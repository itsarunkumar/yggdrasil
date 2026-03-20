import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const LOKI_PALETTE = [
  [0, 1, 0.62],      // #00ff9d emerald
  [1, 0.84, 0],      // #ffd700 gold
  [0.78, 0.55, 0.99],// #c8a8fc violet
  [0.2, 0.83, 0.6],  // #34d499 teal
  [0.98, 0.42, 0.21],// #fb6b35 TVA orange
  [0.95, 0.75, 0.1], // #f2bf1a amber
];

export default function AmbientParticles({ count = 300 }) {
  const pointsRef = useRef();

  const { positions, colors, speeds } = (() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = 5 + Math.random() * 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 2;
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = Math.random() * 20 - 5;
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      const c = LOKI_PALETTE[Math.floor(Math.random() * LOKI_PALETTE.length)];
      col[i * 3] = c[0]; col[i * 3 + 1] = c[1]; col[i * 3 + 2] = c[2];
      spd[i] = 0.003 + Math.random() * 0.006;
    }
    return { positions: pos, colors: col, speeds: spd };
  })();

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const t = clock.getElapsedTime();
    const pos = pointsRef.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      pos.array[i * 3 + 1] += speeds[i] + Math.sin(t * 0.6 + i * 0.3) * 0.002;
      if (pos.array[i * 3 + 1] > 16) pos.array[i * 3 + 1] = -5;
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.065} vertexColors transparent opacity={0.75} sizeAttenuation />
    </points>
  );
}
