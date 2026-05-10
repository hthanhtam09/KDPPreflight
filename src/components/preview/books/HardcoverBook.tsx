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

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
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
// Closed Hardcover — multi-material boards with correct face mapping
// ---------------------------------------------------------------------------

function ClosedHardcover({
  trimWidth,
  trimHeight,
  pageDepth,
  boardThickness,
  coverOverhang,
  coverTextures,
  roughness,
  metalness,
}: {
  trimWidth: number;
  trimHeight: number;
  pageDepth: number;
  boardThickness: number;
  coverOverhang: number;
  coverTextures: CoverTextures;
  roughness: number;
  metalness: number;
}) {
  const coverColor = 0x1a1a2e;
  const pageEdgeColor = '#e8e0d4';
  const trimEdgeColor = '#ede6da';
  const innerColor = '#f5f0e8';

  // Cover dimensions with overhang
  const coverW = trimWidth + coverOverhang * 2;
  const coverH = trimHeight + coverOverhang * 2;
  const totalThickness = safe(pageDepth + boardThickness * 2);

  return (
    <group>
      {/* ── Front board (top, +Z face has front cover texture) ── */}
      <mesh position={[0, 0, pageDepth / 2 + boardThickness / 2]}>
        <boxGeometry args={[safe(coverW), safe(coverH), safe(boardThickness)]} />
        {/* +x: right edge */}
        <meshStandardMaterial attach="material-0" color="#1e1e30" roughness={roughness} metalness={metalness} />
        {/* -x: left edge (spine side) */}
        <meshStandardMaterial attach="material-1" color="#151525" roughness={roughness} metalness={metalness} />
        {/* +y: top edge */}
        <meshStandardMaterial attach="material-2" color="#1e1e30" roughness={roughness} metalness={metalness} />
        {/* -y: bottom edge */}
        <meshStandardMaterial attach="material-3" color="#1e1e30" roughness={roughness} metalness={metalness} />
        {/* +z: FRONT COVER TEXTURE (top face, visible from above) */}
        <meshStandardMaterial
          attach="material-4"
          map={coverTextures.front}
          color={coverTextures.front ? 0xffffff : coverColor}
          roughness={roughness}
          metalness={metalness}
        />
        {/* -z: inner face (facing pages) */}
        <meshStandardMaterial attach="material-5" color={innerColor} roughness={0.92} metalness={0} />
      </mesh>

      {/* ── Back board (bottom, -Z face has back cover texture) ── */}
      <mesh position={[0, 0, -(pageDepth / 2 + boardThickness / 2)]}>
        <boxGeometry args={[safe(coverW), safe(coverH), safe(boardThickness)]} />
        {/* +x: right edge */}
        <meshStandardMaterial attach="material-0" color="#1e1e30" roughness={roughness} metalness={metalness} />
        {/* -x: left edge (spine side) */}
        <meshStandardMaterial attach="material-1" color="#151525" roughness={roughness} metalness={metalness} />
        {/* +y: top edge */}
        <meshStandardMaterial attach="material-2" color="#1e1e30" roughness={roughness} metalness={metalness} />
        {/* -y: bottom edge */}
        <meshStandardMaterial attach="material-3" color="#1e1e30" roughness={roughness} metalness={metalness} />
        {/* +z: inner face (facing pages) */}
        <meshStandardMaterial attach="material-4" color={innerColor} roughness={0.92} metalness={0} />
        {/* -z: BACK COVER TEXTURE (bottom face, visible from below) */}
        <meshStandardMaterial
          attach="material-5"
          map={coverTextures.back}
          color={coverTextures.back ? 0xffffff : coverColor}
          roughness={roughness}
          metalness={metalness}
        />
      </mesh>

      {/* ── Page block (between boards) ── */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[safe(trimWidth * 0.96), safe(trimHeight * 0.96), safe(pageDepth)]} />
        <meshStandardMaterial color="#f5f0e8" roughness={0.95} metalness={0} />
      </mesh>

      {/* ── Rigid spine shell (separate from cover boards) ── */}
      <mesh position={[-coverW / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[safe(totalThickness), safe(coverH)]} />
        <meshStandardMaterial
          map={coverTextures.spine}
          color={coverTextures.spine ? 0xffffff : 0x151525}
          roughness={roughness}
          metalness={metalness}
        />
      </mesh>

      {/* ── Page edges (right side) ── */}
      <mesh position={[(trimWidth * 0.96) / 2 + coverOverhang / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[safe(pageDepth), safe(trimHeight * 0.96)]} />
        <meshStandardMaterial color="#e8e0d4" roughness={0.95} metalness={0} />
      </mesh>

      {/* ── Page edges (top) ── */}
      <mesh position={[0, (trimHeight * 0.96) / 2 + coverOverhang / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[safe(trimWidth * 0.96), safe(pageDepth)]} />
        <meshStandardMaterial color="#ede6da" roughness={0.95} metalness={0} />
      </mesh>

      {/* ── Page edges (bottom) ── */}
      <mesh position={[0, -((trimHeight * 0.96) / 2 + coverOverhang / 2), 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[safe(trimWidth * 0.96), safe(pageDepth)]} />
        <meshStandardMaterial color="#ede6da" roughness={0.95} metalness={0} />
      </mesh>
    </group>
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
// Page Surface (visible page with real manuscript texture and gutter dip)
// ---------------------------------------------------------------------------

function PageSurface({
  width,
  height,
  position,
  texture,
  isLeftPage = false,
}: {
  width: number;
  height: number;
  position: [number, number, number];
  texture: THREE.Texture | null;
  isLeftPage?: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const segments = 12;

  const geometry = useStablePlaneGeometry(width, height, segments, 1);

  useFrame(() => {
    if (!meshRef.current) return;
    const posAttr = meshRef.current.geometry.getAttribute('position');
    if (!posAttr) return;

    let needsUpdate = false;
    for (let i = 0; i < posAttr.count; i++) {
      const col = i % (segments + 1);
      const u = col / segments;

      const spineProximity = isLeftPage ? u : (1 - u);
      const gutterDip = 0.012 * Math.pow(spineProximity, 3);

      const currentZ = posAttr.getZ(i);
      if (Math.abs(currentZ + gutterDip) > 0.0001) {
        posAttr.setZ(i, -gutterDip);
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      posAttr.needsUpdate = true;
      meshRef.current.geometry.computeVertexNormals();
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry} position={position}>
      {texture ? (
        <meshStandardMaterial map={texture} roughness={0.92} metalness={0} />
      ) : (
        <meshStandardMaterial color="#f5f0e8" roughness={0.92} metalness={0} />
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

    // Hardcover pages are stiffer — less curl (0.5 vs 1.0 for paperback)
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
// Open Hardcover — spread with rigid boards, endpapers, hinge gap
// ---------------------------------------------------------------------------

function OpenHardcover({
  trimWidth,
  trimHeight,
  pageDepth,
  boardThickness,
  coverOverhang,
  hingeGap,
  openAmount,
  coverTextures,
  roughness,
  metalness,
  pageCount,
  currentPage,
  flipProgress,
  isFlippingForward,
  pageTextures,
}: {
  trimWidth: number;
  trimHeight: number;
  pageDepth: number;
  boardThickness: number;
  coverOverhang: number;
  hingeGap: number;
  openAmount: number;
  coverTextures: CoverTextures;
  roughness: number;
  metalness: number;
  pageCount: number;
  currentPage: number;
  flipProgress: number;
  isFlippingForward: boolean;
  pageTextures: Map<number, THREE.Texture | null>;
}) {
  const frontCoverPivotRef = useRef<THREE.Group>(null);

  // Cover dimensions with overhang
  const coverW = trimWidth + coverOverhang * 2;
  const coverH = trimHeight + coverOverhang * 2;

  // Dynamic page distribution
  const totalPages = Math.max(pageCount, 1);
  const currentSpread = Math.floor(currentPage / 2);
  const leftPages = currentSpread;
  const rightPages = totalPages - currentSpread;
  const pageThickness = pageDepth / totalPages;
  const leftStackDepth = safe(Math.max(leftPages * pageThickness, 0.003));
  const rightStackDepth = safe(Math.max(rightPages * pageThickness, 0.003));

  // Page textures
  const leftPageTexture = pageTextures.get(currentSpread * 2 - 1) || null;
  const rightPageTexture = pageTextures.get(currentSpread * 2) || null;
  const flippingTexture = pageTextures.get(
    isFlippingForward ? currentSpread * 2 : currentSpread * 2 - 1
  ) || null;

  const coverColor = 0x1a1a2e;
  const innerColor = '#f5f0e8';

  // Front cover pivot animation — hardcover opens stiffly from hinge
  useFrame(() => {
    if (!frontCoverPivotRef.current) return;

    const pivotZ = lerp(pageDepth / 2 + boardThickness / 2, boardThickness / 2, openAmount);

    frontCoverPivotRef.current.position.set(0, 0, pivotZ);
    // Hardcover opens more rigidly — slightly less than full π
    frontCoverPivotRef.current.rotation.y = -openAmount * Math.PI * 0.92;
  });

  return (
    <group>
      {/* ── Back board (flat on the right side) ── */}
      <mesh position={[trimWidth / 2, 0, boardThickness / 2]}>
        <boxGeometry args={[safe(coverW), safe(coverH), safe(boardThickness)]} />
        <meshStandardMaterial attach="material-0" color="#1e1e30" roughness={roughness} metalness={metalness} />
        <meshStandardMaterial attach="material-1" color="#151525" roughness={roughness} metalness={metalness} />
        <meshStandardMaterial attach="material-2" color="#1e1e30" roughness={roughness} metalness={metalness} />
        <meshStandardMaterial attach="material-3" color="#1e1e30" roughness={roughness} metalness={metalness} />
        {/* +z: inner face (inside of back cover) */}
        <meshStandardMaterial attach="material-4" color={innerColor} roughness={0.92} metalness={0} />
        {/* -z: BACK COVER ARTWORK (facing down) */}
        <meshStandardMaterial
          attach="material-5"
          map={coverTextures.back}
          color={coverTextures.back ? 0xffffff : coverColor}
          roughness={roughness}
          metalness={metalness}
        />
      </mesh>

      {/* ── Endpaper on back board ── */}
      <Endpaper
        width={trimWidth * 0.92}
        height={trimHeight * 0.92}
        position={[trimWidth / 2, 0, boardThickness + 0.003]}
      />

      {/* ── Left page stack ── */}
      <PageStack
        width={trimWidth * 0.94}
        height={trimHeight * 0.94}
        depth={leftStackDepth}
        position={[-trimWidth / 2, 0, leftStackDepth / 2 + boardThickness + hingeGap]}
      />

      {/* ── Right page stack ── */}
      <PageStack
        width={trimWidth * 0.94}
        height={trimHeight * 0.94}
        depth={rightStackDepth}
        position={[trimWidth / 2, 0, rightStackDepth / 2 + boardThickness + hingeGap]}
      />

      {/* ── Left visible page ── */}
      <PageSurface
        width={trimWidth * 0.9}
        height={trimHeight * 0.9}
        position={[-trimWidth / 2, 0, leftStackDepth + boardThickness + hingeGap + 0.002]}
        texture={leftPageTexture}
        isLeftPage={true}
      />

      {/* ── Right visible page ── */}
      <PageSurface
        width={trimWidth * 0.9}
        height={trimHeight * 0.9}
        position={[trimWidth / 2, 0, rightStackDepth + boardThickness + hingeGap + 0.002]}
        texture={rightPageTexture}
        isLeftPage={false}
      />

      {/* ── Flipping page ── */}
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

      {/* ── Front board (pivoting open from hinge) ── */}
      <group ref={frontCoverPivotRef}>
        <mesh position={[trimWidth / 2, 0, 0]}>
          <boxGeometry args={[safe(coverW), safe(coverH), safe(boardThickness)]} />
          <meshStandardMaterial attach="material-0" color="#1e1e30" roughness={roughness} metalness={metalness} />
          <meshStandardMaterial attach="material-1" color="#151525" roughness={roughness} metalness={metalness} />
          <meshStandardMaterial attach="material-2" color="#1e1e30" roughness={roughness} metalness={metalness} />
          <meshStandardMaterial attach="material-3" color="#1e1e30" roughness={roughness} metalness={metalness} />
          {/* +z: FRONT COVER TEXTURE */}
          <meshStandardMaterial
            attach="material-4"
            map={coverTextures.front}
            color={coverTextures.front ? 0xffffff : coverColor}
            roughness={roughness}
            metalness={metalness}
          />
          {/* -z: inner face */}
          <meshStandardMaterial attach="material-5" color={innerColor} roughness={0.92} metalness={0} />
        </mesh>

        {/* Endpaper on front board (visible when open) */}
        <mesh position={[trimWidth / 2, 0, -boardThickness - 0.003]}>
          <planeGeometry args={[safe(trimWidth * 0.92), safe(trimHeight * 0.92)]} />
          <meshStandardMaterial color="#c4a882" roughness={0.85} metalness={0} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* ── Hinge gap visual ── */}
      <mesh position={[0, 0, boardThickness / 2]}>
        <boxGeometry args={[safe(hingeGap), safe(trimHeight * 0.94), safe(pageDepth * 0.9)]} />
        <meshStandardMaterial color="#2a2a3e" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* ── Spine with texture (at gutter center) ── */}
      <mesh position={[0, 0, boardThickness / 2]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[safe(boardThickness * 2), safe(coverH * 0.96)]} />
        <meshStandardMaterial
          map={coverTextures.spine}
          color={coverTextures.spine ? 0xffffff : 0x151525}
          roughness={roughness}
          metalness={metalness}
        />
      </mesh>

      {/* ── Gutter shadow ── */}
      <mesh position={[0, 0, boardThickness + hingeGap + 0.001]}>
        <planeGeometry args={[safe(0.025), safe(trimHeight * 0.9)]} />
        <meshStandardMaterial color="#2a1a0a" roughness={1} metalness={0} transparent opacity={0.35} />
      </mesh>
    </group>
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
      return Math.max(0, Math.min(1.2, next));
    });
  });

  const coverRoughness = coverFinish === 'glossy' ? 0.25 : 0.6;
  const coverMetalness = coverFinish === 'glossy' ? 0.15 : 0.02;

  return (
    <group ref={groupRef}>
      {openAmount < 0.15 ? (
        // ━━━ CLOSED HARDCOVER ━━━
        <ClosedHardcover
          trimWidth={trimWidth}
          trimHeight={trimHeight}
          pageDepth={pageDepth}
          boardThickness={boardThickness}
          coverOverhang={coverOverhang}
          coverTextures={coverTextures}
          roughness={coverRoughness}
          metalness={coverMetalness}
        />
      ) : (
        // ━━━ OPEN HARDCOVER ━━━
        <OpenHardcover
          trimWidth={trimWidth}
          trimHeight={trimHeight}
          pageDepth={pageDepth}
          boardThickness={boardThickness}
          coverOverhang={coverOverhang}
          hingeGap={hingeGap}
          openAmount={openAmount}
          coverTextures={coverTextures}
          roughness={coverRoughness}
          metalness={coverMetalness}
          pageCount={pageCount}
          currentPage={currentPage}
          flipProgress={flipProgress}
          isFlippingForward={isFlippingForward}
          pageTextures={pageTextures}
        />
      )}
    </group>
  );
}
