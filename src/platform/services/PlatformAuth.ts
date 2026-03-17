import { Context, Effect } from 'effect'
import type { PlatformUser } from '../types'
import type { PlatformAuthError } from '../errors'

export interface PlatformAuthService {
  signIn(): Effect.Effect<PlatformUser, PlatformAuthError>
  signOut(): Effect.Effect<void>
  getCurrentUser(): Effect.Effect<PlatformUser | null>
}

export const PlatformAuth = Context.GenericTag<PlatformAuthService>('PlatformAuth')
