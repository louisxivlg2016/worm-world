import { Context, Effect } from 'effect'
import type { VideoAdResult, RewardedAdResult } from '../types'
import type { PlatformAdsError } from '../errors'

export interface PlatformAdsService {
  showBanner(config?: { position?: string }): Effect.Effect<void, PlatformAdsError>
  showVideoAd(): Effect.Effect<VideoAdResult, PlatformAdsError>
  showRewardedAd(): Effect.Effect<RewardedAdResult, PlatformAdsError>
}

export const PlatformAds = Context.GenericTag<PlatformAdsService>('PlatformAds')
