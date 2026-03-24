import { Context, Effect } from 'effect'

export interface PlatformMultiplayerService {
  showInviteButton: () => Effect.Effect<string>
  getInviteParam: () => Effect.Effect<string | null>
  isInstantMultiplayer: () => Effect.Effect<boolean>
  updateRoom: () => Effect.Effect<void>
  leftRoom: () => Effect.Effect<void>
}

export const PlatformMultiplayer = Context.GenericTag<PlatformMultiplayerService>('PlatformMultiplayer')
