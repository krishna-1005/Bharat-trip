import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, PerspectiveCamera, Float } from '@react-three/drei';
import * as THREE from 'three';

function GlobalParticles() {
  const pointsRef = useRef();
  const count = 100;

  const [nodes] = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p.set([
        (Math.random() - 0.5) * 25, 
        (Math.random() - 0.5) * 15, 
        (Math.random() - 0.5) * 10
      ], i * 3);
    }
    return [p];
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    pointsRef.current.rotation.y = time * 0.05;
    pointsRef.current.rotation.x = Math.sin(time * 0.2) * 0.1;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={nodes} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial 
        size={0.08} 
        color="#3b82f6" 
        transparent 
        opacity={0.4} 
        sizeAttenuation 
      />
    </points>
  );
}

export default function ThreeScene() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: -1,
      pointerEvents: 'none',
      background: '#020617'
    }}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} />
        <ambientLight intensity={0.5} />
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        <GlobalParticles />
      </Canvas>
    </div>
  );
}