import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function generateParticles(count) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 40;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
  }
  return positions;
}

function ParticleField() {
  const points = useRef();
  const count = 2000;

  // Generate random positions once
  const particles = useMemo(() => generateParticles(count), []);

  useFrame((state) => {
    const { x, y } = state.mouse;
    // Rotation responds to cursor movement smoothly
    points.current.rotation.y = THREE.MathUtils.lerp(points.current.rotation.y, x * 0.3, 0.05);
    points.current.rotation.x = THREE.MathUtils.lerp(points.current.rotation.x, -y * 0.3, 0.05);
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.07} color="#3b82f6" transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

export default function InteractiveAnimation() {
  return (
    <Canvas camera={{ position: [0, 0, 15] }}>
      <color attach="background" args={['#020617']} />
      <ParticleField />
    </Canvas>
  );
}