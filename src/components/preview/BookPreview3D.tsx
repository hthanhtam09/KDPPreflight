'use client';

import { useState, useCallback, useRef, Suspense, useMemo, useEffect } from 'react';
import type { MutableRefObject, RefObject } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, AdaptiveDpr, AdaptiveEvents, PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '@/store/use-app-store';
import { BookType, CameraPreset } from '@/types/kdp';
import { CoverSegments } from '@/engine/cover-parser';
import { calculateMeasurements, DEFAULT_BOOK_CONFIG } from '@/engine/kdp-constants';
import PaperbackBook from './books/PaperbackBook';
import HardcoverBook from './books/HardcoverBook';
import KindleDevice from './books/KindleDevice';

// Suppress THREE.Clock deprecation warning from Three.js r183+.
// react-three-fiber still uses THREE.Clock internally and hasn't migrated to THREE.Timer yet.
// THREE.setConsoleFunction does not exist in standard Three.js — patch console.warn directly.
if (typeof window !== 'undefined') {
  const _warn = console.warn.bind(console);
  console.warn = (...args: Parameters<typeof console.warn>) => {
    if (typeof args[0] === 'string' && args[0].startsWith('THREE.Clock:')) return;
    _warn(...args);
  };
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BookPose = 'closedFront' | 'closedBack' | 'closedSpine' | 'open';
export type FlipDirection = 'forward' | 'backward';

export interface Preview3DState {
  currentPage: number;
  isFlipping: boolean;
  flipProgress: number;
  flipDirection: FlipDirection;
  targetPage: number | null;
  bookType: BookType;
  kindleDevice: 'paperwhite' | 'oasis' | 'tablet' | 'phone';
  darkMode: boolean;
  bookPose: BookPose;
  cameraPreset: CameraPreset;
}

export interface Preview3DOverlays {
  bleed: boolean;
  trim: boolean;
  safe: boolean;
}

export interface Preview3DActions {
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  exportScreenshot: (highRes?: boolean) => void;
  setCameraPreset: (preset: CameraPreset) => void;
  toggleConfig: () => void;
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
// Texture loader with caching — stable, never disposes during session
// ---------------------------------------------------------------------------

class TextureCache {
  private cache = new Map<string, THREE.Texture>();
  private loader = new THREE.TextureLoader();

  load(dataUrl: string): Promise<THREE.Texture> {
    const existing = this.cache.get(dataUrl);
    if (existing) {
      return Promise.resolve(existing);
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

  has(key: string): boolean {
    return this.cache.has(key);
  }

  get(key: string): THREE.Texture | undefined {
    return this.cache.get(key);
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

const CAMERA_PRESETS: Record<CameraPreset, { position: [number, number, number]; target: [number, number, number] } | null> = {
  front:        { position: [0, 0.22, 3.3],  target: [0, 0, 0] },
  back:         { position: [0, 0.22, -3.3], target: [0, 0, 0] },
  spine:        { position: [-3.4, 0.2, 0], target: [0, 0, 0] },
  'open-spread': { position: [0, 2.85, 2.25], target: [0, 0, 0.08] },
  'page-detail': { position: [0, 1.0, 2.0], target: [0, 0, 0.1] },
  free:         null, // User controls freely — no animation
};

// ---------------------------------------------------------------------------
// Camera Preset Animator — animates to preset ONLY when preset changes,
// then hands control back to OrbitControls. Does NOT fight user input.
// ---------------------------------------------------------------------------

function CameraPresetAnimator({
  cameraPreset,
  controlsRef,
  onAnimDone,
}: {
  cameraPreset: CameraPreset;
  controlsRef: RefObject<any>;
  onAnimDone: () => void;
}) {
  const { camera } = useThree();
  const animRef = useRef<{
    active: boolean;
    startPos: THREE.Vector3;
    endPos: THREE.Vector3;
    startTarget: THREE.Vector3;
    endTarget: THREE.Vector3;
    progress: number;
  } | null>(null);
  const prevPreset = useRef<CameraPreset>(cameraPreset);

  // When preset changes (and it's not 'free'), start animation
  useEffect(() => {
    if (cameraPreset === 'free' || cameraPreset === prevPreset.current) return;
    const preset = CAMERA_PRESETS[cameraPreset];
    if (!preset) return;

    animRef.current = {
      active: true,
      startPos: camera.position.clone(),
      endPos: new THREE.Vector3(...preset.position),
      startTarget: controlsRef.current?.target.clone() ?? new THREE.Vector3(0, 0, 0),
      endTarget: new THREE.Vector3(...preset.target),
      progress: 0,
    };
    prevPreset.current = cameraPreset;
  }, [cameraPreset, camera, controlsRef]);

  useFrame((_, delta) => {
    if (!animRef.current || !animRef.current.active) return;

    const anim = animRef.current;
    anim.progress += delta * 2.0; // ~0.5s animation
    const t = Math.min(anim.progress, 1);
    // Smooth ease-in-out
    const eased = t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;

    camera.position.lerpVectors(anim.startPos, anim.endPos, eased);
    if (controlsRef.current) {
      controlsRef.current.target.lerpVectors(anim.startTarget, anim.endTarget, eased);
      controlsRef.current.update();
    }

    if (t >= 1) {
      anim.active = false;
      animRef.current = null;
      onAnimDone();
    }
  });

  return null;
}

// ---------------------------------------------------------------------------
// Scene Content — Renders the appropriate book model
// ---------------------------------------------------------------------------

function SceneContent({
  state,
  coverTextures,
  pageTextures,
  overlays,
}: {
  state: Preview3DState;
  coverTextures: CoverTextures;
  pageTextures: Map<number, THREE.Texture | null>;
  overlays: Preview3DOverlays;
}) {
  const storeState = useAppStore();
  const bookConfig = storeState.bookConfig ?? DEFAULT_BOOK_CONFIG;
  const measurements = storeState.measurements ?? calculateMeasurements(bookConfig);
  const controlsRef = useRef<any>(null);
  const scale = 0.3; // inches to scene units

  const trimWidth = safeVec(measurements.trimWidthIn * scale, 1.8);
  const trimHeight = safeVec(measurements.trimHeightIn * scale, 2.7);
  const spineWidth = safeVec(measurements.spineWidthIn * scale, 0.05);

  return (
    <>
      {/* Studio lighting */}
      <ambientLight intensity={1.2} />
      <directionalLight
        position={[3, 5, 5]}
        intensity={1.4}
        castShadow={false}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={20}
        shadow-camera-near={0.1}
        shadow-bias={-0.002}
      />
      <directionalLight position={[-4, 2, 3]} intensity={0.45} color="#ffffff" />
      <directionalLight position={[0, 3, -4]} intensity={0.25} color="#f8f1e7" />
      <hemisphereLight args={['#ffffff', '#d6d3cc', 0.8]} />

      {/* Camera preset animator — only animates when preset changes */}
      <CameraPresetAnimator
        cameraPreset={state.cameraPreset}
        controlsRef={controlsRef}
        onAnimDone={() => {}}
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
          bookPose={state.bookPose}
          flipProgress={state.flipProgress}
          isFlippingForward={state.flipDirection === 'forward'}
          pageTextures={pageTextures}
          coverTextures={coverTextures}
          coverFinish={bookConfig.coverFinish}
          bleedEnabled={bookConfig.bleed === 'bleed'}
          overlays={overlays}
          safeInset={safeVec(bookConfig.bleed === 'bleed' ? measurements.safeAreaIn * scale : measurements.safeAreaIn * scale, 0.08)}
        />
      ) : (
        <PaperbackBook
          trimWidth={trimWidth}
          trimHeight={trimHeight}
          spineWidth={spineWidth}
          pageCount={bookConfig.pageCount}
          currentPage={state.currentPage}
          bookPose={state.bookPose}
          flipProgress={state.flipProgress}
          isFlippingForward={state.flipDirection === 'forward'}
          pageTextures={pageTextures}
          coverTextures={coverTextures}
          coverFinish={bookConfig.coverFinish}
          bleedEnabled={bookConfig.bleed === 'bleed'}
          overlays={overlays}
          safeInset={safeVec(measurements.safeAreaIn * scale, 0.08)}
        />
      )}

      {/* Ground shadow */}
      <ContactShadows
        position={[0, -trimHeight / 2 - 0.05, 0]}
        opacity={0.4}
        scale={10}
        blur={3.5}
        far={4}
      />

      {/* Orbit controls — TRUE 360° rotation, no constraints, smooth damping */}
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.12}
        minDistance={1.0}
        maxDistance={8.0}
        enablePan={true}
        // Full 360° rotation — no angle limits
        minPolarAngle={0}
        maxPolarAngle={Math.PI}
        minAzimuthAngle={-Infinity}
        maxAzimuthAngle={Infinity}
        // Smooth interaction feel
        rotateSpeed={0.8}
        zoomSpeed={0.8}
        target={[0, 0, 0]}
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
// High-res capture — must live inside Canvas to access gl/scene/camera
// ---------------------------------------------------------------------------

const EXPORT_DPR = 3; // 3× the CSS pixel size → sharp at any viewport

function SceneCapture({
  captureRef,
}: {
  captureRef: MutableRefObject<((filename: string) => void) | null>;
}) {
  const { gl, scene, camera, size } = useThree();

  useEffect(() => {
    captureRef.current = (filename: string) => {
      const origDPR = gl.getPixelRatio();
      try {
        // Upscale buffer for export
        gl.setPixelRatio(EXPORT_DPR);
        gl.setSize(size.width, size.height);
        gl.render(scene, camera);
        // toDataURL is synchronous — captures pixel data before we restore
        const dataUrl = gl.domElement.toDataURL('image/png');
        downloadImage(dataUrl, filename);
      } finally {
        // Always restore, even if render throws
        gl.setPixelRatio(origDPR);
        gl.setSize(size.width, size.height);
      }
    };
  }, [gl, scene, camera, size, captureRef]);

  return null;
}

// ---------------------------------------------------------------------------
// Main 3D Preview Component
// ---------------------------------------------------------------------------

interface BookPreview3DProps {
  coverUrl?: string;
  coverSegments?: CoverSegments | null;
  state: Preview3DState;
  onStateChange: (updates: Partial<Preview3DState>) => void;
  onExportRef?: MutableRefObject<(() => void) | null>;
  overlays: Preview3DOverlays;
}

export default function BookPreview3D({
  coverUrl,
  coverSegments,
  state,
  onStateChange,
  onExportRef,
  overlays,
}: BookPreview3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const internalCaptureRef = useRef<((filename: string) => void) | null>(null);
  const { pdfPageDataUrls, coverDataUrl } = useAppStore();

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const wrapperRef = useRef<HTMLDivElement>(null);

  // ---- Observe container size ----
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      setContainerSize({
        width: entries[0].contentRect.width,
        height: entries[0].contentRect.height,
      });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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

  // ---- Load cover textures from segments ----
  useEffect(() => {
    let cancelled = false;

    async function loadCoverTextures() {
      let frontUrl: string | undefined;
      let backUrl: string | undefined;
      let spineUrl: string | undefined;

      if (coverSegments) {
        frontUrl = coverSegments.frontDataUrl;
        backUrl = coverSegments.backDataUrl;
        spineUrl = coverSegments.spineDataUrl;
      } else if (coverUrl || coverDataUrl) {
        frontUrl = coverUrl || coverDataUrl;
      }

      if (!frontUrl) return;

      try {
        const [frontTex, backTex, spineTex] = await Promise.all([
          frontUrl ? globalTextureCache.load(frontUrl) : Promise.resolve(null),
          backUrl ? globalTextureCache.load(backUrl) : Promise.resolve(null),
          spineUrl ? globalTextureCache.load(spineUrl) : Promise.resolve(null),
        ]);

        if (!cancelled) {
          setCoverTextures({ front: frontTex, back: backTex, spine: spineTex });
        }
      } catch (err) {
        console.error('Error loading cover textures:', err);
      }
    }

    loadCoverTextures();
    return () => { cancelled = true; };
  }, [coverSegments, coverUrl, coverDataUrl]);

  // ---- Stream page textures (current spread + neighbor spreads only) ----
  useEffect(() => {
    let cancelled = false;

    async function streamPages() {
      const currentPage = state.currentPage;
      const range = 3;
      const newTextures = new Map(pageTextures);

      // Load nearby pages
      const pagesToLoad: number[] = [];
      for (let i = Math.max(0, currentPage - 1 - range); i <= currentPage - 1 + range; i++) {
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

      // Evict distant pages (beyond ±20) — but DON'T dispose textures (cache manages them)
      const evictionRange = 8;
      for (const [key] of newTextures) {
        if (Math.abs(key - (currentPage - 1)) > evictionRange) {
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

  // ---- Page flip animation (requestAnimationFrame-based) ----
  const onFlipComplete = useCallback((newPage: number, pose: BookPose = 'open') => {
    isFlippingRef.current = false;
    onStateChange({
      isFlipping: false,
      flipProgress: 0,
      currentPage: newPage,
      targetPage: null,
      bookPose: pose,
      cameraPreset: pose === 'closedBack' ? 'back' : 'open-spread',
    });
  }, [onStateChange]);

  useEffect(() => {
    if (!state.isFlipping) return;
    if (isFlippingRef.current) return;
    isFlippingRef.current = true;

    let startTime: number | null = null;
    const duration = 600; // ms — slightly faster for snappier feel

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
        const maxPage = useAppStore.getState().bookConfig.pageCount;
        const targetPage = state.targetPage ?? (state.flipDirection === 'forward' ? state.currentPage + 2 : state.currentPage - 2);
        const newPage = Math.max(1, Math.min(targetPage, maxPage));
        const lastSpread = maxPage <= 1 ? 1 : maxPage % 2 === 0 ? maxPage : maxPage - 1;
        const shouldCloseBack = state.flipDirection === 'forward' && state.targetPage === null && state.currentPage >= lastSpread;
        onFlipComplete(shouldCloseBack ? lastSpread : newPage, shouldCloseBack ? 'closedBack' : 'open');
      }
    };

    flipAnimRef.current.rafId = requestAnimationFrame(animate);

    return () => {
      if (flipAnimRef.current.rafId !== null) {
        cancelAnimationFrame(flipAnimRef.current.rafId);
      }
    };
  }, [state.isFlipping, onStateChange, state.flipDirection, state.currentPage, state.targetPage, onFlipComplete]);

  // ---- Screenshot export (high-res via SceneCapture, fallback to current frame) ----
  const handleExport = useCallback(() => {
    const filename = `kdp-preview-p${state.currentPage}.png`;
    if (internalCaptureRef.current) {
      try { internalCaptureRef.current(filename); } catch (err) { console.error('Export failed:', err); }
      return;
    }
    // Fallback: current frame at current DPR
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      downloadImage(canvas.toDataURL('image/png'), filename);
    } catch (err) {
      console.error('Export fallback failed:', err);
    }
  }, [state.currentPage]);

  useEffect(() => {
    if (onExportRef) {
      onExportRef.current = handleExport;
    }
  }, [handleExport, onExportRef]);

  return (
    <div ref={wrapperRef} className="h-full w-full relative min-h-0 min-w-0">
      {containerSize.width > 0 && containerSize.height > 0 && (
        <Canvas
          ref={canvasRef}
          camera={{ position: [2, 1.5, 3], fov: 40 }}
          gl={{
            preserveDrawingBuffer: true,
            antialias: true,
            alpha: true,
            outputColorSpace: THREE.SRGBColorSpace,
            toneMapping: THREE.NoToneMapping,
            powerPreference: 'high-performance',
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: containerSize.width,
            height: containerSize.height,
            background: 'transparent'
          }}
          onCreated={({ gl }) => {
            gl.outputColorSpace = THREE.SRGBColorSpace;
            gl.toneMapping = THREE.NoToneMapping;
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
                overlays={overlays}
              />
            </PerformanceMonitor>
            <SceneCapture captureRef={internalCaptureRef} />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helper: Download image
// ---------------------------------------------------------------------------

function downloadImage(dataUrl: string, filename: string) {
  // Convert base64 data URL to blob URL — avoids holding a large base64 string in the DOM
  const [header, b64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/png';
  const bytes = atob(b64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  const url = URL.createObjectURL(new Blob([arr], { type: mime }));
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
