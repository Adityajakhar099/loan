import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const AuroraMesh: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  const uniforms = useRef({
    uTime: { value: 0 },
    uColorA: { value: new THREE.Color('#2563EB') },
    uColorB: { value: new THREE.Color('#38BDF8') },
  });

  useFrame((state) => {
    if (meshRef.current) {
      uniforms.current.uTime.value = state.clock.getElapsedTime() * 0.5;
    }
  });

  const vertexShader = `
    varying vec2 vUv;
    varying float vElevation;
    uniform float uTime;
    
    void main() {
      vUv = uv;
      vec3 pos = position;
      float wave1 = sin(pos.x * 2.0 + uTime) * 0.4;
      float wave2 = cos(pos.y * 1.5 + uTime * 0.8) * 0.4;
      pos.z += wave1 + wave2;
      vElevation = pos.z;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

  const fragmentShader = `
    varying vec2 vUv;
    varying float vElevation;
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    
    void main() {
      float mixFactor = (vElevation + 0.8) * 0.5;
      vec3 color = mix(uColorA, uColorB, clamp(mixFactor, 0.0, 1.0));
      float alpha = smoothstep(0.0, 0.7, vUv.y) * (1.0 - smoothstep(0.7, 1.0, vUv.y)) * 0.35;
      gl_FragColor = vec4(color, alpha);
    }
  `;

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 3, 0, 0]} position={[0, -1, 0]}>
      <planeGeometry args={[12, 8, 64, 64]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms.current}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

export const AuroraScene: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`w-full h-full pointer-events-none ${className}`}>
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <AuroraMesh />
      </Canvas>
    </div>
  );
};
