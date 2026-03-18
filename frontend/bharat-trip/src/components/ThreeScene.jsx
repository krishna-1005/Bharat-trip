import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, PerspectiveCamera, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function InteractiveShape() {
  const meshRef = useRef();
  const { viewport, mouse } = useThree();
  const [hovered, setHover] = useState(false);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Smooth follow mouse (lerping for premium feel)
    const targetX = mouse.x * (viewport.width / 4);
    const targetY = mouse.y * (viewport.height / 4);
    
    meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, 0.05);
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.05);
    
    // Rotation subtly influenced by mouse
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, -mouse.y * 0.5, 0.1);
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, mouse.x * 0.5, 0.1);
    
    // Continuous slow spin
    meshRef.current.rotation.z += 0.005;
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh 
        ref={meshRef} 
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
        scale={hovered ? 1.1 : 1}
      >
        <torusKnotGeometry args={[3, 1, 128, 32]} />
        <MeshDistortMaterial 
          speed={3} 
          distort={0.4} 
          radius={1}
          color="#3b82f6"
          emissive="#1d4ed8"
          emissiveIntensity={0.2}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
    </Float>
  );
}

function Particles({ count = 100 }) {
  const { viewport } = useThree();
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * viewport.width * 2;
      p[i * 3 + 1] = (Math.random() - 0.5) * viewport.height * 2;
      p[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return p;
  }, [count, viewport]);

  const pointsRef = useRef();
  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length / 3}
          array={points}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.1} 
        color="#ffffff" 
        transparent 
        opacity={0.3} 
        sizeAttenuation 
      />
    </points>
  );
}

export default function ThreeScene() {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      zIndex: 1,
      pointerEvents: 'auto'
    }}>
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 15], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        <pointLight position={[-10, -10, -10]} color="#3b82f6" intensity={1} />
        
        <InteractiveShape />
        <Particles count={120} />
        
        <fog attach="fog" args={['#020617', 5, 25]} />
      </Canvas>
    </div>
  );
}
