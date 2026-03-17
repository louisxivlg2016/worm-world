import { Effect, Layer } from 'effect'
import { PlatformAudio } from '../services/PlatformAudio'

export const NoopAudioLayer = Layer.succeed(PlatformAudio, {
  onGameplayStart: () => Effect.void,
  onGameplayStop: () => Effect.void,
})
