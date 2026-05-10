'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

interface KindleDeviceProps {
  currentPage: number;
  totalPages: number;
  pageTextures: Map<number, THREE.Texture | null>;
  deviceType?: 'paperwhite' | 'oasis' | 'tablet' | 'phone';
  darkMode?: boolean;
}

// Device dimensions (in scene units)
const DEVICE_DIMS = {
  paperwhite: { width: 1.3, height: 1.75, depth: 0.035, screenW: 0.95, screenH: 1.3, bezel: 0.12, radius: 0.06 },
  oasis:      { width: 1.2, height: 1.6, depth: 0.03, screenW: 0.9, screenH: 1.25, bezel: 0.1, radius: 0.04 },
  tablet:     { width: 2.1, height: 1.5, depth: 0.04, screenW: 1.8, screenH: 1.25, bezel: 0.08, radius: 0.05 },
  phone:      { width: 0.85, height: 1.7, depth: 0.03, screenW: 0.72, screenH: 1.35, bezel: 0.06, radius: 0.08 },
};

export default function KindleDevice({
  currentPage,
  totalPages,
  pageTextures,
  deviceType = 'paperwhite',
  darkMode = false,
}: KindleDeviceProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [pageTransition, setPageTransition] = useState(0);
  const prevPageRef = useRef(currentPage);

  const dims = DEVICE_DIMS[deviceType];

  // Detect page changes and trigger digital transition
  useFrame((_, delta) => {
    if (prevPageRef.current !== currentPage) {
      setPageTransition(1);
      prevPageRef.current = currentPage;
    }
    if (pageTransition > 0) {
      setPageTransition(prev => Math.max(0, prev - delta * 4));
    }
  });

  // Device colors based on type
  const deviceColor = deviceType === 'oasis' ? '#1a1a1a' : '#2a2a2a';
  const screenBg = darkMode ? '#1a1a1a' : '#f8f6f0';

  // Get current page texture
  const pageTexture = pageTextures.get(currentPage) || null;

  return (
    <group ref={groupRef}>
      {/* Device Body */}
      <RoundedBox args={[dims.width, dims.height, dims.depth]} radius={dims.radius} smoothness={4}>
        <meshStandardMaterial color={deviceColor} roughness={0.5} metalness={0.3} />
      </RoundedBox>

      {/* Screen Bezel (slightly recessed) */}
      <mesh position={[0, 0, dims.depth / 2 - 0.002]}>
        <planeGeometry args={[dims.screenW + 0.02, dims.screenH + 0.02]} />
        <meshStandardMaterial color="#111" roughness={0.8} metalness={0} />
      </mesh>

      {/* Screen Background */}
      <mesh position={[0, 0, dims.depth / 2 - 0.001]}>
        <planeGeometry args={[dims.screenW, dims.screenH]} />
        <meshStandardMaterial
          color={screenBg}
          roughness={0.95}
          metalness={0}
          emissive={darkMode ? '#0a0a0a' : '#f0ead8'}
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Screen Content (page texture) */}
      <mesh position={[0, 0, dims.depth / 2]}>
        <planeGeometry args={[dims.screenW * 0.92, dims.screenH * 0.92]} />
        {pageTexture ? (
          <meshStandardMaterial
            map={pageTexture}
            roughness={0.95}
            metalness={0}
            transparent
            opacity={1 - pageTransition * 0.5}
          />
        ) : (
          <meshStandardMaterial
            color={darkMode ? '#222' : '#e8e0d4'}
            roughness={0.95}
            metalness={0}
            transparent
            opacity={1 - pageTransition * 0.5}
          />
        )}
      </mesh>

      {/* Page transition overlay (digital slide/fade effect) */}
      {pageTransition > 0.01 && (
        <mesh position={[pageTransition * dims.screenW * 0.3, 0, dims.depth / 2 + 0.001]}>
          <planeGeometry args={[dims.screenW, dims.screenH]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={pageTransition * 0.15}
            roughness={1}
            metalness={0}
          />
        </mesh>
      )}

      {/* E-ink subtle texture overlay */}
      {deviceType === 'paperwhite' && !darkMode && (
        <mesh position={[0, 0, dims.depth / 2 + 0.0005]}>
          <planeGeometry args={[dims.screenW, dims.screenH]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.03}
            roughness={1}
            metalness={0}
          />
        </mesh>
      )}

      {/* Kindle logo area (bottom bezel) */}
      {deviceType === 'paperwhite' && (
        <mesh position={[0, -dims.screenH / 2 - dims.bezel / 2, dims.depth / 2 - 0.001]}>
          <planeGeometry args={[0.3, 0.02]} />
          <meshStandardMaterial color="#444" roughness={0.8} metalness={0.2} />
        </mesh>
      )}

      {/* Oasis asymmetric grip */}
      {deviceType === 'oasis' && (
        <RoundedBox
          args={[0.15, dims.height * 0.7, dims.depth + 0.01]}
          position={[-dims.width / 2 + 0.075, 0.1, 0]}
          radius={0.03}
          smoothness={2}
        >
          <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.4} />
        </RoundedBox>
      )}

      {/* Power button */}
      {(deviceType === 'paperwhite' || deviceType === 'oasis') && (
        <mesh position={[dims.width / 2 - 0.02, 0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.015, 0.015, 0.04, 8]} />
          <meshStandardMaterial color="#333" roughness={0.4} metalness={0.5} />
        </mesh>
      )}

      {/* USB-C port */}
      {deviceType !== 'phone' && (
        <mesh position={[0, -dims.height / 2, 0]}>
          <boxGeometry args={[0.08, 0.01, 0.025]} />
          <meshStandardMaterial color="#111" roughness={0.5} metalness={0.3} />
        </mesh>
      )}

      {/* Screen glow (soft light emission) */}
      {darkMode && (
        <pointLight
          position={[0, 0, dims.depth / 2 + 0.2]}
          intensity={0.3}
          distance={1.5}
          color="#f0ead8"
        />
      )}
    </group>
  );
}
