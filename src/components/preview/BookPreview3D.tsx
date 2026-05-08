'use client';

import { useState, useCallback, useRef, Suspense, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, useTexture, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '@/store/use-app-store';

// --- Textured Cover Component ---
function TexturedCover({ 
  url, 
  width, 
  height, 
  position, 
  rotation 
}: { 
  url: string; 
  width: number; 
  height: number; 
  position: [number, number, number]; 
  rotation: [number, number, number]; 
}) {
  const texture = useTexture(url);
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

// --- Fallback Cover (no texture) ---
function PlainCover({ 
  width, 
  height, 
  position, 
  rotation,
  color = '#1a1a2e',
}: { 
  width: number; 
  height: number; 
  position: [number, number, number]; 
  rotation: [number, number, number];
  color?: string;
}) {
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// --- Page Block ---
function PageBlock({
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
  return (
    <RoundedBox args={[width, height, depth]} position={position} radius={0.01} smoothness={2}>
      <meshStandardMaterial color="#f5f0e8" />
    </RoundedBox>
  );
}

// --- Front Cover Wrapper ---
function FrontCover({
  coverUrl,
  width,
  height,
  position,
  rotation,
}: {
  coverUrl: string | undefined;
  width: number;
  height: number;
  position: [number, number, number];
  rotation: [number, number, number];
}) {
  if (coverUrl) {
    return <TexturedCover url={coverUrl} width={width} height={height} position={position} rotation={rotation} />;
  }
  return <PlainCover width={width} height={height} position={position} rotation={rotation} color="#1a1a2e" />;
}

// --- Book Model ---
interface BookModelProps {
  coverUrl?: string;
  spineWidth: number;
  trimWidth: number;
  trimHeight: number;
}

function BookModel({ coverUrl, spineWidth, trimWidth, trimHeight }: BookModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Scale: 1 unit = 1 inch, then scaled down
  const scale = 0.3;
  const w = trimWidth * scale;
  const h = trimHeight * scale;
  const spine = Math.max(spineWidth * scale, 0.02);
  const pageDepth = spine * 0.9;
  const coverThickness = 0.008;
  
  return (
    <group ref={groupRef}>
      {/* Page block (cream pages) */}
      <PageBlock 
        width={w * 0.98} 
        height={h * 0.98} 
        depth={pageDepth} 
        position={[0, 0, 0]} 
      />
      
      {/* Front Cover */}
      <FrontCover 
        coverUrl={coverUrl}
        width={w} 
        height={h} 
        position={[0, 0, pageDepth / 2 + coverThickness]} 
        rotation={[0, 0, 0]} 
      />
      
      {/* Back Cover */}
      <PlainCover 
        width={w} 
        height={h} 
        position={[0, 0, -(pageDepth / 2 + coverThickness)]} 
        rotation={[0, Math.PI, 0]}
        color="#0d0d1a"
      />
      
      {/* Spine */}
      <mesh position={[-w / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[pageDepth + coverThickness * 2, h]} />
        <meshStandardMaterial color="#151525" />
      </mesh>
      
      {/* Right edge (page edges visible) */}
      <mesh position={[w / 2 - 0.001, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[pageDepth, h * 0.98]} />
        <meshStandardMaterial color="#e8e0d4" />
      </mesh>
      
      {/* Top edge */}
      <mesh position={[0, h / 2 - 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w * 0.98, pageDepth]} />
        <meshStandardMaterial color="#ede6da" />
      </mesh>
      
      {/* Bottom edge */}
      <mesh position={[0, -h / 2 + 0.001, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w * 0.98, pageDepth]} />
        <meshStandardMaterial color="#ede6da" />
      </mesh>
    </group>
  );
}

// --- Canvas Loader ---
function CanvasLoader() {
  return (
    <mesh>
      <boxGeometry args={[1, 1.5, 0.3]} />
      <meshStandardMaterial color="#333" wireframe />
    </mesh>
  );
}

// --- Main 3D Preview Component ---
interface BookPreview3DProps {
  coverUrl?: string;
  spineWidth?: number;
  trimWidth?: number;
  trimHeight?: number;
}

export default function BookPreview3D({ 
  coverUrl,
  spineWidth = 0.4,
  trimWidth = 6,
  trimHeight = 9,
}: BookPreview3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleExport = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = 'kdp-book-preview.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, []);

  return (
    <div className="relative w-full h-full">
      <Canvas
        ref={canvasRef}
        camera={{ position: [2, 1.5, 3], fov: 40 }}
        gl={{ preserveDrawingBuffer: true, antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={<CanvasLoader />}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <directionalLight position={[-3, 3, -3]} intensity={0.3} />
          
          <BookModel 
            coverUrl={coverUrl}
            spineWidth={spineWidth}
            trimWidth={trimWidth}
            trimHeight={trimHeight}
          />
          
          <ContactShadows 
            position={[0, -2, 0]} 
            opacity={0.4} 
            scale={10} 
            blur={2} 
            far={4} 
          />
          
          <Environment preset="studio" />
          <OrbitControls 
            enableDamping 
            dampingFactor={0.05}
            minDistance={1}
            maxDistance={10}
            enablePan={true}
          />
        </Suspense>
      </Canvas>
      
      {/* Export button overlay */}
      <button
        onClick={handleExport}
        className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-4 py-2 rounded-lg border border-white/10 transition-all text-sm flex items-center gap-2"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Export PNG
      </button>
    </div>
  );
}
