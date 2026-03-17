import { Effect, Layer } from 'effect'
import { PlatformAds } from '../services/PlatformAds'
import { PlatformUnsupportedError } from '../errors'

export const NoopAdsLayer = Layer.succeed(PlatformAds, {
  showBanner: () => Effect.fail(new PlatformUnsupportedError({ message: 'Ads not supported' })) as never,
  showVideoAd: () => Effect.fail(new PlatformUnsupportedError({ message: 'Ads not supported' })) as never,
  showRewardedAd: () => Effect.fail(new PlatformUnsupportedError({ message: 'Ads not supported' })) as never,
})
