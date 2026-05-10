'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface HardcoverBookProps {
  coverUrl?: string;
  trimWidth: number;
  trimHeight: number;
  spineWidth: number;
  pageCount: number;
  currentPage: number;
  isOpen: boolean;
  flipProgress: number;
  isFlippingForward: boolean;
  pageTextures: Map<number, THREE.Texture | null>;
  coverTexture: THREE.Texture | null;
  coverFinish?: 'matte' | 'glossy';
}

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
  coverTexture,
  coverFinish = 'glossy',
}: HardcoverBookProps) {
  const groupRef = useRef<THREE.Group>(null);
  const frontCoverRef = useRef<THREE.Group>(null);
  const bookOpenRef = useRef(0);

  // Hardcover dimensions
  const boardThickness = 0.04;  // Hard board thickness
  const coverOverhang = 0.04;   // Cover extends beyond pages
  const pageDepth = Math.max(spineWidth * 0.8, 0.05);
  const hingeWidth = 0.06;      // Hinge flex area

  // Animate opening — hardcover opens more rigidly
  useFrame((_, delta) => {
    const targetOpen = isOpen ? 1 : 0;
    // Slower, more deliberate opening for hardcover
    bookOpenRef.current += (targetOpen - bookOpenRef.current) * Math.min(delta * 2.5, 0.12);

    if (frontCoverRef.current) {
      // Hardcover opens rigidly from hinge, not flexing
      frontCoverRef.current.rotation.y = -bookOpenRef.current * Math.PI * 0.85;
    }
  });

  const coverRoughness = coverFinish === 'glossy' ? 0.25 : 0.6;
  const coverMetalness = coverFinish === 'glossy' ? 0.15 : 0.02;

  // Page distribution when open
  const totalPages = Math.max(pageCount, 1);
  const currentLeftPage = Math.floor(currentPage / 2);
  const leftPages = currentLeftPage;
  const rightPages = totalPages - currentLeftPage;
  const pageThickness = pageDepth / totalPages;
  const leftStackDepth = Math.max(leftPages * pageThickness, 0.003);
  const rightStackDepth = Math.max(rightPages * pageThickness, 0.003);

  return (
    <group ref={groupRef}>
      {!isOpen ? (
        // === CLOSED HARDCOVER ===
        <>
          {/* Page block (slightly smaller than cover) */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[trimWidth * 0.96, trimHeight * 0.96, pageDepth]} />
            <meshStandardMaterial color="#f5f0e8" roughness={0.95} metalness={0} />
          </mesh>

          {/* Front Board */}
          <HardBoard
            width={trimWidth + coverOverhang * 2}
            height={trimHeight + coverOverhang * 2}
            thickness={boardThickness}
            position={[0, 0, pageDepth / 2 + boardThickness / 2]}
            texture={coverTexture}
            roughness={coverRoughness}
            metalness={coverMetalness}
          />

          {/* Back Board */}
          <mesh position={[0, 0, -(pageDepth / 2 + boardThickness / 2)]}>
            <boxGeometry args={[trimWidth + coverOverhang * 2, trimHeight + coverOverhang * 2, boardThickness]} />
            <meshStandardMaterial color="#1a1a2e" roughness={coverRoughness} metalness={coverMetalness} />
          </mesh>

          {/* Spine Board */}
          <mesh position={[-(trimWidth + coverOverhang) / 2 - 0.005, 0, 0]}>
            <boxGeometry args={[0.025, trimHeight + coverOverhang * 2, pageDepth + boardThickness * 2]} />
            <meshStandardMaterial color="#151525" roughness={coverRoughness} metalness={coverMetalness} />
          </mesh>

          {/* Right edge (page edges visible) */}
          <mesh position={[(trimWidth + coverOverhang) / 2 + 0.005, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[pageDepth, trimHeight * 0.96]} />
            <meshStandardMaterial color="#e8e0d4" roughness={0.95} metalness={0} />
          </mesh>

          {/* Top edge */}
          <mesh position={[0, (trimHeight + coverOverhang) / 2 + 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[trimWidth * 0.96, pageDepth]} />
            <meshStandardMaterial color="#ede6da" roughness={0.95} metalness={0} />
          </mesh>

          {/* Bottom edge */}
          <mesh position={[0, -(trimHeight + coverOverhang) / 2 - 0.005, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[trimWidth * 0.96, pageDepth]} />
            <meshStandardMaterial color="#ede6da" roughness={0.95} metalness={0} />
          </mesh>
        </>
      ) : (
        // === OPEN HARDCOVER ===
        <>
          {/* Left page stack */}
          <PageStack
            width={trimWidth * 0.96}
            height={trimHeight * 0.96}
            depth={leftStackDepth}
            position={[-trimWidth / 2, 0, leftStackDepth / 2]}
            color="#f5f0e8"
          />

          {/* Right page stack */}
          <PageStack
            width={trimWidth * 0.96}
            height={trimHeight * 0.96}
            depth={rightStackDepth}
            position={[trimWidth / 2, 0, rightStackDepth / 2]}
            color="#f5f0e8"
          />

          {/* Left visible page */}
          <mesh position={[-trimWidth / 2, 0, leftStackDepth + 0.001]}>
            <planeGeometry args={[trimWidth * 0.96, trimHeight * 0.96]} />
            {pageTextures.get(currentLeftPage * 2 - 1) ? (
              <meshStandardMaterial map={pageTextures.get(currentLeftPage * 2 - 1)} roughness={0.9} metalness={0} />
            ) : (
              <meshStandardMaterial color="#f5f0e8" roughness={0.9} metalness={0} />
            )}
          </mesh>

          {/* Right visible page */}
          <mesh position={[trimWidth / 2, 0, rightStackDepth + 0.001]}>
            <planeGeometry args={[trimWidth * 0.96, trimHeight * 0.96]} />
            {pageTextures.get(currentLeftPage * 2) ? (
              <meshStandardMaterial map={pageTextures.get(currentLeftPage * 2)} roughness={0.9} metalness={0} />
            ) : (
              <meshStandardMaterial color="#f5f0e8" roughness={0.9} metalness={0} />
            )}
          </mesh>

          {/* Endpaper - left side (decorative paper inside front cover) */}
          <Endpaper
            width={trimWidth * 0.94}
            height={trimHeight * 0.94}
            position={[-trimWidth / 2, 0, boardThickness + 0.002]}
            color="#c4a882"
          />

          {/* Endpaper - right side (inside back cover) */}
          <Endpaper
            width={trimWidth * 0.94}
            height={trimHeight * 0.94}
            position={[trimWidth / 2, 0, boardThickness + 0.002]}
            color="#c4a882"
          />

          {/* Back board (flat on table) */}
          <mesh position={[-trimWidth / 2, 0, -(boardThickness / 2)]}>
            <boxGeometry args={[trimWidth + coverOverhang * 2, trimHeight + coverOverhang * 2, boardThickness]} />
            <meshStandardMaterial color="#1a1a2e" roughness={coverRoughness} metalness={coverMetalness} />
          </mesh>

          {/* Front board (flipped open) */}
          <group ref={frontCoverRef} position={[-trimWidth, 0, pageDepth / 2]}>
            <HardBoard
              width={trimWidth + coverOverhang * 2}
              height={trimHeight + coverOverhang * 2}
              thickness={boardThickness}
              position={[0, 0, boardThickness / 2]}
              texture={coverTexture}
              roughness={coverRoughness}
              metalness={coverMetalness}
              flipped
            />
          </group>

          {/* Spine area */}
          <mesh position={[-trimWidth, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[pageDepth + boardThickness * 2, trimHeight + coverOverhang * 2]} />
            <meshStandardMaterial color="#151525" roughness={coverRoughness} metalness={coverMetalness} />
          </mesh>

          {/* Flipping page */}
          {flipProgress > 0.001 && flipProgress < 0.999 && (
            <HardcoverFlippingPage
              width={trimWidth * 0.96}
              height={trimHeight * 0.96}
              leftStackDepth={leftStackDepth}
              rightStackDepth={rightStackDepth}
              flipProgress={flipProgress}
              texture={pageTextures.get(isFlippingForward ? currentLeftPage * 2 : currentLeftPage * 2 - 1) || null}
            />
          )}
        </>
      )}
    </group>
  );
}

// --- Hard Board Component ---
function HardBoard({
  width,
  height,
  thickness,
  position,
  texture,
  roughness,
  metalness,
  flipped = false,
}: {
  width: number;
  height: number;
  thickness: number;
  position: [number, number, number];
  texture: THREE.Texture | null;
  roughness: number;
  metalness: number;
  flipped?: boolean;
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={[width, height, thickness]} />
      {texture ? (
        <meshStandardMaterial map={texture} roughness={roughness} metalness={metalness} />
      ) : (
        <meshStandardMaterial color="#1a1a2e" roughness={roughness} metalness={metalness} />
      )}
    </mesh>
  );
}

// --- Endpaper ---
function Endpaper({
  width,
  height,
  position,
  color,
}: {
  width: number;
  height: number;
  position: [number, number, number];
  color: string;
}) {
  return (
    <mesh position={position}>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial color={color} roughness={0.85} metalness={0} side={THREE.DoubleSide} />
    </mesh>
  );
}

// --- Page Stack ---
function PageStack({
  width,
  height,
  depth,
  position,
  color,
}: {
  width: number;
  height: number;
  depth: number;
  position: [number, number, number];
  color: string;
}) {
  if (depth < 0.002) return null;
  return (
    <mesh position={position}>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial color={color} roughness={0.95} metalness={0} />
    </mesh>
  );
}

// --- Hardcover Flipping Page ---
function HardcoverFlippingPage({
  width,
  height,
  leftStackDepth,
  rightStackDepth,
  flipProgress,
  texture,
}: {
  width: number;
  height: number;
  leftStackDepth: number;
  rightStackDepth: number;
  flipProgress: number;
  texture: THREE.Texture | null;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const segments = 16;

  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(width, height, segments, 1);
  }, [width, height]);

  useFrame(() => {
    if (!meshRef.current) return;
    const posAttr = meshRef.current.geometry.getAttribute('position');
    if (!posAttr) return;

    const progress = flipProgress;
    const travelX = width;
    const curlRadius = width * 0.1;
    const curlWave = Math.sin(progress * Math.PI);

    for (let i = 0; i < posAttr.count; i++) {
      const col = i % (segments + 1);
      const origX = (col / segments) * width - width / 2;
      const origY = posAttr.getY(i);
      const t = (origX + width / 2) / width;

      // Hardcover pages flip more stiffly than paperback
      const stiffness = 0.6; // Less curl than paperback
      const baseX = origX - travelX * progress;
      const curlHeight = curlWave * curlRadius * Math.sin(t * Math.PI) * stiffness * (1 - Math.abs(progress - 0.5) * 2);

      posAttr.setX(i, baseX);
      posAttr.setY(i, origY);
      posAttr.setZ(i, Math.max(0, curlHeight));
    }

    posAttr.needsUpdate = true;
    meshRef.current.geometry.computeVertexNormals();
  });

  const zBase = Math.max(leftStackDepth, rightStackDepth) + 0.003;

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
