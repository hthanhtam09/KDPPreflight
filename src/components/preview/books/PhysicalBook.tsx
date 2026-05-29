'use client';

import { useEffect, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { CoverTextures, Preview3DOverlays } from '../BookPreview3D';
import type { PaperType } from '@/types/kdp';

export type PhysicalBookPose = 'closedFront' | 'closedBack' | 'closedSpine' | 'open';

interface PhysicalBookProps {
  trimWidth: number;
  trimHeight: number;
  spineWidth: number;
  pageCount: number;
  currentPage: number;
  targetPage: number | null;
  pose: PhysicalBookPose;
  flipProgress: number;
  isFlipping: boolean;
  isFlippingForward: boolean;
  pageTextures: Map<number, THREE.Texture | null>;
  coverTextures: CoverTextures;
  coverFinish?: 'matte' | 'glossy';
  paperType: PaperType;
  variant?: 'paperback' | 'hardcover';
  bleedEnabled: boolean;
  overlays: Preview3DOverlays;
  safeInset: number;
}

const BLEED_INCH = 0.125;
const SCENE_UNITS_PER_INCH = 0.3;
const BLEED_SIZE = BLEED_INCH * SCENE_UNITS_PER_INCH;
const PAPER = '#faf8f2';
const PAPER_EDGE = '#e7dfd1';
const ENDPAPER = '#f4ecdd';
const COVER_FALLBACK = '#231f2b';
const MIN_STACK = 0.01;
const COVER_FLIP_SECONDS = 0.68;
const PAGE_FLIP_SECONDS = COVER_FLIP_SECONDS;

const ORDER = {
  cover: 1,
  stack: 2,
  active: 3,
  flip: 4,
};

function safe(value: number, fallback = 0.001) {
  return Number.isFinite(value) && !Number.isNaN(value) ? Math.max(value, 0.001) : fallback;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getPaperAppearance(paperType: PaperType) {
  if (paperType === 'cream') {
    return {
      page: '#f3ead7',
      edge: '#ded2ba',
      endpaper: '#efe1c8',
    };
  }

  if (paperType === 'premium-color') {
    return {
      page: '#fffdf8',
      edge: '#ebe6dc',
      endpaper: '#f7f1e8',
    };
  }

  return {
    page: PAPER,
    edge: PAPER_EDGE,
    endpaper: ENDPAPER,
  };
}

function normalizeSpread(page: number, totalPages: number) {
  if (totalPages <= 1) return 1;
  const clamped = clamp(Math.round(page), 1, totalPages);
  if (clamped === 1) return 1;
  return clamped % 2 === 0 ? clamped : clamped - 1;
}

function getPageGeometry({ trimWidth, trimHeight, bleed }: { trimWidth: number; trimHeight: number; bleed: boolean }) {
  return {
    trimWidth,
    trimHeight,
    bleedWidth: bleed ? trimWidth + BLEED_SIZE * 2 : trimWidth,
    bleedHeight: bleed ? trimHeight + BLEED_SIZE * 2 : trimHeight,
  };
}

function material(texture: THREE.Texture | null | undefined, color = PAPER, side: THREE.Side = THREE.FrontSide) {
  if (texture) {
    return new THREE.MeshBasicMaterial({
      color: '#ffffff',
      map: texture,
      side,
      toneMapped: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
      depthWrite: true,
    });
  }

  return new THREE.MeshBasicMaterial({
    color,
    side,
    toneMapped: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
    depthWrite: true,
  });
}

function mirrorGeometryUvX(geometry: THREE.BufferGeometry) {
  const uv = geometry.getAttribute('uv') as THREE.BufferAttribute | undefined;
  if (!uv) return;
  for (let i = 0; i < uv.count; i += 1) {
    uv.setX(i, 1 - uv.getX(i));
  }
  uv.needsUpdate = true;
}

function CoverBoard({
  width,
  height,
  thickness,
  position,
  outside,
  outsideFace,
  insideColor = ENDPAPER,
  roughness,
  metalness,
}: {
  width: number;
  height: number;
  thickness: number;
  position: [number, number, number];
  outside: THREE.Texture | null;
  outsideFace: 'front' | 'back';
  insideColor?: string;
  roughness: number;
  metalness: number;
}) {
  const materials = useMemo(() => {
    const outsideMat = outside
      ? new THREE.MeshPhysicalMaterial({
          color: '#ffffff',
          map: outside,
          roughness,
          metalness,
          clearcoat: roughness < 0.4 ? 0.85 : 0.12,
          clearcoatRoughness: roughness < 0.4 ? 0.08 : 0.75,
          toneMapped: false,
        })
      : new THREE.MeshStandardMaterial({ color: COVER_FALLBACK, roughness, metalness });
    const insideMat = new THREE.MeshBasicMaterial({ color: insideColor, toneMapped: false });
    const edgeMat = new THREE.MeshStandardMaterial({ color: '#2b2534', roughness, metalness });
    return outsideFace === 'front'
      ? [edgeMat, edgeMat, edgeMat, edgeMat, outsideMat, insideMat]
      : [edgeMat, edgeMat, edgeMat, edgeMat, insideMat, outsideMat];
  }, [insideColor, outside, outsideFace, roughness, metalness]);

  return (
    <mesh position={position} renderOrder={ORDER.cover} material={materials}>
      <boxGeometry args={[safe(width), safe(height), safe(thickness)]} />
    </mesh>
  );
}

function ClosedBook({
  trimWidth,
  trimHeight,
  pageDepth,
  coverThickness,
  coverOverhang,
  coverTextures,
  roughness,
  metalness,
  paperColor,
  paperEdgeColor,
  visibleCover = 'front',
}: {
  trimWidth: number;
  trimHeight: number;
  pageDepth: number;
  coverThickness: number;
  coverOverhang: number;
  coverTextures: CoverTextures;
  roughness: number;
  metalness: number;
  paperColor: string;
  paperEdgeColor: string;
  visibleCover?: 'front' | 'back';
}) {
  const coverW = trimWidth + coverOverhang * 2;
  const coverH = trimHeight + coverOverhang * 2;
  const totalDepth = pageDepth + coverThickness * 2;
  const topCoverTexture = visibleCover === 'back' ? coverTextures.back : coverTextures.front;
  const bottomCoverTexture = visibleCover === 'back' ? coverTextures.front : coverTextures.back;

  return (
    <group>
      <CoverBoard
        width={coverW}
        height={coverH}
        thickness={coverThickness}
        position={[0, 0, pageDepth / 2 + coverThickness / 2]}
        outside={topCoverTexture}
        outsideFace="front"
        roughness={roughness}
        metalness={metalness}
      />
      <mesh position={[0.015, 0, 0]} renderOrder={ORDER.stack}>
        <boxGeometry args={[safe(trimWidth * 0.97), safe(trimHeight * 0.97), safe(pageDepth)]} />
        <meshStandardMaterial color={paperColor} roughness={0.96} metalness={0} />
      </mesh>
      <CoverBoard
        width={coverW}
        height={coverH}
        thickness={coverThickness}
        position={[0, 0, -(pageDepth / 2 + coverThickness / 2)]}
        outside={bottomCoverTexture}
        outsideFace="back"
        roughness={roughness}
        metalness={metalness}
      />
      <mesh position={[-coverW / 2 - 0.001, 0, 0]} rotation={[0, -Math.PI / 2, 0]} renderOrder={ORDER.cover}>
        <planeGeometry args={[safe(totalDepth), safe(coverH)]} />
        <meshStandardMaterial
          color={coverTextures.spine ? '#ffffff' : COVER_FALLBACK}
          map={coverTextures.spine}
          roughness={roughness}
          metalness={metalness}
        />
      </mesh>
      <mesh position={[trimWidth / 2 + 0.002, 0, 0]} rotation={[0, Math.PI / 2, 0]} renderOrder={ORDER.stack}>
        <planeGeometry args={[safe(pageDepth), safe(trimHeight * 0.97)]} />
        <meshStandardMaterial color={paperEdgeColor} roughness={0.98} metalness={0} />
      </mesh>
    </group>
  );
}

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
  return (
    <mesh position={position} renderOrder={ORDER.stack}>
      <boxGeometry args={[safe(width), safe(height), safe(depth)]} />
      <meshStandardMaterial color={color} roughness={0.97} metalness={0} />
    </mesh>
  );
}

function RectFrame({
  width,
  height,
  color,
  z = 0.003,
  dashed = false,
}: {
  width: number;
  height: number;
  color: string;
  z?: number;
  dashed?: boolean;
}) {
  const thickness = 0.006;
  const segment = 0.08;
  const gap = 0.045;

  if (dashed) {
    const horizontalCount = Math.max(2, Math.floor(width / (segment + gap)));
    const verticalCount = Math.max(2, Math.floor(height / (segment + gap)));
    const hStep = width / horizontalCount;
    const vStep = height / verticalCount;

    return (
      <group position={[0, 0, z]} renderOrder={ORDER.flip}>
        {Array.from({ length: horizontalCount }).map((_, index) => {
          const x = -width / 2 + hStep * index + hStep / 2;
          const w = Math.min(segment, hStep * 0.72);
          return (
            <group key={`h-${index}`}>
              <mesh position={[x, height / 2, 0]}>
                <planeGeometry args={[w, thickness]} />
                <meshBasicMaterial color={color} transparent opacity={0.9} toneMapped={false} />
              </mesh>
              <mesh position={[x, -height / 2, 0]}>
                <planeGeometry args={[w, thickness]} />
                <meshBasicMaterial color={color} transparent opacity={0.9} toneMapped={false} />
              </mesh>
            </group>
          );
        })}
        {Array.from({ length: verticalCount }).map((_, index) => {
          const y = -height / 2 + vStep * index + vStep / 2;
          const h = Math.min(segment, vStep * 0.72);
          return (
            <group key={`v-${index}`}>
              <mesh position={[width / 2, y, 0]}>
                <planeGeometry args={[thickness, h]} />
                <meshBasicMaterial color={color} transparent opacity={0.9} toneMapped={false} />
              </mesh>
              <mesh position={[-width / 2, y, 0]}>
                <planeGeometry args={[thickness, h]} />
                <meshBasicMaterial color={color} transparent opacity={0.9} toneMapped={false} />
              </mesh>
            </group>
          );
        })}
      </group>
    );
  }

  return (
    <group position={[0, 0, z]} renderOrder={ORDER.flip}>
      <mesh position={[0, height / 2, 0]}>
        <planeGeometry args={[width, thickness]} />
        <meshBasicMaterial color={color} transparent opacity={0.92} toneMapped={false} />
      </mesh>
      <mesh position={[0, -height / 2, 0]}>
        <planeGeometry args={[width, thickness]} />
        <meshBasicMaterial color={color} transparent opacity={0.92} toneMapped={false} />
      </mesh>
      <mesh position={[width / 2, 0, 0]}>
        <planeGeometry args={[thickness, height]} />
        <meshBasicMaterial color={color} transparent opacity={0.92} toneMapped={false} />
      </mesh>
      <mesh position={[-width / 2, 0, 0]}>
        <planeGeometry args={[thickness, height]} />
        <meshBasicMaterial color={color} transparent opacity={0.92} toneMapped={false} />
      </mesh>
    </group>
  );
}

function RiskEdges({ trimWidth, trimHeight, bleedWidth, bleedHeight, strong }: { trimWidth: number; trimHeight: number; bleedWidth: number; bleedHeight: number; strong: boolean }) {
  const edgeX = Math.max((bleedWidth - trimWidth) / 2, 0);
  const edgeY = Math.max((bleedHeight - trimHeight) / 2, 0);
  const opacity = strong ? 0.32 : 0.16;
  const color = '#f97316';

  return (
    <group position={[0, 0, 0.0015]} renderOrder={ORDER.active}>
      {edgeY > 0 && (
        <>
          <mesh position={[0, trimHeight / 2 + edgeY / 2, 0]}>
            <planeGeometry args={[bleedWidth, edgeY]} />
            <meshBasicMaterial color={color} transparent opacity={opacity} toneMapped={false} />
          </mesh>
          <mesh position={[0, -trimHeight / 2 - edgeY / 2, 0]}>
            <planeGeometry args={[bleedWidth, edgeY]} />
            <meshBasicMaterial color={color} transparent opacity={opacity} toneMapped={false} />
          </mesh>
        </>
      )}
      {edgeX > 0 && (
        <>
          <mesh position={[trimWidth / 2 + edgeX / 2, 0, 0]}>
            <planeGeometry args={[edgeX, trimHeight]} />
            <meshBasicMaterial color={color} transparent opacity={opacity} toneMapped={false} />
          </mesh>
          <mesh position={[-trimWidth / 2 - edgeX / 2, 0, 0]}>
            <planeGeometry args={[edgeX, trimHeight]} />
            <meshBasicMaterial color={color} transparent opacity={opacity} toneMapped={false} />
          </mesh>
        </>
      )}
    </group>
  );
}

function CornerLabel({ text, color, position }: { text: string; color: string; position: [number, number, number] }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 72;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(255,255,255,0.88)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = color;
      ctx.lineWidth = 6;
      ctx.strokeRect(3, 3, canvas.width - 6, canvas.height - 6);
      ctx.fillStyle = color;
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [color, text]);

  return (
    <mesh position={position} renderOrder={ORDER.flip}>
      <planeGeometry args={[0.24, 0.068]} />
      <meshBasicMaterial map={texture} transparent toneMapped={false} depthTest={false} />
    </mesh>
  );
}

function ActivePage({
  width,
  height,
  position,
  texture,
  paperColor,
  bleedEnabled,
  overlays,
  safeInset,
}: {
  width: number;
  height: number;
  position: [number, number, number];
  texture: THREE.Texture | null;
  paperColor: string;
  bleedEnabled: boolean;
  overlays: Preview3DOverlays;
  safeInset: number;
}) {
  const geometry = getPageGeometry({ trimWidth: width, trimHeight: height, bleed: bleedEnabled });
  const textureWidth = bleedEnabled ? geometry.bleedWidth : geometry.trimWidth;
  const textureHeight = bleedEnabled ? geometry.bleedHeight : geometry.trimHeight;
  const pageMaterial = useMemo(() => material(texture, paperColor), [paperColor, texture]);
  const paperMaterial = useMemo(() => material(null, paperColor), [paperColor]);
  const showInspection = overlays.bleed || overlays.trim || overlays.safe;
  const safeW = Math.max(geometry.trimWidth - safeInset * 2, geometry.trimWidth * 0.72);
  const safeH = Math.max(geometry.trimHeight - safeInset * 2, geometry.trimHeight * 0.72);

  return (
    <group position={position} renderOrder={ORDER.active}>
      <mesh material={paperMaterial} frustumCulled={false}>
        <planeGeometry args={[safe(geometry.bleedWidth), safe(geometry.bleedHeight), 1, 1]} />
      </mesh>
      {!bleedEnabled && overlays.bleed && (
        <RiskEdges
          trimWidth={geometry.trimWidth}
          trimHeight={geometry.trimHeight}
          bleedWidth={geometry.bleedWidth}
          bleedHeight={geometry.bleedHeight}
          strong={overlays.bleed}
        />
      )}
      <mesh position={[0, 0, 0.002]} material={pageMaterial} frustumCulled={false}>
        <planeGeometry args={[safe(textureWidth), safe(textureHeight), 12, 1]} />
      </mesh>
      {overlays.bleed && (
        <RectFrame
          width={geometry.bleedWidth}
          height={geometry.bleedHeight}
          color={bleedEnabled ? '#22c55e' : '#f97316'}
          dashed={!bleedEnabled}
          z={0.006}
        />
      )}
      {overlays.trim && <RectFrame width={geometry.trimWidth} height={geometry.trimHeight} color="#b86b3c" z={0.009} />}
      {overlays.safe && <RectFrame width={safeW} height={safeH} color="#14b8a6" dashed z={0.012} />}
      {showInspection && (
        <>
          {overlays.trim && <CornerLabel text="Trim" color="#b86b3c" position={[-geometry.trimWidth / 2 + 0.16, geometry.trimHeight / 2 - 0.06, 0.016]} />}
          {overlays.bleed && <CornerLabel text="Bleed" color={bleedEnabled ? '#22c55e' : '#f97316'} position={[geometry.bleedWidth / 2 - 0.17, geometry.bleedHeight / 2 - 0.06, 0.016]} />}
          {overlays.safe && <CornerLabel text="Safe" color="#14b8a6" position={[0, -safeH / 2 + 0.06, 0.016]} />}
        </>
      )}
    </group>
  );
}

function FlippingPage({
  width,
  height,
  pageCenterX,
  topZ,
  forward,
  paperColor,
  frontTexture,
  backTexture,
}: {
  width: number;
  height: number;
  pageCenterX: number;
  topZ: number;
  forward: boolean;
  paperColor: string;
  frontTexture: THREE.Texture | null;
  backTexture: THREE.Texture | null;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const progressRef = useRef(0);
  const front = useMemo(() => material(frontTexture, paperColor, THREE.FrontSide), [frontTexture, paperColor]);
  const back = useMemo(() => material(backTexture, paperColor, THREE.BackSide), [backTexture, paperColor]);
  const frontGeometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(safe(width), safe(height), 18, 1);
    geo.translate(pageCenterX, 0, 0);
    return geo;
  }, [height, pageCenterX, width]);
  const backGeometry = useMemo(() => {
    const geo = frontGeometry.clone();
    mirrorGeometryUvX(geo);
    return geo;
  }, [frontGeometry]);

  useEffect(() => {
    return () => {
      frontGeometry.dispose();
      backGeometry.dispose();
    };
  }, [backGeometry, frontGeometry]);

  useFrame((_, delta) => {
    progressRef.current = Math.min(progressRef.current + delta / PAGE_FLIP_SECONDS, 1);
    const raw = progressRef.current;
    const eased = raw * raw * (3 - 2 * raw);
    const curlLift = Math.sin(eased * Math.PI) * 0.13;

    if (groupRef.current) {
      groupRef.current.rotation.y = forward ? -Math.PI * eased : Math.PI * eased;
    }

    const updateGeometry = (geo: THREE.BufferGeometry, offset: number) => {
      const positions = geo.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < positions.count; i += 1) {
        const x = positions.getX(i);
        const localX = x - pageCenterX;
        const t = forward ? (localX + width / 2) / width : (width / 2 - localX) / width;
        positions.setZ(i, Math.sin(t * Math.PI) * curlLift + offset);
      }
      positions.needsUpdate = true;
      geo.computeVertexNormals();
    };

    updateGeometry(frontGeometry, 0.002);
    updateGeometry(backGeometry, -0.002);
  });

  return (
    <group ref={groupRef} position={[0, 0, topZ + 0.026]}>
      <mesh geometry={frontGeometry} material={front} renderOrder={ORDER.flip} frustumCulled={false} />
      <mesh geometry={backGeometry} material={back} renderOrder={ORDER.flip + 1} frustumCulled={false} />
    </group>
  );
}

function FlippingCover({
  width,
  height,
  thickness,
  side,
  topZ,
  outsideTexture,
  insideColor,
  roughness,
  metalness,
  opening = false,
}: {
  width: number;
  height: number;
  thickness: number;
  side: 'front' | 'back';
  topZ: number;
  outsideTexture: THREE.Texture | null;
  insideColor: string;
  roughness: number;
  metalness: number;
  opening?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const progressRef = useRef(0);
  const materials = useMemo(() => {
    const outsideMat = outsideTexture
      ? new THREE.MeshPhysicalMaterial({
          color: '#ffffff',
          map: outsideTexture,
          roughness,
          metalness,
          clearcoat: roughness < 0.4 ? 0.85 : 0.12,
          clearcoatRoughness: roughness < 0.4 ? 0.08 : 0.75,
          toneMapped: false,
        })
      : new THREE.MeshStandardMaterial({ color: COVER_FALLBACK, roughness, metalness });
    const insideMat = new THREE.MeshBasicMaterial({ color: insideColor, toneMapped: false });
    const edgeMat = new THREE.MeshStandardMaterial({ color: '#2b2534', roughness: 0.72, metalness: 0.02 });

    return [edgeMat, edgeMat, edgeMat, edgeMat, insideMat, outsideMat];
  }, [insideColor, metalness, outsideTexture, roughness]);
  const coverGeometry = useMemo(() => {
    const geo = new THREE.BoxGeometry(safe(width), safe(height), safe(thickness));
    geo.translate(side === 'back' ? width / 2 : -width / 2, 0, 0);
    return geo;
  }, [height, side, thickness, width]);

  useEffect(() => {
    return () => coverGeometry.dispose();
  }, [coverGeometry]);

  useFrame((_, delta) => {
    progressRef.current = Math.min(progressRef.current + delta / COVER_FLIP_SECONDS, 1);
    const raw = progressRef.current;
    const eased = raw * raw * (3 - 2 * raw);

    if (groupRef.current) {
      if (opening) {
        groupRef.current.rotation.y = side === 'back' ? -Math.PI * (1 - eased) : Math.PI * (1 - eased);
      } else {
        groupRef.current.rotation.y = side === 'back' ? -Math.PI * eased : Math.PI * eased;
      }
    }
  });

  const initialRotationY = opening
    ? (side === 'back' ? -Math.PI : Math.PI)
    : 0;

  return (
    <group ref={groupRef} position={[0, 0, topZ + thickness / 2 + 0.012]} rotation={[0, initialRotationY, 0]}>
      <mesh geometry={coverGeometry} material={materials} renderOrder={ORDER.flip} frustumCulled={false} />
    </group>
  );
}

function AnimatedBookCenter({
  fromX,
  toX,
  active,
  children,
}: {
  fromX: number;
  toX: number;
  active: boolean;
  children: ReactNode;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const progressRef = useRef(active ? 0 : 1);

  useEffect(() => {
    progressRef.current = active ? 0 : 1;
    if (groupRef.current) {
      groupRef.current.position.x = active ? fromX : toX;
    }
  }, [active, fromX, toX]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    progressRef.current = Math.min(progressRef.current + delta / COVER_FLIP_SECONDS, 1);
    const eased = progressRef.current * progressRef.current * (3 - 2 * progressRef.current);
    groupRef.current.position.x = fromX + (toX - fromX) * eased;
  });

  return <group ref={groupRef}>{children}</group>;
}

interface OpenBookProps {
  trimWidth: number;
  trimHeight: number;
  pageDepth: number;
  coverThickness: number;
  coverOverhang: number;
  coverTextures: CoverTextures;
  roughness: number;
  metalness: number;
  paperType: PaperType;
  pageCount: number;
  currentPage: number;
  targetPage: number | null;
  flipProgress: number;
  isFlipping: boolean;
  isFlippingForward: boolean;
  pageTextures: Map<number, THREE.Texture | null>;
  bleedEnabled: boolean;
  overlays: Preview3DOverlays;
  safeInset: number;
}

function OpenBook({
  trimWidth,
  trimHeight,
  pageDepth,
  coverThickness,
  coverOverhang,
  coverTextures,
  roughness,
  metalness,
  paperType,
  pageCount,
  currentPage,
  targetPage,
  flipProgress,
  isFlipping,
  isFlippingForward,
  pageTextures,
  bleedEnabled,
  overlays,
  safeInset,
}: OpenBookProps) {
  const totalPages = Math.max(pageCount, 1);
  const spreadPage = normalizeSpread(currentPage, totalPages);
  const leftPageNo = spreadPage === 1 ? null : spreadPage;
  const rightPageNo = spreadPage === 1 ? 1 : spreadPage + 1 <= totalPages ? spreadPage + 1 : null;
  const progress = clamp((leftPageNo ?? 0) / totalPages, 0, 1);
  const leftStackDepth = Math.max(pageDepth * progress, MIN_STACK);
  const rightStackDepth = Math.max(pageDepth * (1 - progress), MIN_STACK);
  const pageW = trimWidth;
  const pageH = trimHeight;
  const paper = getPaperAppearance(paperType);
  const visibleBlankColor = paper.page;
  const flipGeometry = getPageGeometry({ trimWidth: pageW, trimHeight: pageH, bleed: bleedEnabled });
  const flipW = flipGeometry.bleedWidth;
  const flipH = flipGeometry.bleedHeight;
  const coverW = trimWidth + coverOverhang * 2;
  const coverH = trimHeight + coverOverhang * 2;
  const lastSpread = totalPages <= 1 ? 1 : totalPages % 2 === 0 ? totalPages : totalPages - 1;
  const leftTop = coverThickness + leftStackDepth + 0.004;
  const rightTop = coverThickness + rightStackDepth + 0.004;
  const activeTop = Math.max(leftTop, rightTop);
  const getPageTexture = (pageNo: number | null) => (pageNo ? pageTextures.get(pageNo - 1) ?? null : null);
  const getFallbackTexture = (pageNo: number | null, direction: -1 | 1) => {
    if (!pageNo) return null;
    const direct = getPageTexture(pageNo);
    if (direct) return direct;
    for (let offset = 1; offset <= 4; offset += 1) {
      const near = pageNo + direction * offset;
      if (near >= 1 && near <= totalPages) {
        const tex = getPageTexture(near);
        if (tex) return tex;
      }
    }
    return null;
  };
  const flipFrontNo = isFlippingForward ? rightPageNo : leftPageNo;
  const flipBackNo = isFlippingForward ? (rightPageNo ? rightPageNo + 1 : null) : (leftPageNo ? leftPageNo - 1 : null);
  const destinationLeftPageNo = isFlippingForward
    ? (rightPageNo ? rightPageNo + 1 : null)
    : (leftPageNo ? leftPageNo - 2 : null);
  const destinationRightPageNo = isFlippingForward
    ? (rightPageNo ? rightPageNo + 2 : null)
    : (leftPageNo ? leftPageNo - 1 : null);
  const flipFrontTexture = getFallbackTexture(flipFrontNo, isFlippingForward ? -1 : 1);
  const flipBackTexture = getFallbackTexture(
    flipBackNo && flipBackNo >= 1 && flipBackNo <= totalPages ? flipBackNo : null,
    isFlippingForward ? -1 : 1,
  );
  const isMidFlip = isFlipping || (flipProgress > 0.001 && flipProgress < 0.999);
  const isOpeningFrontCover = isMidFlip && isFlippingForward && targetPage === currentPage && spreadPage <= 1;
  const isOpeningBackCover = isMidFlip && !isFlippingForward && targetPage === currentPage && spreadPage >= lastSpread;
  const isClosingBackCover = isMidFlip && isFlippingForward && !isOpeningFrontCover && spreadPage >= lastSpread;
  const isClosingFrontCover = isMidFlip && !isFlippingForward && spreadPage <= 1;
  const isCoverFlip = isOpeningFrontCover || isOpeningBackCover || isClosingBackCover || isClosingFrontCover;
  const showStaticFrontCover = !(isOpeningFrontCover || isClosingFrontCover);
  const showStaticBackCover = !(isOpeningBackCover || isClosingBackCover);
  const showLeftSide = !(isOpeningFrontCover || isClosingFrontCover);
  const showRightSide = !(isOpeningBackCover || isClosingBackCover);
  const showLeftActive = showLeftSide && !(isMidFlip && !isFlippingForward && leftPageNo !== null && !isCoverFlip);
  const showRightActive = showRightSide && !(isMidFlip && isFlippingForward && rightPageNo !== null && !isCoverFlip);
  const leftDisplayPageNo =
    isMidFlip && !isCoverFlip && !isFlippingForward && destinationLeftPageNo && destinationLeftPageNo >= 1
      ? destinationLeftPageNo
      : leftPageNo;
  const rightDisplayPageNo =
    isMidFlip && !isCoverFlip && isFlippingForward && destinationRightPageNo && destinationRightPageNo >= 1 && destinationRightPageNo <= totalPages
      ? destinationRightPageNo
      : rightPageNo;
  const isBackCoverFlip = isOpeningBackCover || isClosingBackCover;
  const centerFromX = isOpeningBackCover ? trimWidth / 2 : 0;
  const centerToX = isClosingBackCover ? trimWidth / 2 : 0;

  return (
    <AnimatedBookCenter fromX={centerFromX} toX={centerToX} active={isBackCoverFlip}>
    <group>
      {showStaticFrontCover && (
        <CoverBoard
          width={coverW}
          height={coverH}
          thickness={coverThickness}
          position={[-trimWidth / 2, 0, coverThickness / 2]}
          outside={coverTextures.front}
          outsideFace="back"
          insideColor={visibleBlankColor}
          roughness={roughness}
          metalness={metalness}
        />
      )}
      {showStaticBackCover && (
        <CoverBoard
          width={coverW}
          height={coverH}
          thickness={coverThickness}
          position={[trimWidth / 2, 0, coverThickness / 2]}
          outside={coverTextures.back}
          outsideFace="back"
          insideColor={visibleBlankColor}
          roughness={roughness}
          metalness={metalness}
        />
      )}
      {showLeftSide && (
        <PageStack width={trimWidth} height={trimHeight} depth={leftStackDepth} position={[-trimWidth / 2, 0, coverThickness + leftStackDepth / 2]} color={visibleBlankColor} />
      )}
      {showRightSide && (
        <PageStack width={trimWidth} height={trimHeight} depth={rightStackDepth} position={[trimWidth / 2, 0, coverThickness + rightStackDepth / 2]} color={visibleBlankColor} />
      )}
      {showLeftActive && (
        <ActivePage
          width={pageW}
          height={pageH}
          position={[-trimWidth / 2, 0, leftTop]}
          texture={getFallbackTexture(leftDisplayPageNo, -1)}
          paperColor={visibleBlankColor}
          bleedEnabled={bleedEnabled}
          overlays={overlays}
          safeInset={safeInset}
        />
      )}
      {rightPageNo && showRightActive && (
        <ActivePage
          width={pageW}
          height={pageH}
          position={[trimWidth / 2, 0, rightTop]}
          texture={getFallbackTexture(rightDisplayPageNo, 1)}
          paperColor={visibleBlankColor}
          bleedEnabled={bleedEnabled}
          overlays={overlays}
          safeInset={safeInset}
        />
      )}
      {isMidFlip && !isCoverFlip && isFlippingForward && destinationRightPageNo && destinationRightPageNo <= totalPages && (
        <ActivePage
          width={pageW}
          height={pageH}
          position={[trimWidth / 2, 0, rightTop]}
          texture={getFallbackTexture(destinationRightPageNo, 1)}
          paperColor={visibleBlankColor}
          bleedEnabled={bleedEnabled}
          overlays={overlays}
          safeInset={safeInset}
        />
      )}
      {isMidFlip && !isCoverFlip && !isFlippingForward && destinationLeftPageNo && destinationLeftPageNo >= 1 && (
        <ActivePage
          width={pageW}
          height={pageH}
          position={[-trimWidth / 2, 0, leftTop]}
          texture={getFallbackTexture(destinationLeftPageNo, -1)}
          paperColor={visibleBlankColor}
          bleedEnabled={bleedEnabled}
          overlays={overlays}
          safeInset={safeInset}
        />
      )}
      {isClosingBackCover && (
        <FlippingCover
          key={`back-cover-${currentPage}`}
          width={coverW}
          height={coverH}
          thickness={coverThickness}
          side="back"
          topZ={activeTop}
          outsideTexture={coverTextures.back}
          insideColor={visibleBlankColor}
          roughness={roughness}
          metalness={metalness}
        />
      )}
      {isOpeningBackCover && (
        <FlippingCover
          key={`back-cover-open-${currentPage}`}
          width={coverW}
          height={coverH}
          thickness={coverThickness}
          side="back"
          topZ={activeTop}
          outsideTexture={coverTextures.back}
          insideColor={visibleBlankColor}
          roughness={roughness}
          metalness={metalness}
          opening
        />
      )}
      {isClosingFrontCover && (
        <FlippingCover
          key={`front-cover-${currentPage}`}
          width={coverW}
          height={coverH}
          thickness={coverThickness}
          side="front"
          topZ={activeTop}
          outsideTexture={coverTextures.front}
          insideColor={visibleBlankColor}
          roughness={roughness}
          metalness={metalness}
        />
      )}
      {isOpeningFrontCover && (
        <FlippingCover
          key={`front-cover-open-${currentPage}`}
          width={coverW}
          height={coverH}
          thickness={coverThickness}
          side="front"
          topZ={activeTop}
          outsideTexture={coverTextures.front}
          insideColor={visibleBlankColor}
          roughness={roughness}
          metalness={metalness}
          opening
        />
      )}
      {isMidFlip && !isCoverFlip && (
        <FlippingPage
          key={`${isFlippingForward ? 'forward' : 'backward'}-${currentPage}`}
          width={flipW}
          height={flipH}
          pageCenterX={isFlippingForward ? trimWidth / 2 : -trimWidth / 2}
          topZ={activeTop}
          forward={isFlippingForward}
          paperColor={visibleBlankColor}
          frontTexture={flipFrontTexture}
          backTexture={flipBackTexture}
        />
      )}
      <mesh position={[0, 0, activeTop + 0.001]} renderOrder={ORDER.active}>
        <planeGeometry args={[0.025, trimHeight * 0.94]} />
        <meshStandardMaterial color="#3b2a1d" roughness={1} transparent opacity={0.35} />
      </mesh>
    </group>
    </AnimatedBookCenter>
  );
}

export default function PhysicalBook({
  trimWidth,
  trimHeight,
  spineWidth,
  pageCount,
  currentPage,
  targetPage,
  pose,
  flipProgress,
  isFlipping,
  isFlippingForward,
  pageTextures,
  coverTextures,
  coverFinish = 'matte',
  paperType,
  variant = 'paperback',
  bleedEnabled,
  overlays,
  safeInset,
}: PhysicalBookProps) {
  const isHardcover = variant === 'hardcover';
  const coverThickness = isHardcover ? 0.04 : 0.014;
  const coverOverhang = isHardcover ? 0.045 : 0;
  const pageDepth = safe(Math.max(spineWidth * (isHardcover ? 0.78 : 0.86), 0.045));
  const roughness = coverFinish === 'glossy' ? 0.28 : 0.68;
  const metalness = coverFinish === 'glossy' ? 0.12 : 0.02;
  const paper = getPaperAppearance(paperType);

  const isOpeningFromClosedFront = pose === 'closedFront' && isFlipping && isFlippingForward && targetPage === currentPage;

  if (pose !== 'open' && !isOpeningFromClosedFront) {
    return (
      <ClosedBook
        trimWidth={trimWidth}
        trimHeight={trimHeight}
        pageDepth={pageDepth}
        coverThickness={coverThickness}
        coverOverhang={coverOverhang}
        coverTextures={coverTextures}
        roughness={roughness}
        metalness={metalness}
        paperColor={paper.page}
        paperEdgeColor={paper.edge}
        visibleCover={pose === 'closedBack' ? 'back' : 'front'}
      />
    );
  }

  return (
    <OpenBook
      trimWidth={trimWidth}
      trimHeight={trimHeight}
      pageDepth={pageDepth}
      coverThickness={coverThickness}
      coverOverhang={coverOverhang}
      coverTextures={coverTextures}
      roughness={roughness}
      metalness={metalness}
      paperType={paperType}
      pageCount={pageCount}
      currentPage={currentPage}
      targetPage={targetPage}
      flipProgress={flipProgress}
      isFlipping={isFlipping}
      isFlippingForward={isFlippingForward}
      pageTextures={pageTextures}
      bleedEnabled={bleedEnabled}
      overlays={overlays}
      safeInset={safeInset}
    />
  );
}
