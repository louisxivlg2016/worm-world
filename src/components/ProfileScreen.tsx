import { useTranslation } from 'react-i18next'
import { getStorage } from '@/services/StorageService'
import { GAME_EVENTS } from '@/config/events'

export interface PlayerStats {
  bestScore: number
  bestTime: number // seconds
  kills: number
  gamesPlayed: number
  totalPlayTime: number // seconds
}

const STATS_KEY = 'playerStats'

export function loadStats(): PlayerStats {
  try {
    const raw = getStorage().getItem(STATS_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return { bestScore: 0, bestTime: 0, kills: 0, gamesPlayed: 0, totalPlayTime: 0 }
}

export function saveStats(stats: PlayerStats) {
  getStorage().setItem(STATS_KEY, JSON.stringify(stats))
}

function formatTime(seconds: number): string {
  if (seconds <= 0) return '0s'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}h ${m}m ${s}s`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

interface ProfileScreenProps {
  playerCoins: number
  onBack: () => void
  onReset: () => void
}

export function ProfileScreen({ playerCoins, onBack, onReset }: ProfileScreenProps) {
  const { t } = useTranslation()
  const stats = loadStats()

  const unlockedEvents = GAME_EVENTS.filter(e => getStorage().getItem(e.unlockKey) === 'true')
  const totalCostumes = GAME_EVENTS.reduce((sum, e) => sum + e.costumes.length, 0)
  const unlockedCostumes = unlockedEvents.reduce((sum, e) => sum + e.costumes.length, 0)

  const handleReset = () => {
    if (confirm('Supprimer toutes les données ? Cette action est irréversible.')) {
      onReset()
    }
  }

  return (
    <div style={styles.container}>
      <style>{`
        .profile-scroll::-webkit-scrollbar { width: 6px; }
        .profile-scroll::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 3px; }
        .profile-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 3px; }
      `}</style>

      <div className="profile-scroll" style={styles.scroll}>
        {/* Avatar / Coins */}
        <div style={styles.header}>
          <div style={styles.coinBadge}>&#x1FA99; {playerCoins}</div>
          <h1 style={styles.title}>Profil</h1>
        </div>

        {/* Stats rows */}
        <div style={styles.statsBox}>
          <StatRow icon="🏆" label="Meilleur Score" value={stats.bestScore.toLocaleString()} />
          <StatRow icon="⏱️" label="Meilleur Temps" value={formatTime(stats.bestTime)} />
          <StatRow icon="💀" label="Vaincu" value={String(stats.kills)} />
          <StatRow icon="🎮" label="Nombre de parties" value={String(stats.gamesPlayed)} />
          <StatRow icon="⏳" label="Temps total de jeu" value={formatTime(stats.totalPlayTime)} />
        </div>

        {/* Costumes unlocked */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Costumes débloqués</div>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${totalCostumes > 0 ? (unlockedCostumes / totalCostumes) * 100 : 0}%` }} />
          </div>
          <div style={styles.progressText}>{unlockedCostumes} / {totalCostumes}</div>
          {unlockedEvents.length > 0 && (
            <div style={styles.badgeRow}>
              {unlockedEvents.map(e => (
                <div key={e.id} style={styles.badge} title={e.label}>
                  <span style={{ fontSize: 24 }}>{e.emoji}</span>
                  <span style={styles.badgeLabel}>{e.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div style={styles.btnRow}>
          <button style={styles.backBtn} onClick={onBack}>
            {t('back')}
          </button>
          <button style={styles.resetBtn} onClick={handleReset}>
            🗑️
          </button>
        </div>
      </div>
    </div>
  )
}

function StatRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={styles.statRow}>
      <span style={styles.statIcon}>{icon}</span>
      <span style={styles.statLabel}>{label}</span>
      <span style={styles.statValue}>{value}</span>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    top: 0, left: 0,
    width: '100%', height: '100%',
    background: 'radial-gradient(ellipse at center, #1a5c8a 0%, #0e3a5c 60%, #082740 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Fredoka', sans-serif",
    zIndex: 100,
  },
  scroll: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  coinBadge: {
    background: 'rgba(255,215,0,0.15)',
    border: '1px solid rgba(255,215,0,0.3)',
    borderRadius: 30,
    padding: '6px 20px',
    color: '#ffd700',
    fontFamily: "'Bungee', cursive",
    fontSize: 20,
  },
  title: {
    fontFamily: "'Bungee', cursive",
    fontSize: 32,
    color: 'white',
    textShadow: '0 4px 15px rgba(0,0,0,0.5)',
    margin: 0,
  },
  statsBox: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  statRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '14px 18px',
    background: 'rgba(100,160,220,0.25)',
    borderRadius: 12,
    backdropFilter: 'blur(6px)',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  statIcon: {
    fontSize: 24,
    width: 36,
    textAlign: 'center',
    flexShrink: 0,
  },
  statLabel: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    fontWeight: 600,
  },
  statValue: {
    color: '#ffd700',
    fontFamily: "'Bungee', cursive",
    fontSize: 18,
    textShadow: '0 2px 8px rgba(0,0,0,0.3)',
  },
  section: {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    border: '1px solid rgba(255,255,255,0.08)',
  },
  sectionTitle: {
    color: 'white',
    fontFamily: "'Bungee', cursive",
    fontSize: 16,
    marginBottom: 10,
  },
  progressBar: {
    width: '100%',
    height: 10,
    borderRadius: 5,
    background: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
    background: 'linear-gradient(90deg, #ff3366, #ff6b35, #ffd700)',
    transition: 'width 0.5s ease',
  },
  progressText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
  },
  badgeRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  badge: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    padding: '8px 12px',
    background: 'rgba(255,215,0,0.1)',
    borderRadius: 10,
    border: '1px solid rgba(255,215,0,0.2)',
  },
  badgeLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
  },
  btnRow: {
    display: 'flex',
    gap: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  backBtn: {
    padding: '14px 40px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderRadius: 50,
    fontFamily: "'Bungee', cursive",
    fontSize: 16,
    color: 'white',
    background: 'transparent',
    cursor: 'pointer',
  },
  resetBtn: {
    padding: '14px 20px',
    border: 'none',
    borderRadius: 50,
    fontFamily: "'Bungee', cursive",
    fontSize: 18,
    color: 'white',
    background: 'linear-gradient(135deg, #cc2222, #ff4444)',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(204,34,34,0.4)',
  },
}
