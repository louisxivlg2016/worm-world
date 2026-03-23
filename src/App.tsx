import { useState, useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { WelcomeScreen } from '@/components/WelcomeScreen'
import { LobbyScreen } from '@/components/LobbyScreen'
import { ShopScreen } from '@/components/ShopScreen'
import { ProfileScreen, loadStats, saveStats } from '@/components/ProfileScreen'
import { GameCanvas } from '@/components/GameCanvas'
import { SKINS, type WormSkin, type GameMode, type GameScreen } from '@/types/game'
import { getStorage } from '@/services/StorageService'
import { GAME_EVENTS, isEventActive, getEventByMode } from '@/config/events'
import { spacetimeService } from '@/services/SpacetimeService'
import backgroundMusic from '../music/Starlight_Arcadepremieree.mp3'

interface DeathInfo {
  score: number
  length: number
  coins: number
  kills: number
}

export function AppInner() {
  const { t } = useTranslation()
  const [screen, setScreen] = useState<GameScreen>('menu')
  const [playerName, setPlayerName] = useState('')
  const [playerSkin, setPlayerSkin] = useState<WormSkin>(() => {
    try {
      const saved = getStorage().getItem('playerSkin')
      return saved ? JSON.parse(saved) : SKINS[0]
    } catch { return SKINS[0] }
  })
  const [customSkin, setCustomSkin] = useState<WormSkin | null>(() => {
    try {
      const saved = getStorage().getItem('customSkin')
      return saved ? JSON.parse(saved) : null
    } catch { return null }
  })
  const [roomSlug, setRoomSlug] = useState<string | undefined>()
  const [roomId, setRoomId] = useState<string | undefined>()
  const [gameMode, setGameMode] = useState<GameMode>('ffa')
  const [seed, setSeed] = useState<number | undefined>()
  const [deathInfo, setDeathInfo] = useState<DeathInfo | null>(null)
  const gameStartTimeRef = useRef(0)
  const [totalCoins, setTotalCoins] = useState(() => {
    const saved = getStorage().getItem('totalCoins')
    if (!saved) {
      // Dev: start with 20000 coins
      getStorage().setItem('totalCoins', '20000')
      return 20000
    }
    return parseInt(saved, 10) || 0
  })
  const backgroundAudioRef = useRef<HTMLAudioElement | null>(null)

  const startBackgroundMusic = useCallback(() => {
    const audio = backgroundAudioRef.current
    if (!audio) return
    audio.play().catch(() => {})
  }, [])

  useEffect(() => {
    const audio = new Audio(backgroundMusic)
    audio.loop = true
    audio.volume = 0.35
    audio.preload = 'auto'
    backgroundAudioRef.current = audio

    return () => {
      audio.pause()
      audio.currentTime = 0
      backgroundAudioRef.current = null
    }
  }, [])

  // Connect to SpacetimeDB
  useEffect(() => {
    spacetimeService.connect().then(() => {
      console.log('[App] SpacetimeDB connected')
    }).catch(err => {
      console.error('[App] SpacetimeDB connection failed:', err)
    })
  }, [])

  const handlePlay = useCallback((name: string, skin: WormSkin) => {
    startBackgroundMusic()
    setPlayerName(name)
    setPlayerSkin(skin)
    setRoomSlug(undefined)
    setRoomId(undefined)
    setGameMode('ffa')
    setSeed(undefined)
    gameStartTimeRef.current = Date.now()
    setScreen('playing')
    document.body.style.cursor = 'none'
  }, [startBackgroundMusic])

  const handlePlayCoins = useCallback((name: string, skin: WormSkin) => {
    startBackgroundMusic()
    setPlayerName(name)
    setPlayerSkin(skin)
    setRoomSlug(undefined)
    setRoomId(undefined)
    setGameMode('coins')
    setSeed(undefined)
    gameStartTimeRef.current = Date.now()
    setScreen('playing')
    document.body.style.cursor = 'none'
  }, [startBackgroundMusic])

  const handlePlayEvent = useCallback((mode: GameMode, name: string, skin: WormSkin) => {
    startBackgroundMusic()
    setPlayerName(name)
    setPlayerSkin(skin)
    setRoomSlug(undefined)
    setRoomId(undefined)
    setGameMode(mode)
    setSeed(undefined)
    gameStartTimeRef.current = Date.now()
    setScreen('playing')
    document.body.style.cursor = 'none'
  }, [startBackgroundMusic])

  const handleEventWin = useCallback(() => {
    const event = getEventByMode(gameMode)
    if (event) {
      getStorage().setItem(event.unlockKey, 'true')
    }
    setScreen('event-win')
    document.body.style.cursor = 'default'
  }, [gameMode])

  const handleMultiplayer = useCallback(() => {
    startBackgroundMusic()
    setScreen('lobby')
  }, [startBackgroundMusic])

  const handleShop = useCallback(() => {
    startBackgroundMusic()
    setScreen('shop')
  }, [startBackgroundMusic])

  const handleProfile = useCallback(() => {
    setScreen('profile')
  }, [])

  const handleResetData = useCallback(() => {
    const storage = getStorage()
    storage.removeItem('playerStats')
    storage.removeItem('totalCoins')
    storage.removeItem('customSkin')
    storage.removeItem('playerSkin')
    GAME_EVENTS.forEach(e => storage.removeItem(e.unlockKey))
    setTotalCoins(0)
    setCustomSkin(null)
    setPlayerSkin(SKINS[0])
    setScreen('menu')
  }, [])

  const handleShopApply = useCallback((skin: WormSkin, cost: number) => {
    setTotalCoins(prev => {
      const next = prev - cost
      getStorage().setItem('totalCoins', String(next))
      return next
    })
    setCustomSkin(skin)
    setPlayerSkin(skin)
    getStorage().setItem('customSkin', JSON.stringify(skin))
    getStorage().setItem('playerSkin', JSON.stringify(skin))
    setScreen('menu')
  }, [])

  const handleJoinRoom = useCallback((slug: string, id: string, mode: GameMode, roomSeed: number) => {
    startBackgroundMusic()
    setRoomSlug(slug)
    setRoomId(id)
    setGameMode(mode)
    setSeed(roomSeed)
    gameStartTimeRef.current = Date.now()
    setScreen('playing')
    document.body.style.cursor = 'none'
  }, [startBackgroundMusic])

  const handleDeath = useCallback((score: number, length: number, coins: number, kills: number) => {
    startBackgroundMusic()
    setDeathInfo({ score, length, coins, kills })
    setTotalCoins(prev => {
      const next = prev + coins
      getStorage().setItem('totalCoins', String(next))
      return next
    })
    // Update persistent stats
    const elapsed = Math.floor((Date.now() - gameStartTimeRef.current) / 1000)
    const stats = loadStats()
    stats.bestScore = Math.max(stats.bestScore, score)
    stats.bestTime = Math.max(stats.bestTime, elapsed)
    stats.kills += kills
    stats.gamesPlayed++
    stats.totalPlayTime += elapsed
    saveStats(stats)
    setScreen('dead')
    document.body.style.cursor = 'default'
  }, [startBackgroundMusic])

  const handleRetry = useCallback(() => {
    startBackgroundMusic()
    gameStartTimeRef.current = Date.now()
    setScreen('playing')
    document.body.style.cursor = 'none'
  }, [startBackgroundMusic])

  const handleBackToMenu = useCallback(() => {
    startBackgroundMusic()
    setScreen('menu')
    document.body.style.cursor = 'default'
  }, [startBackgroundMusic])

  // Event modes: available on specific dates (or always for dev)
  const activeEvents = GAME_EVENTS.filter(e => isEventActive(e) && getStorage().getItem(e.unlockKey) !== 'true')
  const wonEvent = getEventByMode(gameMode)

  if (screen === 'event-win' && wonEvent) {
    return (
      <div style={styles.deathContainer}>
        <div style={{ fontSize: 80, marginBottom: 20 }}>{wonEvent.emoji}</div>
        <h2 style={{ ...styles.deathTitle, color: wonEvent.bgGradient[0] }}>{wonEvent.winTitle}</h2>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 18, marginBottom: 30, textAlign: 'center', maxWidth: 400 }}>
          {wonEvent.winMessage}
        </div>
        <button style={styles.retryBtn} onClick={handleBackToMenu}>OK</button>
      </div>
    )
  }

  if (screen === 'menu') {
    return (
      <WelcomeScreen
        customSkin={customSkin}
        activeEvents={activeEvents}
        onPlay={handlePlay}
        onPlayCoins={handlePlayCoins}
        onPlayEvent={handlePlayEvent}
        onMultiplayer={handleMultiplayer}
        onShop={handleShop}
        onProfile={handleProfile}
      />
    )
  }

  if (screen === 'profile') {
    return (
      <ProfileScreen
        playerCoins={totalCoins}
        onBack={handleBackToMenu}
        onReset={handleResetData}
      />
    )
  }

  if (screen === 'shop') {
    return (
      <ShopScreen
        currentSkin={customSkin ?? playerSkin}
        playerCoins={totalCoins}
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
        onWin={getEventByMode(gameMode) ? handleEventWin : undefined}
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
