import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, useTexture } from '@react-three/drei';
import * as THREE from 'three';

function ImageCard({ url, position, rotation, scale = 1 }) {
  const meshRef = useRef();
  const texture = useTexture(url);
  const { mouse } = useThree();
  const [hovered, setHover] = useState(false);

  // Ensure texture is properly disposed when component unmounts
  useEffect(() => {
    return () => {
      if (texture) texture.dispose();
    };
  }, [texture]);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Subtle tilt based on mouse
    const targetRotateX = rotation[0] - mouse.y * 0.2;
    const targetRotateY = rotation[1] + mouse.x * 0.2;
    
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetRotateX, 0.05);
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotateY, 0.05);
    
    // Floating movement
    const time = state.clock.getElapsedTime();
    meshRef.current.position.y = position[1] + Math.sin(time + position[0]) * 0.2;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh 
        ref={meshRef} 
        position={position} 
        rotation={rotation}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
        scale={hovered ? scale * 1.05 : scale}
      >
        <planeGeometry args={[4, 5.5]} />
        <meshBasicMaterial map={texture} side={THREE.DoubleSide} transparent opacity={0.9} />
      </mesh>
    </Float>
  );
}

function Particles({ count = 80 }) {
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
    pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.02;
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
        size={0.08} 
        color="#ffffff" 
        transparent 
        opacity={0.2} 
        sizeAttenuation 
      />
    </points>
  );
}

export default function ThreeScene({ images = [] }) {
  // Ensure images is always an array
  const safeImages = Array.isArray(images) ? images : [];
  
  const layout = [
    { pos: [0, 0, 0], rot: [0, 0, 0], scale: 1.2 },        // Main Center
    { pos: [-4.5, 1, -2], rot: [0, 0.3, 0], scale: 0.8 },  // Left Top
    { pos: [4.5, 1, -2], rot: [0, -0.3, 0], scale: 0.8 },  // Right Top
    { pos: [-3.5, -3, -1], rot: [0, 0.2, 0], scale: 0.7 }, // Left Bottom
    { pos: [3.5, -3, -1], rot: [0, -0.2, 0], scale: 0.7 }, // Right Bottom
  ];

  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      zIndex: 1,
      pointerEvents: 'auto'
    }}>
      <Canvas 
        dpr={[1, 2]} 
        camera={{ position: [0, 0, 12], fov: 50 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance",
          preserveDrawingBuffer: false
        }}
      >
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        <React.Suspense fallback={null}>
          {safeImages.length > 0 && safeImages.slice(0, 5).map((url, i) => (
            <ImageCard 
              key={url} 
              url={url} 
              position={layout[i].pos} 
              rotation={layout[i].rot} 
              scale={layout[i].scale}
            />
          ))}
        </React.Suspense>

        <Particles count={80} />
        
        <fog attach="fog" args={['#020617', 5, 25]} />
      </Canvas>
    </div>
  );
}
