import { useRef, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useGameEngine, type GameEngineCallbacks } from '@/hooks/useGameEngine'
import type { GameMode, WormSkin } from '@/types/game'

interface GameCanvasProps {
  playerName: string
  playerSkin: WormSkin
  roomSlug?: string
  roomId?: string
  gameMode?: GameMode
  seed?: number
  onDeath: (score: number, length: number, coins: number, kills: number) => void
  onWin?: () => void
  onBack: () => void
}

export function GameCanvas({
  playerName,
  playerSkin,
  roomSlug,
  roomId,
  gameMode,
  seed,
  onDeath,
  onWin,
  onBack,
}: GameCanvasProps) {
  const { t } = useTranslation()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const minimapRef = useRef<HTMLCanvasElement>(null)

  const [score, setScore] = useState(0)
  const [coins, setCoins] = useState(0)
  const [boostEnergy, setBoostEnergy] = useState(100)
  const [leaderboard, setLeaderboard] = useState<{ name: string; score: number; isPlayer: boolean }[]>([])
  const [showHint, setShowHint] = useState(true)
  const [joyKnob, setJoyKnob] = useState({ x: 0, y: 0 })
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const [controlStyle] = useState(() => {
    try {
      return (typeof localStorage !== 'undefined' ? localStorage : null)?.getItem('controlStyle') || 'mouse'
    } catch { return 'mouse' }
  })
  const [minimapSize] = useState(() => {
    const sizes: Record<string, number> = { tiny: 80, small: 120, medium: 160, large: 200, xlarge: 250 }
    try {
      const saved = (typeof localStorage !== 'undefined' ? localStorage : null)?.getItem('minimapSize')
      return saved && sizes[saved] ? sizes[saved] : 160
    } catch { return 160 }
  })

  const callbacks: GameEngineCallbacks = {
    onScoreUpdate: setScore,
    onCoinsUpdate: setCoins,
    onBoostUpdate: setBoostEnergy,
    onLeaderboardUpdate: setLeaderboard,
    onDeath,
    onWin,
  }

  const { startGame, stopGame, stateRef } = useGameEngine(canvasRef, minimapRef, callbacks)

  useEffect(() => {
    startGame(playerName, playerSkin, roomSlug, roomId, gameMode, seed)

    // Background music
    const audio = new Audio('/music.mp3')
    audio.loop = true
    let savedVol = 0.35
    try {
      const saved = (typeof localStorage !== 'undefined' ? localStorage : null)?.getItem('musicVolume')
      if (saved) savedVol = parseFloat(saved)
    } catch {}
    audio.volume = savedVol
    audio.play().catch(() => {})

    // Read SFX volume
    let sfxVol = 0.6
    try {
      const s = (typeof localStorage !== 'undefined' ? localStorage : null)?.getItem('sfxVolume')
      if (s) sfxVol = parseFloat(s)
    } catch {}

    // Preload collision sound (HTMLAudio fallback)
    const chocSfx = new Audio('/choc.mp3')
    chocSfx.volume = sfxVol
    chocSfx.preload = 'auto'
    chocSfx.load()
    ;(window as any).__chocSfx = chocSfx

    // Preload coin pickup sound (HTMLAudio fallback)
    if (!(window as any).__coinSfx) {
      const coinSfx = new Audio('/coin.mp3')
      coinSfx.volume = sfxVol
      coinSfx.preload = 'auto'
      coinSfx.load()
      ;(window as any).__coinSfx = coinSfx
    }

    // Preload Web Audio buffers for instant playback
    const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext
    if (AudioCtx) {
      const ctx = (window as any).__audioCtx || new AudioCtx()
      ;(window as any).__audioCtx = ctx
      if (!(window as any).__chocBuffer) {
        fetch('/choc.mp3').then((r) => r.arrayBuffer()).then((b) => ctx.decodeAudioData(b))
          .then((d: AudioBuffer) => { (window as any).__chocBuffer = d }).catch(() => {})
      }
      if (!(window as any).__coinBuffer) {
        fetch('/coin.mp3').then((r) => r.arrayBuffer()).then((b) => ctx.decodeAudioData(b))
          .then((d: AudioBuffer) => { (window as any).__coinBuffer = d }).catch(() => {})
      }
    }

    const hintTimer = setTimeout(() => setShowHint(false), 5000)

    return () => {
      stopGame()
      audio.pause()
      audio.currentTime = 0
      clearTimeout(hintTimer)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', position: 'fixed', top: 0, left: 0, outline: 'none' }}
        tabIndex={0}
      />

      {/* Score */}
      <div style={styles.score}>Score: {score}</div>

      {/* Coins */}
      <div style={styles.coinPanel}>
        <span style={{ fontSize: 24 }}>&#x1FA99;</span>
        <span style={styles.coinText}>{coins}</span>
      </div>

      {/* Boost bar */}
      <div style={styles.boostContainer}>
        <div style={{ ...styles.boostBar, width: `${boostEnergy}%` }} />
      </div>

      {/* Minimap */}
      <canvas
        ref={minimapRef}
        width={minimapSize}
        height={minimapSize}
        style={{ ...styles.minimap, width: minimapSize, height: minimapSize }}
      />

      {/* Leaderboard */}
      <div style={styles.leaderboard}>
        <h3 style={styles.lbTitle}>&#x1F3C6; {t('topWorms')}</h3>
        {(isMobile ? leaderboard.slice(0, 3) : leaderboard).map((entry, i) => (
          <div
            key={i}
            style={{
              ...styles.lbEntry,
              ...(entry.isPlayer ? styles.lbEntryMe : {}),
            }}
          >
            <span style={styles.lbRank}>{i + 1}</span>
            <span style={styles.lbName}>{entry.name}</span>
            <span style={styles.lbScore}>{entry.score}</span>
          </div>
        ))}
      </div>

      {/* Race HUD */}
      {gameMode === 'race' && (
        <div style={styles.raceHud}>
          <div style={styles.raceTitle}>🏁 Grand Prix — 500 pts</div>
          {leaderboard.slice(0, 5).map((entry, i) => {
            const progress = Math.min((entry.score / 500) * 100, 100)
            return (
              <div key={i} style={styles.raceLane}>
                <span style={{ ...styles.raceName, ...(entry.isPlayer ? { color: '#ffd700', fontWeight: 700 } : {}) }}>
                  {entry.isPlayer ? '⭐' : ''} {entry.name}
                </span>
                <div style={styles.raceBarBg}>
                  <div style={{
                    ...styles.raceBarFill,
                    width: `${progress}%`,
                    background: entry.isPlayer
                      ? 'linear-gradient(90deg, #ff3366, #ffd700)'
                      : 'linear-gradient(90deg, #666, #999)',
                  }} />
                </div>
                <span style={styles.raceScore}>{entry.score}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Controls hint */}
      {showHint && (
        <div style={styles.controlsHint}>{t('controlsHint')}</div>
      )}

      {/* Directional buttons - only in buttons mode */}
      {controlStyle === 'buttons' && <div style={styles.dpad}>
        <div
          style={styles.dpadBtn}
          onMouseDown={() => { const s = stateRef.current; s.controlMode = 'keyboard'; s.keys.up = true }}
          onMouseUp={() => { stateRef.current.keys.up = false }}
          onMouseLeave={() => { stateRef.current.keys.up = false }}
          onTouchStart={(e) => { e.preventDefault(); const s = stateRef.current; s.controlMode = 'keyboard'; s.keys.up = true }}
          onTouchEnd={(e) => { e.preventDefault(); stateRef.current.keys.up = false }}
        >▲</div>
        <div style={{ display: 'flex', gap: 4 }}>
          <div
            style={styles.dpadBtn}
            onMouseDown={() => { const s = stateRef.current; s.controlMode = 'keyboard'; s.keys.left = true }}
            onMouseUp={() => { stateRef.current.keys.left = false }}
            onMouseLeave={() => { stateRef.current.keys.left = false }}
            onTouchStart={(e) => { e.preventDefault(); const s = stateRef.current; s.controlMode = 'keyboard'; s.keys.left = true }}
            onTouchEnd={(e) => { e.preventDefault(); stateRef.current.keys.left = false }}
          >◀</div>
          <div
            style={styles.dpadBtn}
            onMouseDown={() => { const s = stateRef.current; s.controlMode = 'keyboard'; s.keys.right = true }}
            onMouseUp={() => { stateRef.current.keys.right = false }}
            onMouseLeave={() => { stateRef.current.keys.right = false }}
            onTouchStart={(e) => { e.preventDefault(); const s = stateRef.current; s.controlMode = 'keyboard'; s.keys.right = true }}
            onTouchEnd={(e) => { e.preventDefault(); stateRef.current.keys.right = false }}
          >▶</div>
        </div>
        <div
          style={styles.dpadBtn}
          onMouseDown={() => { const s = stateRef.current; s.controlMode = 'keyboard'; s.keys.down = true }}
          onMouseUp={() => { stateRef.current.keys.down = false }}
          onMouseLeave={() => { stateRef.current.keys.down = false }}
          onTouchStart={(e) => { e.preventDefault(); const s = stateRef.current; s.controlMode = 'keyboard'; s.keys.down = true }}
          onTouchEnd={(e) => { e.preventDefault(); stateRef.current.keys.down = false }}
        >▼</div>
      </div>}

      {/* Joystick */}
      {controlStyle === 'joystick' && <div
        style={styles.joystick}
        onMouseDown={(e) => {
          const s = stateRef.current; s.controlMode = 'touch';
          const rect = e.currentTarget.getBoundingClientRect();
          const cx = rect.left + 60, cy = rect.top + 60;
          const jx = Math.max(-1, Math.min(1, (e.clientX - cx) / 50));
          const jy = Math.max(-1, Math.min(1, (e.clientY - cy) / 50));
          s.touchVector.x = jx * 100; s.touchVector.y = jy * 100;
          setJoyKnob({ x: jx, y: jy });
          const onMove = (ev: MouseEvent) => {
            const mx = Math.max(-1, Math.min(1, (ev.clientX - cx) / 50));
            const my = Math.max(-1, Math.min(1, (ev.clientY - cy) / 50));
            s.touchVector.x = mx * 100; s.touchVector.y = my * 100;
            setJoyKnob({ x: mx, y: my });
          };
          const onUp = () => { s.touchVector.x = 0; s.touchVector.y = 0; setJoyKnob({ x: 0, y: 0 }); window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
          window.addEventListener('mousemove', onMove);
          window.addEventListener('mouseup', onUp);
        }}
        onTouchStart={(e) => {
          e.preventDefault(); const s = stateRef.current; s.controlMode = 'touch';
          const rect = e.currentTarget.getBoundingClientRect();
          const cx = rect.left + 60, cy = rect.top + 60;
          const t = e.touches[0];
          const jx = Math.max(-1, Math.min(1, (t.clientX - cx) / 50));
          const jy = Math.max(-1, Math.min(1, (t.clientY - cy) / 50));
          s.touchVector.x = jx * 100; s.touchVector.y = jy * 100;
          setJoyKnob({ x: jx, y: jy });
          const onMove = (ev: TouchEvent) => {
            ev.preventDefault(); const ct = ev.touches[0];
            const mx = Math.max(-1, Math.min(1, (ct.clientX - cx) / 50));
            const my = Math.max(-1, Math.min(1, (ct.clientY - cy) / 50));
            s.touchVector.x = mx * 100; s.touchVector.y = my * 100;
            setJoyKnob({ x: mx, y: my });
          };
          const onEnd = () => { s.touchVector.x = 0; s.touchVector.y = 0; setJoyKnob({ x: 0, y: 0 }); window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onEnd); };
          window.addEventListener('touchmove', onMove, { passive: false });
          window.addEventListener('touchend', onEnd);
        }}
      >
        <div style={{ ...styles.joystickKnob, top: `calc(50% + ${joyKnob.y * 35}px)`, left: `calc(50% + ${joyKnob.x * 35}px)`, transition: joyKnob.x === 0 && joyKnob.y === 0 ? 'all 0.15s' : 'none' }} />
      </div>}

      {/* Swipe zone */}
      {controlStyle === 'swipe' && <div
        style={styles.swipeZone}
        onTouchStart={(e) => {
          e.preventDefault(); const s = stateRef.current; s.controlMode = 'touch';
          const t = e.touches[0]; const start = { x: t.clientX, y: t.clientY };
          const onMove = (ev: TouchEvent) => {
            ev.preventDefault(); const ct = ev.touches[0];
            s.touchVector.x = Math.max(-100, Math.min(100, (ct.clientX - start.x) * 2));
            s.touchVector.y = Math.max(-100, Math.min(100, (ct.clientY - start.y) * 2));
          };
          const onEnd = () => { s.touchVector.x = 0; s.touchVector.y = 0; window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onEnd); };
          window.addEventListener('touchmove', onMove, { passive: false });
          window.addEventListener('touchend', onEnd);
        }}
      >Swipe</div>}
    </>
  )
}

const styles: Record<string, React.CSSProperties> = {
  score: {
    position: 'fixed',
    top: 20, left: '50%',
    transform: 'translateX(-50%)',
    color: 'white',
    fontFamily: "'Bungee', cursive",
    fontSize: 28,
    textShadow: '0 3px 10px rgba(0,0,0,0.5), 0 0 20px rgba(255,255,255,0.2)',
    zIndex: 20,
    letterSpacing: 2,
    pointerEvents: 'none',
  },
  coinPanel: {
    position: 'fixed',
    top: 20, left: 20,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'rgba(0,0,0,0.4)',
    padding: '8px 16px',
    borderRadius: 30,
    zIndex: 20,
    backdropFilter: 'blur(6px)',
    border: '1px solid rgba(255,215,0,0.3)',
  },
  coinText: {
    color: '#ffd700',
    fontFamily: "'Bungee', cursive",
    fontSize: 20,
    textShadow: '0 2px 6px rgba(0,0,0,0.4)',
  },
  boostContainer: {
    position: 'fixed',
    bottom: 30, left: '50%',
    transform: 'translateX(-50%)',
    width: 200, height: 12,
    background: 'rgba(0,0,0,0.4)',
    borderRadius: 10,
    zIndex: 20,
    border: '2px solid rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  boostBar: {
    height: '100%',
    background: 'linear-gradient(90deg, #ff6b35, #ffd700, #7fff00)',
    borderRadius: 8,
    transition: 'width 0.1s',
  },
  minimap: {
    position: 'fixed',
    bottom: 20, right: 20,
    width: 160, height: 160,
    background: 'rgba(0,0,0,0.5)',
    border: '2px solid rgba(255,255,255,0.25)',
    borderRadius: 12,
    zIndex: 20,
    backdropFilter: 'blur(4px)',
  },
  leaderboard: {
    position: 'fixed',
    top: 20, right: 20,
    width: 200,
    background: 'rgba(0,0,0,0.45)',
    borderRadius: 14,
    padding: 14,
    zIndex: 20,
    backdropFilter: 'blur(6px)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  lbTitle: {
    color: '#ffd700',
    fontFamily: "'Bungee', cursive",
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 1,
  },
  lbEntry: {
    display: 'flex',
    justifyContent: 'space-between',
    color: 'white',
    fontSize: 13,
    padding: '3px 6px',
    borderRadius: 6,
    marginBottom: 2,
  },
  lbEntryMe: {
    background: 'rgba(255,215,0,0.2)',
    color: '#ffd700',
    fontWeight: 700,
  },
  lbRank: { width: 24, textAlign: 'center', opacity: 0.6 },
  lbName: { flex: 1, marginLeft: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  lbScore: { fontWeight: 600, marginLeft: 8 },
  controlsHint: {
    position: 'fixed',
    bottom: 60, left: '50%',
    transform: 'translateX(-50%)',
    color: 'rgba(255,255,255,0.3)',
    fontSize: 13,
    zIndex: 20,
    textAlign: 'center',
    letterSpacing: 1,
    pointerEvents: 'none',
  },
  dpad: {
    position: 'fixed',
    bottom: 20, left: 20,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    zIndex: 30,
  },
  dpadBtn: {
    width: 50, height: 50,
    borderRadius: 25,
    background: 'rgba(255,255,255,0.2)',
    border: '2px solid rgba(255,255,255,0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22,
    color: '#fff',
    cursor: 'pointer',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    touchAction: 'none',
    backdropFilter: 'blur(4px)',
  } as React.CSSProperties,
  joystick: {
    position: 'fixed',
    bottom: 20, left: 20,
    width: 120, height: 120,
    borderRadius: 60,
    background: 'rgba(255,255,255,0.12)',
    border: '2px solid rgba(255,255,255,0.3)',
    zIndex: 30,
    touchAction: 'none',
    backdropFilter: 'blur(4px)',
  },
  joystickKnob: {
    position: 'absolute',
    top: '50%', left: '50%',
    transform: 'translate(-50%,-50%)',
    width: 40, height: 40,
    borderRadius: 20,
    background: 'rgba(255,255,255,0.45)',
    border: '2px solid rgba(255,255,255,0.6)',
    pointerEvents: 'none',
  },
  swipeZone: {
    position: 'fixed',
    bottom: 20, left: 20,
    width: 110, height: 110,
    borderRadius: 20,
    background: 'rgba(255,255,255,0.08)',
    border: '2px dashed rgba(255,255,255,0.25)',
    zIndex: 30,
    touchAction: 'none',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    fontWeight: '700',
    userSelect: 'none',
  } as React.CSSProperties,
  raceHud: {
    position: 'fixed',
    top: 60, left: 10,
    background: 'rgba(0,0,0,0.6)',
    borderRadius: 14,
    padding: '12px 16px',
    zIndex: 25,
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.1)',
    minWidth: 260,
    pointerEvents: 'none',
  },
  raceTitle: {
    color: '#ffd700',
    fontFamily: "'Bungee', cursive",
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 1,
  },
  raceLane: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  raceName: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    width: 70,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  raceBarBg: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    background: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  raceBarFill: {
    height: '100%',
    borderRadius: 5,
    transition: 'width 0.3s ease',
  },
  raceScore: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    width: 35,
    textAlign: 'right',
    fontVariant: 'tabular-nums',
  },
}
