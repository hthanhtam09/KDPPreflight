'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// --- Types ---
interface PaperbackBookProps {
  coverUrl?: string;
  trimWidth: number;       // in scene units (inches * scale)
  trimHeight: number;      // in scene units
  spineWidth: number;      // in scene units
  pageCount: number;
  currentPage: number;
  isOpen: boolean;
  flipProgress: number;    // 0-1, current flip animation progress
  isFlippingForward: boolean;
  pageTextures: Map<number, THREE.Texture | null>;
  coverTexture: THREE.Texture | null;
  coverFinish?: 'matte' | 'glossy';
}

// --- Page Curl Geometry ---
// Creates a page mesh that can deform during flipping
function PageMesh({
  width,
  height,
  position,
  rotation,
  flipProgress,
  isRightSide,  // true if this page starts on the right side
  texture,
  showBack,
  backColor,
}: {
  width: number;
  height: number;
  position: [number, number, number];
  rotation: [number, number, number];
  flipProgress: number;
  isRightSide: boolean;
  texture: THREE.Texture | null;
  showBack: boolean;
  backColor?: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const segmentsX = 20;
  const segmentsY = 1;

  // Create base geometry with enough subdivisions for curling
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(width, height, segmentsX, segmentsY);
    return geo;
  }, [width, height]);

  // Deform vertices based on flip progress (rolling cylinder model)
  useFrame(() => {
    if (!meshRef.current) return;
    const posAttr = meshRef.current.geometry.getAttribute('position');
    if (!posAttr) return;

    const progress = isRightSide ? flipProgress : 1 - flipProgress;
    if (progress <= 0.001 || progress >= 0.999) {
      // Reset to flat when not flipping
      const origGeo = new THREE.PlaneGeometry(width, height, segmentsX, segmentsY);
      const origPos = origGeo.getAttribute('position');
      for (let i = 0; i < posAttr.count; i++) {
        posAttr.setX(i, origPos.getX(i));
        posAttr.setY(i, origPos.getY(i));
        posAttr.setZ(i, origPos.getZ(i));
      }
      posAttr.needsUpdate = true;
      meshRef.current.geometry.computeVertexNormals();
      origGeo.dispose();
      return;
    }

    // Rolling cylinder parameters
    const curlRadius = width * 0.15;
    const curlCenter = -width / 2 + (width * progress);
    const maxCurlAngle = Math.PI * 1.8; // How far the curl wraps

    for (let i = 0; i < posAttr.count; i++) {
      const origX = (i % (segmentsX + 1)) / segmentsX * width - width / 2;
      const origY = posAttr.getY(i); // Keep Y unchanged

      // Distance from the curl center
      const distFromCurl = origX - curlCenter;

      let newX: number, newZ: number;

      if (distFromCurl > 0) {
        // Ahead of the curl — flat, shifted
        newX = curlCenter + distFromCurl * Math.cos(0);
        newZ = 0;
      } else {
        // Behind the curl — wrapped around cylinder
        const angle = Math.max(0, Math.min(maxCurlAngle, (-distFromCurl / curlRadius)));
        newX = curlCenter + curlRadius * Math.sin(angle);
        newZ = curlRadius * (1 - Math.cos(angle));
      }

      posAttr.setX(i, newX);
      posAttr.setY(i, origY);
      posAttr.setZ(i, newZ);
    }

    posAttr.needsUpdate = true;
    meshRef.current.geometry.computeVertexNormals();
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Front face */}
      <mesh ref={meshRef} geometry={geometry}>
        {texture ? (
          <meshStandardMaterial
            map={texture}
            side={THREE.FrontSide}
            roughness={0.8}
            metalness={0}
          />
        ) : (
          <meshStandardMaterial
            color="#f5f0e8"
            side={THREE.FrontSide}
            roughness={0.9}
            metalness={0}
          />
        )}
      </mesh>
      {/* Back face */}
      {showBack && (
        <mesh rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[width, height]} />
          <meshStandardMaterial
            color={backColor || '#ede6da'}
            side={THREE.FrontSide}
            roughness={0.9}
            metalness={0}
          />
        </mesh>
      )}
    </group>
  );
}

// --- Page Stack (left and right sides of open book) ---
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

// --- Main Paperback Book Component ---
export default function PaperbackBook({
  coverUrl,
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
  coverFinish = 'matte',
}: PaperbackBookProps) {
  const groupRef = useRef<THREE.Group>(null);
  const frontCoverRef = useRef<THREE.Group>(null);
  const bookOpenRef = useRef(0); // animated open amount 0-1

  // Cover thickness
  const coverThickness = 0.012;
  const pageDepth = Math.max(spineWidth * 0.85, 0.04);

  // Animate book opening
  useFrame((_, delta) => {
    const targetOpen = isOpen ? 1 : 0;
    bookOpenRef.current += (targetOpen - bookOpenRef.current) * Math.min(delta * 3, 0.15);

    if (frontCoverRef.current) {
      // Front cover pivots around left edge (spine side)
      frontCoverRef.current.rotation.y = -bookOpenRef.current * Math.PI * 0.88;
    }
  });

  // Cover material properties based on finish
  const coverRoughness = coverFinish === 'glossy' ? 0.3 : 0.7;
  const coverMetalness = coverFinish === 'glossy' ? 0.1 : 0;

  // Page distribution when open
  const totalPages = Math.max(pageCount, 1);
  const currentLeftPage = Math.floor(currentPage / 2);
  const leftPages = currentLeftPage;
  const rightPages = totalPages - currentLeftPage;
  const pageThickness = pageDepth / totalPages;

  const leftStackDepth = Math.max(leftPages * pageThickness, 0.002);
  const rightStackDepth = Math.max(rightPages * pageThickness, 0.002);

  // Spine flex when opening
  const spineFlex = bookOpenRef.current * 0.3;

  return (
    <group ref={groupRef}>
      {!isOpen ? (
        // === CLOSED BOOK ===
        <>
          {/* Page block */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[trimWidth * 0.98, trimHeight * 0.98, pageDepth]} />
            <meshStandardMaterial color="#f5f0e8" roughness={0.95} metalness={0} />
          </mesh>

          {/* Front Cover */}
          <FrontCover
            texture={coverTexture}
            width={trimWidth}
            height={trimHeight}
            thickness={coverThickness}
            position={[0, 0, pageDepth / 2 + coverThickness / 2]}
            roughness={coverRoughness}
            metalness={coverMetalness}
          />

          {/* Back Cover */}
          <mesh position={[0, 0, -(pageDepth / 2 + coverThickness / 2)]}>
            <boxGeometry args={[trimWidth, trimHeight, coverThickness]} />
            <meshStandardMaterial color="#1a1a2e" roughness={coverRoughness} metalness={coverMetalness} />
          </mesh>

          {/* Spine */}
          <mesh position={[-trimWidth / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[pageDepth + coverThickness * 2, trimHeight]} />
            <meshStandardMaterial color="#151525" roughness={coverRoughness} metalness={coverMetalness} />
          </mesh>

          {/* Right page edge */}
          <mesh position={[trimWidth / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[pageDepth, trimHeight * 0.98]} />
            <meshStandardMaterial color="#e8e0d4" roughness={0.95} metalness={0} />
          </mesh>

          {/* Top page edge */}
          <mesh position={[0, trimHeight / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[trimWidth * 0.98, pageDepth]} />
            <meshStandardMaterial color="#ede6da" roughness={0.95} metalness={0} />
          </mesh>

          {/* Bottom page edge */}
          <mesh position={[0, -trimHeight / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[trimWidth * 0.98, pageDepth]} />
            <meshStandardMaterial color="#ede6da" roughness={0.95} metalness={0} />
          </mesh>
        </>
      ) : (
        // === OPEN BOOK ===
        <>
          {/* Left page stack */}
          <PageStack
            width={trimWidth}
            height={trimHeight * 0.98}
            depth={leftStackDepth}
            position={[-trimWidth / 2, 0, leftStackDepth / 2]}
            color="#f5f0e8"
          />

          {/* Right page stack */}
          <PageStack
            width={trimWidth}
            height={trimHeight * 0.98}
            depth={rightStackDepth}
            position={[trimWidth / 2, 0, rightStackDepth / 2]}
            color="#f5f0e8"
          />

          {/* Left page surface (visible page on left stack) */}
          <LeftPageSurface
            width={trimWidth}
            height={trimHeight * 0.98}
            stackDepth={leftStackDepth}
            texture={pageTextures.get(currentLeftPage * 2 - 1) || null}
          />

          {/* Right page surface (visible page on right stack) */}
          <RightPageSurface
            width={trimWidth}
            height={trimHeight * 0.98}
            stackDepth={rightStackDepth}
            texture={pageTextures.get(currentLeftPage * 2) || null}
          />

          {/* Flipping page */}
          {flipProgress > 0.001 && flipProgress < 0.999 && (
            <FlippingPage
              width={trimWidth}
              height={trimHeight * 0.98}
              leftStackDepth={leftStackDepth}
              rightStackDepth={rightStackDepth}
              flipProgress={flipProgress}
              isFlippingForward={isFlippingForward}
              texture={pageTextures.get(isFlippingForward ? currentLeftPage * 2 : currentLeftPage * 2 - 1) || null}
            />
          )}

          {/* Back cover (under left stack) */}
          <mesh position={[-trimWidth / 2, 0, -(coverThickness / 2)]}>
            <boxGeometry args={[trimWidth, trimHeight, coverThickness]} />
            <meshStandardMaterial color="#1a1a2e" roughness={coverRoughness} metalness={coverMetalness} />
          </mesh>

          {/* Front cover (flipped open to the left) */}
          <group ref={frontCoverRef} position={[-trimWidth, 0, pageDepth / 2]}>
            <group position={[0, 0, coverThickness / 2]}>
              <FrontCover
                texture={coverTexture}
                width={trimWidth}
                height={trimHeight}
                thickness={coverThickness}
                position={[0, 0, 0]}
                roughness={coverRoughness}
                metalness={coverMetalness}
                flipped
              />
            </group>
          </group>

          {/* Spine area */}
          <mesh position={[-trimWidth, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[pageDepth, trimHeight]} />
            <meshStandardMaterial color="#151525" roughness={coverRoughness} metalness={coverMetalness} />
          </mesh>
        </>
      )}
    </group>
  );
}

// --- Front Cover Component ---
function FrontCover({
  texture,
  width,
  height,
  thickness,
  position,
  roughness,
  metalness,
  flipped = false,
}: {
  texture: THREE.Texture | null;
  width: number;
  height: number;
  thickness: number;
  position: [number, number, number];
  roughness: number;
  metalness: number;
  flipped?: boolean;
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={[width, height, thickness]} />
      {texture ? (
        <meshStandardMaterial
          map={texture}
          roughness={roughness}
          metalness={metalness}
        />
      ) : (
        <meshStandardMaterial
          color="#1a1a2e"
          roughness={roughness}
          metalness={metalness}
        />
      )}
    </mesh>
  );
}

// --- Left Page Surface ---
function LeftPageSurface({
  width,
  height,
  stackDepth,
  texture,
}: {
  width: number;
  height: number;
  stackDepth: number;
  texture: THREE.Texture | null;
}) {
  return (
    <mesh position={[-width / 2, 0, stackDepth + 0.001]}>
      <planeGeometry args={[width, height]} />
      {texture ? (
        <meshStandardMaterial map={texture} roughness={0.9} metalness={0} side={THREE.FrontSide} />
      ) : (
        <meshStandardMaterial color="#f5f0e8" roughness={0.9} metalness={0} side={THREE.FrontSide} />
      )}
    </mesh>
  );
}

// --- Right Page Surface ---
function RightPageSurface({
  width,
  height,
  stackDepth,
  texture,
}: {
  width: number;
  height: number;
  stackDepth: number;
  texture: THREE.Texture | null;
}) {
  return (
    <mesh position={[width / 2, 0, stackDepth + 0.001]}>
      <planeGeometry args={[width, height]} />
      {texture ? (
        <meshStandardMaterial map={texture} roughness={0.9} metalness={0} side={THREE.FrontSide} />
      ) : (
        <meshStandardMaterial color="#f5f0e8" roughness={0.9} metalness={0} side={THREE.FrontSide} />
      )}
    </mesh>
  );
}

// --- Flipping Page ---
function FlippingPage({
  width,
  height,
  leftStackDepth,
  rightStackDepth,
  flipProgress,
  isFlippingForward,
  texture,
}: {
  width: number;
  height: number;
  leftStackDepth: number;
  rightStackDepth: number;
  flipProgress: number;
  isFlippingForward: boolean;
  texture: THREE.Texture | null;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const segments = 20;

  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(width, height, segments, 1);
  }, [width, height]);

  // Animate the page curl
  useFrame(() => {
    if (!meshRef.current) return;
    const posAttr = meshRef.current.geometry.getAttribute('position');
    if (!posAttr) return;

    const progress = flipProgress;
    const curlRadius = width * 0.12;

    // The page starts on the right and flips to the left
    // progress 0 = on right side, progress 1 = on left side
    const travelX = width; // total horizontal travel

    for (let i = 0; i < posAttr.count; i++) {
      const col = i % (segments + 1);
      const origX = (col / segments) * width - width / 2;
      const origY = posAttr.getY(i);

      // How far across the page this vertex is (0 = spine edge, 1 = free edge)
      const t = (origX + width / 2) / width;

      // The curl wave moves from the free edge to the spine
      const curlWave = Math.sin(progress * Math.PI); // peaks at 0.5
      const curlAmount = curlWave * 0.8;

      // Vertex displacement
      const vertexProgress = progress * (1 + curlAmount * (1 - t));

      // X position: linear interpolation + curl offset
      const baseX = origX - travelX * vertexProgress;

      // Z displacement: curl height
      const curlHeight = curlWave * curlRadius * Math.sin(t * Math.PI) * (1 - Math.abs(vertexProgress - 0.5) * 2);

      // Add subtle curve
      const curveAmount = curlWave * 0.3;
      const zOffset = curveAmount * Math.sin(t * Math.PI * 0.5) * curlRadius;

      posAttr.setX(i, baseX);
      posAttr.setY(i, origY);
      posAttr.setZ(i, Math.max(0, curlHeight + zOffset));
    }

    posAttr.needsUpdate = true;
    meshRef.current.geometry.computeVertexNormals();
  });

  // Position the page at the spine
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
