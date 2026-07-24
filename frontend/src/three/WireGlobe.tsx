import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const GlobeMesh: React.FC = () => {
  const globeGroupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (globeGroupRef.current) {
      globeGroupRef.current.rotation.y = state.clock.getElapsedTime() * 0.12;
      globeGroupRef.current.rotation.x = 0.2;
    }
  });

  return (
    <group ref={globeGroupRef}>
      {/* Outer Wireframe Sphere */}
      <mesh>
        <sphereGeometry args={[2, 24, 24]} />
        <meshBasicMaterial color="#38BDF8" wireframe transparent opacity={0.25} />
      </mesh>
      {/* Inner Glow Core */}
      <mesh>
        <sphereGeometry args={[1.9, 16, 16]} />
        <meshBasicMaterial color="#1E3A8A" transparent opacity={0.15} />
      </mesh>
    </group>
  );
};

export const WireGlobe: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`w-full h-full pointer-events-none ${className}`}>
      <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }}>
        <ambientLight intensity={0.8} />
        <GlobeMesh />
      </Canvas>
    </div>
  );
};
