import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import { Suspense, useEffect } from 'react';
import YggdrasilTree from './components/YggdrasilTree';
import AmbientParticles from './components/AmbientParticles';
import HUD from './components/HUD';
import LoadingScreen from './components/LoadingScreen';
import { AppProvider, useApp } from './context/AppContext';
import './index.css';

function Scene() {
  const { treeData } = useApp();
  return (
    <Canvas
      camera={{ position: [0, 5, 22], fov: 52 }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      shadows
    >
      {/* Loki deep-forest background */}
      <color attach="background" args={['#01080a']} />
      <fog attach="fog" args={['#011208', 28, 70]} />

      {/* ── Lighting ── */}
      {/* Soft base */}
      <ambientLight intensity={0.18} color="#0a2a10" />

      {/* Sacred timeline shaft from below */}
      <pointLight position={[0, -2, 0]} intensity={3.5} color="#00ff9d" distance={12} decay={2} />

      {/* Crown overhead glow */}
      <pointLight position={[0, 18, 0]} intensity={2.8} color="#ffd700" distance={22} decay={1.6} />

      {/* Side fills — TVA amber left, violet right */}
      <pointLight position={[-10, 8, 5]}  intensity={1.8} color="#fb6b35" distance={20} decay={2} />
      <pointLight position={[10, 8, -5]}  intensity={1.8} color="#c084fc" distance={20} decay={2} />

      {/* Behind fill */}
      <pointLight position={[0, 6, -14]} intensity={1.2} color="#34d399" distance={18} decay={2} />

      {/* Rim light (cold teal) */}
      <pointLight position={[6, 12, 10]}  intensity={0.9} color="#00d4ff" distance={16} decay={2} />

      {/* Stars */}
      <Stars radius={90} depth={70} count={5000} factor={4.5} saturation={0.9} fade speed={0.35} />

      <Suspense fallback={null}>
        <AmbientParticles count={320} />
        <YggdrasilTree treeData={treeData} />
      </Suspense>

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={5}
        maxDistance={45}
        autoRotate
        autoRotateSpeed={0.25}
        maxPolarAngle={Math.PI * 0.78}
        minPolarAngle={Math.PI * 0.05}
      />
    </Canvas>
  );
}

function AppInner() {
  const { loadData, loading } = useApp();
  useEffect(() => { loadData(null); }, []);

  return (
    <div className="app-root">
      <LoadingScreen visible={loading} />
      <HUD />
      <Scene />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
