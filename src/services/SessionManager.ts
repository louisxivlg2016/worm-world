import { Effect } from 'effect'
import { SessionError } from '@/types/errors'
import { StorageService } from './StorageService'

const SESSION_KEY = 'wormworld_session'

export interface SessionData {
  playerName: string
  selectedSkin: number
  coins: number
  wins: number
  gamesPlayed: number
}

const defaultSession: SessionData = {
  playerName: '',
  selectedSkin: 0,
  coins: 0,
  wins: 0,
  gamesPlayed: 0,
}

export const SessionManager = {
  load: () =>
    Effect.gen(function* () {
      const data = yield* StorageService.loadJSON<SessionData>(SESSION_KEY)
      return data ?? { ...defaultSession }
    }).pipe(
      Effect.catchAll(() => Effect.succeed({ ...defaultSession }))
    ),

  save: (session: SessionData) =>
    StorageService.saveJSON(SESSION_KEY, session).pipe(
      Effect.catchAll((e) => Effect.fail(new SessionError({ message: e.message })))
    ),

  updateCoins: (delta: number) =>
    Effect.gen(function* () {
      const session = yield* SessionManager.load()
      session.coins += delta
      yield* SessionManager.save(session)
      return session.coins
    }),

  recordGame: (won: boolean) =>
    Effect.gen(function* () {
      const session = yield* SessionManager.load()
      session.gamesPlayed++
      if (won) session.wins++
      yield* SessionManager.save(session)
      return session
    }),
}
