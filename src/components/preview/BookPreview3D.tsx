'use client';

import { useState, useCallback, useRef, Suspense, useMemo, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, AdaptiveDpr, AdaptiveEvents, PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '@/store/use-app-store';
import { BookType, CameraPreset } from '@/types/kdp';
import { CoverSegments } from '@/engine/cover-parser';
import PaperbackBook from './books/PaperbackBook';
import HardcoverBook from './books/HardcoverBook';
import KindleDevice from './books/KindleDevice';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BookState = 'closed' | 'opening' | 'opened' | 'closing' | 'flipping' | 'idle';
export type FlipDirection = 'forward' | 'backward';

export interface Preview3DState {
  isOpen: boolean;
  currentPage: number;
  isFlipping: boolean;
  flipProgress: number;
  flipDirection: FlipDirection;
  bookType: BookType;
  kindleDevice: 'paperwhite' | 'oasis' | 'tablet' | 'phone';
  darkMode: boolean;
  bookState: BookState;
  cameraPreset: CameraPreset;
}

export interface Preview3DActions {
  toggleOpen: () => void;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  setBookType: (type: BookType) => void;
  setKindleDevice: (device: 'paperwhite' | 'oasis' | 'tablet' | 'phone') => void;
  toggleDarkMode: () => void;
  resetCamera: () => void;
  exportScreenshot: (highRes?: boolean) => void;
  setCameraPreset: (preset: CameraPreset) => void;
}

export interface CoverTextures {
  front: THREE.Texture | null;
  back: THREE.Texture | null;
  spine: THREE.Texture | null;
}

// ---------------------------------------------------------------------------
// NaN-safe geometry helper
// ---------------------------------------------------------------------------

function safeVec(v: number, fallback = 0): number {
  if (!Number.isFinite(v) || Number.isNaN(v)) return fallback;
  return v;
}

// ---------------------------------------------------------------------------
// Texture loader with caching and NaN protection
// ---------------------------------------------------------------------------

class TextureCache {
  private cache = new Map<string, THREE.Texture>();
  private loader = new THREE.TextureLoader();

  load(dataUrl: string): Promise<THREE.Texture> {
    if (this.cache.has(dataUrl)) {
      return Promise.resolve(this.cache.get(dataUrl)!);
    }
    return new Promise((resolve, reject) => {
      this.loader.load(
        dataUrl,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.minFilter = THREE.LinearMipmapLinearFilter;
          tex.magFilter = THREE.LinearFilter;
          tex.generateMipmaps = true;
          tex.needsUpdate = true;
          this.cache.set(dataUrl, tex);
          resolve(tex);
        },
        undefined,
        reject,
      );
    });
  }

  dispose(key: string) {
    const tex = this.cache.get(key);
    if (tex) {
      tex.dispose();
      this.cache.delete(key);
    }
  }

  disposeAll() {
    this.cache.forEach(tex => tex.dispose());
    this.cache.clear();
  }
}

const globalTextureCache = new TextureCache();

// ---------------------------------------------------------------------------
// Camera preset positions
// ---------------------------------------------------------------------------

const CAMERA_PRESETS: Record<CameraPreset, { position: [number, number, number]; lookAt: [number, number, number] } | null> = {
  front:       { position: [0, 0.5, 3.5],  lookAt: [0, 0, 0] },
  back:        { position: [0, 0.5, -3.5], lookAt: [0, 0, 0] },
  spine:       { position: [-3.5, 0.5, 0], lookAt: [0, 0, 0] },
  'open-spread': { position: [0, 3.5, 2],  lookAt: [0, 0, 0] },
  'page-detail': { position: [0, 1.5, 2],  lookAt: [0, 0, 0.2] },
  free:        null, // No animation — user controls freely
};

// ---------------------------------------------------------------------------
// Camera controller — smooth orbit with damping, supports presets
// ---------------------------------------------------------------------------

function CameraController({
  isOpen,
  bookType,
  cameraPreset,
  onUserInteract,
}: {
  isOpen: boolean;
  bookType: BookType;
  cameraPreset: CameraPreset;
  onUserInteract: () => void;
}) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(2, 1.5, 3));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const prevPreset = useRef<CameraPreset>(cameraPreset);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05); // Cap delta to prevent jumps

    // Determine target camera position
    let goal: THREE.Vector3;
    let lookGoal: THREE.Vector3;

    if (cameraPreset !== 'free' && CAMERA_PRESETS[cameraPreset]) {
      // Use preset position
      const preset = CAMERA_PRESETS[cameraPreset]!;
      goal = new THREE.Vector3(...preset.position);
      lookGoal = new THREE.Vector3(...preset.lookAt);
    } else if (bookType === 'kindle') {
      goal = new THREE.Vector3(0, 0.3, 2.5);
      lookGoal = new THREE.Vector3(0, 0, 0);
    } else if (isOpen) {
      goal = new THREE.Vector3(0, 2.5, 3.5);
      lookGoal = new THREE.Vector3(0, 0, 0.1);
    } else {
      goal = new THREE.Vector3(2, 1.5, 3);
      lookGoal = new THREE.Vector3(0, 0, 0);
    }

    targetPos.current.copy(goal);
    targetLookAt.current.copy(lookGoal);

    // Smooth damped interpolation (velocity-based)
    const stiffness = 3.0;
    const damping = 0.8;

    velocity.current.lerp(
      targetPos.current.clone().sub(camera.position).multiplyScalar(stiffness * dt),
      damping,
    );
    // Clamp velocity
    velocity.current.clampLength(0, 5);

    camera.position.add(velocity.current.clone().multiplyScalar(dt * 60));

    // Smooth look-at interpolation
    currentLookAt.current.lerp(targetLookAt.current, dt * 3);
    camera.lookAt(currentLookAt.current);

    prevPreset.current = cameraPreset;
  });

  return null;
}

// ---------------------------------------------------------------------------
// OrbitControls wrapper that detects user interaction
// ---------------------------------------------------------------------------

function OrbitControlsWrapper({
  isOpen,
  bookType,
  onUserInteract,
}: {
  isOpen: boolean;
  bookType: BookType;
  onUserInteract: () => void;
}) {
  const handleStart = useCallback(() => {
    onUserInteract();
  }, [onUserInteract]);

  return (
    <OrbitControls
      enableDamping
      dampingFactor={0.08}
      minDistance={1.0}
      maxDistance={8.0}
      enablePan={true}
      minPolarAngle={0}
      maxPolarAngle={Math.PI}
      minAzimuthAngle={-Infinity}
      maxAzimuthAngle={Infinity}
      target={[0, 0, isOpen ? 0.1 : 0]}
      rotateSpeed={0.6}
      zoomSpeed={0.8}
      onStart={handleStart}
    />
  );
}

// ---------------------------------------------------------------------------
// Scene Content — Renders the appropriate book model
// ---------------------------------------------------------------------------

function SceneContent({
  state,
  coverTextures,
  pageTextures,
  onFlipComplete,
  onUserCameraInteract,
}: {
  state: Preview3DState;
  coverTextures: CoverTextures;
  pageTextures: Map<number, THREE.Texture | null>;
  onFlipComplete: (newPage: number) => void;
  onUserCameraInteract: () => void;
}) {
  const { bookConfig, measurements } = useAppStore();
  const scale = 0.3; // inches to scene units

  const trimWidth = safeVec(measurements.trimWidthIn * scale, 1.8);
  const trimHeight = safeVec(measurements.trimHeightIn * scale, 2.7);
  const spineWidth = safeVec(measurements.spineWidthIn * scale, 0.05);

  return (
    <>
      {/* Studio lighting */}
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.0}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={20}
        shadow-camera-near={0.1}
        shadow-bias={-0.002}
      />
      <directionalLight position={[-3, 4, -3]} intensity={0.3} color="#b4c7e7" />
      <directionalLight position={[0, 2, -5]} intensity={0.15} color="#f0e0c0" />
      {/* Fill light from below for softer shadows */}
      <hemisphereLight args={['#b4c7e7', '#1a1a2e', 0.2]} />

      {/* Camera auto-framing with preset support */}
      <CameraController
        isOpen={state.isOpen}
        bookType={state.bookType}
        cameraPreset={state.cameraPreset}
        onUserInteract={onUserCameraInteract}
      />

      {/* Book Model */}
      {state.bookType === 'kindle' ? (
        <KindleDevice
          currentPage={state.currentPage}
          totalPages={bookConfig.pageCount}
          pageTextures={pageTextures}
          deviceType={state.kindleDevice}
          darkMode={state.darkMode}
        />
      ) : state.bookType === 'hardcover' ? (
        <HardcoverBook
          trimWidth={trimWidth}
          trimHeight={trimHeight}
          spineWidth={spineWidth}
          pageCount={bookConfig.pageCount}
          currentPage={state.currentPage}
          isOpen={state.isOpen}
          flipProgress={state.flipProgress}
          isFlippingForward={state.flipDirection === 'forward'}
          pageTextures={pageTextures}
          coverTextures={coverTextures}
          coverFinish={bookConfig.coverFinish}
          onFlipComplete={onFlipComplete}
        />
      ) : (
        <PaperbackBook
          trimWidth={trimWidth}
          trimHeight={trimHeight}
          spineWidth={spineWidth}
          pageCount={bookConfig.pageCount}
          currentPage={state.currentPage}
          isOpen={state.isOpen}
          flipProgress={state.flipProgress}
          isFlippingForward={state.flipDirection === 'forward'}
          pageTextures={pageTextures}
          coverTextures={coverTextures}
          coverFinish={bookConfig.coverFinish}
          onFlipComplete={onFlipComplete}
        />
      )}

      {/* Ground shadow */}
      <ContactShadows
        position={[0, -trimHeight / 2 - 0.05, 0]}
        opacity={0.4}
        scale={10}
        blur={2.5}
        far={4}
      />

      {/* Orbit controls with full 360° rotation */}
      <OrbitControlsWrapper
        isOpen={state.isOpen}
        bookType={state.bookType}
        onUserInteract={onUserCameraInteract}
      />

      {/* Performance optimization */}
      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
    </>
  );
}

// ---------------------------------------------------------------------------
// Loading placeholder
// ---------------------------------------------------------------------------

function SceneLoader() {
  return (
    <mesh>
      <boxGeometry args={[1, 1.5, 0.3]} />
      <meshStandardMaterial color="#333" wireframe />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Main 3D Preview Component
// ---------------------------------------------------------------------------

interface BookPreview3DProps {
  coverUrl?: string;
  coverSegments?: CoverSegments | null;
  state: Preview3DState;
  onStateChange: (updates: Partial<Preview3DState>) => void;
  onExportRef?: React.MutableRefObject<(() => void) | null>;
  cameraPreset?: CameraPreset;
}

export default function BookPreview3D({
  coverUrl,
  coverSegments,
  state,
  onStateChange,
  onExportRef,
  cameraPreset,
}: BookPreview3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { pdfPageDataUrls, coverDataUrl } = useAppStore();

  // ---- Texture state ----
  const [coverTextures, setCoverTextures] = useState<CoverTextures>({
    front: null,
    back: null,
    spine: null,
  });
  const [pageTextures, setPageTextures] = useState<Map<number, THREE.Texture | null>>(new Map());

  // ---- Flip animation state ----
  const flipAnimRef = useRef<{ rafId: number | null; startTime: number | null }>({
    rafId: null,
    startTime: null,
  });
  const isFlippingRef = useRef(false);

  // ---- User camera interaction handler ----
  const handleUserCameraInteract = useCallback(() => {
    onStateChange({ cameraPreset: 'free' });
  }, [onStateChange]);

  // ---- Load cover textures from segments ----
  useEffect(() => {
    let cancelled = false;

    async function loadCoverTextures() {
      // Priority: coverSegments (split) > coverUrl (single image) > coverDataUrl (from store)
      let frontUrl: string | undefined;
      let backUrl: string | undefined;
      let spineUrl: string | undefined;

      if (coverSegments) {
        frontUrl = coverSegments.frontDataUrl;
        backUrl = coverSegments.backDataUrl;
        spineUrl = coverSegments.spineDataUrl;
      } else if (coverUrl || coverDataUrl) {
        frontUrl = coverUrl || coverDataUrl;
        // Single image — use for front only; back/spine will use defaults
      }

      if (!frontUrl) return;

      try {
        const [frontTex, backTex, spineTex] = await Promise.all([
          frontUrl ? globalTextureCache.load(frontUrl) : Promise.resolve(null),
          backUrl ? globalTextureCache.load(backUrl) : Promise.resolve(null),
          spineUrl ? globalTextureCache.load(spineUrl) : Promise.resolve(null),
        ]);

        if (!cancelled) {
          // Dispose old textures
          setCoverTextures(prev => {
            // Don't dispose here — the cache manages them
            return { front: frontTex, back: backTex, spine: spineTex };
          });
        }
      } catch (err) {
        console.error('Error loading cover textures:', err);
      }
    }

    loadCoverTextures();
    return () => { cancelled = true; };
  }, [coverSegments, coverUrl, coverDataUrl]);

  // ---- Stream page textures (dynamic loading with eviction) ----
  useEffect(() => {
    let cancelled = false;

    async function streamPages() {
      const currentPage = state.currentPage;
      const range = 5; // Load ±5 pages around current
      const newTextures = new Map(pageTextures);

      // Load nearby pages
      const pagesToLoad: number[] = [];
      for (let i = Math.max(0, currentPage - range); i <= currentPage + range; i++) {
        if (pdfPageDataUrls.has(i) && !newTextures.has(i)) {
          pagesToLoad.push(i);
        }
      }

      for (const pageIndex of pagesToLoad) {
        if (cancelled) break;
        const dataUrl = pdfPageDataUrls.get(pageIndex);
        if (!dataUrl) continue;
        try {
          const tex = await globalTextureCache.load(dataUrl);
          if (!cancelled) {
            newTextures.set(pageIndex, tex);
          }
        } catch {
          newTextures.set(pageIndex, null);
        }
      }

      // Evict distant pages (beyond ±15)
      const evictionRange = 15;
      for (const [key] of newTextures) {
        if (Math.abs(key - currentPage) > evictionRange) {
          const tex = newTextures.get(key);
          if (tex) {
            // Don't dispose — let cache manage lifecycle
          }
          newTextures.delete(key);
        }
      }

      if (!cancelled) {
        setPageTextures(newTextures);
      }
    }

    streamPages();
    return () => { cancelled = true; };
  }, [state.currentPage, pdfPageDataUrls]);

  // ---- Page flip animation (requestAnimationFrame-based, not React state) ----
  const onFlipComplete = useCallback((newPage: number) => {
    isFlippingRef.current = false;
    onStateChange({
      isFlipping: false,
      flipProgress: 0,
      currentPage: newPage,
      bookState: state.isOpen ? 'opened' : 'closed',
    });
  }, [onStateChange, state.isOpen]);

  useEffect(() => {
    if (!state.isFlipping) return;
    if (isFlippingRef.current) return; // Prevent duplicate animations
    isFlippingRef.current = true;

    let startTime: number | null = null;
    const duration = 700; // ms

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const rawProgress = Math.min(elapsed / duration, 1);

      // Easing: ease-in-out cubic
      const eased = rawProgress < 0.5
        ? 4 * rawProgress * rawProgress * rawProgress
        : 1 - Math.pow(-2 * rawProgress + 2, 3) / 2;

      onStateChange({ flipProgress: safeVec(eased, 0) });

      if (rawProgress < 1) {
        flipAnimRef.current.rafId = requestAnimationFrame(animate);
      } else {
        // Animation complete — update page
        const pageDelta = state.flipDirection === 'forward' ? 2 : -2;
        const maxPage = useAppStore.getState().bookConfig.pageCount;
        const newPage = Math.max(0, Math.min(state.currentPage + pageDelta, maxPage));
        onFlipComplete(newPage);
      }
    };

    flipAnimRef.current.rafId = requestAnimationFrame(animate);

    return () => {
      if (flipAnimRef.current.rafId !== null) {
        cancelAnimationFrame(flipAnimRef.current.rafId);
      }
    };
  }, [state.isFlipping, onStateChange, state.flipDirection, state.currentPage, onFlipComplete]);

  // ---- Screenshot export ----
  const handleExport = useCallback((highRes = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const dataUrl = canvas.toDataURL('image/png');
      downloadImage(dataUrl, highRes ? 'kdp-book-preview-hd.png' : 'kdp-book-preview.png');
    } catch (err) {
      console.error('Export failed:', err);
    }
  }, []);

  useEffect(() => {
    if (onExportRef) {
      onExportRef.current = handleExport;
    }
  }, [handleExport, onExportRef]);

  // ---- Cleanup on unmount ----
  useEffect(() => {
    return () => {
      // Don't dispose cached textures — they're managed globally
    };
  }, []);

  return (
    <Canvas
      ref={canvasRef}
      camera={{ position: [2, 1.5, 3], fov: 40 }}
      gl={{
        preserveDrawingBuffer: true,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      }}
      style={{ background: 'transparent' }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.1;
      }}
      dpr={[1, 2]}
      performance={{ min: 0.5 }}
    >
      <Suspense fallback={<SceneLoader />}>
        <PerformanceMonitor>
          <SceneContent
            state={state}
            coverTextures={coverTextures}
            pageTextures={pageTextures}
            onFlipComplete={onFlipComplete}
            onUserCameraInteract={handleUserCameraInteract}
          />
        </PerformanceMonitor>
      </Suspense>
    </Canvas>
  );
}

// ---------------------------------------------------------------------------
// Helper: Download image
// ---------------------------------------------------------------------------

function downloadImage(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
