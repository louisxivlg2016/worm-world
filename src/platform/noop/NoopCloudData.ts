import { Effect, Layer } from 'effect'
import { PlatformCloudData } from '../services/PlatformCloudData'
import { PlatformUnsupportedError } from '../errors'

export const NoopCloudDataLayer = Layer.succeed(PlatformCloudData, {
  save: () => Effect.fail(new PlatformUnsupportedError({ message: 'CloudData not supported' })) as never,
  load: () => Effect.fail(new PlatformUnsupportedError({ message: 'CloudData not supported' })) as never,
  listSlots: () => Effect.fail(new PlatformUnsupportedError({ message: 'CloudData not supported' })) as never,
  deleteSlot: () => Effect.fail(new PlatformUnsupportedError({ message: 'CloudData not supported' })) as never,
})
