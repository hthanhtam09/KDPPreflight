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

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

// ---------------------------------------------------------------------------
// Persistent page geometry (created once, deformed via vertex manipulation)
// ---------------------------------------------------------------------------

function useStablePlaneGeometry(width: number, height: number, segX: number, segY: number) {
  return useMemo(() => {
    return new THREE.PlaneGeometry(safe(width), safe(height), segX, segY);
  }, [width, height, segX, segY]);
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
      {/* ── Front cover board (top, +Z face has front cover texture) ── */}
      <mesh position={[0, 0, pageDepth / 2 + coverThickness / 2]}>
        <boxGeometry args={[safe(trimWidth), safe(trimHeight), safe(coverThickness)]} />
        {/* +x: right edge / page edges */}
        <meshStandardMaterial attach="material-0" color={pageEdgeColor} roughness={0.95} metalness={0} />
        {/* -x: left edge / spine side */}
        <meshStandardMaterial attach="material-1" color="#151525" roughness={roughness} metalness={metalness} />
        {/* +y: top edge */}
        <meshStandardMaterial attach="material-2" color={trimEdgeColor} roughness={0.95} metalness={0} />
        {/* -y: bottom edge */}
        <meshStandardMaterial attach="material-3" color={trimEdgeColor} roughness={0.95} metalness={0} />
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

      {/* ── Back cover board (bottom, -Z face has back cover texture) ── */}
      <mesh position={[0, 0, -(pageDepth / 2 + coverThickness / 2)]}>
        <boxGeometry args={[safe(trimWidth), safe(trimHeight), safe(coverThickness)]} />
        {/* +x: right edge / page edges */}
        <meshStandardMaterial attach="material-0" color={pageEdgeColor} roughness={0.95} metalness={0} />
        {/* -x: left edge / spine side */}
        <meshStandardMaterial attach="material-1" color="#151525" roughness={roughness} metalness={metalness} />
        {/* +y: top edge */}
        <meshStandardMaterial attach="material-2" color={trimEdgeColor} roughness={0.95} metalness={0} />
        {/* -y: bottom edge */}
        <meshStandardMaterial attach="material-3" color={trimEdgeColor} roughness={0.95} metalness={0} />
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

      {/* ── Page block (between covers) ── */}
      <mesh position={[0.005, 0, 0]}>
        <boxGeometry args={[safe(trimWidth * 0.97), safe(trimHeight * 0.97), safe(pageDepth)]} />
        <meshStandardMaterial color="#f5f0e8" roughness={0.95} metalness={0} />
      </mesh>

      {/* ── Spine strip (left side, -X face) ── */}
      <mesh position={[-trimWidth / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[safe(totalThickness), safe(trimHeight)]} />
        <meshStandardMaterial
          map={coverTextures.spine}
          color={coverTextures.spine ? 0xffffff : 0x151525}
          roughness={roughness}
          metalness={metalness}
        />
      </mesh>

      {/* ── Page edge details (right side, +X) ── */}
      <mesh position={[trimWidth / 2 + 0.001, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
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
    <mesh position={position}>
      <boxGeometry args={[safe(width), safe(height), safe(depth)]} />
      <meshStandardMaterial color="#f5f0e8" roughness={0.95} metalness={0} />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Visible Page Surface (shows real manuscript content with gutter dip)
// ---------------------------------------------------------------------------

function PageSurface({
  width,
  height,
  position,
  texture,
  side = THREE.FrontSide,
  isLeftPage = false,
}: {
  width: number;
  height: number;
  position: [number, number, number];
  texture: THREE.Texture | null;
  side?: THREE.Side;
  isLeftPage?: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const segments = 12;

  const geometry = useStablePlaneGeometry(width, height, segments, 1);

  // Apply gutter dip near the spine edge
  useFrame(() => {
    if (!meshRef.current) return;
    const posAttr = meshRef.current.geometry.getAttribute('position');
    if (!posAttr) return;

    let needsUpdate = false;
    for (let i = 0; i < posAttr.count; i++) {
      const col = i % (segments + 1);
      const u = col / segments; // 0 to 1 across page width

      // Gutter dip: curves inward near the spine edge
      // For left pages, spine is on the right (u=1)
      // For right pages, spine is on the left (u=0)
      const spineProximity = isLeftPage ? u : (1 - u);
      const gutterDip = 0.015 * Math.pow(spineProximity, 3);

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
        <meshStandardMaterial
          map={texture}
          roughness={0.92}
          metalness={0}
          side={side}
        />
      ) : (
        <meshStandardMaterial
          color="#f5f0e8"
          roughness={0.92}
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

  const geometry = useStablePlaneGeometry(width, height, segments, 1);

  useFrame(() => {
    if (!meshRef.current) return;
    const posAttr = meshRef.current.geometry.getAttribute('position');
    if (!posAttr) return;

    const progress = safe(flipProgress, 0);

    // When not flipping, keep flat
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

    // Bezier-curve page curl
    const curlRadius = safe(width * 0.12, 0.01);
    const travelX = width;
    const curlIntensity = Math.sin(progress * Math.PI);

    for (let i = 0; i < posAttr.count; i++) {
      const col = i % (segments + 1);
      const origX = (col / segments) * width - width / 2;
      const origY = posAttr.getY(i);

      const t = (origX + width / 2) / safe(width, 1);

      const vertexDelay = (1 - t) * 0.3;
      const vertexProgress = Math.max(0, Math.min(1, (progress - vertexDelay) / (1 - vertexDelay)));

      const baseX = origX - travelX * vertexProgress;

      const curlWave = Math.sin(t * Math.PI);
      const liftHeight = curlIntensity * curlRadius * curlWave * (1 - Math.abs(progress - 0.5) * 2);

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
// Open Paperback Book — spread with page stacks and pivoting front cover
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

  // Dynamic page distribution
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

  // Front cover rotation and pivot animation
  useFrame(() => {
    if (!frontCoverPivotRef.current) return;

    // Pivot Z interpolates from top-of-pages to table-level as book opens
    const pivotZ = lerp(pageDepth / 2 + coverThickness / 2, coverThickness / 2, openAmount);

    frontCoverPivotRef.current.position.set(0, 0, pivotZ);
    frontCoverPivotRef.current.rotation.y = -openAmount * Math.PI;
  });

  const coverColor = 0x1a1a2e;
  const pageEdgeColor = '#e8e0d4';
  const trimEdgeColor = '#ede6da';
  const innerColor = '#f5f0e8';

  return (
    <group>
      {/* ── Back cover (flat on the right side) ── */}
      <mesh position={[trimWidth / 2, 0, coverThickness / 2]}>
        <boxGeometry args={[safe(trimWidth), safe(trimHeight), safe(coverThickness)]} />
        {/* +x: right edge */}
        <meshStandardMaterial attach="material-0" color={pageEdgeColor} roughness={0.95} metalness={0} />
        {/* -x: left edge (spine side) */}
        <meshStandardMaterial attach="material-1" color="#151525" roughness={roughness} metalness={metalness} />
        {/* +y: top edge */}
        <meshStandardMaterial attach="material-2" color={trimEdgeColor} roughness={0.95} metalness={0} />
        {/* -y: bottom edge */}
        <meshStandardMaterial attach="material-3" color={trimEdgeColor} roughness={0.95} metalness={0} />
        {/* +z: inner face (facing up, inside of back cover) */}
        <meshStandardMaterial attach="material-4" color={innerColor} roughness={0.92} metalness={0} />
        {/* -z: BACK COVER ARTWORK (facing down, toward table) */}
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

      {/* ── Left visible page ── */}
      <PageSurface
        width={trimWidth * 0.92}
        height={trimHeight * 0.92}
        position={[-trimWidth / 2, 0, leftStackDepth + coverThickness + 0.002]}
        texture={leftPageTexture}
        isLeftPage={true}
      />

      {/* ── Right visible page ── */}
      <PageSurface
        width={trimWidth * 0.92}
        height={trimHeight * 0.92}
        position={[trimWidth / 2, 0, rightStackDepth + coverThickness + 0.002]}
        texture={rightPageTexture}
        isLeftPage={false}
      />

      {/* ── Flipping page animation ── */}
      {flipProgress > 0.005 && flipProgress < 0.995 && (
        <FlippingPage
          width={trimWidth * 0.92}
          height={trimHeight * 0.92}
          flipProgress={flipProgress}
          leftStackDepth={leftStackDepth}
          rightStackDepth={rightStackDepth}
          texture={flippingTexture}
        />
      )}

      {/* ── Front cover (pivoting from spine edge) ── */}
      <group ref={frontCoverPivotRef}>
        <mesh position={[trimWidth / 2, 0, 0]}>
          <boxGeometry args={[safe(trimWidth), safe(trimHeight), safe(coverThickness)]} />
          {/* +x: right edge (free edge when closed, spine edge when open) */}
          <meshStandardMaterial attach="material-0" color={pageEdgeColor} roughness={0.95} metalness={0} />
          {/* -x: left edge (spine edge when closed, free edge when open) */}
          <meshStandardMaterial attach="material-1" color="#151525" roughness={roughness} metalness={metalness} />
          {/* +y: top edge */}
          <meshStandardMaterial attach="material-2" color={trimEdgeColor} roughness={0.95} metalness={0} />
          {/* -y: bottom edge */}
          <meshStandardMaterial attach="material-3" color={trimEdgeColor} roughness={0.95} metalness={0} />
          {/* +z: FRONT COVER TEXTURE (faces up when closed, down when open) */}
          <meshStandardMaterial
            attach="material-4"
            map={coverTextures.front}
            color={coverTextures.front ? 0xffffff : coverColor}
            roughness={roughness}
            metalness={metalness}
          />
          {/* -z: inner face (faces down when closed, up when open) */}
          <meshStandardMaterial attach="material-5" color={innerColor} roughness={0.92} metalness={0} />
        </mesh>
      </group>

      {/* ── Spine strip (visible at gutter when open) ── */}
      <mesh position={[0, 0, coverThickness / 2]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[safe(coverThickness * 2), safe(trimHeight * 0.96)]} />
        <meshStandardMaterial
          map={coverTextures.spine}
          color={coverTextures.spine ? 0xffffff : 0x151525}
          roughness={roughness}
          metalness={metalness}
        />
      </mesh>

      {/* ── Gutter shadow (dark strip in center) ── */}
      <mesh position={[0, 0, coverThickness + 0.001]}>
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
        // ━━━ CLOSED BOOK ━━━
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
        // ━━━ OPEN BOOK ━━━
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
