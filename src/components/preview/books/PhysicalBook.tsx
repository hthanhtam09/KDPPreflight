'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import type { CoverTextures, Preview3DOverlays } from '../BookPreview3D';

export type PhysicalBookPose = 'closedFront' | 'closedBack' | 'closedSpine' | 'open';

interface PhysicalBookProps {
  trimWidth: number;
  trimHeight: number;
  spineWidth: number;
  pageCount: number;
  currentPage: number;
  pose: PhysicalBookPose;
  flipProgress: number;
  isFlippingForward: boolean;
  pageTextures: Map<number, THREE.Texture | null>;
  coverTextures: CoverTextures;
  coverFinish?: 'matte' | 'glossy';
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
    });
  }

  return new THREE.MeshBasicMaterial({
    color,
    side,
    toneMapped: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
}

function CoverBoard({
  width,
  height,
  thickness,
  position,
  outside,
  outsideFace,
  roughness,
  metalness,
}: {
  width: number;
  height: number;
  thickness: number;
  position: [number, number, number];
  outside: THREE.Texture | null;
  outsideFace: 'front' | 'back';
  roughness: number;
  metalness: number;
}) {
  const materials = useMemo(() => {
    const outsideMat = outside
      ? new THREE.MeshBasicMaterial({ color: '#ffffff', map: outside, toneMapped: false })
      : new THREE.MeshStandardMaterial({ color: COVER_FALLBACK, roughness, metalness });
    const insideMat = new THREE.MeshStandardMaterial({ color: ENDPAPER, roughness: 0.92, metalness: 0 });
    const edgeMat = new THREE.MeshStandardMaterial({ color: '#2b2534', roughness, metalness });
    return outsideFace === 'front'
      ? [edgeMat, edgeMat, edgeMat, edgeMat, outsideMat, insideMat]
      : [edgeMat, edgeMat, edgeMat, edgeMat, insideMat, outsideMat];
  }, [outside, outsideFace, roughness, metalness]);

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
}: {
  trimWidth: number;
  trimHeight: number;
  pageDepth: number;
  coverThickness: number;
  coverOverhang: number;
  coverTextures: CoverTextures;
  roughness: number;
  metalness: number;
}) {
  const coverW = trimWidth + coverOverhang * 2;
  const coverH = trimHeight + coverOverhang * 2;
  const totalDepth = pageDepth + coverThickness * 2;

  return (
    <group>
      <CoverBoard
        width={coverW}
        height={coverH}
        thickness={coverThickness}
        position={[0, 0, pageDepth / 2 + coverThickness / 2]}
        outside={coverTextures.front}
        outsideFace="front"
        roughness={roughness}
        metalness={metalness}
      />
      <mesh position={[0.015, 0, 0]} renderOrder={ORDER.stack}>
        <boxGeometry args={[safe(trimWidth * 0.97), safe(trimHeight * 0.97), safe(pageDepth)]} />
        <meshStandardMaterial color={PAPER} roughness={0.96} metalness={0} />
      </mesh>
      <CoverBoard
        width={coverW}
        height={coverH}
        thickness={coverThickness}
        position={[0, 0, -(pageDepth / 2 + coverThickness / 2)]}
        outside={coverTextures.back}
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
        <meshStandardMaterial color={PAPER_EDGE} roughness={0.98} metalness={0} />
      </mesh>
    </group>
  );
}

function PageStack({ width, height, depth, position }: { width: number; height: number; depth: number; position: [number, number, number] }) {
  return (
    <mesh position={position} renderOrder={ORDER.stack}>
      <boxGeometry args={[safe(width), safe(height), safe(depth)]} />
      <meshStandardMaterial color={PAPER} roughness={0.97} metalness={0} />
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
  bleedEnabled,
  overlays,
  safeInset,
}: {
  width: number;
  height: number;
  position: [number, number, number];
  texture: THREE.Texture | null;
  bleedEnabled: boolean;
  overlays: Preview3DOverlays;
  safeInset: number;
}) {
  const geometry = getPageGeometry({ trimWidth: width, trimHeight: height, bleed: true });
  const textureWidth = bleedEnabled ? geometry.bleedWidth : geometry.trimWidth;
  const textureHeight = bleedEnabled ? geometry.bleedHeight : geometry.trimHeight;
  const pageMaterial = useMemo(() => material(texture), [texture]);
  const paperMaterial = useMemo(() => material(null), []);
  const showInspection = overlays.bleed || overlays.trim || overlays.safe;
  const safeW = Math.max(geometry.trimWidth - safeInset * 2, geometry.trimWidth * 0.72);
  const safeH = Math.max(geometry.trimHeight - safeInset * 2, geometry.trimHeight * 0.72);

  return (
    <group position={position} renderOrder={ORDER.active}>
      <mesh material={paperMaterial} frustumCulled={false}>
        <planeGeometry args={[safe(geometry.bleedWidth), safe(geometry.bleedHeight), 1, 1]} />
      </mesh>
      {!bleedEnabled && (
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
  topZ,
  progress,
  forward,
  frontTexture,
  backTexture,
}: {
  width: number;
  height: number;
  topZ: number;
  progress: number;
  forward: boolean;
  frontTexture: THREE.Texture | null;
  backTexture: THREE.Texture | null;
}) {
  const eased = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
  const curlLift = Math.sin(eased * Math.PI) * 0.1;
  const front = useMemo(() => material(frontTexture, PAPER, THREE.FrontSide), [frontTexture]);
  const back = useMemo(() => material(backTexture, PAPER, THREE.BackSide), [backTexture]);
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(safe(width), safe(height), 18, 1);
    geo.translate(forward ? width / 2 : -width / 2, 0, 0);
    const positions = geo.getAttribute('position');
    for (let i = 0; i < positions.count; i += 1) {
      const x = positions.getX(i);
      const t = forward ? x / width : Math.abs(x) / width;
      positions.setZ(i, Math.sin(t * Math.PI) * curlLift);
    }
    positions.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, [curlLift, forward, height, width]);

  return (
    <group position={[0, 0, topZ + 0.018]} rotation={[0, forward ? -Math.PI * eased : Math.PI * eased, 0]}>
      <mesh geometry={geometry} material={front} renderOrder={ORDER.flip} frustumCulled={false} />
      <mesh geometry={geometry} material={back} renderOrder={ORDER.flip} frustumCulled={false} />
    </group>
  );
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
  pageCount: number;
  currentPage: number;
  flipProgress: number;
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
  pageCount,
  currentPage,
  flipProgress,
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
  const pageW = trimWidth * 0.94;
  const pageH = trimHeight * 0.94;
  const flipGeometry = getPageGeometry({ trimWidth: pageW, trimHeight: pageH, bleed: bleedEnabled });
  const flipW = flipGeometry.bleedWidth;
  const flipH = flipGeometry.bleedHeight;
  const coverW = trimWidth + coverOverhang * 2;
  const coverH = trimHeight + coverOverhang * 2;
  const leftTop = coverThickness + leftStackDepth + 0.004;
  const rightTop = coverThickness + rightStackDepth + 0.004;
  const activeTop = Math.max(leftTop, rightTop);
  const getPageTexture = (pageNo: number | null) => (pageNo ? pageTextures.get(pageNo - 1) ?? null : null);
  const flipFrontNo = isFlippingForward ? rightPageNo : leftPageNo;
  const flipBackNo = isFlippingForward ? (rightPageNo ? rightPageNo + 1 : null) : (leftPageNo ? leftPageNo - 1 : null);

  return (
    <group>
      <CoverBoard
        width={coverW}
        height={coverH}
        thickness={coverThickness}
        position={[-trimWidth / 2, 0, coverThickness / 2]}
        outside={coverTextures.front}
        outsideFace="back"
        roughness={roughness}
        metalness={metalness}
      />
      <CoverBoard
        width={coverW}
        height={coverH}
        thickness={coverThickness}
        position={[trimWidth / 2, 0, coverThickness / 2]}
        outside={coverTextures.back}
        outsideFace="back"
        roughness={roughness}
        metalness={metalness}
      />
      <PageStack width={trimWidth * 0.96} height={trimHeight * 0.96} depth={leftStackDepth} position={[-trimWidth / 2, 0, coverThickness + leftStackDepth / 2]} />
      <PageStack width={trimWidth * 0.96} height={trimHeight * 0.96} depth={rightStackDepth} position={[trimWidth / 2, 0, coverThickness + rightStackDepth / 2]} />
      <ActivePage
        width={pageW}
        height={pageH}
        position={[-trimWidth / 2, 0, leftTop]}
        texture={getPageTexture(leftPageNo)}
        bleedEnabled={bleedEnabled}
        overlays={overlays}
        safeInset={safeInset}
      />
      {rightPageNo && (
        <ActivePage
          width={pageW}
          height={pageH}
          position={[trimWidth / 2, 0, rightTop]}
          texture={getPageTexture(rightPageNo)}
          bleedEnabled={bleedEnabled}
          overlays={overlays}
          safeInset={safeInset}
        />
      )}
      {flipProgress > 0.001 && flipProgress < 0.999 && (
        <FlippingPage
          width={flipW}
          height={flipH}
          topZ={activeTop}
          progress={flipProgress}
          forward={isFlippingForward}
          frontTexture={getPageTexture(flipFrontNo)}
          backTexture={getPageTexture(flipBackNo && flipBackNo >= 1 && flipBackNo <= totalPages ? flipBackNo : null)}
        />
      )}
      <mesh position={[0, 0, activeTop + 0.001]} renderOrder={ORDER.active}>
        <planeGeometry args={[0.025, trimHeight * 0.94]} />
        <meshStandardMaterial color="#3b2a1d" roughness={1} transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

export default function PhysicalBook({
  trimWidth,
  trimHeight,
  spineWidth,
  pageCount,
  currentPage,
  pose,
  flipProgress,
  isFlippingForward,
  pageTextures,
  coverTextures,
  coverFinish = 'matte',
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

  if (pose !== 'open') {
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
      pageCount={pageCount}
      currentPage={currentPage}
      flipProgress={flipProgress}
      isFlippingForward={isFlippingForward}
      pageTextures={pageTextures}
      bleedEnabled={bleedEnabled}
      overlays={overlays}
      safeInset={safeInset}
    />
  );
}
