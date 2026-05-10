'use client';

import { useState, useCallback, useRef, Suspense, useMemo, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, AdaptiveDpr, AdaptiveEvents, PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '@/store/use-app-store';
import { BookType } from '@/types/kdp';
import PaperbackBook from './books/PaperbackBook';
import HardcoverBook from './books/HardcoverBook';
import KindleDevice from './books/KindleDevice';

// --- Types ---
export interface Preview3DState {
  isOpen: boolean;
  currentPage: number;
  isFlipping: boolean;
  flipProgress: number;
  flipDirection: 'forward' | 'backward';
  bookType: BookType;
  kindleDevice: 'paperwhite' | 'oasis' | 'tablet' | 'phone';
  darkMode: boolean;
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
}

// --- Texture Manager ---
// Manages loading and caching of page textures
function useTextureManager(pageDataUrls: Map<number, string>, coverDataUrl: string) {
  const textureCache = useRef<Map<number, THREE.Texture>>(new Map());
  const coverTextureRef = useRef<THREE.Texture | null>(null);
  const loader = useMemo(() => new THREE.TextureLoader(), []);

  // Load a texture from data URL
  const loadTexture = useCallback((dataUrl: string): Promise<THREE.Texture> => {
    return new Promise((resolve, reject) => {
      loader.load(dataUrl, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = true;
        resolve(texture);
      }, undefined, reject);
    });
  }, [loader]);

  // Get or load a page texture
  const getPageTexture = useCallback(async (pageIndex: number): Promise<THREE.Texture | null> => {
    if (textureCache.current.has(pageIndex)) {
      return textureCache.current.get(pageIndex)!;
    }
    const dataUrl = pageDataUrls.get(pageIndex);
    if (!dataUrl) return null;
    try {
      const tex = await loadTexture(dataUrl);
      textureCache.current.set(pageIndex, tex);
      return tex;
    } catch {
      return null;
    }
  }, [pageDataUrls, loadTexture]);

  // Get cover texture
  const getCoverTexture = useCallback(async (): Promise<THREE.Texture | null> => {
    if (coverTextureRef.current) return coverTextureRef.current;
    if (!coverDataUrl) return null;
    try {
      const tex = await loadTexture(coverDataUrl);
      coverTextureRef.current = tex;
      return tex;
    } catch {
      return null;
    }
  }, [coverDataUrl, loadTexture]);

  // Get currently loaded textures as a Map
  const getLoadedTextures = useCallback((): Map<number, THREE.Texture | null> => {
    return new Map(textureCache.current);
  }, []);

  // Dispose all textures
  const disposeAll = useCallback(() => {
    textureCache.current.forEach(tex => tex.dispose());
    textureCache.current.clear();
    if (coverTextureRef.current) {
      coverTextureRef.current.dispose();
      coverTextureRef.current = null;
    }
  }, []);

  return { getPageTexture, getCoverTexture, getLoadedTextures, disposeAll };
}

// --- Camera Auto-Framing ---
function CameraAutoFrame({ isOpen, bookType }: { isOpen: boolean; bookType: BookType }) {
  const { camera } = useThree();
  const targetRef = useRef(new THREE.Vector3());
  const posRef = useRef(new THREE.Vector3(2, 1.5, 3));

  useFrame((_, delta) => {
    // Target position based on book state
    let targetPos: THREE.Vector3;
    if (bookType === 'kindle') {
      targetPos = new THREE.Vector3(0, 0.3, 2.5);
    } else if (isOpen) {
      targetPos = new THREE.Vector3(0, 2.5, 3);
    } else {
      targetPos = new THREE.Vector3(2, 1.5, 3);
    }

    // Smooth interpolation
    posRef.current.lerp(targetPos, delta * 2);
    camera.position.lerp(posRef.current, delta * 2);

    // Look at center
    const lookTarget = new THREE.Vector3(0, 0, isOpen ? 0.1 : 0);
    targetRef.current.lerp(lookTarget, delta * 2);
    camera.lookAt(targetRef.current);
  });

  return null;
}

// --- Scene Content ---
function SceneContent({
  state,
  coverTexture,
  pageTextures,
}: {
  state: Preview3DState;
  coverTexture: THREE.Texture | null;
  pageTextures: Map<number, THREE.Texture | null>;
}) {
  const { bookConfig, measurements } = useAppStore();
  const scale = 0.3; // inches to scene units

  const trimWidth = measurements.trimWidthIn * scale;
  const trimHeight = measurements.trimHeightIn * scale;
  const spineWidth = measurements.spineWidthIn * scale;

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={20}
        shadow-camera-near={0.1}
        shadow-bias={-0.001}
      />
      <directionalLight position={[-3, 4, -3]} intensity={0.4} color="#b4c7e7" />
      <directionalLight position={[0, 2, -5]} intensity={0.2} color="#f0e0c0" />

      {/* Camera auto-framing */}
      <CameraAutoFrame isOpen={state.isOpen} bookType={state.bookType} />

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
          coverUrl=""
          trimWidth={trimWidth}
          trimHeight={trimHeight}
          spineWidth={spineWidth}
          pageCount={bookConfig.pageCount}
          currentPage={state.currentPage}
          isOpen={state.isOpen}
          flipProgress={state.flipProgress}
          isFlippingForward={state.flipDirection === 'forward'}
          pageTextures={pageTextures}
          coverTexture={coverTexture}
          coverFinish={bookConfig.coverFinish}
        />
      ) : (
        <PaperbackBook
          coverUrl=""
          trimWidth={trimWidth}
          trimHeight={trimHeight}
          spineWidth={spineWidth}
          pageCount={bookConfig.pageCount}
          currentPage={state.currentPage}
          isOpen={state.isOpen}
          flipProgress={state.flipProgress}
          isFlippingForward={state.flipDirection === 'forward'}
          pageTextures={pageTextures}
          coverTexture={coverTexture}
          coverFinish={bookConfig.coverFinish}
        />
      )}

      {/* Ground shadow */}
      <ContactShadows
        position={[0, -trimHeight / 2 - 0.1, 0]}
        opacity={0.5}
        scale={10}
        blur={2.5}
        far={4}
      />

      {/* Environment for reflections */}
      <Environment preset="studio" />

      {/* Orbit controls */}
      <OrbitControls
        enableDamping
        dampingFactor={0.08}
        minDistance={state.bookType === 'kindle' ? 1 : 0.8}
        maxDistance={state.bookType === 'kindle' ? 5 : 8}
        enablePan={true}
        maxPolarAngle={Math.PI * 0.85}
        minPolarAngle={Math.PI * 0.1}
        target={[0, 0, state.isOpen ? 0.1 : 0]}
      />

      {/* Performance optimization */}
      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
    </>
  );
}

// --- Loading Placeholder ---
function SceneLoader() {
  return (
    <mesh>
      <boxGeometry args={[1, 1.5, 0.3]} />
      <meshStandardMaterial color="#333" wireframe />
    </mesh>
  );
}

// --- Main 3D Preview Component ---
interface BookPreview3DProps {
  coverUrl?: string;
  state: Preview3DState;
  onStateChange: (updates: Partial<Preview3DState>) => void;
  onExportRef?: React.MutableRefObject<(() => void) | null>;
}

export default function BookPreview3D({
  coverUrl,
  state,
  onStateChange,
  onExportRef,
}: BookPreview3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const { pdfPageDataUrls, coverDataUrl } = useAppStore();

  // Texture management
  const [coverTexture, setCoverTexture] = useState<THREE.Texture | null>(null);
  const [pageTextures, setPageTextures] = useState<Map<number, THREE.Texture | null>>(new Map());
  const loader = useMemo(() => new THREE.TextureLoader(), []);

  // Resolve effective cover URL
  const effectiveCoverUrl = coverUrl || coverDataUrl;

  // Load cover texture (only when URL exists — avoid sync setState in effect)
  useEffect(() => {
    if (!effectiveCoverUrl) return;
    let cancelled = false;
    loader.load(effectiveCoverUrl, (tex) => {
      if (cancelled) { tex.dispose(); return; }
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      setCoverTexture(prev => {
        if (prev) prev.dispose();
        return tex;
      });
    });
    return () => { cancelled = true; };
  }, [effectiveCoverUrl, loader]);

  // Use texture only when URL is present; otherwise treat as null
  const activeCoverTexture = effectiveCoverUrl ? coverTexture : null;

  // Load nearby page textures (texture streaming)
  useEffect(() => {
    const loadNearbyPages = async () => {
      const currentPage = state.currentPage;
      const range = 4; // Load pages within ±4 of current
      const newTextures = new Map(pageTextures);

      for (let i = Math.max(0, currentPage - range); i <= currentPage + range; i++) {
        const dataUrl = pdfPageDataUrls.get(i);
        if (dataUrl && !newTextures.has(i)) {
          try {
            const tex = await new Promise<THREE.Texture>((resolve, reject) => {
              loader.load(dataUrl, (texture) => {
                texture.colorSpace = THREE.SRGBColorSpace;
                texture.minFilter = THREE.LinearFilter;
                texture.magFilter = THREE.LinearFilter;
                resolve(texture);
              }, undefined, reject);
            });
            newTextures.set(i, tex);
          } catch {
            newTextures.set(i, null);
          }
        }
      }

      // Unload distant pages (LRU-like eviction)
      const unloadRange = 10;
      for (const [key] of newTextures) {
        if (Math.abs(key - currentPage) > unloadRange) {
          const tex = newTextures.get(key);
          if (tex) tex.dispose();
          newTextures.delete(key);
        }
      }

      setPageTextures(newTextures);
    };

    loadNearbyPages();
  }, [state.currentPage, pdfPageDataUrls, loader]);

  // Page flip animation
  useEffect(() => {
    if (!state.isFlipping) return;

    let start: number | null = null;
    const duration = 800; // ms

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);

      // Easing: ease-in-out cubic
      const eased = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      onStateChange({ flipProgress: eased });

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        onStateChange({
          isFlipping: false,
          flipProgress: 0,
          currentPage: state.flipDirection === 'forward'
            ? Math.min(state.currentPage + 2, useAppStore.getState().bookConfig.pageCount)
            : Math.max(state.currentPage - 2, 0),
        });
      }
    };

    requestAnimationFrame(animate);
  }, [state.isFlipping, onStateChange, state.flipDirection, state.currentPage]);

  // Screenshot export
  const handleExport = useCallback((highRes = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (highRes) {
      // High-res export: render at 2x resolution
      const gl = rendererRef.current;
      if (!gl) return;

      const originalSize = gl.getSize(new THREE.Vector2());
      const originalPixelRatio = gl.getPixelRatio();

      gl.setPixelRatio(originalPixelRatio * 2);
      gl.setSize(originalSize.x, originalSize.y, false);
      gl.render(gl.domElement.parentElement as any, null as any);

      const dataUrl = canvas.toDataURL('image/png');

      gl.setPixelRatio(originalPixelRatio);
      gl.setSize(originalSize.x, originalSize.y, false);

      downloadImage(dataUrl, 'kdp-book-preview-hd.png');
    } else {
      const dataUrl = canvas.toDataURL('image/png');
      downloadImage(dataUrl, 'kdp-book-preview.png');
    }
  }, []);

  // Expose export function to parent
  useEffect(() => {
    if (onExportRef) {
      onExportRef.current = handleExport;
    }
  }, [handleExport, onExportRef]);

  // Cleanup textures on unmount
  useEffect(() => {
    return () => {
      if (coverTexture) coverTexture.dispose();
      pageTextures.forEach(tex => { if (tex) tex.dispose(); });
    };
  }, []); // cleanup only on unmount

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
        rendererRef.current = gl;
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
            coverTexture={activeCoverTexture}
            pageTextures={pageTextures}
          />
        </PerformanceMonitor>
      </Suspense>
    </Canvas>
  );
}

// --- Helper: Download image ---
function downloadImage(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
