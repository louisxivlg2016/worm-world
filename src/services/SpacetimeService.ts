import { DbConnection, type EventContext, type SubscriptionEventContext } from '@/module_bindings'
import type { Room, RoomMember, PlayerState, GameEvent as DbGameEvent } from '@/module_bindings/types'
import type { Identity } from 'spacetimedb'

const SPACETIMEDB_URI = process.env.EXPO_PUBLIC_SPACETIMEDB_URI || process.env.VITE_SPACETIMEDB_URI || 'wss://maincloud.spacetimedb.com'
const SPACETIMEDB_DB = process.env.EXPO_PUBLIC_SPACETIMEDB_DB || process.env.VITE_SPACETIMEDB_DB || 'worm-world-server'

export interface RemotePlayerData {
  identity: Identity
  x: number
  y: number
  angle: number
  score: number
  alive: boolean
  segmentsCount: number
  boosting: boolean
  skinJson: string
  name: string
}

type GameCallbacks = {
  onRemotePlayerUpdate?: (identityHex: string, data: RemotePlayerData) => void
  onRemotePlayerLeft?: (identityHex: string) => void
  onGameEvent?: (event: { senderHex: string; eventType: string; payload: Record<string, unknown> }) => void
  onRoomListChanged?: () => void
  onMemberJoined?: (username: string) => void
  onMemberLeft?: (identityHex: string) => void
  onRoomDeleted?: () => void
}

class SpacetimeService {
  private conn: DbConnection | null = null
  private identity: Identity | null = null
  private token: string | null = null
  private currentRoomId: bigint | null = null
  private callbacks: GameCallbacks = {}
  private updateLoopInterval: ReturnType<typeof setInterval> | null = null
  private connected = false
  private pendingCreateResolve: ((result: { slug: string; seed: number; gameMode: string; maxPlayers: number } | null) => void) | null = null

  connect(): Promise<Identity> {
    if (this.conn && this.connected && this.identity) {
      return Promise.resolve(this.identity)
    }

    return new Promise((resolve, reject) => {
      let savedToken: string | null = null
      try { savedToken = localStorage.getItem('spacetimedb_token') } catch {}

      console.log('[SpacetimeDB] Connecting to', SPACETIMEDB_URI, 'db:', SPACETIMEDB_DB, 'hasToken:', !!savedToken)

      try {
        this.conn = DbConnection.builder()
          .withUri(SPACETIMEDB_URI)
          .withDatabaseName(SPACETIMEDB_DB)
          .withToken(savedToken || undefined)
          .onConnect((conn: DbConnection, identity: Identity, token: string) => {
            console.log('[SpacetimeDB] Connected, identity:', identity.toHexString())
            this.identity = identity
            this.token = token
            this.connected = true
            try { localStorage.setItem('spacetimedb_token', token) } catch {}

            conn.subscriptionBuilder()
              .onApplied((_ctx: SubscriptionEventContext) => {
                console.log('[SpacetimeDB] Lobby subscription applied')
                resolve(identity)
              })
              .subscribe([
                'SELECT * FROM room',
                'SELECT * FROM room_member',
                'SELECT * FROM player',
              ])

            this.setupTableCallbacks(conn)
          })
          .onDisconnect(() => {
            console.log('[SpacetimeDB] Disconnected')
            this.connected = false
          })
          .onConnectError((_ctx: any, err: Error) => {
            console.error('[SpacetimeDB] Connection error:', err)
            reject(err)
          })
          .build()
      } catch (e) {
        reject(e)
      }
    })
  }

  private setupTableCallbacks(conn: DbConnection) {
    conn.db.room.onInsert((_ctx: EventContext, room: Room) => {
      this.callbacks.onRoomListChanged?.()
      if (this.pendingCreateResolve && this.identity && room.host.isEqual(this.identity)) {
        const resolve = this.pendingCreateResolve
        this.pendingCreateResolve = null
        this.currentRoomId = room.id
        resolve({
          slug: room.slug,
          seed: Number(room.seed),
          gameMode: room.gameMode,
          maxPlayers: Number(room.maxPlayers),
        })
      }
    })

    conn.db.room.onDelete((_ctx: EventContext, room: Room) => {
      this.callbacks.onRoomListChanged?.()
      if (this.currentRoomId !== null && room.id === this.currentRoomId) {
        this.callbacks.onRoomDeleted?.()
      }
    })

    conn.db.room.onUpdate((_ctx: EventContext, _old: Room, _new: Room) => {
      this.callbacks.onRoomListChanged?.()
    })

    conn.db.room_member.onInsert((_ctx: EventContext, member: RoomMember) => {
      this.callbacks.onRoomListChanged?.()
      if (this.currentRoomId !== null && member.roomId === this.currentRoomId) {
        this.callbacks.onMemberJoined?.(member.username)
      }
    })

    conn.db.room_member.onDelete((_ctx: EventContext, member: RoomMember) => {
      this.callbacks.onRoomListChanged?.()
      if (this.currentRoomId !== null && member.roomId === this.currentRoomId) {
        this.callbacks.onMemberLeft?.(member.identity.toHexString())
      }
    })

    conn.db.player_state.onInsert((_ctx: EventContext, ps: PlayerState) => {
      if (this.identity && ps.identity.isEqual(this.identity)) return
      this.handlePlayerStateUpdate(ps)
    })

    conn.db.player_state.onUpdate((_ctx: EventContext, _old: PlayerState, ps: PlayerState) => {
      if (this.identity && ps.identity.isEqual(this.identity)) return
      this.handlePlayerStateUpdate(ps)
    })

    conn.db.player_state.onDelete((_ctx: EventContext, ps: PlayerState) => {
      if (this.identity && ps.identity.isEqual(this.identity)) return
      this.callbacks.onRemotePlayerLeft?.(ps.identity.toHexString())
    })

    conn.db.game_event.onInsert((_ctx: EventContext, evt: DbGameEvent) => {
      if (this.identity && evt.senderIdentity.isEqual(this.identity)) return
      let payload: Record<string, unknown> = {}
      try { payload = JSON.parse(evt.payloadJson) } catch { /* empty */ }
      this.callbacks.onGameEvent?.({
        senderHex: evt.senderIdentity.toHexString(),
        eventType: evt.eventType,
        payload,
      })
    })
  }

  private handlePlayerStateUpdate(ps: PlayerState) {
    this.callbacks.onRemotePlayerUpdate?.(ps.identity.toHexString(), {
      identity: ps.identity,
      x: ps.x,
      y: ps.y,
      angle: ps.angle,
      score: Number(ps.score),
      alive: ps.alive,
      segmentsCount: Number(ps.segmentsCount),
      boosting: ps.boosting,
      skinJson: ps.skinJson,
      name: ps.name,
    })
  }

  updateCallbacks(callbacks: GameCallbacks) {
    this.callbacks = callbacks
  }

  getIdentity(): Identity | null { return this.identity ?? null }
  getIdentityHex(): string { return this.identity?.toHexString() || '' }

  setUsername(username: string) {
    if (!this.conn) return
    this.conn.reducers.setUsername({ username })
  }

  // ─── Rooms ───

  async createRoom(name: string, isPublic = true, gameMode = 'ffa', maxPlayers = 8): Promise<{ slug: string; seed: number; gameMode: string; maxPlayers: number } | null> {
    console.log('[SpacetimeDB] createRoom called, conn:', !!this.conn, 'connected:', this.connected, 'identity:', this.identity?.toHexString())
    if (!this.conn) {
      console.error('[SpacetimeDB] createRoom: no connection!')
      return null
    }
    return new Promise((resolve) => {
      this.pendingCreateResolve = resolve
      setTimeout(() => {
        if (this.pendingCreateResolve === resolve) {
          console.error('[SpacetimeDB] createRoom: timed out after 5s (room.onInsert never fired)')
          this.pendingCreateResolve = null
          resolve(null)
        }
      }, 5000)
      console.log('[SpacetimeDB] calling reducers.createRoom...')
      this.conn!.reducers.createRoom({ name, isPublic, gameMode, maxPlayers })
    })
  }

  joinRoom(slug: string): { roomId: bigint; seed: number; gameMode: string; maxPlayers: number } | null {
    if (!this.conn) return null
    const room = Array.from(this.conn.db.room.iter()).find(r => r.slug === slug)
    if (!room) return null
    this.currentRoomId = room.id
    this.conn.reducers.joinRoom({ slug })
    return { roomId: room.id, seed: Number(room.seed), gameMode: room.gameMode, maxPlayers: Number(room.maxPlayers) }
  }

  leaveRoom() {
    if (!this.conn || this.currentRoomId === null) return
    this.conn.reducers.leaveRoom({ roomId: this.currentRoomId })
    this.currentRoomId = null
  }

  deleteRoom(roomId?: bigint) {
    if (!this.conn) return
    const id = roomId ?? this.currentRoomId
    if (id === null) return
    this.conn.reducers.deleteRoom({ roomId: id })
    if (id === this.currentRoomId) this.currentRoomId = null
  }

  updateGameMode(gameMode: string) {
    if (!this.conn || this.currentRoomId === null) return
    this.conn.reducers.updateGameMode({ roomId: this.currentRoomId, gameMode })
  }

  getCurrentRoomId(): bigint | null { return this.currentRoomId }

  isRoomAlive(roomId?: bigint): boolean {
    if (!this.conn) return false
    const id = roomId ?? this.currentRoomId
    if (id === null) return false
    return Array.from(this.conn.db.room.iter()).some(r => r.id === id)
  }

  getRoomList(): Array<{ id: bigint; name: string; slug: string; host: Identity; isPublic: boolean; gameMode: string; maxPlayers: number; memberCount: number }> {
    if (!this.conn) return []
    const rooms = Array.from(this.conn.db.room.iter()).filter(r => r.isPublic)
    return rooms.map(r => {
      const memberCount = Array.from(this.conn!.db.room_member.iter()).filter(m => m.roomId === r.id).length
      return { id: r.id, name: r.name, slug: r.slug, host: r.host, isPublic: r.isPublic, gameMode: r.gameMode, maxPlayers: Number(r.maxPlayers), memberCount }
    })
  }

  getRoomBySlug(slug: string): Room | undefined {
    if (!this.conn) return undefined
    return Array.from(this.conn.db.room.iter()).find(r => r.slug === slug)
  }

  getRoomMemberCount(roomId?: bigint): number {
    if (!this.conn) return 0
    const id = roomId ?? this.currentRoomId
    if (id === null) return 0
    return Array.from(this.conn.db.room_member.iter()).filter(m => m.roomId === id).length
  }

  getRoomMembers(roomId?: bigint): Array<{ identity: Identity; username: string }> {
    if (!this.conn) return []
    const id = roomId ?? this.currentRoomId
    if (id === null) return []
    return Array.from(this.conn.db.room_member.iter())
      .filter(m => m.roomId === id)
      .map(m => ({ identity: m.identity, username: m.username }))
  }

  // ─── Player State Broadcasting (12Hz) ───

  startUpdateLoop(getState: () => {
    x: number; y: number; angle: number; score: number; alive: boolean;
    segmentsCount: number; boosting: boolean; skinJson: string; name: string;
  }) {
    this.stopUpdateLoop()
    this.updateLoopInterval = setInterval(() => {
      if (!this.conn || this.currentRoomId === null) return
      const state = getState()
      this.conn.reducers.updatePlayerState({
        roomId: this.currentRoomId,
        x: state.x, y: state.y, angle: state.angle,
        score: state.score, alive: state.alive,
        segmentsCount: state.segmentsCount, boosting: state.boosting,
        skinJson: state.skinJson, name: state.name,
      })
    }, 1000 / 12)
  }

  stopUpdateLoop() {
    if (this.updateLoopInterval) {
      clearInterval(this.updateLoopInterval)
      this.updateLoopInterval = null
    }
  }

  // ─── Game Events ───

  broadcastGameEvent(eventType: string, payload: Record<string, unknown> = {}) {
    if (!this.conn || this.currentRoomId === null) return
    this.conn.reducers.broadcastGameEvent({ roomId: this.currentRoomId, eventType, payloadJson: JSON.stringify(payload) })
  }

  clearGameEvents() {
    if (!this.conn || this.currentRoomId === null) return
    this.conn.reducers.clearGameEvents({ roomId: this.currentRoomId })
  }

  // ─── Stats ───

  reportWin() {
    if (!this.conn) return
    this.conn.reducers.reportWin({})
  }

  markEliminated() {
    if (!this.conn || this.currentRoomId === null) return
    this.conn.reducers.markEliminated({ roomId: this.currentRoomId })
  }

  addCoins(amount: number) {
    if (!this.conn) return
    this.conn.reducers.addCoins({ amount })
  }

  getMyCoins(): number {
    if (!this.conn || !this.identity) return 0
    const p = this.conn.db.player.identity.find(this.identity)
    return p ? Number(p.coins) : 0
  }

  // ─── Game Subscription ───

  subscribeToGameData(roomId: bigint) {
    if (!this.conn) return
    this.conn.subscriptionBuilder()
      .onApplied((_ctx: SubscriptionEventContext) => {
        console.log('[SpacetimeDB] Game subscription applied for room', String(roomId))
      })
      .subscribe([
        `SELECT * FROM player_state WHERE room_id = ${roomId}`,
        `SELECT * FROM game_event WHERE room_id = ${roomId}`,
      ])
  }
}

export const spacetimeService = new SpacetimeService()
