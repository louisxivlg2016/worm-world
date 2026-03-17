import { Effect, Layer } from 'effect'
import { PlatformMultiplayer } from '../services/PlatformMultiplayer'

export const NoopMultiplayerLayer = Layer.succeed(PlatformMultiplayer, {
  showInviteButton: () => Effect.succeed(''),
  getInviteParam: () => Effect.succeed(null),
  isInstantMultiplayer: () => Effect.succeed(false),
  updateRoom: () => Effect.void,
  leftRoom: () => Effect.void,
})
