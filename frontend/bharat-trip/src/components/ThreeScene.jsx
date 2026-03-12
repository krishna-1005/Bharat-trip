import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

function GoldenDust() {
  const pointsRef = useRef();
  const count = 2000;
  const { mouse } = useThree();

  const [positions, step] = useMemo(() => {
    const p = new Float32Array(count * 3);
    const s = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      p.set([
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 20
      ], i * 3);
      s[i] = Math.random();
    }
    return [p, s];
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Subtle rotation of the whole field
    pointsRef.current.rotation.y = time * 0.02;
    
    // Move points toward mouse slightly
    const targetX = mouse.x * 2;
    const targetY = mouse.y * 2;
    
    pointsRef.current.position.x = THREE.MathUtils.lerp(pointsRef.current.position.x, targetX, 0.05);
    pointsRef.current.position.y = THREE.MathUtils.lerp(pointsRef.current.position.y, targetY, 0.05);

    // Update individual particle sizes or positions if needed, 
    // but for performance we'll just pulse the opacity
    pointsRef.current.material.opacity = 0.4 + Math.sin(time) * 0.2;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute 
          attach="attributes-position" 
          count={count} 
          array={positions} 
          itemSize={3} 
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.06} 
        color="#f59e0b" // Golden/Amber color
        transparent 
        opacity={0.6} 
        sizeAttenuation 
        blending={THREE.AdditiveBlending}
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
      background: '#010411' // Deep dark blue/black
    }}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 15]} />
        <ambientLight intensity={0.5} />
        
        {/* Static Golden Stars */}
        <Stars 
          radius={100} 
          depth={50} 
          count={5000} 
          factor={4} 
          saturation={0.5} 
          fade 
          speed={0.5} 
        />
        
        {/* Interactive Golden Dust */}
        <GoldenDust />
      </Canvas>
    </div>
  );
}