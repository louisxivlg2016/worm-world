import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { WelcomeScreen } from '@/components/WelcomeScreen'
import { LobbyScreen } from '@/components/LobbyScreen'
import { ShopScreen } from '@/components/ShopScreen'
import { GameCanvas } from '@/components/GameCanvas'
import { SKINS, type WormSkin, type GameMode, type GameScreen } from '@/types/game'

interface DeathInfo {
  score: number
  length: number
  coins: number
}

export function AppInner() {
  const { t } = useTranslation()
  const [screen, setScreen] = useState<GameScreen>('menu')
  const [playerName, setPlayerName] = useState('')
  const [playerSkin, setPlayerSkin] = useState<WormSkin>(SKINS[0])
  const [customSkin, setCustomSkin] = useState<WormSkin | null>(null)
  const [roomSlug, setRoomSlug] = useState<string | undefined>()
  const [roomId, setRoomId] = useState<string | undefined>()
  const [gameMode, setGameMode] = useState<GameMode>('ffa')
  const [seed, setSeed] = useState<number | undefined>()
  const [deathInfo, setDeathInfo] = useState<DeathInfo | null>(null)

  const handlePlay = useCallback((name: string, skin: WormSkin) => {
    setPlayerName(name)
    setPlayerSkin(skin)
    setRoomSlug(undefined)
    setRoomId(undefined)
    setGameMode('ffa')
    setSeed(undefined)
    setScreen('playing')
    document.body.style.cursor = 'none'
  }, [])

  const handleMultiplayer = useCallback(() => {
    setScreen('lobby')
  }, [])

  const handleShop = useCallback(() => {
    setScreen('shop')
  }, [])

  const handleShopApply = useCallback((skin: WormSkin) => {
    setCustomSkin(skin)
    setPlayerSkin(skin)
    setScreen('menu')
  }, [])

  const handleJoinRoom = useCallback((slug: string, id: string, mode: GameMode, roomSeed: number) => {
    setRoomSlug(slug)
    setRoomId(id)
    setGameMode(mode)
    setSeed(roomSeed)
    setScreen('playing')
    document.body.style.cursor = 'none'
  }, [])

  const handleDeath = useCallback((score: number, length: number, coins: number) => {
    setDeathInfo({ score, length, coins })
    setScreen('dead')
    document.body.style.cursor = 'default'
  }, [])

  const handleRetry = useCallback(() => {
    setScreen('playing')
    document.body.style.cursor = 'none'
  }, [])

  const handleBackToMenu = useCallback(() => {
    setScreen('menu')
    document.body.style.cursor = 'default'
  }, [])

  if (screen === 'menu') {
    return (
      <WelcomeScreen
        customSkin={customSkin}
        onPlay={handlePlay}
        onMultiplayer={handleMultiplayer}
        onShop={handleShop}
      />
    )
  }

  if (screen === 'shop') {
    return (
      <ShopScreen
        currentSkin={customSkin ?? playerSkin}
        onApply={handleShopApply}
        onBack={handleBackToMenu}
      />
    )
  }

  if (screen === 'lobby') {
    return <LobbyScreen onJoinRoom={handleJoinRoom} onBack={handleBackToMenu} />
  }

  if (screen === 'playing') {
    return (
      <GameCanvas
        key={`${roomSlug ?? 'solo'}-${Date.now()}`}
        playerName={playerName}
        playerSkin={playerSkin}
        roomSlug={roomSlug}
        roomId={roomId}
        gameMode={gameMode}
        seed={seed}
        onDeath={handleDeath}
        onBack={handleBackToMenu}
      />
    )
  }

  // Death screen
  return (
    <div style={styles.deathContainer}>
      <h2 style={styles.deathTitle}>{t('gameOver')}</h2>
      <div style={styles.finalScore}>{deathInfo?.score ?? 0}</div>
      <div style={styles.finalLength}>{t('length')}: {deathInfo?.length ?? 0}</div>
      <div style={styles.finalCoins}>&#x1FA99; {deathInfo?.coins ?? 0}</div>
      <button style={styles.retryBtn} onClick={handleRetry}>{t('retry')}</button>
      <button style={styles.menuBtn} onClick={handleBackToMenu}>{t('back')}</button>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  deathContainer: {
    position: 'fixed',
    top: 0, left: 0,
    width: '100%', height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    background: 'rgba(8,30,50,0.85)',
    backdropFilter: 'blur(8px)',
  },
  deathTitle: {
    fontFamily: "'Bungee', cursive",
    fontSize: 42,
    color: '#ff3366',
    marginBottom: 10,
    textShadow: '0 0 30px rgba(255,51,102,0.5)',
  },
  finalScore: {
    fontFamily: "'Bungee', cursive",
    fontSize: 60,
    color: '#ffd700',
    marginBottom: 8,
  },
  finalLength: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 18,
    marginBottom: 8,
  },
  finalCoins: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 18,
    marginBottom: 30,
  },
  retryBtn: {
    padding: '14px 50px',
    border: 'none',
    borderRadius: 50,
    fontFamily: "'Bungee', cursive",
    fontSize: 20,
    color: 'white',
    background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
    cursor: 'pointer',
    boxShadow: '0 6px 25px rgba(124,58,237,0.4)',
    letterSpacing: 2,
    marginBottom: 12,
  },
  menuBtn: {
    padding: '10px 30px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderRadius: 30,
    fontFamily: "'Bungee', cursive",
    fontSize: 14,
    color: 'white',
    background: 'transparent',
    cursor: 'pointer',
  },
}
