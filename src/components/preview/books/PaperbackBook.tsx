'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
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

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

// ---------------------------------------------------------------------------
// Stable geometry — created once per dimensions, never recreated in useFrame
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
// Helper: Create a stable MeshStandardMaterial with z-fighting prevention
// ---------------------------------------------------------------------------

function createPageMaterial(texture: THREE.Texture | null, opts?: { side?: THREE.Side; polyOffset?: number }) {
  return new THREE.MeshStandardMaterial({
    color: texture ? 0xffffff : 0xf5f0e8,
    map: texture,
    roughness: 0.92,
    metalness: 0,
    side: opts?.side ?? THREE.FrontSide,
    polygonOffset: true,
    polygonOffsetFactor: opts?.polyOffset ?? -1,
    polygonOffsetUnit: -1,
    depthWrite: true,
  });
}

// ---------------------------------------------------------------------------
// Closed Paperback Book — unified structure with multi-material covers
// ---------------------------------------------------------------------------

function ClosedPaperback({
  trimWidth,
  trimHeight,
  pageDepth,
  coverThickness,
  coverTextures,
  roughness,
  metalness,
}: {
  trimWidth: number;
  trimHeight: number;
  pageDepth: number;
  coverThickness: number;
  coverTextures: CoverTextures;
  roughness: number;
  metalness: number;
}) {
  const coverColor = 0x1a1a2e;
  const pageEdgeColor = '#e8e0d4';
  const trimEdgeColor = '#ede6da';
  const innerColor = '#f5f0e8';

  const totalThickness = safe(pageDepth + coverThickness * 2);

  return (
    <group>
      {/* ── Front cover board (+Z face = front cover texture) ── */}
      <mesh position={[0, 0, pageDepth / 2 + coverThickness / 2]} renderOrder={RENDER_ORDER.coverBoard}>
        <boxGeometry args={[safe(trimWidth), safe(trimHeight), safe(coverThickness)]} />
        <meshStandardMaterial attach="material-0" color={pageEdgeColor} roughness={0.95} metalness={0} />
        <meshStandardMaterial attach="material-1" color="#151525" roughness={roughness} metalness={metalness} />
        <meshStandardMaterial attach="material-2" color={trimEdgeColor} roughness={0.95} metalness={0} />
        <meshStandardMaterial attach="material-3" color={trimEdgeColor} roughness={0.95} metalness={0} />
        <meshStandardMaterial
          attach="material-4"
          map={coverTextures.front}
          color={coverTextures.front ? 0xffffff : coverColor}
          roughness={roughness}
          metalness={metalness}
        />
        <meshStandardMaterial attach="material-5" color={innerColor} roughness={0.92} metalness={0} />
      </mesh>

      {/* ── Back cover board (-Z face = back cover texture) ── */}
      <mesh position={[0, 0, -(pageDepth / 2 + coverThickness / 2)]} renderOrder={RENDER_ORDER.coverBoard}>
        <boxGeometry args={[safe(trimWidth), safe(trimHeight), safe(coverThickness)]} />
        <meshStandardMaterial attach="material-0" color={pageEdgeColor} roughness={0.95} metalness={0} />
        <meshStandardMaterial attach="material-1" color="#151525" roughness={roughness} metalness={metalness} />
        <meshStandardMaterial attach="material-2" color={trimEdgeColor} roughness={0.95} metalness={0} />
        <meshStandardMaterial attach="material-3" color={trimEdgeColor} roughness={0.95} metalness={0} />
        <meshStandardMaterial attach="material-4" color={innerColor} roughness={0.92} metalness={0} />
        <meshStandardMaterial
          attach="material-5"
          map={coverTextures.back}
          color={coverTextures.back ? 0xffffff : coverColor}
          roughness={roughness}
          metalness={metalness}
        />
      </mesh>

      {/* ── Page block (between covers) ── */}
      <mesh position={[0.005, 0, 0]} renderOrder={RENDER_ORDER.pageStack}>
        <boxGeometry args={[safe(trimWidth * 0.97), safe(trimHeight * 0.97), safe(pageDepth)]} />
        <meshStandardMaterial color="#f5f0e8" roughness={0.95} metalness={0} />
      </mesh>

      {/* ── Spine strip (left side, -X face) ── */}
      <mesh position={[-trimWidth / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]} renderOrder={RENDER_ORDER.spine}>
        <planeGeometry args={[safe(totalThickness), safe(trimHeight)]} />
        <meshStandardMaterial
          map={coverTextures.spine}
          color={coverTextures.spine ? 0xffffff : 0x151525}
          roughness={roughness}
          metalness={metalness}
        />
      </mesh>

      {/* ── Page edge details (right side, +X) ── */}
      <mesh position={[trimWidth / 2 + 0.001, 0, 0]} rotation={[0, Math.PI / 2, 0]} renderOrder={RENDER_ORDER.pageStack}>
        <planeGeometry args={[safe(pageDepth), safe(trimHeight * 0.97)]} />
        <meshStandardMaterial color="#e8e0d4" roughness={0.95} metalness={0} />
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
// Page Surface — shows real manuscript content with gutter dip
// CRITICAL: z-fighting prevention via polygonOffset + renderOrder
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

  // Apply gutter dip ONCE (not every frame — prevents flicker)
  useEffect(() => {
    if (!meshRef.current || gutterApplied.current) return;
    const posAttr = meshRef.current.geometry.getAttribute('position');
    if (!posAttr) return;

    for (let i = 0; i < posAttr.count; i++) {
      const col = i % (segments + 1);
      const u = col / segments;

      const spineProximity = isLeftPage ? u : (1 - u);
      const gutterDip = 0.012 * Math.pow(spineProximity, 3);

      posAttr.setZ(i, -gutterDip);
    }

    posAttr.needsUpdate = true;
    meshRef.current.geometry.computeVertexNormals();
    gutterApplied.current = true;
  }, [isLeftPage, segments]);

  // Create material — recreated when texture changes (stable, no mutation)
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
// Flipping Page — stable geometry with Bezier-curve deformation
// CRITICAL: Does NOT create new geometry in useFrame
// CRITICAL: Has its OWN materials for front and back
// CRITICAL: frustumCulled=false to prevent disappearing
// ---------------------------------------------------------------------------

function FlippingPage({
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
  const segments = 16;
  const geometry = useStablePlaneGeometry(width, height, segments, 1);

  // Store original positions for efficient reset
  const origPositions = useMemo(() => {
    const geo = new THREE.PlaneGeometry(safe(width), safe(height), segments, 1);
    const pos = geo.getAttribute('position');
    const arr = new Float32Array(pos.array);
    geo.dispose();
    return arr;
  }, [width, height, segments]);

  // Create two materials: front side and back side of the page
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

  // Deform vertices based on flip progress
  useFrame(() => {
    if (!meshRef.current) return;
    const posAttr = meshRef.current.geometry.getAttribute('position');
    if (!posAttr) return;

    const progress = safe(flipProgress, 0);

    // When not flipping, restore original positions from cache
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
      // Page fully flipped — move to other side
      for (let i = 0; i < posAttr.count; i++) {
        const i3 = i * 3;
        const origX = origPositions[i3];
        posAttr.setX(i, origX - width); // Flipped across
        posAttr.setZ(i, 0);
      }
      posAttr.needsUpdate = true;
      meshRef.current.geometry.computeVertexNormals();
      return;
    }

    // Bezier-curve page curl
    const curlRadius = safe(width * 0.1, 0.01);
    const travelX = width;
    const curlIntensity = Math.sin(progress * Math.PI);

    for (let i = 0; i < posAttr.count; i++) {
      const i3 = i * 3;
      const origX = origPositions[i3];

      const col = i % (segments + 1);
      const t = col / segments; // 0 to 1 across page width

      // Wave propagation: spine-side starts turning first
      const vertexDelay = (1 - t) * 0.25;
      const vertexProgress = Math.max(0, Math.min(1, (progress - vertexDelay) / (1 - vertexDelay)));

      const baseX = origX - travelX * vertexProgress;

      // Curl height — peaks in the middle of the flip
      const curlWave = Math.sin(t * Math.PI);
      const liftHeight = curlIntensity * curlRadius * curlWave * (1 - Math.abs(progress - 0.5) * 2);

      // Subtle spine curve
      const spineCurve = curlIntensity * 0.1 * Math.sin(t * Math.PI * 0.5) * curlRadius;

      posAttr.setX(i, safe(baseX));
      posAttr.setZ(i, safe(Math.max(0, liftHeight + spineCurve)));
    }

    posAttr.needsUpdate = true;
    meshRef.current.geometry.computeVertexNormals();
  });

  const zBase = Math.max(safe(leftStackDepth), safe(rightStackDepth)) + 0.005;

  return (
    <group position={[0, 0, zBase]}>
      {/* Front face of the flipping page */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={frontMaterial}
        renderOrder={RENDER_ORDER.flippingPage}
        frustumCulled={false}
      />
      {/* Back face of the flipping page */}
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
// Open Paperback Book — spread with page stacks and pivoting front cover
// CRITICAL FIX: Correct page spread logic
//   Spread 0: [Blank | Page 1]  (first page is on the RIGHT)
//   Spread 1: [Page 2 | Page 3]
//   Spread N: [Page 2N | Page 2N+1]
// ---------------------------------------------------------------------------

function OpenPaperback({
  trimWidth,
  trimHeight,
  pageDepth,
  coverThickness,
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
  coverThickness: number;
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

  const totalPages = Math.max(pageCount, 1);
  const currentSpread = Math.floor(currentPage / 2);

  // Page distribution — left stack = pages before current spread, right stack = pages after
  const leftPages = Math.max(currentSpread, 0);
  const rightPages = Math.max(totalPages - currentSpread, 0);
  const pageThickness = pageDepth / totalPages;

  const leftStackDepth = safe(Math.max(leftPages * pageThickness, 0.003));
  const rightStackDepth = safe(Math.max(rightPages * pageThickness, 0.003));

  // ━━━ CORRECT PAGE SPREAD LOGIC ━━━
  // Pages are 0-indexed internally, but represent actual manuscript pages
  // Spread 0: left=blank, right=page 0 (first page is on the right)
  // Spread 1: left=page 1, right=page 2
  // Spread N: left=page 2N-1, right=page 2N
  const leftPageIndex = currentSpread === 0 ? -1 : (currentSpread * 2 - 1);
  const rightPageIndex = currentSpread * 2;

  const leftPageTexture = leftPageIndex >= 0 ? (pageTextures.get(leftPageIndex) || null) : null;
  const rightPageTexture = rightPageIndex < totalPages ? (pageTextures.get(rightPageIndex) || null) : null;

  // Flipping page textures — front face and back face
  // When flipping forward: the right page lifts and turns to become the left page
  // Front = current right page texture, Back = next left page texture
  const flipFrontIndex = isFlippingForward ? rightPageIndex : leftPageIndex;
  const flipBackIndex = isFlippingForward ? (rightPageIndex + 1) : (leftPageIndex - 1);
  const flipFrontTexture = flipFrontIndex >= 0 && flipFrontIndex < totalPages ? (pageTextures.get(flipFrontIndex) || null) : null;
  const flipBackTexture = flipBackIndex >= 0 && flipBackIndex < totalPages ? (pageTextures.get(flipBackIndex) || null) : null;

  // Front cover pivot animation — rotates around spine edge
  useFrame(() => {
    if (!frontCoverPivotRef.current) return;

    const pivotZ = lerp(pageDepth / 2 + coverThickness / 2, coverThickness / 2, openAmount);

    frontCoverPivotRef.current.position.set(0, 0, pivotZ);
    // Opening angle ~160° (not full 180° which looks unnatural)
    frontCoverPivotRef.current.rotation.y = -openAmount * Math.PI * 0.89;
  });

  const coverColor = 0x1a1a2e;
  const pageEdgeColor = '#e8e0d4';
  const trimEdgeColor = '#ede6da';
  const innerColor = '#f5f0e8';

  // Page surface width — slightly less than trim to show page edges
  const pageSurfaceW = trimWidth * 0.92;
  const pageSurfaceH = trimHeight * 0.92;

  return (
    <group>
      {/* ── Back cover (flat on the right side) ── */}
      <mesh position={[trimWidth / 2, 0, coverThickness / 2]} renderOrder={RENDER_ORDER.coverBoard}>
        <boxGeometry args={[safe(trimWidth), safe(trimHeight), safe(coverThickness)]} />
        <meshStandardMaterial attach="material-0" color={pageEdgeColor} roughness={0.95} metalness={0} />
        <meshStandardMaterial attach="material-1" color="#151525" roughness={roughness} metalness={metalness} />
        <meshStandardMaterial attach="material-2" color={trimEdgeColor} roughness={0.95} metalness={0} />
        <meshStandardMaterial attach="material-3" color={trimEdgeColor} roughness={0.95} metalness={0} />
        <meshStandardMaterial attach="material-4" color={innerColor} roughness={0.92} metalness={0} />
        <meshStandardMaterial
          attach="material-5"
          map={coverTextures.back}
          color={coverTextures.back ? 0xffffff : coverColor}
          roughness={roughness}
          metalness={metalness}
        />
      </mesh>

      {/* ── Left page stack ── */}
      <PageStack
        width={trimWidth * 0.96}
        height={trimHeight * 0.96}
        depth={leftStackDepth}
        position={[-trimWidth / 2, 0, leftStackDepth / 2 + coverThickness]}
      />

      {/* ── Right page stack ── */}
      <PageStack
        width={trimWidth * 0.96}
        height={trimHeight * 0.96}
        depth={rightStackDepth}
        position={[trimWidth / 2, 0, rightStackDepth / 2 + coverThickness]}
      />

      {/* ── Left visible page (or blank for first spread) ── */}
      <PageSurface
        width={pageSurfaceW}
        height={pageSurfaceH}
        position={[-trimWidth / 2, 0, leftStackDepth + coverThickness + 0.002]}
        texture={leftPageTexture}
        isLeftPage={true}
      />

      {/* ── Right visible page ── */}
      <PageSurface
        width={pageSurfaceW}
        height={pageSurfaceH}
        position={[trimWidth / 2, 0, rightStackDepth + coverThickness + 0.002]}
        texture={rightPageTexture}
        isLeftPage={false}
      />

      {/* ── Flipping page animation ━━━ ONLY renders when actively flipping ━━━ */}
      {flipProgress > 0.005 && flipProgress < 0.995 && (
        <FlippingPage
          width={pageSurfaceW}
          height={pageSurfaceH}
          flipProgress={flipProgress}
          leftStackDepth={leftStackDepth}
          rightStackDepth={rightStackDepth}
          frontTexture={flipFrontTexture}
          backTexture={flipBackTexture}
        />
      )}

      {/* ── Front cover (pivoting from spine edge) ── */}
      <group ref={frontCoverPivotRef}>
        <mesh position={[trimWidth / 2, 0, 0]} renderOrder={RENDER_ORDER.coverBoard}>
          <boxGeometry args={[safe(trimWidth), safe(trimHeight), safe(coverThickness)]} />
          <meshStandardMaterial attach="material-0" color={pageEdgeColor} roughness={0.95} metalness={0} />
          <meshStandardMaterial attach="material-1" color="#151525" roughness={roughness} metalness={metalness} />
          <meshStandardMaterial attach="material-2" color={trimEdgeColor} roughness={0.95} metalness={0} />
          <meshStandardMaterial attach="material-3" color={trimEdgeColor} roughness={0.95} metalness={0} />
          <meshStandardMaterial
            attach="material-4"
            map={coverTextures.front}
            color={coverTextures.front ? 0xffffff : coverColor}
            roughness={roughness}
            metalness={metalness}
          />
          <meshStandardMaterial attach="material-5" color={innerColor} roughness={0.92} metalness={0} />
        </mesh>
      </group>

      {/* ── Spine strip (visible at gutter when open) ── */}
      <mesh position={[0, 0, coverThickness / 2]} rotation={[0, Math.PI / 2, 0]} renderOrder={RENDER_ORDER.spine}>
        <planeGeometry args={[safe(coverThickness * 2), safe(trimHeight * 0.96)]} />
        <meshStandardMaterial
          map={coverTextures.spine}
          color={coverTextures.spine ? 0xffffff : 0x151525}
          roughness={roughness}
          metalness={metalness}
        />
      </mesh>

      {/* ── Gutter shadow (dark strip in center) ── */}
      <mesh position={[0, 0, coverThickness + 0.001]} renderOrder={RENDER_ORDER.pageSurface}>
        <planeGeometry args={[safe(0.02), safe(trimHeight * 0.92)]} />
        <meshStandardMaterial color="#2a1a0a" roughness={1} metalness={0} transparent opacity={0.4} />
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
    const dt = Math.min(delta, 0.05);
    setOpenAmount(prev => {
      const next = prev + (targetOpen - prev) * Math.min(dt * 3, 0.12);
      return Math.max(0, Math.min(1.2, next));
    });
  });

  // Cover material properties
  const coverRoughness = coverFinish === 'glossy' ? 0.3 : 0.7;
  const coverMetalness = coverFinish === 'glossy' ? 0.1 : 0;

  return (
    <group ref={groupRef}>
      {openAmount < 0.15 ? (
        <ClosedPaperback
          trimWidth={trimWidth}
          trimHeight={trimHeight}
          pageDepth={pageDepth}
          coverThickness={coverThickness}
          coverTextures={coverTextures}
          roughness={coverRoughness}
          metalness={coverMetalness}
        />
      ) : (
        <OpenPaperback
          trimWidth={trimWidth}
          trimHeight={trimHeight}
          pageDepth={pageDepth}
          coverThickness={coverThickness}
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
