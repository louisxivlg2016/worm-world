import { Effect, Layer } from 'effect'
import { PlatformAuth } from '../services/PlatformAuth'
import { PlatformUnsupportedError } from '../errors'

export const NoopAuthLayer = Layer.succeed(PlatformAuth, {
  signIn: () => Effect.fail(new PlatformUnsupportedError({ message: 'Auth not supported on this platform' })) as never,
  signOut: () => Effect.void,
  getCurrentUser: () => Effect.succeed(null),
})
