import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const CoinMesh: React.FC<{ position: [number, number, number]; speed: number }> = ({
  position,
  speed,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.015 * speed;
      meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.8 * speed) * 0.2;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * speed) * 0.15;
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={[Math.PI / 4, 0, 0]}>
      <cylinderGeometry args={[0.8, 0.8, 0.15, 32]} />
      <meshStandardMaterial
        color="#38BDF8"
        metalness={0.9}
        roughness={0.1}
        emissive="#1E3A8A"
        emissiveIntensity={0.3}
      />
    </mesh>
  );
};

export const FloatingCoins: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`w-full h-full pointer-events-none ${className}`}>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} color="#38BDF8" />
        <pointLight position={[-5, -5, -5]} intensity={1} color="#2563EB" />
        <CoinMesh position={[-1.8, 0.5, 0]} speed={1} />
        <CoinMesh position={[1.8, -0.4, -0.5]} speed={1.2} />
      </Canvas>
    </div>
  );
};
