import { Effect } from 'effect'
import { RoomError } from '@/types/errors'
import { supabase } from '@/lib/supabase'
import type { GameMode } from '@/types/game'

function generateSlug(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let slug = ''
  for (let i = 0; i < 6; i++) slug += chars[Math.floor(Math.random() * chars.length)]
  return slug
}

export interface RoomInfo {
  id: string
  slug: string
  name: string
  hostId: string
  isPublic: boolean
  seed: number
  gameMode: GameMode
  maxPlayers: number
  memberCount?: number
}

export const RoomService = {
  createRoom: (name: string, isPublic: boolean, gameMode: GameMode, maxPlayers: number) =>
    Effect.gen(function* () {
      const { data: { user } } = yield* Effect.promise(() => supabase.auth.getUser())
      if (!user) return yield* Effect.fail(new RoomError({ message: 'Not authenticated' }))

      const slug = generateSlug()
      const seed = Math.floor(Math.random() * 2147483647)

      const { data: room, error } = yield* Effect.promise(() =>
        supabase.from('rooms').insert({
          name,
          slug,
          host_id: user.id,
          is_public: isPublic,
          seed,
          game_mode: gameMode,
          max_players: maxPlayers,
        }).select().single()
      )

      if (error || !room) return yield* Effect.fail(new RoomError({ message: error?.message ?? 'Failed to create room' }))

      // Auto-join the room
      yield* Effect.promise(() =>
        supabase.from('room_members').upsert({ room_id: room.id, user_id: user.id })
      )

      return { slug, seed, gameMode } as const
    }),

  joinRoom: (slug: string) =>
    Effect.gen(function* () {
      const { data: { user } } = yield* Effect.promise(() => supabase.auth.getUser())
      if (!user) return yield* Effect.fail(new RoomError({ message: 'Not authenticated' }))

      const { data: room, error } = yield* Effect.promise(() =>
        supabase.from('rooms').select('*').eq('slug', slug).single()
      )

      if (error || !room) return yield* Effect.fail(new RoomError({ message: 'Room not found' }))

      // Check capacity
      const { count } = yield* Effect.promise(() =>
        supabase.from('room_members').select('*', { count: 'exact', head: true }).eq('room_id', room.id)
      )

      if (count !== null && count >= room.max_players) {
        return yield* Effect.fail(new RoomError({ message: 'Room is full' }))
      }

      // Check not eliminated
      const { data: existing } = yield* Effect.promise(() =>
        supabase.from('room_members').select('eliminated').eq('room_id', room.id).eq('user_id', user.id).single()
      )

      if (existing?.eliminated) {
        return yield* Effect.fail(new RoomError({ message: 'You were eliminated from this room' }))
      }

      // Upsert membership
      yield* Effect.promise(() =>
        supabase.from('room_members').upsert({ room_id: room.id, user_id: user.id })
      )

      return {
        roomId: room.id,
        seed: room.seed,
        gameMode: room.game_mode as GameMode,
        maxPlayers: room.max_players,
      }
    }),

  leaveRoom: (roomId: string) =>
    Effect.gen(function* () {
      const { data: { user } } = yield* Effect.promise(() => supabase.auth.getUser())
      if (!user) return

      yield* Effect.promise(() =>
        supabase.from('room_members').delete().eq('room_id', roomId).eq('user_id', user.id)
      )
    }),

  deleteRoom: (roomId: string) =>
    Effect.gen(function* () {
      yield* Effect.promise(() => supabase.from('room_members').delete().eq('room_id', roomId))
      yield* Effect.promise(() => supabase.from('world_events').delete().eq('room_id', roomId))
      yield* Effect.promise(() => supabase.from('rooms').delete().eq('id', roomId))
    }),

  listPublicRooms: () =>
    Effect.gen(function* () {
      const { data, error } = yield* Effect.promise(() =>
        supabase.from('rooms').select('*, room_members(count)').eq('is_public', true).order('created_at', { ascending: false }).limit(20)
      )

      if (error) return yield* Effect.fail(new RoomError({ message: error.message }))

      return (data ?? []).map((r): RoomInfo => ({
        id: r.id,
        slug: r.slug,
        name: r.name,
        hostId: r.host_id,
        isPublic: r.is_public,
        seed: r.seed,
        gameMode: r.game_mode as GameMode,
        maxPlayers: r.max_players,
        memberCount: Array.isArray(r.room_members) ? r.room_members.length : 0,
      }))
    }),
}
