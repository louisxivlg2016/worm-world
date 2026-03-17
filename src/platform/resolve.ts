import type { Layer } from 'effect'
import type { PlatformAuthService } from './services/PlatformAuth'
import type { PlatformAdsService } from './services/PlatformAds'
import type { PlatformIAPService } from './services/PlatformIAP'
import type { PlatformSocialService } from './services/PlatformSocial'
import type { PlatformCloudDataService } from './services/PlatformCloudData'
import type { PlatformAudioService } from './services/PlatformAudio'
import type { PlatformMultiplayerService } from './services/PlatformMultiplayer'
import type { PlatformInfoService } from './services/PlatformInfo'

export type PlatformLayer = Layer.Layer<
  PlatformAuthService | PlatformAdsService | PlatformIAPService |
  PlatformSocialService | PlatformCloudDataService | PlatformAudioService |
  PlatformMultiplayerService | PlatformInfoService
>

export async function resolvePlatformLayer(): Promise<PlatformLayer> {
  const platform = import.meta.env.VITE_PLATFORM_SDK ?? 'dev'

  switch (platform) {
    case 'crazygames': {
      const { CrazyGamesPlatformLayer } = await import('./providers/crazygames/index')
      return CrazyGamesPlatformLayer as PlatformLayer
    }
    case 'poki': {
      const { PokiPlatformLayer } = await import('./providers/poki/index')
      return PokiPlatformLayer as PlatformLayer
    }
    default: {
      const { DevPlatformLayer } = await import('./providers/dev/index')
      return DevPlatformLayer as PlatformLayer
    }
  }
}
