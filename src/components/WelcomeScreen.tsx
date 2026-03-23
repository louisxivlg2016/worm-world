import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SKINS, type WormSkin, type GameMode } from '@/types/game'
import type { GameEvent } from '@/config/events'

interface WelcomeScreenProps {
  customSkin: WormSkin | null
  activeEvents: GameEvent[]
  onPlay: (name: string, skin: WormSkin) => void
  onPlayCoins: (name: string, skin: WormSkin) => void
  onPlayEvent: (mode: GameMode, name: string, skin: WormSkin) => void
  onMultiplayer: () => void
  onShop: () => void
  onProfile: () => void
}

export function WelcomeScreen({ customSkin, activeEvents, onPlay, onPlayCoins, onPlayEvent, onMultiplayer, onShop, onProfile }: WelcomeScreenProps) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [selectedSkin, setSelectedSkin] = useState(0)
  const [useCustom, setUseCustom] = useState(!!customSkin)

  // If custom skin is active from shop, use it; otherwise use selected default skin
  const activeSkin = (useCustom && customSkin) ? customSkin : (SKINS[selectedSkin] ?? SKINS[0])

  const handlePlay = () => {
    onPlay(name.trim() || `Guest${Math.floor(Math.random() * 999)}`, activeSkin)
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>{t('title')}</h1>
      <div style={styles.subtitle}>{t('subtitle')}</div>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t('namePlaceholder')}
        maxLength={15}
        style={styles.input}
        onKeyDown={(e) => { if (e.key === 'Enter') handlePlay() }}
      />
      <div style={styles.skinSelector}>
        {SKINS.map((skin, i) => (
          <div
            key={i}
            style={{
              ...styles.skinOption,
              background: `linear-gradient(135deg, ${skin.colors[0]}, ${skin.colors[1]})`,
              borderColor: !customSkin && i === selectedSkin ? '#ffd700' : 'rgba(255,255,255,0.15)',
              boxShadow: !customSkin && i === selectedSkin ? '0 0 20px rgba(255,215,0,0.5)' : 'none',
              transform: !customSkin && i === selectedSkin ? 'scale(1.15)' : 'scale(1)',
            }}
            onClick={() => { setSelectedSkin(i); setUseCustom(false) }}
          />
        ))}
      </div>
      <button style={styles.playBtn} onClick={handlePlay}>
        {t('soloPlay')}
      </button>
      <button style={styles.coinsBtn} onClick={() => onPlayCoins(name.trim() || `Guest${Math.floor(Math.random() * 999)}`, activeSkin)}>
        {t('coinsMode')}
      </button>
      {activeEvents.length > 0 && (
        <div style={styles.eventsScroll}>
          {activeEvents.map(event => (
            <button
              key={event.id}
              style={{
                padding: '10px 28px',
                border: 'none',
                borderRadius: 50,
                fontFamily: "'Bungee', cursive",
                fontSize: 14,
                color: '#FFFFFF',
                background: event.btnGradient,
                cursor: 'pointer',
                boxShadow: event.btnShadow,
                letterSpacing: 1,
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
              onClick={() => onPlayEvent(event.id, name.trim() || `Guest${Math.floor(Math.random() * 999)}`, activeSkin)}
            >
              {event.emoji} {event.label}
            </button>
          ))}
        </div>
      )}
      <div style={styles.btnRow}>
        <button style={styles.multiBtn} onClick={onMultiplayer}>
          {t('multiplay')}
        </button>
        <button style={styles.shopBtn} onClick={onShop}>
          {t('shop')}
        </button>
        <button style={styles.profileBtn} onClick={onProfile}>
          Profil
        </button>
      </div>

      {/* Decorative particles */}
      {Array.from({ length: 15 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'fixed',
            borderRadius: '50%',
            opacity: 0.15,
            background: ['#ff3366', '#ff6b35', '#ffd700', '#7cff00', '#00ccff', '#cc33ff', '#ff69b4', '#00ff88'][i % 8],
            width: 4 + Math.random() * 8,
            height: 4 + Math.random() * 8,
            left: `${Math.random() * 100}%`,
            animation: `floatUp ${8 + Math.random() * 12}s linear infinite`,
            animationDelay: `${-Math.random() * 15}s`,
            zIndex: 1,
          }}
        />
      ))}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    top: 0, left: 0,
    width: '100%', height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    background: 'radial-gradient(ellipse at center, #1a5c8a 0%, #0e3a5c 60%, #082740 100%)',
  },
  title: {
    fontFamily: "'Bungee', cursive",
    fontSize: 64,
    background: 'linear-gradient(180deg, #ff6b35, #ff3366, #cc33ff)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    filter: 'drop-shadow(0 4px 20px rgba(255,51,102,0.5))',
    marginBottom: 10,
    animation: 'titlePulse 2s ease-in-out infinite',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
    marginBottom: 40,
    letterSpacing: 3,
  },
  input: {
    width: 280,
    padding: '14px 20px',
    border: '3px solid rgba(255,255,255,0.2)',
    borderRadius: 50,
    background: 'rgba(255,255,255,0.08)',
    color: 'white',
    fontFamily: "'Fredoka', sans-serif",
    fontSize: 18,
    textAlign: 'center' as const,
    outline: 'none',
    marginBottom: 20,
    backdropFilter: 'blur(10px)',
  },
  skinSelector: {
    display: 'flex',
    gap: 12,
    marginBottom: 30,
    flexWrap: 'wrap' as const,
    justifyContent: 'center',
  },
  skinOption: {
    width: 50, height: 50,
    borderRadius: '50%',
    cursor: 'pointer',
    border: '3px solid rgba(255,255,255,0.15)',
    transition: 'all 0.3s',
    position: 'relative' as const,
  },
  playBtn: {
    padding: '16px 60px',
    border: 'none',
    borderRadius: 50,
    fontFamily: "'Bungee', cursive",
    fontSize: 22,
    color: 'white',
    background: 'linear-gradient(135deg, #ff3366, #ff6b35)',
    cursor: 'pointer',
    boxShadow: '0 6px 30px rgba(255,51,102,0.4)',
    letterSpacing: 2,
    marginBottom: 12,
  },
  coinsBtn: {
    padding: '12px 40px',
    border: 'none',
    borderRadius: 50,
    fontFamily: "'Bungee', cursive",
    fontSize: 16,
    color: '#ffd700',
    background: 'linear-gradient(135deg, #b8860b, #daa520)',
    cursor: 'pointer',
    boxShadow: '0 6px 25px rgba(218,165,32,0.4)',
    letterSpacing: 2,
    marginBottom: 12,
  },
  eventsScroll: {
    display: 'flex',
    gap: 8,
    overflowX: 'auto',
    maxWidth: '90vw',
    padding: '8px 4px',
    marginBottom: 8,
    scrollbarWidth: 'thin',
    WebkitOverflowScrolling: 'touch',
  } as React.CSSProperties,
  btnRow: {
    display: 'flex',
    gap: 12,
  },
  multiBtn: {
    padding: '12px 30px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderRadius: 50,
    fontFamily: "'Bungee', cursive",
    fontSize: 16,
    color: 'white',
    background: 'rgba(255,255,255,0.1)',
    cursor: 'pointer',
    backdropFilter: 'blur(10px)',
    letterSpacing: 2,
  },
  shopBtn: {
    padding: '12px 30px',
    border: '2px solid rgba(255,215,0,0.4)',
    borderRadius: 50,
    fontFamily: "'Bungee', cursive",
    fontSize: 16,
    color: '#ffd700',
    background: 'rgba(255,215,0,0.1)',
    cursor: 'pointer',
    backdropFilter: 'blur(10px)',
    letterSpacing: 2,
  },
  profileBtn: {
    padding: '12px 30px',
    border: '2px solid rgba(100,200,255,0.4)',
    borderRadius: 50,
    fontFamily: "'Bungee', cursive",
    fontSize: 16,
    color: '#64c8ff',
    background: 'rgba(100,200,255,0.1)',
    cursor: 'pointer',
    backdropFilter: 'blur(10px)',
    letterSpacing: 2,
  },
}
