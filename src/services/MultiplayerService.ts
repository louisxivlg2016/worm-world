import { joinRoom as trysteroJoinRoom, selfId } from 'trystero/supabase'
import { supabase } from '@/lib/supabase'
import type { PresenceData, MotionDelta, GameEvent, Worm, WormSkin } from '@/types/game'

export { selfId }

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// Adaptive tick rates (ms)
const TICK_ACTIVE = 1000 / 12   // 12 Hz
const TICK_IDLE = 1000 / 4      // 4 Hz
const TICK_HIDDEN = 1000         // 1 Hz

type ActionSend<T> = (data: T, targetPeers?: string[]) => void
type ActionReceive<T> = (cb: (data: T, peerId: string) => void) => void

interface TrysteroRoom {
  leave: () => void
  getPeers: () => string[]
  onPeerJoin: (cb: (peerId: string) => void) => void
  onPeerLeave: (cb: (peerId: string) => void) => void
  makeAction: <T>(name: string) => [ActionSend<T>, ActionReceive<T>]
}

export class MultiplayerService {
  private room: TrysteroRoom | null = null
  private roomSlug: string | null = null
  private roomId: string | null = null
  private userId: string | null = null

  // P2P actions
  private sendPresence: ActionSend<PresenceData> | null = null
  private sendProfile: ActionSend<Partial<PresenceData>> | null = null
  private sendMotion: ActionSend<MotionDelta> | null = null
  private sendEvent: ActionSend<GameEvent> | null = null

  // Callbacks
  public onPresence: ((data: PresenceData, peerId: string) => void) | null = null
  public onProfile: ((data: Partial<PresenceData>, peerId: string) => void) | null = null
  public onMotion: ((data: MotionDelta, peerId: string) => void) | null = null
  public onGameEvent: ((event: GameEvent, peerId: string) => void) | null = null
  public onPeerJoin: ((peerId: string) => void) | null = null
  public onPeerLeave: ((peerId: string) => void) | null = null

  // State
  private tickInterval: ReturnType<typeof setInterval> | null = null
  private healthCheckInterval: ReturnType<typeof setInterval> | null = null
  private eventSeq = 0
  private peerLastSeq = new Map<string, number>()
  _peersSeen = new Set<string>()
  private pendingJoins: string[] = []
  private presenceCallback: (() => PresenceData) | null = null

  async setupRoom(slug: string, roomId: string, userId: string): Promise<void> {
    this.roomSlug = slug
    this.roomId = roomId
    this.userId = userId

    this.room = trysteroJoinRoom(
      { appId: SUPABASE_URL, supabaseKey: SUPABASE_KEY, password: SUPABASE_KEY, _client: supabase } as Parameters<typeof trysteroJoinRoom>[0],
      `wormworld-${slug}`
    ) as unknown as TrysteroRoom

    // Create P2P actions
    const [sendP, onP] = this.room.makeAction<PresenceData>('p')
    const [sendJ, onJ] = this.room.makeAction<Partial<PresenceData>>('j')
    const [sendM, onM] = this.room.makeAction<MotionDelta>('m')
    const [sendE, onE] = this.room.makeAction<GameEvent>('e')

    this.sendPresence = sendP
    this.sendProfile = sendJ
    this.sendMotion = sendM
    this.sendEvent = sendE

    onP((data, peerId) => this.onPresence?.(data, peerId))
    onJ((data, peerId) => this.onProfile?.(data, peerId))
    onM((data, peerId) => this.onMotion?.(data, peerId))
    onE((event, peerId) => {
      // Dedup by sequence number
      const lastSeq = this.peerLastSeq.get(peerId) ?? -1
      if (event.seq <= lastSeq) return
      this.peerLastSeq.set(peerId, event.seq)
      this.onGameEvent?.(event, peerId)
    })

    // Peer join handshake
    this.room.onPeerJoin((peerId) => {
      this._peersSeen.add(peerId)

      if (this.presenceCallback) {
        // Immediately send full presence
        const data = this.presenceCallback()
        this.sendPresence?.(data, [peerId])
        // Delayed re-send at 500ms for data channels that weren't ready
        setTimeout(() => this.sendPresence?.(data, [peerId]), 500)
      } else {
        this.pendingJoins.push(peerId)
      }

      this.onPeerJoin?.(peerId)
    })

    this.room.onPeerLeave((peerId) => {
      this.peerLastSeq.delete(peerId)
      this.onPeerLeave?.(peerId)
    })

    // Start health check
    this.startHealthCheck()
  }

  startPresenceBroadcast(getPresence: () => PresenceData): void {
    this.presenceCallback = getPresence

    // Flush pending joins
    for (const peerId of this.pendingJoins) {
      const data = getPresence()
      this.sendPresence?.(data, [peerId])
      setTimeout(() => this.sendPresence?.(data, [peerId]), 500)
    }
    this.pendingJoins = []

    // Delayed re-broadcasts for late data channels
    const data = getPresence()
    setTimeout(() => this.sendPresence?.(data), 1000)
    setTimeout(() => this.sendPresence?.(data), 3000)
    setTimeout(() => this.sendPresence?.(data), 5000)

    // Start adaptive tick
    this.setTickRate(TICK_ACTIVE)

    // Visibility change handler
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.setTickRate(TICK_HIDDEN)
      } else {
        this.setTickRate(TICK_ACTIVE)
      }
    })
  }

  private setTickRate(ms: number): void {
    if (this.tickInterval) clearInterval(this.tickInterval)
    this.tickInterval = setInterval(() => {
      if (!this.presenceCallback) return
      const data = this.presenceCallback()
      this.sendMotion?.({
        x: data.x,
        y: data.y,
        vx: Math.cos(data.angle) * (data.boosting ? 3.8 : 2.0),
        vy: Math.sin(data.angle) * (data.boosting ? 3.8 : 2.0),
        facing: data.angle,
        health: data.health,
      })
    }, ms)
  }

  broadcastEvent(event: Omit<GameEvent, 'seq'>): void {
    this.eventSeq++
    this.sendEvent?.({ ...event, seq: this.eventSeq })
  }

  broadcastPresence(): void {
    if (this.presenceCallback) {
      this.sendPresence?.(this.presenceCallback())
    }
  }

  private mismatchStreak = 0

  private startHealthCheck(): void {
    this.healthCheckInterval = setInterval(async () => {
      if (!this.roomId) return

      const { count } = await supabase
        .from('room_members')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', this.roomId)

      const p2pCount = this.room?.getPeers().length ?? 0
      const dbCount = (count ?? 0) - 1 // exclude self

      if (dbCount > 0 && p2pCount !== dbCount) {
        this.mismatchStreak++
        if (this.mismatchStreak === 1) {
          this.broadcastPresence()
        }
        if (this.mismatchStreak >= 3) {
          // Rejoin room
          this.mismatchStreak = 0
          await this.rejoin()
        }
      } else {
        this.mismatchStreak = 0
      }
    }, 5000)
  }

  private async rejoin(): Promise<void> {
    if (!this.roomSlug || !this.roomId || !this.userId) return
    this.leave()
    await this.setupRoom(this.roomSlug, this.roomId, this.userId)
    if (this.presenceCallback) {
      this.startPresenceBroadcast(this.presenceCallback)
    }
  }

  async persistWin(): Promise<void> {
    if (!this.userId) return
    await supabase.rpc('increment_wins', { p_user_id: this.userId })
  }

  async markEliminated(): Promise<void> {
    if (!this.roomId || !this.userId) return
    await supabase
      .from('room_members')
      .update({ eliminated: true })
      .eq('room_id', this.roomId)
      .eq('user_id', this.userId)
  }

  async deleteRoom(): Promise<void> {
    if (!this.roomId) return
    await supabase.from('room_members').delete().eq('room_id', this.roomId)
    await supabase.from('world_events').delete().eq('room_id', this.roomId)
    await supabase.from('rooms').delete().eq('id', this.roomId)
  }

  leave(): void {
    if (this.tickInterval) clearInterval(this.tickInterval)
    if (this.healthCheckInterval) clearInterval(this.healthCheckInterval)
    this.room?.leave()
    this.room = null
    this.peerLastSeq.clear()
    this._peersSeen.clear()
    this.mismatchStreak = 0
  }

  // Reconnection
  setupReconnection(): void {
    window.addEventListener('online', () => {
      if (this.roomSlug && this.roomId && this.userId) {
        this.rejoin()
      }
    })
  }
}
