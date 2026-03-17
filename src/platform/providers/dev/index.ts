import { Effect, Layer } from 'effect'
import { PlatformAuth } from '../../services/PlatformAuth'
import { PlatformInfo } from '../../services/PlatformInfo'
import { NoopAdsLayer } from '../../noop/NoopAds'
import { NoopIAPLayer } from '../../noop/NoopIAP'
import { NoopSocialLayer } from '../../noop/NoopSocial'
import { NoopCloudDataLayer } from '../../noop/NoopCloudData'
import { NoopAudioLayer } from '../../noop/NoopAudio'
import { NoopMultiplayerLayer } from '../../noop/NoopMultiplayer'
import { supabase } from '@/lib/supabase'

const DevAuthLayer = Layer.succeed(PlatformAuth, {
  signIn: () =>
    Effect.promise(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        return { id: session.user.id, username: session.user.user_metadata?.username ?? 'Player' }
      }
      const { data, error } = await supabase.auth.signInAnonymously()
      if (error) throw error
      return { id: data.user!.id, username: data.user!.user_metadata?.username ?? 'Player' }
    }),
  signOut: () => Effect.promise(() => supabase.auth.signOut().then(() => {})),
  getCurrentUser: () =>
    Effect.promise(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null
      return { id: user.id, username: user.user_metadata?.username ?? 'Player' }
    }),
})

const InfoLayer = Layer.succeed(PlatformInfo, {
  capabilities: { platformId: 'dev', auth: true, ads: false, iap: false, social: false, cloudData: false },
})

export const DevPlatformLayer = Layer.mergeAll(
  DevAuthLayer,
  NoopAdsLayer,
  NoopIAPLayer,
  NoopSocialLayer,
  NoopCloudDataLayer,
  NoopAudioLayer,
  NoopMultiplayerLayer,
  InfoLayer,
)
