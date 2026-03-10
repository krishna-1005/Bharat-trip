import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, PerspectiveCamera, Float } from '@react-three/drei';
import * as THREE from 'three';

function TravelConstellation() {
  const lineRef = useRef();
  const pointsRef = useRef();
  const count = 40; // Number of "City Nodes"

  // 1. Create static City Nodes across the sky
  const [nodes, originalPos] = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p.set([(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 5], i * 3);
    }
    return [p, new Float32Array(p)];
  }, []);

  useFrame((state) => {
    const { x, y } = state.mouse;
    const time = state.clock.getElapsedTime();

    // 2. Compass Interaction: Nodes "pulse" when cursor is near
    const positions = pointsRef.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const iy = i * 3 + 1;
      
      const targetX = x * 10;
      const targetY = y * 6;

      const dist = Math.sqrt(Math.pow(targetX - originalPos[ix], 2) + Math.pow(targetY - originalPos[iy], 2));

      if (dist < 3) {
        // Magnetic pull toward cursor
        positions[ix] = THREE.MathUtils.lerp(positions[ix], targetX, 0.1);
        positions[iy] = THREE.MathUtils.lerp(positions[iy], targetY, 0.1);
      } else {
        // Smoothly return to original city location
        positions[ix] = THREE.MathUtils.lerp(positions[ix], originalPos[ix], 0.05);
        positions[iy] = THREE.MathUtils.lerp(positions[iy], originalPos[iy], 0.05);
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    
    // Rotate the "World" slowly
    pointsRef.current.rotation.z = time * 0.02;
  });

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={count} array={nodes} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.15} color="#fbbf24" transparent opacity={0.8} />
      </points>
    </group>
  );
}

export default function ThreeScene() {
  return (
    <div className="three-scene-container">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} />
        <color attach="background" args={['#020617']} />
        <ambientLight intensity={0.5} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <TravelConstellation />
      </Canvas>
    </div>
  );
}