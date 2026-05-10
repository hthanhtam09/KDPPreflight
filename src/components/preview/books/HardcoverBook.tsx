'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
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
// Z-fighting prevention constants
// ---------------------------------------------------------------------------

const RENDER_ORDER = {
  pageStack: 0,
  pageSurface: 10,
  flippingPage: 20,
  coverBoard: 5,
  spine: 3,
};

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

  const coverW = trimWidth + coverOverhang * 2;
  const coverH = trimHeight + coverOverhang * 2;
  const totalThickness = safe(pageDepth + boardThickness * 2);

  return (
    <group>
      {/* ── Front board (+Z face = front cover texture) ── */}
      <mesh position={[0, 0, pageDepth / 2 + boardThickness / 2]} renderOrder={RENDER_ORDER.coverBoard}>
        <boxGeometry args={[safe(coverW), safe(coverH), safe(boardThickness)]} />
        <meshStandardMaterial attach="material-0" color="#1e1e30" roughness={roughness} metalness={metalness} />
        <meshStandardMaterial attach="material-1" color="#151525" roughness={roughness} metalness={metalness} />
        <meshStandardMaterial attach="material-2" color="#1e1e30" roughness={roughness} metalness={metalness} />
        <meshStandardMaterial attach="material-3" color="#1e1e30" roughness={roughness} metalness={metalness} />
        <meshStandardMaterial
          attach="material-4"
          map={coverTextures.front}
          color={coverTextures.front ? 0xffffff : coverColor}
          roughness={roughness}
          metalness={metalness}
        />
        <meshStandardMaterial attach="material-5" color={innerColor} roughness={0.92} metalness={0} />
      </mesh>

      {/* ── Back board (-Z face = back cover texture) ── */}
      <mesh position={[0, 0, -(pageDepth / 2 + boardThickness / 2)]} renderOrder={RENDER_ORDER.coverBoard}>
        <boxGeometry args={[safe(coverW), safe(coverH), safe(boardThickness)]} />
        <meshStandardMaterial attach="material-0" color="#1e1e30" roughness={roughness} metalness={metalness} />
        <meshStandardMaterial attach="material-1" color="#151525" roughness={roughness} metalness={metalness} />
        <meshStandardMaterial attach="material-2" color="#1e1e30" roughness={roughness} metalness={metalness} />
        <meshStandardMaterial attach="material-3" color="#1e1e30" roughness={roughness} metalness={metalness} />
        <meshStandardMaterial attach="material-4" color={innerColor} roughness={0.92} metalness={0} />
        <meshStandardMaterial
          attach="material-5"
          map={coverTextures.back}
          color={coverTextures.back ? 0xffffff : coverColor}
          roughness={roughness}
          metalness={metalness}
        />
      </mesh>

      {/* ── Page block ── */}
      <mesh position={[0, 0, 0]} renderOrder={RENDER_ORDER.pageStack}>
        <boxGeometry args={[safe(trimWidth * 0.96), safe(trimHeight * 0.96), safe(pageDepth)]} />
        <meshStandardMaterial color="#f5f0e8" roughness={0.95} metalness={0} />
      </mesh>

      {/* ── Rigid spine shell ── */}
      <mesh position={[-coverW / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]} renderOrder={RENDER_ORDER.spine}>
        <planeGeometry args={[safe(totalThickness), safe(coverH)]} />
        <meshStandardMaterial
          map={coverTextures.spine}
          color={coverTextures.spine ? 0xffffff : 0x151525}
          roughness={roughness}
          metalness={metalness}
        />
      </mesh>

      {/* ── Page edges (right side) ── */}
      <mesh position={[(trimWidth * 0.96) / 2 + coverOverhang / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]} renderOrder={RENDER_ORDER.pageStack}>
        <planeGeometry args={[safe(pageDepth), safe(trimHeight * 0.96)]} />
        <meshStandardMaterial color="#e8e0d4" roughness={0.95} metalness={0} />
      </mesh>

      {/* ── Page edges (top) ── */}
      <mesh position={[0, (trimHeight * 0.96) / 2 + coverOverhang / 2, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={RENDER_ORDER.pageStack}>
        <planeGeometry args={[safe(trimWidth * 0.96), safe(pageDepth)]} />
        <meshStandardMaterial color="#ede6da" roughness={0.95} metalness={0} />
      </mesh>

      {/* ── Page edges (bottom) ── */}
      <mesh position={[0, -((trimHeight * 0.96) / 2 + coverOverhang / 2), 0]} rotation={[Math.PI / 2, 0, 0]} renderOrder={RENDER_ORDER.pageStack}>
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
    <mesh position={position} renderOrder={RENDER_ORDER.pageSurface}>
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
    <mesh position={position} renderOrder={RENDER_ORDER.pageStack}>
      <boxGeometry args={[safe(width), safe(height), safe(depth)]} />
      <meshStandardMaterial
        color="#f5f0e8"
        roughness={0.95}
        metalness={0}
        polygonOffset
        polygonOffsetFactor={1}
        polygonOffsetUnit={1}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Page Surface — stable, z-fight-free, with gutter dip
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
  const gutterApplied = useRef(false);

  const geometry = useStablePlaneGeometry(width, height, segments, 1);

  useEffect(() => {
    if (!meshRef.current || gutterApplied.current) return;
    const posAttr = meshRef.current.geometry.getAttribute('position');
    if (!posAttr) return;

    for (let i = 0; i < posAttr.count; i++) {
      const col = i % (segments + 1);
      const u = col / segments;
      const spineProximity = isLeftPage ? u : (1 - u);
      const gutterDip = 0.01 * Math.pow(spineProximity, 3);
      posAttr.setZ(i, -gutterDip);
    }

    posAttr.needsUpdate = true;
    meshRef.current.geometry.computeVertexNormals();
    gutterApplied.current = true;
  }, [isLeftPage, segments]);

  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: texture ? 0xffffff : 0xf5f0e8,
      map: texture,
      roughness: 0.92,
      metalness: 0,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnit: -1,
      depthWrite: true,
    });
  }, [texture]);

  useEffect(() => {
    if (material.map !== texture) {
      material.map = texture;
      material.color.set(texture ? 0xffffff : 0xf5f0e8);
      material.needsUpdate = true;
    }
  }, [material, texture]);

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={position}
      material={material}
      renderOrder={RENDER_ORDER.pageSurface}
      frustumCulled={false}
    />
  );
}

// ---------------------------------------------------------------------------
// Hardcover Flipping Page — stiffer curl, dual-sided
// ---------------------------------------------------------------------------

function HardcoverFlippingPage({
  width,
  height,
  flipProgress,
  leftStackDepth,
  rightStackDepth,
  frontTexture,
  backTexture,
}: {
  width: number;
  height: number;
  flipProgress: number;
  leftStackDepth: number;
  rightStackDepth: number;
  frontTexture: THREE.Texture | null;
  backTexture: THREE.Texture | null;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const segments = 14;
  const geometry = useStablePlaneGeometry(width, height, segments, 1);

  const origPositions = useMemo(() => {
    const geo = new THREE.PlaneGeometry(safe(width), safe(height), segments, 1);
    const pos = geo.getAttribute('position');
    const arr = new Float32Array(pos.array);
    geo.dispose();
    return arr;
  }, [width, height, segments]);

  const frontMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: frontTexture ? 0xffffff : 0xf5f0e8,
      map: frontTexture,
      roughness: 0.85,
      metalness: 0,
      side: THREE.FrontSide,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnit: -2,
      depthWrite: true,
    });
  }, [frontTexture]);

  const backMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: backTexture ? 0xffffff : 0xf5f0e8,
      map: backTexture,
      roughness: 0.85,
      metalness: 0,
      side: THREE.BackSide,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnit: -2,
      depthWrite: true,
    });
  }, [backTexture]);

  useEffect(() => {
    if (frontMaterial.map !== frontTexture) {
      frontMaterial.map = frontTexture;
      frontMaterial.color.set(frontTexture ? 0xffffff : 0xf5f0e8);
      frontMaterial.needsUpdate = true;
    }
  }, [frontMaterial, frontTexture]);

  useEffect(() => {
    if (backMaterial.map !== backTexture) {
      backMaterial.map = backTexture;
      backMaterial.color.set(backTexture ? 0xffffff : 0xf5f0e8);
      backMaterial.needsUpdate = true;
    }
  }, [backMaterial, backTexture]);

  useFrame(() => {
    if (!meshRef.current) return;
    const posAttr = meshRef.current.geometry.getAttribute('position');
    if (!posAttr) return;

    const progress = safe(flipProgress, 0);

    if (progress <= 0.001) {
      for (let i = 0; i < posAttr.count; i++) {
        const i3 = i * 3;
        posAttr.setX(i, origPositions[i3]);
        posAttr.setZ(i, origPositions[i3 + 2]);
      }
      posAttr.needsUpdate = true;
      meshRef.current.geometry.computeVertexNormals();
      return;
    }

    if (progress >= 0.999) {
      for (let i = 0; i < posAttr.count; i++) {
        const i3 = i * 3;
        posAttr.setX(i, origPositions[i3] - width);
        posAttr.setZ(i, 0);
      }
      posAttr.needsUpdate = true;
      meshRef.current.geometry.computeVertexNormals();
      return;
    }

    const curlRadius = safe(width * 0.08, 0.01);
    const travelX = width;
    const curlIntensity = Math.sin(progress * Math.PI);
    const stiffness = 0.5; // Hardcover pages are stiffer

    for (let i = 0; i < posAttr.count; i++) {
      const i3 = i * 3;
      const origX = origPositions[i3];
      const col = i % (segments + 1);
      const t = col / segments;

      const vertexDelay = (1 - t) * 0.2;
      const vertexProgress = Math.max(0, Math.min(1, (progress - vertexDelay) / (1 - vertexDelay)));

      const baseX = origX - travelX * vertexProgress;
      const curlWave = Math.sin(t * Math.PI);
      const liftHeight = curlIntensity * curlRadius * curlWave * stiffness * (1 - Math.abs(progress - 0.5) * 2);

      posAttr.setX(i, safe(baseX));
      posAttr.setZ(i, safe(Math.max(0, liftHeight)));
    }

    posAttr.needsUpdate = true;
    meshRef.current.geometry.computeVertexNormals();
  });

  const zBase = Math.max(safe(leftStackDepth), safe(rightStackDepth)) + 0.005;

  return (
    <group position={[0, 0, zBase]}>
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={frontMaterial}
        renderOrder={RENDER_ORDER.flippingPage}
        frustumCulled={false}
      />
      <mesh
        geometry={geometry}
        material={backMaterial}
        renderOrder={RENDER_ORDER.flippingPage}
        frustumCulled={false}
      />
    </group>
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

  const coverW = trimWidth + coverOverhang * 2;
  const coverH = trimHeight + coverOverhang * 2;

  const totalPages = Math.max(pageCount, 1);
  const currentSpread = Math.floor(currentPage / 2);
  const leftPages = Math.max(currentSpread, 0);
  const rightPages = Math.max(totalPages - currentSpread, 0);
  const pageThickness = pageDepth / totalPages;
  const leftStackDepth = safe(Math.max(leftPages * pageThickness, 0.003));
  const rightStackDepth = safe(Math.max(rightPages * pageThickness, 0.003));

  // Correct page spread logic
  const leftPageIndex = currentSpread === 0 ? -1 : (currentSpread * 2 - 1);
  const rightPageIndex = currentSpread * 2;

  const leftPageTexture = leftPageIndex >= 0 ? (pageTextures.get(leftPageIndex) || null) : null;
  const rightPageTexture = rightPageIndex < totalPages ? (pageTextures.get(rightPageIndex) || null) : null;

  const flipFrontIndex = isFlippingForward ? rightPageIndex : leftPageIndex;
  const flipBackIndex = isFlippingForward ? (rightPageIndex + 1) : (leftPageIndex - 1);
  const flipFrontTexture = flipFrontIndex >= 0 && flipFrontIndex < totalPages ? (pageTextures.get(flipFrontIndex) || null) : null;
  const flipBackTexture = flipBackIndex >= 0 && flipBackIndex < totalPages ? (pageTextures.get(flipBackIndex) || null) : null;

  const coverColor = 0x1a1a2e;
  const innerColor = '#f5f0e8';

  // Front cover pivot animation — hardcover opens stiffly from hinge
  useFrame(() => {
    if (!frontCoverPivotRef.current) return;
    const pivotZ = lerp(pageDepth / 2 + boardThickness / 2, boardThickness / 2, openAmount);
    frontCoverPivotRef.current.position.set(0, 0, pivotZ);
    // Hardcover opens ~160° (slightly less than full π)
    frontCoverPivotRef.current.rotation.y = -openAmount * Math.PI * 0.88;
  });

  const pageSurfaceW = trimWidth * 0.9;
  const pageSurfaceH = trimHeight * 0.9;

  return (
    <group>
      {/* ── Back board ── */}
      <mesh position={[trimWidth / 2, 0, boardThickness / 2]} renderOrder={RENDER_ORDER.coverBoard}>
        <boxGeometry args={[safe(coverW), safe(coverH), safe(boardThickness)]} />
        <meshStandardMaterial attach="material-0" color="#1e1e30" roughness={roughness} metalness={metalness} />
        <meshStandardMaterial attach="material-1" color="#151525" roughness={roughness} metalness={metalness} />
        <meshStandardMaterial attach="material-2" color="#1e1e30" roughness={roughness} metalness={metalness} />
        <meshStandardMaterial attach="material-3" color="#1e1e30" roughness={roughness} metalness={metalness} />
        <meshStandardMaterial attach="material-4" color={innerColor} roughness={0.92} metalness={0} />
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
        width={pageSurfaceW}
        height={pageSurfaceH}
        position={[-trimWidth / 2, 0, leftStackDepth + boardThickness + hingeGap + 0.002]}
        texture={leftPageTexture}
        isLeftPage={true}
      />

      {/* ── Right visible page ── */}
      <PageSurface
        width={pageSurfaceW}
        height={pageSurfaceH}
        position={[trimWidth / 2, 0, rightStackDepth + boardThickness + hingeGap + 0.002]}
        texture={rightPageTexture}
        isLeftPage={false}
      />

      {/* ── Flipping page ── */}
      {flipProgress > 0.005 && flipProgress < 0.995 && (
        <HardcoverFlippingPage
          width={pageSurfaceW}
          height={pageSurfaceH}
          flipProgress={flipProgress}
          leftStackDepth={leftStackDepth}
          rightStackDepth={rightStackDepth}
          frontTexture={flipFrontTexture}
          backTexture={flipBackTexture}
        />
      )}

      {/* ── Front board (pivoting open from hinge) ── */}
      <group ref={frontCoverPivotRef}>
        <mesh position={[trimWidth / 2, 0, 0]} renderOrder={RENDER_ORDER.coverBoard}>
          <boxGeometry args={[safe(coverW), safe(coverH), safe(boardThickness)]} />
          <meshStandardMaterial attach="material-0" color="#1e1e30" roughness={roughness} metalness={metalness} />
          <meshStandardMaterial attach="material-1" color="#151525" roughness={roughness} metalness={metalness} />
          <meshStandardMaterial attach="material-2" color="#1e1e30" roughness={roughness} metalness={metalness} />
          <meshStandardMaterial attach="material-3" color="#1e1e30" roughness={roughness} metalness={metalness} />
          <meshStandardMaterial
            attach="material-4"
            map={coverTextures.front}
            color={coverTextures.front ? 0xffffff : coverColor}
            roughness={roughness}
            metalness={metalness}
          />
          <meshStandardMaterial attach="material-5" color={innerColor} roughness={0.92} metalness={0} />
        </mesh>

        {/* Endpaper on front board */}
        <mesh position={[trimWidth / 2, 0, -boardThickness - 0.003]} renderOrder={RENDER_ORDER.pageSurface}>
          <planeGeometry args={[safe(trimWidth * 0.92), safe(trimHeight * 0.92)]} />
          <meshStandardMaterial color="#c4a882" roughness={0.85} metalness={0} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* ── Hinge gap visual ── */}
      <mesh position={[0, 0, boardThickness / 2]} renderOrder={RENDER_ORDER.pageStack}>
        <boxGeometry args={[safe(hingeGap), safe(trimHeight * 0.94), safe(pageDepth * 0.9)]} />
        <meshStandardMaterial color="#2a2a3e" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* ── Spine with texture ── */}
      <mesh position={[0, 0, boardThickness / 2]} rotation={[0, Math.PI / 2, 0]} renderOrder={RENDER_ORDER.spine}>
        <planeGeometry args={[safe(boardThickness * 2), safe(coverH * 0.96)]} />
        <meshStandardMaterial
          map={coverTextures.spine}
          color={coverTextures.spine ? 0xffffff : 0x151525}
          roughness={roughness}
          metalness={metalness}
        />
      </mesh>

      {/* ── Gutter shadow ── */}
      <mesh position={[0, 0, boardThickness + hingeGap + 0.001]} renderOrder={RENDER_ORDER.pageSurface}>
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

  const boardThickness = 0.04;
  const coverOverhang = 0.04;
  const pageDepth = safe(Math.max(spineWidth * 0.8, 0.05));
  const hingeGap = 0.02;

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
