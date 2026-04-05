import React, { useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, useTexture, Html, useProgress } from '@react-three/drei';
import * as THREE from 'three';

// Custom Loader with dark-mode theme
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div style={{
        color: '#f8fafc',
        background: 'rgba(2, 6, 23, 0.9)',
        padding: '20px 40px',
        borderRadius: '12px',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        textAlign: 'center',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        backdropFilter: 'blur(10px)',
        minWidth: '200px'
      }}>
        <div style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '10px' }}>
          Loading <span style={{ color: '#3b82f6' }}>Experience</span>
        </div>
        <div style={{
          width: '100%',
          height: '4px',
          background: '#1e293b',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #3b82f6, #10b981)',
            transition: 'width 0.3s ease'
          }} />
        </div>
        <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#94a3b8' }}>
          {Math.round(progress)}%
        </div>
      </div>
    </Html>
  );
}

function ImageCard({ url, position, rotation, scale = 1 }) {
  const meshRef = useRef();
  const texture = useTexture(url);
  const { mouse } = useThree();
  const [hovered, setHover] = useState(false);

  useFrame(() => {
    if (!meshRef.current) return;
    
    const targetRotateX = rotation[0] - mouse.y * 0.2;
    const targetRotateY = rotation[1] + mouse.x * 0.2;
    
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetRotateX, 0.05);
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotateY, 0.05);
    
    const time = performance.now() / 1000;
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
        castShadow
        receiveShadow
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
  useFrame(() => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = (performance.now() / 1000) * 0.02;
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
  const safeImages = Array.isArray(images) ? images : [];
  
  // Performance Monitor / Device Detection
  const isMobile = useMemo(() => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
           || (window.innerWidth <= 768);
  }, []);

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
        shadows={!isMobile} // Disable shadows entirely on mobile if needed, or reduce resolution
        dpr={isMobile ? 1 : [1, 2]}
        camera={{ position: [0, 0, 12], fov: 50 }}
        gl={{ 
          antialias: !isMobile, // Disable antialiasing on mobile to maintain 60fps
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true
        }}
        onCreated={({ gl }) => {
          if (!isMobile) {
            gl.shadowMap.enabled = true;
            gl.shadowMap.type = THREE.PCFSoftShadowMap;
          }
        }}
      >
        <Suspense fallback={<Loader />}>
          <ambientLight intensity={0.7} />
          <directionalLight 
            position={[10, 10, 10]} 
            intensity={1.5} 
            castShadow={!isMobile}
            shadow-mapSize-width={isMobile ? 256 : 1024} // Low-res shadows for mobile
            shadow-mapSize-height={isMobile ? 256 : 1024}
          />
          
          {safeImages.length > 0 && safeImages.slice(0, 5).map((url, i) => (
            <ImageCard 
              key={url} 
              url={url} 
              position={layout[i].pos} 
              rotation={layout[i].rot} 
              scale={layout[i].scale}
            />
          ))}

          <Particles count={isMobile ? 40 : 80} /> // Reduce particle count on mobile
          <fog attach="fog" args={['#020617', 5, 25]} />
        </Suspense>
      </Canvas>
    </div>
  );
}

