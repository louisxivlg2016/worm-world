import { Effect, Layer } from 'effect'
import { PlatformIAP } from '../services/PlatformIAP'
import { PlatformUnsupportedError } from '../errors'

export const NoopIAPLayer = Layer.succeed(PlatformIAP, {
  getProducts: () => Effect.fail(new PlatformUnsupportedError({ message: 'IAP not supported' })) as never,
  purchase: () => Effect.fail(new PlatformUnsupportedError({ message: 'IAP not supported' })) as never,
})
