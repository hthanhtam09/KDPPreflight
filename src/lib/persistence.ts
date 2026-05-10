/**
 * IndexedDB-based persistence layer for KDPPreflight.
 * Auto-saves workspace state so users never lose progress after refresh/crash.
 */

import type { BookConfig, BookPage, PreviewViewMode, OverlayType, IssueFilter, SpreadModel } from '@/types/kdp';

// ---------------------------------------------------------------------------
// Database setup
// ---------------------------------------------------------------------------

const DB_NAME = 'kdp-preflight';
const DB_VERSION = 1;
const STORE_META = 'meta';
const STORE_ASSETS = 'assets';

export interface SavedWorkspace {
  // Book config
  bookType: string;
  bookConfig: BookConfig;
  coverFileName: string;
  manuscriptFileName: string;
  coverDataUrl: string;
  pdfPageDataUrls: Record<number, string>; // serialized Map<number, string>

  // Preview state
  currentPage: number;
  previewViewMode: PreviewViewMode;
  activeOverlays: OverlayType[];
  issueFilter: IssueFilter;

  // Book model
  bookPages: BookPage[];
  spreadModels: SpreadModel[];

  // Timestamps
  savedAt: number;
  createdAt: number;
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_ASSETS)) {
        db.createObjectStore(STORE_ASSETS);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ---------------------------------------------------------------------------
// Save workspace
// ---------------------------------------------------------------------------

export async function saveWorkspace(workspace: SavedWorkspace): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_META], 'readwrite');
    const store = tx.objectStore(STORE_META);
    store.put({ id: 'workspace', ...workspace });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ---------------------------------------------------------------------------
// Load workspace
// ---------------------------------------------------------------------------

export async function loadWorkspace(): Promise<SavedWorkspace | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_META], 'readonly');
    const store = tx.objectStore(STORE_META);
    const request = store.get('workspace');
    request.onsuccess = () => {
      const result = request.result;
      if (!result) {
        resolve(null);
        return;
      }
      // Remove the 'id' field we added for IndexedDB key
      const { id: _id, ...workspace } = result;
      resolve(workspace as SavedWorkspace);
    };
    request.onerror = () => reject(request.error);
  });
}

// ---------------------------------------------------------------------------
// Clear workspace
// ---------------------------------------------------------------------------

export async function clearWorkspace(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_META, STORE_ASSETS], 'readwrite');
    tx.objectStore(STORE_META).delete('workspace');
    tx.objectStore(STORE_ASSETS).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ---------------------------------------------------------------------------
// Check if workspace exists
// ---------------------------------------------------------------------------

export async function hasSavedWorkspace(): Promise<boolean> {
  const workspace = await loadWorkspace();
  return workspace !== null;
}

// ---------------------------------------------------------------------------
// Save PDF binary for crash recovery
// ---------------------------------------------------------------------------

export async function savePDFBinary(key: string, data: ArrayBuffer): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_ASSETS], 'readwrite');
    const store = tx.objectStore(STORE_ASSETS);
    store.put(data, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadPDFBinary(key: string): Promise<ArrayBuffer | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_ASSETS], 'readonly');
    const store = tx.objectStore(STORE_ASSETS);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
  });
}

// ---------------------------------------------------------------------------
// Convert Map to Record for serialization
// ---------------------------------------------------------------------------

export function mapToRecord(map: Map<number, string>): Record<number, string> {
  const record: Record<number, string> = {};
  map.forEach((value, key) => {
    record[key] = value;
  });
  return record;
}

export function recordToMap(record: Record<number, string>): Map<number, string> {
  const map = new Map<number, string>();
  for (const [key, value] of Object.entries(record)) {
    map.set(Number(key), value);
  }
  return map;
}
