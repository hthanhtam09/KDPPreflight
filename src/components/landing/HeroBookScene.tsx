'use client';

import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { AdaptiveDpr, ContactShadows, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function PageStack() {
  const pages = useMemo(() => Array.from({ length: 18 }, (_, i) => i), []);

  return (
    <group position={[0.08, 0, 0.018]}>
      {pages.map((page) => (
        <mesh key={page} position={[0, 0, page * 0.004 - 0.034]} castShadow receiveShadow>
          <boxGeometry args={[1.72 - page * 0.002, 2.46 - page * 0.001, 0.003]} />
          <meshStandardMaterial color={page % 2 ? '#f5f7f8' : '#e8eef0'} roughness={0.78} metalness={0.02} />
        </mesh>
      ))}
    </group>
  );
}

function FlipPage({ delay = 0 }: { delay?: number }) {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = (Math.sin(clock.elapsedTime * 0.9 + delay) + 1) / 2;
    ref.current.rotation.y = -0.12 - t * 1.85;
    ref.current.position.z = 0.055 + Math.sin(t * Math.PI) * 0.028;
  });

  return (
    <group ref={ref} position={[-0.82, 0, 0.05]}>
      <mesh position={[0.84, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.68, 2.4, 0.004]} />
        <meshStandardMaterial color="#fbfcfd" roughness={0.62} />
      </mesh>
      <mesh position={[1.18, 0.56, 0.004]}>
        <boxGeometry args={[0.58, 0.02, 0.003]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.5} />
      </mesh>
      <mesh position={[1.11, 0.38, 0.004]}>
        <boxGeometry args={[0.72, 0.018, 0.003]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.5} />
      </mesh>
    </group>
  );
}

function HeroBook() {
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const scroll = typeof window === 'undefined' ? 0 : Math.min(window.scrollY / 900, 1.2);
    group.current.rotation.y = -0.45 + scroll * 0.42 + Math.sin(clock.elapsedTime * 0.32) * 0.1;
    group.current.rotation.x = -0.09 + Math.sin(clock.elapsedTime * 0.36) * 0.025;
    group.current.position.y = Math.sin(clock.elapsedTime * 0.8) * 0.035;
  });

  return (
    <group ref={group} rotation={[0, -0.45, 0]} scale={1.05}>
      <mesh position={[-0.04, 0, -0.055]} castShadow receiveShadow>
        <boxGeometry args={[1.9, 2.68, 0.12]} />
        <meshStandardMaterial color="#0d171d" roughness={0.54} metalness={0.08} />
      </mesh>
      <mesh position={[0.02, 0, 0.025]} castShadow>
        <boxGeometry args={[1.84, 2.56, 0.065]} />
        <meshStandardMaterial color="#14242c" roughness={0.48} metalness={0.12} />
      </mesh>
      <mesh position={[-0.92, 0, 0.035]} castShadow>
        <boxGeometry args={[0.18, 2.62, 0.14]} />
        <meshStandardMaterial color="#38d7c4" roughness={0.35} metalness={0.18} />
      </mesh>
      <mesh position={[0.02, 0, 0.064]} castShadow receiveShadow>
        <boxGeometry args={[1.74, 2.44, 0.022]} />
        <meshStandardMaterial color="#111d24" roughness={0.45} metalness={0.1} />
      </mesh>
      <mesh position={[0.02, 0.53, 0.078]}>
        <boxGeometry args={[1.18, 0.1, 0.012]} />
        <meshStandardMaterial color="#f5ead6" emissive="#16120c" roughness={0.4} />
      </mesh>
      <mesh position={[0.02, 0.32, 0.08]}>
        <boxGeometry args={[1.28, 0.032, 0.012]} />
        <meshStandardMaterial color="#d5c4a2" roughness={0.35} />
      </mesh>
      <mesh position={[0.02, 0.18, 0.08]}>
        <boxGeometry args={[1.18, 0.028, 0.012]} />
        <meshStandardMaterial color="#8ba79f" roughness={0.35} />
      </mesh>
      <mesh position={[0.02, -0.32, 0.08]}>
        <boxGeometry args={[0.72, 0.72, 0.012]} />
        <meshStandardMaterial color="#263238" roughness={0.38} />
      </mesh>
      <PageStack />
      <FlipPage />
    </group>
  );
}

function SceneLights() {
  const key = useRef<THREE.DirectionalLight>(null);
  const fill = useRef<THREE.PointLight>(null);

  useFrame(({ pointer }) => {
    if (key.current) {
      key.current.position.x = THREE.MathUtils.lerp(key.current.position.x, 3.4 + pointer.x * 1.1, 0.045);
      key.current.position.y = THREE.MathUtils.lerp(key.current.position.y, 4.5 + pointer.y * 0.55, 0.045);
    }
    if (fill.current) {
      fill.current.position.x = THREE.MathUtils.lerp(fill.current.position.x, pointer.x * 1.8, 0.05);
      fill.current.position.y = THREE.MathUtils.lerp(fill.current.position.y, 1.2 + pointer.y * 0.8, 0.05);
    }
  });

  return (
    <>
      <ambientLight intensity={0.28} />
      <directionalLight ref={key} position={[3.8, 4.6, 4.2]} intensity={1.72} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <directionalLight position={[-3.5, 1.6, -2.8]} intensity={0.35} color="#efe2ca" />
      <pointLight ref={fill} position={[0, 1.2, 2.6]} intensity={0.65} color="#9cb7ad" />
    </>
  );
}

export default function HeroBookScene() {
  return (
    <div className="relative mx-auto h-[clamp(390px,54vw,650px)] w-[min(100%,700px)] overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(244,239,229,0.08),transparent_30%),linear-gradient(145deg,rgba(38,34,27,0.72),rgba(5,7,10,0.92))] shadow-[0_42px_120px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(244,239,229,0.1)] max-sm:h-[430px] max-sm:rounded-[22px]" aria-label="Interactive 3D paperback preview with animated page flip">
      <Canvas
        shadows
        dpr={[1, 1.7]}
        camera={{ position: [0, 0.25, 4.1], fov: 36 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <SceneLights />
          <HeroBook />
          <ContactShadows position={[0, -1.45, 0]} opacity={0.34} scale={5.6} blur={2.6} far={3.4} />
          <OrbitControls enablePan={false} enableZoom={false} dampingFactor={0.08} enableDamping rotateSpeed={0.55} minPolarAngle={Math.PI / 2.8} maxPolarAngle={Math.PI / 1.7} />
          <AdaptiveDpr pixelated />
        </Suspense>
      </Canvas>
    </div>
  );
}
