'use client';

import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { CoverTextures } from '../BookPreview3D';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface HardcoverBookProps {
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
// NaN-safe helper
// ---------------------------------------------------------------------------

function safe(v: number, fallback = 0.001): number {
  if (!Number.isFinite(v) || Number.isNaN(v)) return fallback;
  return Math.max(v, 0.001);
}

// ---------------------------------------------------------------------------
// Persistent geometry hook
// ---------------------------------------------------------------------------

function useStablePlaneGeometry(width: number, height: number, segX: number, segY: number) {
  return useMemo(() => {
    return new THREE.PlaneGeometry(safe(width), safe(height), segX, segY);
  }, [width, height, segX, segY]);
}

// ---------------------------------------------------------------------------
// Hard Board — thick rigid cover with front/spine/back texture mapping
// ---------------------------------------------------------------------------

function HardBoard({
  width,
  height,
  thickness,
  position,
  texture,
  roughness,
  metalness,
}: {
  width: number;
  height: number;
  thickness: number;
  position: [number, number, number];
  texture: THREE.Texture | null;
  roughness: number;
  metalness: number;
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={[safe(width), safe(height), safe(thickness)]} />
      <meshStandardMaterial
        map={texture}
        color={texture ? 0xffffff : 0x1a1a2e}
        roughness={roughness}
        metalness={metalness}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Endpaper — decorative paper inside covers
// ---------------------------------------------------------------------------

function Endpaper({
  width,
  height,
  position,
  color = '#c4a882',
}: {
  width: number;
  height: number;
  position: [number, number, number];
  color?: string;
}) {
  return (
    <mesh position={position}>
      <planeGeometry args={[safe(width), safe(height)]} />
      <meshStandardMaterial color={color} roughness={0.85} metalness={0} side={THREE.DoubleSide} />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Page Stack
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
// Page Surface (visible page with real manuscript texture)
// ---------------------------------------------------------------------------

function PageSurface({
  width,
  height,
  position,
  texture,
}: {
  width: number;
  height: number;
  position: [number, number, number];
  texture: THREE.Texture | null;
}) {
  return (
    <mesh position={position}>
      <planeGeometry args={[safe(width), safe(height)]} />
      {texture ? (
        <meshStandardMaterial map={texture} roughness={0.9} metalness={0} />
      ) : (
        <meshStandardMaterial color="#f5f0e8" roughness={0.9} metalness={0} />
      )}
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Hardcover Flipping Page — stiffer than paperback
// ---------------------------------------------------------------------------

function HardcoverFlippingPage({
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
  const segments = 16;

  const geometry = useStablePlaneGeometry(width, height, segments, 1);

  useFrame(() => {
    if (!meshRef.current) return;
    const posAttr = meshRef.current.geometry.getAttribute('position');
    if (!posAttr) return;

    const progress = safe(flipProgress, 0);

    if (progress <= 0.001 || progress >= 0.999) {
      // Reset to flat
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

    const curlRadius = safe(width * 0.1, 0.01);
    const travelX = width;
    const curlIntensity = Math.sin(progress * Math.PI);

    // Hardcover pages are stiffer — less curl
    const stiffness = 0.5;

    for (let i = 0; i < posAttr.count; i++) {
      const col = i % (segments + 1);
      const origX = (col / segments) * width - width / 2;
      const origY = posAttr.getY(i);
      const t = (origX + width / 2) / safe(width, 1);

      const baseX = origX - travelX * progress;
      const curlHeight = curlIntensity * curlRadius * Math.sin(t * Math.PI) * stiffness * (1 - Math.abs(progress - 0.5) * 2);

      posAttr.setX(i, safe(baseX));
      posAttr.setY(i, origY);
      posAttr.setZ(i, safe(Math.max(0, curlHeight)));
    }

    posAttr.needsUpdate = true;
    meshRef.current.geometry.computeVertexNormals();
  });

  const zBase = Math.max(safe(leftStackDepth), safe(rightStackDepth)) + 0.004;

  return (
    <mesh ref={meshRef} geometry={geometry} position={[0, 0, zBase]}>
      {texture ? (
        <meshStandardMaterial map={texture} roughness={0.85} metalness={0} side={THREE.DoubleSide} />
      ) : (
        <meshStandardMaterial color="#f5f0e8" roughness={0.85} metalness={0} side={THREE.DoubleSide} />
      )}
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Main Hardcover Book Component
// ---------------------------------------------------------------------------

export default function HardcoverBook({
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
  coverFinish = 'glossy',
  onFlipComplete,
}: HardcoverBookProps) {
  const groupRef = useRef<THREE.Group>(null);
  const frontCoverRef = useRef<THREE.Group>(null);
  const [openAmount, setOpenAmount] = useState(0);

  // Hardcover dimensions
  const boardThickness = 0.04; // Thick rigid board
  const coverOverhang = 0.04; // Cover extends beyond pages
  const pageDepth = safe(Math.max(spineWidth * 0.8, 0.05));
  const hingeGap = 0.02; // Visible hinge gap

  // Animate opening — hardcover opens more deliberately
  useFrame((_, delta) => {
    const targetOpen = isOpen ? 1 : 0;
    const dt = Math.min(delta, 0.05);
    setOpenAmount(prev => {
      const next = prev + (targetOpen - prev) * Math.min(dt * 2.5, 0.1);
      return Math.max(0, Math.min(1, next));
    });

    if (frontCoverRef.current) {
      // Hardcover opens rigidly from hinge
      frontCoverRef.current.rotation.y = -openAmount * Math.PI * 0.85;
    }
  });

  const coverRoughness = coverFinish === 'glossy' ? 0.25 : 0.6;
  const coverMetalness = coverFinish === 'glossy' ? 0.15 : 0.02;

  // Dynamic page distribution
  const totalPages = Math.max(pageCount, 1);
  const currentSpread = Math.floor(currentPage / 2);
  const leftPages = currentSpread;
  const rightPages = totalPages - currentSpread;
  const pageThickness = pageDepth / totalPages;
  const leftStackDepth = safe(Math.max(leftPages * pageThickness, 0.003));
  const rightStackDepth = safe(Math.max(rightPages * pageThickness, 0.003));

  // Cover dimensions with overhang
  const coverW = trimWidth + coverOverhang * 2;
  const coverH = trimHeight + coverOverhang * 2;

  // Page textures for current spread
  const leftPageTexture = pageTextures.get(currentSpread * 2 - 1) || null;
  const rightPageTexture = pageTextures.get(currentSpread * 2) || null;
  const flippingTexture = pageTextures.get(
    isFlippingForward ? currentSpread * 2 : currentSpread * 2 - 1
  ) || null;

  return (
    <group ref={groupRef}>
      {!isOpen && openAmount < 0.05 ? (
        // ━━━ CLOSED HARDCOVER ━━━
        <>
          {/* Page block */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[safe(trimWidth * 0.96), safe(trimHeight * 0.96), safe(pageDepth)]} />
            <meshStandardMaterial color="#f5f0e8" roughness={0.95} metalness={0} />
          </mesh>

          {/* Front Board with front cover texture */}
          <HardBoard
            width={coverW}
            height={coverH}
            thickness={boardThickness}
            position={[0, 0, pageDepth / 2 + boardThickness / 2]}
            texture={coverTextures.front}
            roughness={coverRoughness}
            metalness={coverMetalness}
          />

          {/* Back Board with back cover texture */}
          <HardBoard
            width={coverW}
            height={coverH}
            thickness={boardThickness}
            position={[0, 0, -(pageDepth / 2 + boardThickness / 2)]}
            texture={coverTextures.back}
            roughness={coverRoughness}
            metalness={coverMetalness}
          />

          {/* Spine shell with spine texture */}
          <mesh position={[-coverW / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[safe(pageDepth + boardThickness * 2), safe(coverH)]} />
            <meshStandardMaterial
              map={coverTextures.spine}
              color={coverTextures.spine ? 0xffffff : 0x151525}
              roughness={coverRoughness}
              metalness={coverMetalness}
            />
          </mesh>

          {/* Page edges */}
          <mesh position={[(trimWidth * 0.96) / 2 + coverOverhang / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[safe(pageDepth), safe(trimHeight * 0.96)]} />
            <meshStandardMaterial color="#e8e0d4" roughness={0.95} metalness={0} />
          </mesh>
          <mesh position={[0, (trimHeight * 0.96) / 2 + coverOverhang / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[safe(trimWidth * 0.96), safe(pageDepth)]} />
            <meshStandardMaterial color="#ede6da" roughness={0.95} metalness={0} />
          </mesh>
          <mesh position={[0, -((trimHeight * 0.96) / 2 + coverOverhang / 2), 0]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[safe(trimWidth * 0.96), safe(pageDepth)]} />
            <meshStandardMaterial color="#ede6da" roughness={0.95} metalness={0} />
          </mesh>
        </>
      ) : (
        // ━━━ OPEN HARDCOVER ━━━
        <>
          {/* Left page stack */}
          <PageStack
            width={trimWidth * 0.94}
            height={trimHeight * 0.94}
            depth={leftStackDepth}
            position={[-trimWidth / 2, 0, leftStackDepth / 2]}
          />

          {/* Right page stack */}
          <PageStack
            width={trimWidth * 0.94}
            height={trimHeight * 0.94}
            depth={rightStackDepth}
            position={[trimWidth / 2, 0, rightStackDepth / 2]}
          />

          {/* Left visible page */}
          <PageSurface
            width={trimWidth * 0.9}
            height={trimHeight * 0.9}
            position={[-trimWidth / 2, 0, leftStackDepth + 0.002]}
            texture={leftPageTexture}
          />

          {/* Right visible page */}
          <PageSurface
            width={trimWidth * 0.9}
            height={trimHeight * 0.9}
            position={[trimWidth / 2, 0, rightStackDepth + 0.002]}
            texture={rightPageTexture}
          />

          {/* Flipping page */}
          {flipProgress > 0.005 && flipProgress < 0.995 && (
            <HardcoverFlippingPage
              width={trimWidth * 0.9}
              height={trimHeight * 0.9}
              flipProgress={flipProgress}
              leftStackDepth={leftStackDepth}
              rightStackDepth={rightStackDepth}
              texture={flippingTexture}
            />
          )}

          {/* Endpaper - left side */}
          <Endpaper
            width={trimWidth * 0.92}
            height={trimHeight * 0.92}
            position={[-trimWidth / 2, 0, boardThickness + 0.003]}
          />

          {/* Endpaper - right side */}
          <Endpaper
            width={trimWidth * 0.92}
            height={trimHeight * 0.92}
            position={[trimWidth / 2, 0, boardThickness + 0.003]}
          />

          {/* Back board (flat on table) */}
          <HardBoard
            width={coverW}
            height={coverH}
            thickness={boardThickness}
            position={[-trimWidth / 2, 0, -(boardThickness / 2)]}
            texture={coverTextures.back}
            roughness={coverRoughness}
            metalness={coverMetalness}
          />

          {/* Front board (pivoting open from hinge) */}
          <group ref={frontCoverRef} position={[-trimWidth, 0, pageDepth / 2]}>
            <HardBoard
              width={coverW}
              height={coverH}
              thickness={boardThickness}
              position={[0, 0, boardThickness / 2]}
              texture={coverTextures.front}
              roughness={coverRoughness}
              metalness={coverMetalness}
            />
          </group>

          {/* Hinge gap visual */}
          <mesh position={[-trimWidth, 0, 0]}>
            <boxGeometry args={[safe(hingeGap), safe(trimHeight * 0.94), safe(pageDepth * 0.9)]} />
            <meshStandardMaterial color="#2a2a3e" roughness={0.8} metalness={0.1} />
          </mesh>

          {/* Spine with texture */}
          <mesh position={[-trimWidth - hingeGap / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[safe(pageDepth + boardThickness * 2), safe(coverH)]} />
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
