import { Layer } from 'effect'
import { PlatformInfo } from '../../services/PlatformInfo'
import { NoopAdsLayer } from '../../noop/NoopAds'
import { NoopIAPLayer } from '../../noop/NoopIAP'
import { NoopSocialLayer } from '../../noop/NoopSocial'
import { NoopCloudDataLayer } from '../../noop/NoopCloudData'
import { NoopAudioLayer } from '../../noop/NoopAudio'
import { NoopMultiplayerLayer } from '../../noop/NoopMultiplayer'
import { NoopAuthLayer } from '../../noop/NoopAuth'

// TODO: integrate CrazyGames SDK v3
const InfoLayer = Layer.succeed(PlatformInfo, {
  capabilities: { platformId: 'crazygames', auth: false, ads: false, iap: false, social: false, cloudData: false },
})

export const CrazyGamesPlatformLayer = Layer.mergeAll(
  NoopAuthLayer,
  NoopAdsLayer,
  NoopIAPLayer,
  NoopSocialLayer,
  NoopCloudDataLayer,
  NoopAudioLayer,
  NoopMultiplayerLayer,
  InfoLayer,
)
