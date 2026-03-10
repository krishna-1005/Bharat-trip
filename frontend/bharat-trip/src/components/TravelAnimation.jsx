import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

function FlightTrail() {
  const planeRef = useRef();
  const particlesRef = useRef();
  const count = 100;

  // Create initial trail particles
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) p.set([0, 0, 0], i * 3);
    return p;
  }, []);

  useFrame((state) => {
    const { x, y } = state.mouse;
    
    // 1. Move the Plane toward cursor (normalized coordinates)
    const targetX = x * 12;
    const targetY = y * 7;
    
    planeRef.current.position.x = THREE.MathUtils.lerp(planeRef.current.position.x, targetX, 0.1);
    planeRef.current.position.y = THREE.MathUtils.lerp(planeRef.current.position.y, targetY, 0.1);

    // 2. Tilt the plane based on movement direction
    planeRef.current.rotation.z = THREE.MathUtils.lerp(planeRef.current.rotation.z, -x * 0.8, 0.1);
    planeRef.current.rotation.x = THREE.MathUtils.lerp(planeRef.current.rotation.x, -y * 0.5, 0.1);

    // 3. Update the trail logic
    const positions = particlesRef.current.geometry.attributes.position.array;
    for (let i = count - 1; i > 0; i--) {
      positions[i * 3] = positions[(i - 1) * 3];
      positions[i * 3 + 1] = positions[(i - 1) * 3 + 1];
      positions[i * 3 + 2] = positions[(i - 1) * 3 + 2] - 0.1; // Move trail backward
    }
    positions[0] = planeRef.current.position.x;
    positions[1] = planeRef.current.position.y;
    positions[2] = planeRef.current.position.z;
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <group>
      {/* The "Plane" - A simple sleek 3D Triangle */}
      <mesh ref={planeRef}>
        <coneGeometry args={[0.2, 0.8, 3]} />
        <meshStandardMaterial color="#3b82f6" emissive="#1d4ed8" emissiveIntensity={2} />
      </mesh>

      {/* The Glowing Flight Trail */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={points}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.1} color="#60a5fa" transparent opacity={0.6} blending={THREE.AdditiveBlending} />
      </points>
    </group>
  );
}

export default function TravelAnimation() {
  return (
    <Canvas>
      <PerspectiveCamera makeDefault position={[0, 0, 10]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <FlightTrail />
    </Canvas>
  );
}