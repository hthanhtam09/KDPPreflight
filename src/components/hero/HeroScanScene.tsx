'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

type HeroScanSceneProps = {
  activeStep: number;
};

const PULSE_POSITIONS: Record<number, [number, number, number]> = {
  4: [-1.8, 0.95, 0.16],
  5: [-1.8, 0.95, 0.16],
  6: [0, 0.05, 0.16],
  7: [1.75, -0.95, 0.16],
  9: [0, 0.05, 0.16],
};

const WARNING_COLOR = '#DC2626';
const COPPER_COLOR = '#C08457';
const SUCCESS_COLOR = '#059669';

export default function HeroScanScene({ activeStep }: HeroScanSceneProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return null;

  return (
    <Canvas
      className="h-full w-full"
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 6], fov: 45 }}
      gl={{ alpha: true, antialias: true }}
      frameloop="always"
    >
      <ambientLight intensity={0.45} />
      <ScanField activeStep={activeStep} />
    </Canvas>
  );
}

function ScanField({ activeStep }: { activeStep: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const beamRef = useRef<THREE.Mesh>(null);
  const completionGlowRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const pulseRef = useRef<THREE.Mesh>(null);
  const lineRefs = useRef<THREE.Mesh[]>([]);
  const previousStepRef = useRef(activeStep);
  const pulseStartRef = useRef<number | null>(null);

  const scanning = activeStep === 3 || activeStep === 8;
  const warning = activeStep >= 4 && activeStep <= 5;
  const fixing = activeStep === 6;
  const rechecking = activeStep >= 7 && activeStep <= 8;
  const complete = activeStep >= 9;
  const pulseColor = warning ? WARNING_COLOR : complete || rechecking ? SUCCESS_COLOR : COPPER_COLOR;

  const particlePositions = useMemo(() => {
    const count = 90;
    const arr = new Float32Array(count * 3);
    let seed = 42;

    function random() {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    }

    for (let i = 0; i < count; i += 1) {
      arr[i * 3] = (random() - 0.5) * 7.1;
      arr[i * 3 + 1] = (random() - 0.5) * 4.1;
      arr[i * 3 + 2] = (random() - 0.5) * 1.2;
    }

    return arr;
  }, []);

  useEffect(() => {
    if (activeStep !== previousStepRef.current && PULSE_POSITIONS[activeStep]) {
      pulseStartRef.current = null;
    }

    previousStepRef.current = activeStep;
  }, [activeStep]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(t * 0.12) * 0.015;
      groupRef.current.position.y = Math.sin(t * 0.25) * 0.04;
    }

    if (beamRef.current) {
      beamRef.current.visible = scanning;
      if (scanning) {
        beamRef.current.position.y = 2.05 - ((t * (activeStep === 8 ? 1.65 : 0.92)) % 4.1);
        const mat = beamRef.current.material as THREE.MeshBasicMaterial;
        mat.color.set(activeStep === 8 ? SUCCESS_COLOR : COPPER_COLOR);
        mat.opacity = 0.12 + Math.sin(t * 5) * 0.035;
      }
    }

    if (particlesRef.current) {
      particlesRef.current.rotation.z = t * (scanning || fixing ? 0.02 : 0.008);
      particlesRef.current.position.y = Math.sin(t * 0.3) * 0.03;
      const mat = particlesRef.current.material as THREE.PointsMaterial;
      mat.color.set(complete ? SUCCESS_COLOR : warning ? WARNING_COLOR : COPPER_COLOR);
      mat.opacity = scanning ? 0.2 : complete ? 0.18 : warning || fixing || rechecking ? 0.16 : activeStep >= 1 ? 0.13 : 0.09;
    }

    lineRefs.current.forEach((line, index) => {
      line.visible = activeStep >= 1 && !complete;
      if (!line.visible) return;

      line.position.x = -3.2 + ((t * (0.18 + index * 0.035) + index * 1.45) % 6.4);
      const mat = line.material as THREE.MeshBasicMaterial;
      mat.color.set(warning ? WARNING_COLOR : rechecking ? SUCCESS_COLOR : COPPER_COLOR);
      mat.opacity = scanning || fixing ? 0.04 + Math.sin(t * 2.4 + index) * 0.012 : warning ? 0.035 : 0.018;
    });

    if (completionGlowRef.current) {
      completionGlowRef.current.visible = complete;
      const mat = completionGlowRef.current.material as THREE.MeshBasicMaterial;
      mat.color.set(SUCCESS_COLOR);
      mat.opacity = complete ? 0.12 + Math.sin(t * 1.4) * 0.018 : 0;
    }

    if (pulseRef.current) {
      const pulsePosition = PULSE_POSITIONS[activeStep];

      if (!pulsePosition) {
        pulseRef.current.visible = false;
        return;
      }

      if (pulseStartRef.current === null) {
        pulseStartRef.current = t;
        pulseRef.current.position.set(...pulsePosition);
      }

      const age = t - pulseStartRef.current;
      const visible = age < 0.9;
      pulseRef.current.visible = visible;

      if (visible) {
        const scale = 0.55 + age * (fixing ? 1.55 : 1.2);
        pulseRef.current.scale.set(scale, scale, 1);
        const mat = pulseRef.current.material as THREE.MeshBasicMaterial;
        mat.color.set(pulseColor);
        mat.opacity = Math.max(0, (fixing ? 0.28 : 0.23) * (1 - age / 0.9));
      }
    }
  });

  return (
    <group ref={groupRef} scale={[1.08, 1.08, 1]}>
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particlePositions, 3]}
            count={particlePositions.length / 3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.022}
          color={complete ? SUCCESS_COLOR : warning ? WARNING_COLOR : COPPER_COLOR}
          transparent
          opacity={scanning ? 0.2 : complete ? 0.18 : warning || fixing || rechecking ? 0.16 : activeStep >= 1 ? 0.13 : 0.09}
          depthWrite={false}
        />
      </points>

      <mesh ref={beamRef} position={[0, 0, 0.08]} visible={scanning}>
        <planeGeometry args={[6.8, 0.34]} />
        <meshBasicMaterial
          color={activeStep === 8 ? SUCCESS_COLOR : COPPER_COLOR}
          transparent
          opacity={0.12}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {[0, 1, 2, 3].map((index) => (
        <mesh
          key={index}
          ref={(node) => {
            if (node) lineRefs.current[index] = node;
          }}
          position={[-3 + index * 1.6, -1.45 + index * 0.9, 0.11]}
          rotation={[0, 0, -0.18]}
          visible={activeStep >= 1 && !complete}
        >
          <planeGeometry args={[0.018, 3.2]} />
          <meshBasicMaterial
            color={warning ? WARNING_COLOR : rechecking ? SUCCESS_COLOR : COPPER_COLOR}
            transparent
            opacity={0.028}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}

      <mesh position={[0, 0, -0.22]} rotation={[0, 0, -0.035]}>
        <planeGeometry args={[6.9, 3.9, 14, 8]} />
        <meshBasicMaterial
          color={complete ? SUCCESS_COLOR : warning ? WARNING_COLOR : COPPER_COLOR}
          wireframe
          transparent
          opacity={complete ? 0.034 : warning ? 0.032 : 0.024}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={pulseRef} visible={false}>
        <ringGeometry args={[0.35, 0.58, 48]} />
        <meshBasicMaterial
          color={pulseColor}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh ref={completionGlowRef} position={[0, 0, -0.04]} visible={complete}>
        <circleGeometry args={[2.85, 64]} />
        <meshBasicMaterial
          color={SUCCESS_COLOR}
          transparent
          opacity={complete ? 0.12 : 0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
