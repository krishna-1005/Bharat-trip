import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, PerspectiveCamera, Float } from '@react-three/drei';
import * as THREE from 'three';

function GlobalParticles() {
  const pointsRef = useRef();
  const count = 1500; // Increased count for better coverage

  const [nodes] = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p.set([
        (Math.random() - 0.5) * 50, 
        (Math.random() - 0.5) * 30, 
        (Math.random() - 0.5) * 20
      ], i * 3);
    }
    return [p];
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const scrollY = window.scrollY || 0;
    
    pointsRef.current.rotation.y = time * 0.03 + scrollY * 0.0005;
    pointsRef.current.rotation.x = Math.sin(time * 0.1) * 0.1 + scrollY * 0.0002;
    
    // Slight drifting effect
    pointsRef.current.position.y = -scrollY * 0.005;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={nodes} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial 
        size={0.06} 
        color="#3b82f6" 
        transparent 
        opacity={0.3} 
        sizeAttenuation 
      />
    </points>
  );
}

export default function ThreeScene() {
  return (
    <div className="three-background-canvas">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 15]} />
        <ambientLight intensity={0.5} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1.5} />
        <GlobalParticles />
      </Canvas>
    </div>
  );
}