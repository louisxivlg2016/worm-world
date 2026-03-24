/**
 * Audio module — wraps expo-av Audio.Sound with sound pooling.
 * All calls are web-safe (try/catch).
 */

type AudioModule = typeof import("expo-av");

let AV: AudioModule | null = null;
let avLoaded = false;

async function loadAV(): Promise<AudioModule | null> {
  if (avLoaded) return AV;
  avLoaded = true;
  try {
    AV = await import("expo-av");
  } catch {
    AV = null;
  }
  return AV;
}

// Sound pool: multiple instances per name for concurrent playback
const soundPool = new Map<string, InstanceType<AudioModule["Audio"]["Sound"]>[]>();
const POOL_SIZE = 3;

/**
 * Play a short sound effect by asset name (e.g. "boost", "coin", "death").
 * Uses a pool so the same sound can overlap.
 */
export async function playSound(name: string) {
  try {
    const av = await loadAV();
    if (!av) return;

    let pool = soundPool.get(name);
    if (!pool) {
      pool = [];
      soundPool.set(name, pool);
    }

    // Find an idle sound in the pool
    for (const s of pool) {
      try {
        const status = await s.getStatusAsync();
        if (status.isLoaded && !status.isPlaying) {
          await s.setPositionAsync(0);
          await s.playAsync();
          return;
        }
      } catch {}
    }

    // Pool not full — create a new sound
    if (pool.length < POOL_SIZE) {
      const { sound } = await av.Audio.Sound.createAsync(
        { uri: `/sounds/${name}.mp3` },
        { shouldPlay: true },
      );
      pool.push(sound);
      return;
    }

    // Pool full, reuse first
    const first = pool[0];
    try {
      await first.setPositionAsync(0);
      await first.playAsync();
    } catch {}
  } catch {}
}

// Background music
let musicInstance: InstanceType<AudioModule["Audio"]["Sound"]> | null = null;

/**
 * Play looping background music from a URI.
 */
export async function playMusic(uri: string) {
  try {
    await stopMusic();
    const av = await loadAV();
    if (!av) return;
    const { sound } = await av.Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true, isLooping: true, volume: 0.3 },
    );
    musicInstance = sound;
  } catch {}
}

/**
 * Stop and unload background music.
 */
export async function stopMusic() {
  try {
    if (musicInstance) {
      await musicInstance.stopAsync();
      await musicInstance.unloadAsync();
      musicInstance = null;
    }
  } catch {}
}
