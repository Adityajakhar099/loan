import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const RaysMesh: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 2, -2]} rotation={[Math.PI / 4, 0, 0]}>
      <cylinderGeometry args={[0.2, 5, 8, 32, 1, true]} />
      <meshBasicMaterial
        color="#38BDF8"
        transparent
        opacity={0.08}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
};

export const LightRays: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`w-full h-full pointer-events-none ${className}`}>
      <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
        <RaysMesh />
      </Canvas>
    </div>
  );
};
