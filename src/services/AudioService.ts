import { Effect } from 'effect'
import { AudioError } from '@/types/errors'

const audioPool = new Map<string, HTMLAudioElement[]>()
let muted = false

function getAudio(src: string, poolSize = 3): HTMLAudioElement {
  if (!audioPool.has(src)) {
    const pool: HTMLAudioElement[] = []
    for (let i = 0; i < poolSize; i++) {
      const audio = new Audio(src)
      audio.preload = 'auto'
      pool.push(audio)
    }
    audioPool.set(src, pool)
  }
  const pool = audioPool.get(src)!
  const available = pool.find(a => a.paused || a.ended) ?? pool[0]
  return available
}

export const AudioService = {
  play: (src: string, volume = 1) =>
    Effect.try({
      try: () => {
        if (muted) return
        const audio = getAudio(src)
        audio.volume = volume
        audio.currentTime = 0
        audio.play().catch(() => {})
      },
      catch: (e) => new AudioError({ message: String(e) }),
    }),

  setMuted: (m: boolean) =>
    Effect.sync(() => { muted = m }),

  isMuted: () =>
    Effect.sync(() => muted),
}
