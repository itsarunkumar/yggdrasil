import { motion, AnimatePresence } from 'motion/react';

export default function LoadingScreen({ visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.0, ease: 'easeInOut' }}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'radial-gradient(ellipse at 50% 60%, #021a0a 0%, #010a08 50%, #01080a 100%)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 28, overflow: 'hidden',
          }}
        >
          {/* Scanlines */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,157,0.015) 2px, rgba(0,255,157,0.015) 4px)',
          }} />

          {/* Outer rotating ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            style={{
              position: 'absolute',
              width: 260, height: 260,
              border: '1px solid rgba(0,255,157,0.15)',
              borderRadius: '50%',
              borderTopColor: '#00ff9d',
              boxShadow: '0 0 30px rgba(0,255,157,0.1)',
            }}
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            style={{
              position: 'absolute',
              width: 200, height: 200,
              border: '1px solid rgba(255,215,0,0.12)',
              borderRadius: '50%',
              borderRightColor: '#ffd700',
              boxShadow: '0 0 20px rgba(255,215,0,0.08)',
            }}
          />

          {/* Tree emoji */}
          <motion.div
            animate={{
              filter: [
                'drop-shadow(0 0 8px #00ff9d)',
                'drop-shadow(0 0 24px #ffd700)',
                'drop-shadow(0 0 8px #00ff9d)',
              ],
              scale: [1, 1.06, 1],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ fontSize: 64, zIndex: 1 }}
          >
            🌳
          </motion.div>

          {/* Title */}
          <div style={{ textAlign: 'center', zIndex: 1 }}>
            <div style={{
              fontFamily: 'Cinzel, serif',
              fontWeight: 900, fontSize: 34, letterSpacing: 8,
              background: 'linear-gradient(90deg, #00ff9d 0%, #ffd700 50%, #c084fc 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              YGGDRASIL
            </div>
            <div style={{ color: '#1a5a25', fontSize: 10, letterSpacing: 5, marginTop: 6 }}>
              GITHUB EVENT VISUALIZER
            </div>
          </div>

          {/* Pulsing rune dots */}
          <div style={{ display: 'flex', gap: 10, zIndex: 1 }}>
            {['#00ff9d', '#ffd700', '#c084fc', '#fb6b35', '#34d399'].map((col, i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.3, 0.8] }}
                transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.18 }}
                style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: col, boxShadow: `0 0 10px ${col}`,
                }}
              />
            ))}
          </div>

          <motion.div
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ color: '#1a5a25', fontSize: 10, letterSpacing: 4, fontFamily: 'Cinzel, serif', zIndex: 1 }}
          >
            READING THE BRANCHES...
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
