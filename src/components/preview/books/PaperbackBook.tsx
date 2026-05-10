'use client';

import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { CoverTextures } from '../BookPreview3D';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PaperbackBookProps {
  trimWidth: number;
  trimHeight: number;
  spineWidth: number;
  pageCount: number;
  currentPage: number;
  isOpen: boolean;
  flipProgress: number;
  isFlippingForward: boolean;
  pageTextures: Map<number, THREE.Texture | null>;
  coverTextures: CoverTextures;
  coverFinish?: 'matte' | 'glossy';
  onFlipComplete?: (newPage: number) => void;
}

// ---------------------------------------------------------------------------
// NaN-safe helpers
// ---------------------------------------------------------------------------

function safe(v: number, fallback = 0.001): number {
  if (!Number.isFinite(v) || Number.isNaN(v)) return fallback;
  return Math.max(v, 0.001);
}

// ---------------------------------------------------------------------------
// Persistent page geometry (created once, deformed via vertex manipulation)
// ---------------------------------------------------------------------------

function useStablePlaneGeometry(width: number, height: number, segX: number, segY: number) {
  return useMemo(() => {
    const geo = new THREE.PlaneGeometry(safe(width), safe(height), segX, segY);
    return geo;
  }, [width, height, segX, segY]);
}

// ---------------------------------------------------------------------------
// Material helpers
// ---------------------------------------------------------------------------

function paperMaterial(texture: THREE.Texture | null, roughness = 0.92): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    map: texture,
    color: texture ? 0xffffff : 0xf5f0e8,
    roughness,
    metalness: 0,
    side: THREE.FrontSide,
  });
}

function coverMaterial(
  texture: THREE.Texture | null,
  roughness: number,
  metalness: number,
): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    map: texture,
    color: texture ? 0xffffff : 0x1a1a2e,
    roughness,
    metalness,
  });
}

// ---------------------------------------------------------------------------
// Front Cover — has separate front/spine/back textures
// ---------------------------------------------------------------------------

function PaperbackFrontCoverClosed({
  trimWidth,
  trimHeight,
  spineWidth,
  pageDepth,
  coverThickness,
  coverTextures,
  roughness,
  metalness,
}: {
  trimWidth: number;
  trimHeight: number;
  spineWidth: number;
  pageDepth: number;
  coverThickness: number;
  coverTextures: CoverTextures;
  roughness: number;
  metalness: number;
}) {
  // Front cover face (visible when book is closed)
  return (
    <group>
      {/* Front cover board */}
      <mesh position={[0, 0, pageDepth / 2 + coverThickness / 2]}>
        <boxGeometry args={[safe(trimWidth), safe(trimHeight), safe(coverThickness)]} />
        {/* Top face (front cover texture) */}
        <meshStandardMaterial
          map={coverTextures.front}
          color={coverTextures.front ? 0xffffff : 0x1a1a2e}
          roughness={roughness}
          metalness={metalness}
        />
      </mesh>

      {/* Spine (separate mesh with spine texture) */}
      <mesh position={[-trimWidth / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[safe(pageDepth + coverThickness * 2), safe(trimHeight)]} />
        <meshStandardMaterial
          map={coverTextures.spine}
          color={coverTextures.spine ? 0xffffff : 0x151525}
          roughness={roughness}
          metalness={metalness}
        />
      </mesh>

      {/* Back cover (visible from behind) */}
      <mesh position={[0, 0, -(pageDepth / 2 + coverThickness / 2)]}>
        <boxGeometry args={[safe(trimWidth), safe(trimHeight), safe(coverThickness)]} />
        <meshStandardMaterial
          map={coverTextures.back}
          color={coverTextures.back ? 0xffffff : 0x1a1a2e}
          roughness={roughness}
          metalness={metalness}
        />
      </mesh>

      {/* Page block */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[safe(trimWidth * 0.98), safe(trimHeight * 0.98), safe(pageDepth)]} />
        <meshStandardMaterial color="#f5f0e8" roughness={0.95} metalness={0} />
      </mesh>

      {/* Right page edge */}
      <mesh position={[trimWidth / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[safe(pageDepth), safe(trimHeight * 0.98)]} />
        <meshStandardMaterial color="#e8e0d4" roughness={0.95} metalness={0} />
      </mesh>

      {/* Top page edge */}
      <mesh position={[0, trimHeight / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[safe(trimWidth * 0.98), safe(pageDepth)]} />
        <meshStandardMaterial color="#ede6da" roughness={0.95} metalness={0} />
      </mesh>

      {/* Bottom page edge */}
      <mesh position={[0, -trimHeight / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[safe(trimWidth * 0.98), safe(pageDepth)]} />
        <meshStandardMaterial color="#ede6da" roughness={0.95} metalness={0} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Page Stack (dynamic thickness based on page count)
// ---------------------------------------------------------------------------

function PageStack({
  width,
  height,
  depth,
  position,
}: {
  width: number;
  height: number;
  depth: number;
  position: [number, number, number];
}) {
  if (depth < 0.003) return null;
  return (
    <mesh position={position}>
      <boxGeometry args={[safe(width), safe(height), safe(depth)]} />
      <meshStandardMaterial color="#f5f0e8" roughness={0.95} metalness={0} />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Visible Page Surface (shows real manuscript content)
// ---------------------------------------------------------------------------

function PageSurface({
  width,
  height,
  position,
  texture,
  side = THREE.FrontSide,
}: {
  width: number;
  height: number;
  position: [number, number, number];
  texture: THREE.Texture | null;
  side?: THREE.Side;
}) {
  return (
    <mesh position={position}>
      <planeGeometry args={[safe(width), safe(height)]} />
      {texture ? (
        <meshStandardMaterial
          map={texture}
          roughness={0.9}
          metalness={0}
          side={side}
        />
      ) : (
        <meshStandardMaterial
          color="#f5f0e8"
          roughness={0.9}
          metalness={0}
          side={side}
        />
      )}
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Flipping Page — stable geometry with Bezier-curve deformation
// ---------------------------------------------------------------------------

function FlippingPage({
  width,
  height,
  flipProgress,
  leftStackDepth,
  rightStackDepth,
  texture,
}: {
  width: number;
  height: number;
  flipProgress: number;
  leftStackDepth: number;
  rightStackDepth: number;
  texture: THREE.Texture | null;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const segments = 20;

  // Persistent geometry — never recreated
  const geometry = useStablePlaneGeometry(width, height, segments, 1);

  useFrame(() => {
    if (!meshRef.current) return;
    const posAttr = meshRef.current.geometry.getAttribute('position');
    if (!posAttr) return;

    const progress = safe(flipProgress, 0);

    // When not flipping, keep flat
    if (progress <= 0.001 || progress >= 0.999) {
      // Reset to flat (only if needed)
      const origGeo = new THREE.PlaneGeometry(safe(width), safe(height), segments, 1);
      const origPos = origGeo.getAttribute('position');
      let needsUpdate = false;
      for (let i = 0; i < posAttr.count; i++) {
        const ox = origPos.getX(i);
        const oz = origPos.getZ(i);
        if (Math.abs(posAttr.getX(i) - ox) > 0.0001 || Math.abs(posAttr.getZ(i) - oz) > 0.0001) {
          posAttr.setX(i, ox);
          posAttr.setZ(i, oz);
          needsUpdate = true;
        }
      }
      if (needsUpdate) {
        posAttr.needsUpdate = true;
        meshRef.current.geometry.computeVertexNormals();
      }
      origGeo.dispose();
      return;
    }

    // Bezier-curve page curl
    const curlRadius = safe(width * 0.12, 0.01);
    const travelX = width;

    // Sinusoidal curl intensity — peaks at midpoint
    const curlIntensity = Math.sin(progress * Math.PI);

    for (let i = 0; i < posAttr.count; i++) {
      const col = i % (segments + 1);
      const origX = (col / segments) * width - width / 2;
      const origY = posAttr.getY(i);

      // t = normalized position along page width (0=spine, 1=free edge)
      const t = (origX + width / 2) / safe(width, 1);

      // Travel distance for this vertex (free edge leads)
      const vertexDelay = (1 - t) * 0.3; // Free edge moves first
      const vertexProgress = Math.max(0, Math.min(1, (progress - vertexDelay) / (1 - vertexDelay)));

      // X: linear travel with curl offset
      const baseX = origX - travelX * vertexProgress;

      // Z: Bezier curl height
      const curlWave = Math.sin(t * Math.PI);
      const liftHeight = curlIntensity * curlRadius * curlWave * (1 - Math.abs(progress - 0.5) * 2);

      // Subtle spine-anchored curve
      const spineCurve = curlIntensity * 0.15 * Math.sin(t * Math.PI * 0.5) * curlRadius;

      posAttr.setX(i, safe(baseX));
      posAttr.setY(i, origY);
      posAttr.setZ(i, safe(Math.max(0, liftHeight + spineCurve)));
    }

    posAttr.needsUpdate = true;
    meshRef.current.geometry.computeVertexNormals();
  });

  const zBase = Math.max(safe(leftStackDepth), safe(rightStackDepth)) + 0.004;

  return (
    <mesh ref={meshRef} geometry={geometry} position={[0, 0, zBase]}>
      {texture ? (
        <meshStandardMaterial
          map={texture}
          roughness={0.85}
          metalness={0}
          side={THREE.DoubleSide}
        />
      ) : (
        <meshStandardMaterial
          color="#f5f0e8"
          roughness={0.85}
          metalness={0}
          side={THREE.DoubleSide}
        />
      )}
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Opened Front Cover (pivots from spine)
// ---------------------------------------------------------------------------

function OpenedFrontCover({
  trimWidth,
  trimHeight,
  coverThickness,
  openAmount,
  coverTextures,
  roughness,
  metalness,
}: {
  trimWidth: number;
  trimHeight: number;
  coverThickness: number;
  openAmount: number;
  coverTextures: CoverTextures;
  roughness: number;
  metalness: number;
}) {
  const coverRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (coverRef.current) {
      coverRef.current.rotation.y = -openAmount * Math.PI * 0.88;
    }
  });

  return (
    <group ref={coverRef} position={[-trimWidth, 0, 0]}>
      {/* Front cover board — inner side visible */}
      <mesh position={[trimWidth / 2, 0, coverThickness / 2]}>
        <boxGeometry args={[safe(trimWidth), safe(trimHeight), safe(coverThickness)]} />
        {/* The outer side has the front cover texture */}
        <meshStandardMaterial
          map={coverTextures.front}
          color={coverTextures.front ? 0xffffff : 0x1a1a2e}
          roughness={roughness}
          metalness={metalness}
        />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Main Paperback Book Component
// ---------------------------------------------------------------------------

export default function PaperbackBook({
  trimWidth,
  trimHeight,
  spineWidth,
  pageCount,
  currentPage,
  isOpen,
  flipProgress,
  isFlippingForward,
  pageTextures,
  coverTextures,
  coverFinish = 'matte',
  onFlipComplete,
}: PaperbackBookProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [openAmount, setOpenAmount] = useState(0);

  // Cover dimensions
  const coverThickness = 0.012;
  const pageDepth = safe(Math.max(spineWidth * 0.85, 0.04));

  // Animate book opening (smooth lerp)
  useFrame((_, delta) => {
    const targetOpen = isOpen ? 1 : 0;
    const dt = Math.min(delta, 0.05); // Cap delta
    setOpenAmount(prev => {
      const next = prev + (targetOpen - prev) * Math.min(dt * 3, 0.12);
      return Math.max(0, Math.min(1, next));
    });
  });

  // Cover material properties
  const coverRoughness = coverFinish === 'glossy' ? 0.3 : 0.7;
  const coverMetalness = coverFinish === 'glossy' ? 0.1 : 0;

  // Page distribution (dynamic thickness)
  const totalPages = Math.max(pageCount, 1);
  const currentSpread = Math.floor(currentPage / 2);
  const leftPages = currentSpread;
  const rightPages = totalPages - currentSpread;
  const pageThickness = pageDepth / totalPages;

  const leftStackDepth = safe(Math.max(leftPages * pageThickness, 0.003));
  const rightStackDepth = safe(Math.max(rightPages * pageThickness, 0.003));

  // Page texture indices for current spread
  const leftPageTexture = pageTextures.get(currentSpread * 2 - 1) || null;
  const rightPageTexture = pageTextures.get(currentSpread * 2) || null;
  const flippingTexture = pageTextures.get(
    isFlippingForward ? currentSpread * 2 : currentSpread * 2 - 1
  ) || null;

  return (
    <group ref={groupRef}>
      {!isOpen && openAmount < 0.05 ? (
        // ━━━ CLOSED BOOK ━━━
        <PaperbackFrontCoverClosed
          trimWidth={trimWidth}
          trimHeight={trimHeight}
          spineWidth={spineWidth}
          pageDepth={pageDepth}
          coverThickness={coverThickness}
          coverTextures={coverTextures}
          roughness={coverRoughness}
          metalness={coverMetalness}
        />
      ) : (
        // ━━━ OPEN BOOK ━━━
        <>
          {/* Left page stack (grows as you flip forward) */}
          <PageStack
            width={trimWidth * 0.98}
            height={trimHeight * 0.98}
            depth={leftStackDepth}
            position={[-trimWidth / 2, 0, leftStackDepth / 2]}
          />

          {/* Right page stack (shrinks as you flip forward) */}
          <PageStack
            width={trimWidth * 0.98}
            height={trimHeight * 0.98}
            depth={rightStackDepth}
            position={[trimWidth / 2, 0, rightStackDepth / 2]}
          />

          {/* Left visible page */}
          <PageSurface
            width={trimWidth * 0.94}
            height={trimHeight * 0.94}
            position={[-trimWidth / 2, 0, leftStackDepth + 0.002]}
            texture={leftPageTexture}
          />

          {/* Right visible page */}
          <PageSurface
            width={trimWidth * 0.94}
            height={trimHeight * 0.94}
            position={[trimWidth / 2, 0, rightStackDepth + 0.002]}
            texture={rightPageTexture}
          />

          {/* Flipping page animation */}
          {flipProgress > 0.005 && flipProgress < 0.995 && (
            <FlippingPage
              width={trimWidth * 0.94}
              height={trimHeight * 0.94}
              flipProgress={flipProgress}
              leftStackDepth={leftStackDepth}
              rightStackDepth={rightStackDepth}
              texture={flippingTexture}
            />
          )}

          {/* Back cover (flat on table) */}
          <mesh position={[-trimWidth / 2, 0, -(coverThickness / 2)]}>
            <boxGeometry args={[safe(trimWidth), safe(trimHeight), safe(coverThickness)]} />
            <meshStandardMaterial
              map={coverTextures.back}
              color={coverTextures.back ? 0xffffff : 0x1a1a2e}
              roughness={coverRoughness}
              metalness={coverMetalness}
            />
          </mesh>

          {/* Front cover (opened, pivoting from spine) */}
          <OpenedFrontCover
            trimWidth={trimWidth}
            trimHeight={trimHeight}
            coverThickness={coverThickness}
            openAmount={openAmount}
            coverTextures={coverTextures}
            roughness={coverRoughness}
            metalness={coverMetalness}
          />

          {/* Spine (visible when open) */}
          <mesh position={[-trimWidth, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[safe(pageDepth), safe(trimHeight)]} />
            <meshStandardMaterial
              map={coverTextures.spine}
              color={coverTextures.spine ? 0xffffff : 0x151525}
              roughness={coverRoughness}
              metalness={coverMetalness}
            />
          </mesh>
        </>
      )}
    </group>
  );
}
