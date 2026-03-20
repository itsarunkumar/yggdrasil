import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { EVENT_TYPES } from '../services/githubApi';

export default function HUD() {
  const { treeData, loading, repoQuery, setRepoQuery, loadData } = useApp();
  const [inputVal, setInputVal] = useState('');
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = inputVal.trim();
    setRepoQuery(q);
    loadData(q || null);
  };

  const handleReset = () => {
    setInputVal('');
    setRepoQuery('');
    loadData(null);
  };

  const totalEvents = treeData?.totalEvents ?? 0;

  return (
    <>
      {/* ── Top bar ── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 24px',
        background: 'linear-gradient(to bottom, rgba(1,8,10,0.97) 0%, rgba(1,8,10,0) 100%)',
        backdropFilter: 'blur(4px)',
        borderBottom: '1px solid rgba(0,255,157,0.08)',
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ position: 'relative' }}>
            <span style={{ fontSize: 32, filter: 'drop-shadow(0 0 10px #00ff9d)' }}>🌳</span>
          </div>
          <div>
            <div style={{
              fontFamily: 'Cinzel, serif',
              fontWeight: 900, fontSize: 20, letterSpacing: 4,
              background: 'linear-gradient(90deg, #00ff9d, #ffd700, #c084fc)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              textShadow: 'none',
            }}>YGGDRASIL</div>
            <div style={{ color: '#2a5a35', fontSize: 9, letterSpacing: 4, marginTop: 1 }}>
              GITHUB EVENT VISUALIZER
            </div>
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <input
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              placeholder="owner/repo  (blank = global timeline)"
              style={{
                background: 'rgba(0,255,157,0.04)',
                border: '1px solid rgba(0,255,157,0.2)',
                borderRadius: 8, padding: '8px 14px',
                color: '#b2ffdb', fontSize: 12, width: 270,
                outline: 'none', letterSpacing: 0.3,
              }}
            />
          </div>
          <button type="submit" style={{
            background: 'linear-gradient(135deg, #006644, #004422)',
            border: '1px solid #00ff9d44',
            borderRadius: 8, padding: '8px 20px',
            color: '#00ff9d', fontWeight: 700, fontSize: 12,
            cursor: 'pointer', letterSpacing: 1,
            boxShadow: '0 0 12px #00ff9d22',
          }}>
            {loading ? '⟳' : 'LOAD'}
          </button>
          {repoQuery && (
            <button type="button" onClick={handleReset} style={{
              background: 'rgba(251,107,53,0.1)', border: '1px solid rgba(251,107,53,0.35)',
              borderRadius: 8, padding: '8px 12px', color: '#fb6b35',
              fontSize: 11, cursor: 'pointer',
            }}>✕</button>
          )}
        </form>

        {/* Meta info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {treeData?.isMock && (
            <div style={{
              background: 'rgba(251,107,53,0.1)', border: '1px solid rgba(251,107,53,0.35)',
              borderRadius: 6, padding: '4px 10px', color: '#fb6b35', fontSize: 10, letterSpacing: 1,
            }}>⚠ DEMO DATA</div>
          )}
          {treeData?.rateLimitRemaining != null && (
            <div style={{ color: '#2a5a35', fontSize: 10, letterSpacing: 0.5 }}>
              API: <span style={{ color: '#00ff9d', fontWeight: 700 }}>{treeData.rateLimitRemaining}</span> left
            </div>
          )}
          <button
            onClick={() => setIsPanelOpen(v => !v)}
            style={{
              background: 'rgba(0,255,157,0.05)', border: '1px solid rgba(0,255,157,0.15)',
              borderRadius: 8, padding: '6px 12px', color: '#2a8a55', cursor: 'pointer', fontSize: 11,
              letterSpacing: 1,
            }}
          >{isPanelOpen ? '◀' : '▶'} LEGEND</button>
        </div>
      </div>

      {/* ── Right panel ── */}
      <AnimatePresence>
        {isPanelOpen && (
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{
              position: 'fixed', right: 18, top: '50%', transform: 'translateY(-50%)',
              zIndex: 100, width: 220,
              background: 'linear-gradient(160deg, rgba(1,12,8,0.92) 0%, rgba(1,8,12,0.92) 100%)',
              border: '1px solid rgba(0,255,157,0.12)',
              borderRadius: 16, padding: '18px 16px',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 8px 48px rgba(0,0,0,0.7), 0 0 40px rgba(0,255,157,0.04)',
            }}
          >
            {/* Panel header */}
            <div style={{
              fontFamily: 'Cinzel, serif',
              color: '#00ff9d', fontSize: 9, letterSpacing: 3,
              marginBottom: 14, opacity: 0.7,
              borderBottom: '1px solid rgba(0,255,157,0.1)', paddingBottom: 8,
            }}>THE BRANCHES</div>

            {treeData?.branches?.length > 0
              ? treeData.branches.map(b => (
                <motion.div
                  key={b.type}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: 11, padding: '4px 0',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: b.color,
                      boxShadow: `0 0 10px ${b.color}`,
                      flexShrink: 0,
                    }} />
                    <span style={{ color: '#9acca8', fontSize: 11 }}>{b.emoji} {b.label}</span>
                  </div>
                  <span style={{
                    color: b.color, fontWeight: 800, fontSize: 14,
                    textShadow: `0 0 8px ${b.color}88`,
                  }}>{b.count}</span>
                </motion.div>
              ))
              : Object.entries(EVENT_TYPES).map(([type, info]) => (
                <div key={type} style={{
                  display: 'flex', alignItems: 'center', gap: 8, marginBottom: 11, opacity: 0.3,
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: info.color, flexShrink: 0 }} />
                  <span style={{ color: '#6a9a78', fontSize: 11 }}>{info.emoji} {info.label}</span>
                </div>
              ))
            }

            {/* Footer */}
            <div style={{
              borderTop: '1px solid rgba(0,255,157,0.1)', marginTop: 10, paddingTop: 12,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#2a5a35', fontSize: 10, letterSpacing: 1 }}>TOTAL EVENTS</span>
                <span style={{
                  color: '#00ff9d', fontWeight: 900, fontSize: 20,
                  textShadow: '0 0 12px #00ff9d',
                }}>{totalEvents.toLocaleString()}</span>
              </div>
              {treeData?.fetchedAt && (
                <div style={{ color: '#1a3a20', fontSize: 9, marginTop: 6, textAlign: 'right' }}>
                  {new Date(treeData.fetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom hint ── */}
      <div style={{
        position: 'fixed', bottom: 14, left: '50%', transform: 'translateX(-50%)',
        color: '#1a4a25', fontSize: 10, letterSpacing: 2, zIndex: 100, userSelect: 'none',
        fontFamily: 'Cinzel, serif',
      }}>
        DRAG ✦ ROTATE &nbsp;·&nbsp; SCROLL ✦ ZOOM &nbsp;·&nbsp; HOVER ✦ INSPECT
      </div>
    </>
  );
}
