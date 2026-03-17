import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Effect } from 'effect'
import { RoomService, type RoomInfo } from '@/services/RoomService'
import type { GameMode } from '@/types/game'

interface LobbyScreenProps {
  onJoinRoom: (slug: string, roomId: string, gameMode: GameMode, seed: number) => void
  onBack: () => void
}

export function LobbyScreen({ onJoinRoom, onBack }: LobbyScreenProps) {
  const { t } = useTranslation()
  const [rooms, setRooms] = useState<RoomInfo[]>([])
  const [roomName, setRoomName] = useState('')
  const [joinSlug, setJoinSlug] = useState('')
  const [gameMode, setGameMode] = useState<GameMode>('battle')
  const [loading, setLoading] = useState(false)

  const loadRooms = useCallback(async () => {
    const result = await Effect.runPromise(
      RoomService.listPublicRooms().pipe(Effect.catchAll(() => Effect.succeed([] as RoomInfo[])))
    )
    setRooms(result)
  }, [])

  useEffect(() => {
    loadRooms()
    const interval = setInterval(loadRooms, 5000)
    return () => clearInterval(interval)
  }, [loadRooms])

  const handleCreate = async () => {
    if (!roomName.trim()) return
    setLoading(true)
    try {
      const result = await Effect.runPromise(
        RoomService.createRoom(roomName.trim(), true, gameMode, 8).pipe(
          Effect.catchAll((e) => Effect.fail(e))
        )
      )
      // After creating, join our own room
      const joinResult = await Effect.runPromise(
        RoomService.joinRoom(result.slug).pipe(Effect.catchAll((e) => Effect.fail(e)))
      )
      onJoinRoom(result.slug, joinResult.roomId, result.gameMode as GameMode, result.seed)
    } catch (e) {
      console.error('Failed to create room:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async (slug: string) => {
    setLoading(true)
    try {
      const result = await Effect.runPromise(
        RoomService.joinRoom(slug).pipe(Effect.catchAll((e) => Effect.fail(e)))
      )
      onJoinRoom(slug, result.roomId, result.gameMode, result.seed)
    } catch (e) {
      console.error('Failed to join room:', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>{t('lobby')}</h1>

      {/* Create room */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>{t('createRoom')}</h3>
        <input
          type="text"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder={t('roomName')}
          maxLength={30}
          style={styles.input}
        />
        <div style={styles.modeSelector}>
          {(['battle', 'ffa'] as GameMode[]).map((m) => (
            <button
              key={m}
              style={{
                ...styles.modeBtn,
                background: m === gameMode ? 'rgba(255,215,0,0.3)' : 'rgba(255,255,255,0.1)',
                borderColor: m === gameMode ? '#ffd700' : 'rgba(255,255,255,0.2)',
              }}
              onClick={() => setGameMode(m)}
            >
              {t(m)}
            </button>
          ))}
        </div>
        <button style={styles.createBtn} onClick={handleCreate} disabled={loading}>
          {t('createRoom')}
        </button>
      </div>

      {/* Join by slug */}
      <div style={styles.section}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={joinSlug}
            onChange={(e) => setJoinSlug(e.target.value)}
            placeholder="Code..."
            maxLength={6}
            style={{ ...styles.input, flex: 1 }}
          />
          <button style={styles.joinBtn} onClick={() => handleJoin(joinSlug)} disabled={loading}>
            {t('joinRoom')}
          </button>
        </div>
      </div>

      {/* Public rooms */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>{t('publicRooms')}</h3>
        <div style={styles.roomList}>
          {rooms.length === 0 && (
            <div style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: 20 }}>
              No rooms available
            </div>
          )}
          {rooms.map((room) => (
            <div key={room.id} style={styles.roomEntry}>
              <div>
                <span style={styles.roomName}>{room.name}</span>
                <span style={styles.roomMode}>{room.gameMode}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={styles.roomPlayers}>
                  {room.memberCount ?? 0}/{room.maxPlayers} {t('players')}
                </span>
                <button style={styles.joinSmallBtn} onClick={() => handleJoin(room.slug)}>
                  {t('joinRoom')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button style={styles.backBtn} onClick={onBack}>
        {t('back')}
      </button>
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
    justifyContent: 'flex-start',
    paddingTop: 40,
    zIndex: 100,
    background: 'radial-gradient(ellipse at center, #1a5c8a 0%, #0e3a5c 60%, #082740 100%)',
    overflow: 'auto',
  },
  title: {
    fontFamily: "'Bungee', cursive",
    fontSize: 42,
    color: '#ffd700',
    marginBottom: 20,
    textShadow: '0 3px 10px rgba(0,0,0,0.5)',
  },
  section: {
    width: 400,
    maxWidth: '90%',
    marginBottom: 20,
    background: 'rgba(0,0,0,0.3)',
    borderRadius: 16,
    padding: 20,
    backdropFilter: 'blur(6px)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  sectionTitle: {
    fontFamily: "'Bungee', cursive",
    fontSize: 16,
    color: '#ffd700',
    marginBottom: 12,
  },
  input: {
    width: '100%',
    padding: '10px 16px',
    border: '2px solid rgba(255,255,255,0.2)',
    borderRadius: 30,
    background: 'rgba(255,255,255,0.08)',
    color: 'white',
    fontFamily: "'Fredoka', sans-serif",
    fontSize: 16,
    outline: 'none',
    marginBottom: 10,
  },
  modeSelector: {
    display: 'flex',
    gap: 8,
    marginBottom: 12,
  },
  modeBtn: {
    flex: 1,
    padding: '8px 16px',
    border: '2px solid rgba(255,255,255,0.2)',
    borderRadius: 20,
    fontFamily: "'Fredoka', sans-serif",
    fontSize: 14,
    color: 'white',
    cursor: 'pointer',
  },
  createBtn: {
    width: '100%',
    padding: '12px 24px',
    border: 'none',
    borderRadius: 30,
    fontFamily: "'Bungee', cursive",
    fontSize: 16,
    color: 'white',
    background: 'linear-gradient(135deg, #ff3366, #ff6b35)',
    cursor: 'pointer',
  },
  joinBtn: {
    padding: '10px 24px',
    border: 'none',
    borderRadius: 30,
    fontFamily: "'Bungee', cursive",
    fontSize: 14,
    color: 'white',
    background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  roomList: {
    maxHeight: 200,
    overflow: 'auto',
  },
  roomEntry: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    marginBottom: 6,
    borderRadius: 10,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  roomName: {
    color: 'white',
    fontWeight: 600,
    fontSize: 14,
    marginRight: 8,
  },
  roomMode: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  roomPlayers: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
  },
  joinSmallBtn: {
    padding: '6px 14px',
    border: 'none',
    borderRadius: 20,
    fontFamily: "'Fredoka', sans-serif",
    fontSize: 13,
    color: 'white',
    background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
    cursor: 'pointer',
  },
  backBtn: {
    marginTop: 10,
    marginBottom: 30,
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
