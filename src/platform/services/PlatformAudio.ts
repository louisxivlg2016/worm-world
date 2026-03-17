import { Context, Effect } from 'effect'
import type { PlatformUnsupportedError } from '../errors'

export interface PlatformAudioService {
  onGameplayStart(): Effect.Effect<void, PlatformUnsupportedError>
  onGameplayStop(): Effect.Effect<void, PlatformUnsupportedError>
}

export const PlatformAudio = Context.GenericTag<PlatformAudioService>('PlatformAudio')
