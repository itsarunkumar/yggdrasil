import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { EVENT_TYPES } from '../services/githubApi';
import { useApp } from '../context/AppContext';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildCurve(pts) {
  return new THREE.CatmullRomCurve3(pts);
}

// Gold/emerald "sacred timeline" glow ring around trunk
function RuneRing({ y, color, radius = 1.0, segments = 64 }) {
  const ringRef = useRef();
  useFrame(({ clock }) => {
    if (!ringRef.current) return;
    ringRef.current.rotation.z = clock.getElapsedTime() * 0.4;
    ringRef.current.material.opacity = 0.35 + Math.sin(clock.getElapsedTime() * 2 + y) * 0.2;
  });
  const pts = useMemo(() => {
    const arr = [];
    for (let i = 0; i <= segments; i++) {
      const a = (i / segments) * Math.PI * 2;
      arr.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
    }
    return arr;
  }, [radius, segments]);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    return g;
  }, [pts]);
  return (
    <line ref={ringRef} position={[0, y, 0]} geometry={geo}>
      <lineBasicMaterial color={color} transparent opacity={0.55} />
    </line>
  );
}

// Glowing tube branch
function TubeBranch({ curve, radius = 0.12, color, opacity = 1, segments = 30 }) {
  const geo = useMemo(
    () => new THREE.TubeGeometry(curve, segments, radius, 10, false),
    [curve, radius, segments]
  );
  const matRef = useRef();
  useFrame(({ clock }) => {
    if (!matRef.current) return;
    matRef.current.emissiveIntensity = 0.3 + Math.sin(clock.getElapsedTime() * 1.2) * 0.12;
  });
  return (
    <mesh geometry={geo}>
      <meshPhysicalMaterial
        ref={matRef}
        color={color}
        emissive={color}
        emissiveIntensity={0.35}
        transparent
        opacity={opacity}
        roughness={0.25}
        metalness={0.55}
        envMapIntensity={1.2}
      />
    </mesh>
  );
}

// Sacred timeline particle stream flowing along curve
function ParticleStream({ curve, color, count = 18 }) {
  const pointsRef = useRef();
  const offsets = useMemo(() => Array.from({ length: count }, (_, i) => i / count), [count]);
  const initialPositions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const pt = curve.getPoint(offsets[i]);
      arr[i * 3] = pt.x; arr[i * 3 + 1] = pt.y; arr[i * 3 + 2] = pt.z;
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const t = clock.getElapsedTime() * 0.12;
    const pos = pointsRef.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      const u = (offsets[i] + t) % 1;
      const pt = curve.getPoint(u);
      pos.setXYZ(i, pt.x, pt.y, pt.z);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[initialPositions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.055} transparent opacity={0.9} sizeAttenuation />
    </points>
  );
}

// Rune-shaped leaf node (octahedron = crystal rune)
function LeafNode({ position, color, size = 0.15, event, repoName, branchType }) {
  const meshRef = useRef();
  const glowRef = useRef();
  const { setHoveredNode, hoveredNode } = useApp();
  const isHovered = hoveredNode?.id === event?.id;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 1.2 + position[0];
      meshRef.current.rotation.x = t * 0.7;
      meshRef.current.scale.setScalar(isHovered ? 1.8 : 1 + Math.sin(t * 2.5 + position[2]) * 0.1);
      meshRef.current.material.emissiveIntensity = isHovered ? 2.2 : 0.9 + Math.sin(t * 3) * 0.3;
    }
    if (glowRef.current) {
      glowRef.current.material.opacity = isHovered ? 0.4 : 0.12 + Math.sin(t * 2 + position[1]) * 0.06;
      glowRef.current.scale.setScalar(isHovered ? 2.5 : 1.8 + Math.sin(t * 1.5) * 0.3);
    }
  });

  return (
    <group position={position}>
      {/* Outer glow sphere */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[size * 1.0, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.12} depthWrite={false} />
      </mesh>

      {/* Crystal rune core */}
      <mesh
        ref={meshRef}
        onPointerOver={(e) => { e.stopPropagation(); setHoveredNode({ id: event?.id, event, repoName, branchType, color }); }}
        onPointerOut={() => setHoveredNode(null)}
      >
        <octahedronGeometry args={[size, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.9}
          roughness={0.05}
          metalness={0.8}
        />
      </mesh>

      {isHovered && (
        <Html distanceFactor={9} center style={{ pointerEvents: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(2,8,23,0.97) 0%, rgba(10,20,10,0.97) 100%)',
            border: `1px solid ${color}`,
            borderRadius: 12,
            padding: '10px 14px',
            color: '#e8f5e9',
            fontSize: 11,
            minWidth: 190,
            backdropFilter: 'blur(16px)',
            boxShadow: `0 0 24px ${color}66, 0 0 60px ${color}22`,
            fontFamily: 'Inter, sans-serif',
          }}>
            <div style={{
              color, fontWeight: 800, marginBottom: 6, fontSize: 13,
              textShadow: `0 0 12px ${color}`,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span>{EVENT_TYPES[branchType]?.emoji}</span>
              <span>{EVENT_TYPES[branchType]?.label}</span>
            </div>
            <div style={{ opacity: 0.9, marginBottom: 3, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ opacity: 0.5 }}>📁</span> {repoName}
            </div>
            <div style={{ opacity: 0.7, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ opacity: 0.5 }}>👤</span> {event?.actor || 'unknown'}
            </div>
            {event?.commitCount > 1 && (
              <div style={{ opacity: 0.6, marginTop: 3 }}>
                <span style={{ color, fontWeight: 700 }}>{event.commitCount}</span> commits
              </div>
            )}
            <div style={{ opacity: 0.45, fontSize: 10, marginTop: 5, borderTop: `1px solid ${color}33`, paddingTop: 4 }}>
              🕐 {event?.created_at ? new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

// One major branch type with repo sub-branches
function EventBranch({ branch, index, total, trunkHeight }) {
  // Spread branches around trunk with golden-ratio inspired angles
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const angle = index * goldenAngle;
  const heightFraction = (index + 1) / (total + 1);
  const heightOffset = 1.5 + heightFraction * trunkHeight * 0.92;
  const spread = 4.5 + Math.sin(index * 2.1) * 1.2;
  const dip = -0.8 + Math.cos(index * 1.7) * 0.6; // natural drooping branches

  const sx = Math.sin(angle);
  const sz = Math.cos(angle);

  const start = new THREE.Vector3(sx * 0.35, heightOffset, sz * 0.35);
  const ctrl1 = new THREE.Vector3(sx * spread * 0.45, heightOffset + dip + 1.5, sz * spread * 0.45);
  const ctrl2 = new THREE.Vector3(sx * spread * 0.78, heightOffset + dip + 0.5, sz * spread * 0.78);
  const end   = new THREE.Vector3(sx * spread, heightOffset + dip, sz * spread);

  const mainCurve = useMemo(() => buildCurve([start, ctrl1, ctrl2, end]), [index]);
  const branchRadius = Math.max(0.05, Math.min(0.25, 0.03 + branch.count / 180));

  return (
    <group>
      <TubeBranch curve={mainCurve} radius={branchRadius} color={branch.color} />
      <ParticleStream curve={mainCurve} color={branch.color} count={20} />

      {/* Sub-branches per repo */}
      {branch.repos.slice(0, 12).map((repo, ri) => {
        const fanAngle = angle + (ri - (branch.repos.length - 1) / 2) * 0.28;
        const fsx = Math.sin(fanAngle);
        const fsz = Math.cos(fanAngle);
        const subSpreadMult = 1.0 + ri * 0.08;
        const subEnd = new THREE.Vector3(
          fsx * (spread + 2.5 * subSpreadMult),
          end.y + Math.sin(ri * 0.9 + index) * 1.4 - ri * 0.15,
          fsz * (spread + 2.5 * subSpreadMult)
        );
        const subMid1 = end.clone().lerp(subEnd, 0.35).add(new THREE.Vector3(0, 0.6, 0));
        const subMid2 = end.clone().lerp(subEnd, 0.7).add(new THREE.Vector3(0, 0.2, 0));
        const subCurve = buildCurve([end, subMid1, subMid2, subEnd]);
        const subRadius = Math.max(0.018, Math.min(0.08, 0.015 + repo.count / 200));

        return (
          <group key={repo.name}>
            <TubeBranch curve={subCurve} radius={subRadius} color={branch.color} opacity={0.72} segments={20} />
            <ParticleStream curve={subCurve} color={branch.color} count={8} />

            {/* Leaf nodes along sub-branch */}
            {repo.events.slice(0, 15).map((ev, ei) => {
              const u = 0.3 + ei * (0.65 / Math.max(repo.events.length, 1));
              const leafPt = subCurve.getPoint(Math.min(u, 0.98));
              const jitter = 0.12;
              return (
                <LeafNode
                  key={ev.id}
                  position={[
                    leafPt.x + (Math.random() - 0.5) * jitter,
                    leafPt.y + (Math.random() - 0.5) * jitter,
                    leafPt.z + (Math.random() - 0.5) * jitter,
                  ]}
                  color={branch.color}
                  size={0.08 + Math.min(ev.commitCount || 1, 8) * 0.015}
                  event={ev}
                  repoName={repo.name}
                  branchType={branch.type}
                />
              );
            })}

            {/* Tertiary twigs for the biggest repos */}
            {repo.count > 4 && [0, 1].map((ti) => {
              const twigAngle = fanAngle + (ti - 0.5) * 0.5;
              const twig_sx = Math.sin(twigAngle);
              const twig_sz = Math.cos(twigAngle);
              const twigEnd = new THREE.Vector3(
                twig_sx * (spread + 4.2),
                subEnd.y + ti * 0.8 - 0.4,
                twig_sz * (spread + 4.2)
              );
              const tmid = subEnd.clone().lerp(twigEnd, 0.5).add(new THREE.Vector3(0, 0.3, 0));
              const twigCurve = buildCurve([subEnd, tmid, twigEnd]);
              return (
                <TubeBranch
                  key={ti}
                  curve={twigCurve}
                  radius={0.012}
                  color={branch.color}
                  opacity={0.5}
                  segments={12}
                />
              );
            })}
          </group>
        );
      })}
    </group>
  );
}

// Bark-textured trunk with golden Loki rune rings
function Trunk({ height }) {
  const trunkRef = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (trunkRef.current) trunkRef.current.rotation.y = Math.sin(t * 0.12) * 0.025;
  });

  // Glowing core inside trunk
  const coreGeo = useMemo(() => new THREE.CylinderGeometry(0.06, 0.06, height, 8), [height]);

  return (
    <group ref={trunkRef}>
      {/* Outer bark */}
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.12, 0.65, height, 14, 12, true]} />
        <meshStandardMaterial
          color="#1a2a0d"
          emissive="#0a1a05"
          emissiveIntensity={0.15}
          roughness={0.95}
          metalness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Inner sacred-timeline glowing core */}
      <mesh position={[0, height / 2, 0]} geometry={coreGeo}>
        <meshStandardMaterial
          color="#00ff9d"
          emissive="#00ff9d"
          emissiveIntensity={1.8}
          roughness={0.1}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Rune rings at intervals (Loki sacred timeline aesthetic) */}
      {Array.from({ length: 10 }).map((_, i) => {
        const y = 1.5 + i * (height / 10);
        const colors = ['#ffd700', '#00ff9d', '#a78bfa', '#ffd700', '#34d399'];
        return (
          <RuneRing
            key={i}
            y={y}
            color={colors[i % colors.length]}
            radius={0.85 - i * 0.045}
          />
        );
      })}

      {/* Root tendrils — thicker, more dramatic */}
      {Array.from({ length: 10 }).map((_, i) => {
        const a = (i / 10) * Math.PI * 2;
        const rootColor = i % 2 === 0 ? '#1a3a0d' : '#0d2a0d';
        const curve = buildCurve([
          new THREE.Vector3(0, 0.2, 0),
          new THREE.Vector3(Math.sin(a) * 0.6, -0.6, Math.cos(a) * 0.6),
          new THREE.Vector3(Math.sin(a) * 1.6, -1.6, Math.cos(a) * 1.6),
          new THREE.Vector3(Math.sin(a) * 2.8, -2.4, Math.cos(a) * 2.8),
        ]);
        return <TubeBranch key={i} curve={curve} radius={0.07 - i * 0.003} color={rootColor} opacity={0.9} segments={14} />;
      })}

      {/* Ground glow disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <circleGeometry args={[3.5, 48]} />
        <meshBasicMaterial color="#00ff9d" transparent opacity={0.04} depthWrite={false} />
      </mesh>
    </group>
  );
}

// ─── Scene ground fog ring ────────────────────────────────────────────────────
function GroundFog() {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.05;
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.1, 0]}>
      <ringGeometry args={[0.5, 9, 80]} />
      <meshBasicMaterial color="#002a15" transparent opacity={0.18} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────
export default function YggdrasilTree({ treeData }) {
  const treeRef = useRef();
  const trunkHeight = 16;

  useFrame(({ clock }) => {
    if (treeRef.current) treeRef.current.rotation.y = clock.getElapsedTime() * 0.012;
  });

  if (!treeData) return null;

  return (
    <>
      <GroundFog />
      <group ref={treeRef} position={[0, -3.5, 0]}>
        <Trunk height={trunkHeight} />
        {treeData.branches.map((branch, i) => (
          <EventBranch
            key={branch.type}
            branch={branch}
            index={i}
            total={treeData.branches.length}
            trunkHeight={trunkHeight}
          />
        ))}
      </group>
    </>
  );
}
