import { Context, Effect } from 'effect'
import type { PlatformSocialError } from '../errors'

export interface PlatformSocialService {
  shareScore(score: number): Effect.Effect<void, PlatformSocialError>
  showLeaderboard(): Effect.Effect<void, PlatformSocialError>
}

export const PlatformSocial = Context.GenericTag<PlatformSocialService>('PlatformSocial')
