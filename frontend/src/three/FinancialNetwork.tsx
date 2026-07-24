import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const NetworkMesh: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Central Node */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#38BDF8" emissive="#2563EB" emissiveIntensity={0.8} />
      </mesh>
      {/* Outer Connected Nodes */}
      {[-2, 2].map((x, i) =>
        [-1.5, 1.5].map((y, j) => (
          <mesh key={`${i}-${j}`} position={[x, y, (i - j) * 0.5]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color="#60A5FA" emissive="#1E3A8A" emissiveIntensity={0.5} />
          </mesh>
        ))
      )}
    </group>
  );
};

export const FinancialNetwork: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`w-full h-full pointer-events-none ${className}`}>
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#38BDF8" />
        <NetworkMesh />
      </Canvas>
    </div>
  );
};
