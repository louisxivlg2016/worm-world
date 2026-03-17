import { Effect, Layer } from 'effect'
import { PlatformSocial } from '../services/PlatformSocial'
import { PlatformUnsupportedError } from '../errors'

export const NoopSocialLayer = Layer.succeed(PlatformSocial, {
  shareScore: () => Effect.fail(new PlatformUnsupportedError({ message: 'Social not supported' })) as never,
  showLeaderboard: () => Effect.fail(new PlatformUnsupportedError({ message: 'Social not supported' })) as never,
})
