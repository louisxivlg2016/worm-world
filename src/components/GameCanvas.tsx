import { useRef, useState, useCallback, useEffect } from 'react'
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
  onDeath: (score: number, length: number, coins: number) => void
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

  const callbacks: GameEngineCallbacks = {
    onScoreUpdate: setScore,
    onCoinsUpdate: setCoins,
    onBoostUpdate: setBoostEnergy,
    onLeaderboardUpdate: setLeaderboard,
    onDeath,
  }

  const { startGame, stopGame } = useGameEngine(canvasRef, minimapRef, callbacks)

  useEffect(() => {
    startGame(playerName, playerSkin, roomSlug, roomId, gameMode, seed)

    const hintTimer = setTimeout(() => setShowHint(false), 5000)

    return () => {
      stopGame()
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
        width={160}
        height={160}
        style={styles.minimap}
      />

      {/* Leaderboard */}
      <div style={styles.leaderboard}>
        <h3 style={styles.lbTitle}>&#x1F3C6; {t('topWorms')}</h3>
        {leaderboard.map((entry, i) => (
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

      {/* Controls hint */}
      {showHint && (
        <div style={styles.controlsHint}>{t('controlsHint')}</div>
      )}
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
    bottom: 30, left: 20,
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
}
