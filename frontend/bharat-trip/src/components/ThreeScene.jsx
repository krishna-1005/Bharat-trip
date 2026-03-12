import React, { useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function PremiumMesh() {
  const meshRef = useRef();
  const { mouse } = useThree();

  // Create a grid for the wave effect
  // Variables were unused and thus removed


  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const geo = meshRef.current.geometry;
    const pos = geo.attributes.position.array;

    for (let i = 0; i < 60; i++) {
      for (let j = 0; j < 60; j++) {
        const idx = (i * 60 + j) * 3;
        const x = pos[idx];
        const z = pos[idx + 2];
        
        // Complex wave math for "liquid" feel
        const dist = Math.sqrt(x * x + z * z);
        const mouseDist = Math.sqrt(Math.pow(x - mouse.x * 20, 2) + Math.pow(z + mouse.y * 20, 2));
        
        pos[idx + 1] = 
          Math.sin(dist * 0.2 - time * 0.5) * 1.5 + 
          Math.cos(x * 0.3 + time) * 0.5 +
          (mouseDist < 10 ? (10 - mouseDist) * 0.4 : 0); // Interaction
      }
    }
    geo.attributes.position.needsUpdate = true;
    
    meshRef.current.rotation.y = time * 0.05;
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 3, 0, 0]} position={[0, -5, -10]}>
      <planeGeometry args={[80, 80, 59, 59]} />
      <meshStandardMaterial 
        color="#0f172a" 
        wireframe 
        transparent 
        opacity={0.3} 
        emissive="#3b82f6"
        emissiveIntensity={0.5}
      />
    </mesh>
  );
}

function FloatingOrbs() {
  return (
    <group>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <mesh position={[-15, 5, -10]}>
          <sphereGeometry args={[2, 32, 32]} />
          <MeshDistortMaterial color="#3b82f6" speed={2} distort={0.4} radius={1} />
        </mesh>
      </Float>
      <Float speed={3} rotationIntensity={1} floatIntensity={2}>
        <mesh position={[18, -2, -15]}>
          
          <sphereGeometry args={[3, 32, 32]} />
          <MeshDistortMaterial color="#1d4ed8" speed={1.5} distort={0.3} radius={1} />
        </mesh>
      </Float>
    </group>
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
      background: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)'
    }}>
      <Canvas shadowMap>
        <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={50} />
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#3b82f6" />
        <spotLight position={[-20, 20, 10]} angle={0.15} penumbra={1} intensity={1} color="#60a5fa" />
        
        <PremiumMesh />
        <FloatingOrbs />
        
        <fog attach="fog" args={['#020617', 10, 50]} />
      </Canvas>
    </div>
  );
}