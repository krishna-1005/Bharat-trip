import React, { useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Html, useProgress, Stars, PerspectiveCamera, OrbitControls, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// --- LOW-POLY TAJ MAHAL COMPLEX ---

function Tree({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]}>
        <coneGeometry args={[0.3, 1.2, 6]} />
        <meshStandardMaterial color="#2d5a5a" flatShading />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.4]} />
        <meshStandardMaterial color="#3d2b1f" />
      </mesh>
    </group>
  );
}

function Gateway({ position, rotation }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Main Arch Block */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[3, 3, 1.5]} />
        <meshStandardMaterial color="#8b5a2b" flatShading />
      </mesh>
      {/* Arch Cutout (Visual Detail) */}
      <mesh position={[0, 1, 0.76]}>
        <planeGeometry args={[1.5, 2]} />
        <meshStandardMaterial color="#3d2b1f" />
      </mesh>
      {/* Top Detail */}
      <mesh position={[0, 3.2, 0]}>
        <boxGeometry args={[2, 0.4, 1.2]} />
        <meshStandardMaterial color="#a0522d" />
      </mesh>
    </group>
  );
}

function TajMahal({ position, scale }) {
  return (
    <group position={position} scale={scale}>
      {/* Main Large Platform */}
      <mesh position={[0, 0.25, 0]} receiveShadow>
        <boxGeometry args={[12, 0.5, 12]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>

      {/* Main Building Structure */}
      <group position={[0, 0.5, 0]}>
        {/* Central Block */}
        <mesh position={[0, 2, 0]} castShadow>
          <boxGeometry args={[6, 4, 6]} />
          <meshStandardMaterial color="#ffffff" flatShading />
        </mesh>
        
        {/* Arch Details (Decorative) */}
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} rotation={[0, (i * Math.PI) / 2, 0]} position={[0, 1.8, 3.01]}>
            <planeGeometry args={[3, 3]} />
            <meshStandardMaterial color="#e2e8f0" transparent opacity={0.5} />
          </mesh>
        ))}

        {/* Central Dome */}
        <mesh position={[0, 5.5, 0]} castShadow>
          <sphereGeometry args={[2.2, 16, 16, 0, Math.PI * 2, 0, Math.PI / 1.3]} />
          <meshStandardMaterial color="#ffffff" flatShading />
        </mesh>
        {/* Spire */}
        <mesh position={[0, 7.5, 0]}>
          <cylinderGeometry args={[0.05, 0.1, 1.5]} />
          <meshStandardMaterial color="#fbbf24" metalness={1} />
        </mesh>

        {/* 4 Corner Small Domes */}
        {[[-2.2, 4, -2.2], [2.2, 4, -2.2], [-2.2, 4, 2.2], [2.2, 4, 2.2]].map((p, i) => (
          <mesh key={i} position={p} castShadow>
            <sphereGeometry args={[0.8, 12, 12, 0, Math.PI * 2, 0, Math.PI / 1.5]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        ))}
      </group>

      {/* 4 Minarets (Towers) */}
      {[[-5, 0.5, -5], [5, 0.5, -5], [-5, 0.5, 5], [5, 0.5, 5]].map((p, i) => (
        <group key={i} position={p}>
          <mesh position={[0, 2.5, 0]} castShadow>
            <cylinderGeometry args={[0.4, 0.5, 5, 8]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0, 5.2, 0]}>
            <sphereGeometry args={[0.6, 8, 8]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}

      {/* Garden Paths & Pools */}
      <group position={[0, 0.1, 0]}>
        {/* Lateral Paths */}
        <mesh position={[10, 0, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[8, 0.2, 4]} />
          <meshStandardMaterial color="#4a6b6b" />
        </mesh>
        <mesh position={[-10, 0, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[8, 0.2, 4]} />
          <meshStandardMaterial color="#4a6b6b" />
        </mesh>

        {/* Reflective Pools */}
        <mesh position={[10, 0.1, 0]}>
          <boxGeometry args={[6, 0.05, 1.5]} />
          <meshStandardMaterial color="#3b82f6" transparent opacity={0.6} metalness={1} roughness={0} />
        </mesh>
        <mesh position={[-10, 0.1, 0]}>
          <boxGeometry args={[6, 0.05, 1.5]} />
          <meshStandardMaterial color="#3b82f6" transparent opacity={0.6} metalness={1} roughness={0} />
        </mesh>

        {/* Trees along paths */}
        {[...Array(6)].map((_, i) => (
          <group key={i}>
            <Tree position={[7 + i * 1.2, 0.1, 1.2]} />
            <Tree position={[7 + i * 1.2, 0.1, -1.2]} />
            <Tree position={[-7 - i * 1.2, 0.1, 1.2]} />
            <Tree position={[-7 - i * 1.2, 0.1, -1.2]} />
          </group>
        ))}

        {/* Gateways */}
        <Gateway position={[14, 0.1, 0]} rotation={[0, -Math.PI / 2, 0]} />
        <Gateway position={[-14, 0.1, 0]} rotation={[0, Math.PI / 2, 0]} />
      </group>
    </group>
  );
}

function Moon() {
  return (
    <group position={[12, 12, -10]}>
      {/* Stylized Crescent */}
      <mesh>
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial color="#fef08a" emissive="#f59e0b" emissiveIntensity={1.5} />
      </mesh>
      {/* Cutout to make it crescent */}
      <mesh position={[0.8, 0.5, 0.5]}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial color="#020617" />
      </mesh>
      <pointLight color="#fde047" intensity={2} distance={100} />
    </group>
  );
}

// --- CORE SYSTEM ---

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div style={{ color: '#fff', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>{Math.round(progress)}%</div>
      </div>
    </Html>
  );
}

export default function ThreeScene({ mode = "vision" }) {
  const sceneRef = useRef();

  return (
    <div style={{ width: '100%', height: '100%', background: '#020617' }}>
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[25, 25, 25]} fov={35} />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          maxPolarAngle={Math.PI / 2.2} 
          minPolarAngle={Math.PI / 4}
        />
        
        <Suspense fallback={<Loader />}>
          <ambientLight intensity={0.3} />
          <directionalLight 
            position={[10, 20, 10]} 
            intensity={1.5} 
            castShadow 
            shadow-mapSize={[1024, 1024]}
          />
          <pointLight position={[-10, 5, -10]} intensity={0.5} color="#3b82f6" />

          <group ref={sceneRef}>
            <TajMahal position={[0, -2, 0]} scale={1} />
            <Moon />
            <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
          </group>

          <fog attach="fog" args={['#020617', 20, 70]} />
        </Suspense>
      </Canvas>
    </div>
  );
}
