import { Layer } from 'effect'
import { PlatformInfo } from './services/PlatformInfo'
import { NoopAuthLayer } from './noop/NoopAuth'
import { NoopAdsLayer } from './noop/NoopAds'
import { NoopIAPLayer } from './noop/NoopIAP'
import { NoopSocialLayer } from './noop/NoopSocial'
import { NoopCloudDataLayer } from './noop/NoopCloudData'
import { NoopAudioLayer } from './noop/NoopAudio'
import { NoopMultiplayerLayer } from './noop/NoopMultiplayer'

const DefaultInfoLayer = Layer.succeed(PlatformInfo, {
  capabilities: { platformId: 'web', auth: false, ads: false, iap: false, social: false, cloudData: false },
})

const DefaultPlatformLayer = Layer.mergeAll(
  NoopAuthLayer,
  NoopAdsLayer,
  NoopIAPLayer,
  NoopSocialLayer,
  NoopCloudDataLayer,
  NoopAudioLayer,
  NoopMultiplayerLayer,
  DefaultInfoLayer,
)

export type PlatformLayer = typeof DefaultPlatformLayer

export async function resolvePlatformLayer(): Promise<PlatformLayer> {
  const host = typeof window !== 'undefined' ? window.location?.hostname : ''

  if (host?.includes('crazygames')) {
    const { CrazyGamesPlatformLayer } = await import('./providers/crazygames/index')
    return CrazyGamesPlatformLayer as PlatformLayer
  }

  if (host?.includes('poki')) {
    const { PokiPlatformLayer } = await import('./providers/poki/index')
    return PokiPlatformLayer as PlatformLayer
  }

  return DefaultPlatformLayer
}
