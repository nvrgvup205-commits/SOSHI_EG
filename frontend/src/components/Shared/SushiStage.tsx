import { ContactShadows, Float } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useMemo, useRef, type ReactNode } from 'react';
import type { Group } from 'three';
import { useTheme } from '../../hooks/useTheme';

function Nigiri() {
  const group = useRef<Group>(null);
  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.18;
  });

  return (
    <group ref={group} position={[0, 0.15, 0]}>
      <mesh position={[0, -0.02, 0]} scale={[1.35, 0.52, 0.82]} castShadow>
        <sphereGeometry args={[0.42, 40, 28]} />
        <meshStandardMaterial color="#f4efe4" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.28, 0]} rotation={[0.08, 0.12, 0.04]} scale={[1.28, 0.22, 0.72]} castShadow>
        <boxGeometry args={[0.85, 0.28, 0.7]} />
        <meshStandardMaterial color="#e56a2a" roughness={0.38} metalness={0.08} />
      </mesh>
      <mesh position={[0.12, 0.34, 0.02]} rotation={[0.2, 0.4, 0.1]} scale={[0.9, 0.06, 0.28]}>
        <boxGeometry args={[0.7, 0.08, 0.5]} />
        <meshStandardMaterial color="#f3e6d2" roughness={0.5} transparent opacity={0.55} />
      </mesh>
      <mesh position={[0, 0.08, 0]} rotation={[0.08, 0, 0]} castShadow>
        <cylinderGeometry args={[0.34, 0.34, 0.12, 32]} />
        <meshStandardMaterial color="#16362d" roughness={0.7} />
      </mesh>
      <mesh position={[0.08, 0.44, 0.04]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color="#3f8f4a" roughness={0.5} />
      </mesh>
    </group>
  );
}

function Chopsticks() {
  return (
    <group position={[-0.15, 0.05, -0.35]} rotation={[0.5, 0.8, -0.4]}>
      <mesh position={[0.08, 0.4, 0]} rotation={[0.1, 0, 0.08]} castShadow>
        <cylinderGeometry args={[0.035, 0.02, 2.1, 12]} />
        <meshStandardMaterial color="#c9a06a" roughness={0.45} />
      </mesh>
      <mesh position={[-0.08, 0.38, 0.08]} rotation={[-0.08, 0, -0.06]} castShadow>
        <cylinderGeometry args={[0.035, 0.02, 2.1, 12]} />
        <meshStandardMaterial color="#b8894e" roughness={0.45} />
      </mesh>
    </group>
  );
}

function Halo({ dark }: { dark: boolean }) {
  return (
    <mesh position={[0, 0.05, -0.6]} rotation={[0, 0, 0]}>
      <circleGeometry args={[1.35, 64]} />
      <meshStandardMaterial
        color={dark ? '#1aa3b8' : '#2ec4d4'}
        roughness={0.35}
        metalness={0.2}
        transparent
        opacity={0.85}
      />
    </mesh>
  );
}

function Stage({ dark }: { dark: boolean }) {
  return (
    <>
      <color attach="background" args={[dark ? '#050505' : '#f4efe6']} />
      <ambientLight intensity={dark ? 0.35 : 0.7} />
      <spotLight position={[4, 7, 5]} intensity={dark ? 2.4 : 1.6} color="#ffd9a8" angle={0.45} penumbra={0.6} castShadow />
      <spotLight position={[-5, 3, -2]} intensity={1.4} color="#4ec4d4" />
      <directionalLight position={[0, 6, 2]} intensity={0.45} />
      <Halo dark={dark} />
      <Float speed={1.6} rotationIntensity={0.25} floatIntensity={0.55}>
        <Chopsticks />
        <Nigiri />
      </Float>
      <ContactShadows position={[0, -0.85, 0]} opacity={dark ? 0.45 : 0.22} scale={6} blur={2.4} far={2} />
    </>
  );
}

function WebGLCanvas({ className, children }: { className?: string; children: ReactNode }) {
  const ok = useMemo(() => {
    if (typeof document === 'undefined') return false;
    try {
      const canvas = document.createElement('canvas');
      return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
    } catch {
      return false;
    }
  }, []);

  if (!ok) return null;

  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 1.1, 3.4], fov: 38 }}
        dpr={[1, 1.7]}
        gl={{ antialias: true, alpha: true }}
        shadows
      >
        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
    </div>
  );
}

export default function SushiStage({ className = 'absolute inset-0' }: { className?: string }) {
  const { theme } = useTheme();
  return (
    <WebGLCanvas className={className}>
      <Stage dark={theme === 'dark'} />
    </WebGLCanvas>
  );
}
