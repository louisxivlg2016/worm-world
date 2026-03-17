import { Context, Effect } from 'effect'
import type { PlatformUnsupportedError } from '../errors'

export interface PlatformMultiplayerService {
  showInviteButton(roomSlug: string): Effect.Effect<string, PlatformUnsupportedError>
  getInviteParam(key: string): Effect.Effect<string | null>
  isInstantMultiplayer(): Effect.Effect<boolean>
  updateRoom(roomSlug: string): Effect.Effect<void, PlatformUnsupportedError>
  leftRoom(): Effect.Effect<void, PlatformUnsupportedError>
}

export const PlatformMultiplayer = Context.GenericTag<PlatformMultiplayerService>('PlatformMultiplayer')
