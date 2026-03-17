import { Effect } from 'effect'
import { StorageError } from '@/types/errors'

let sdkDataReady: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> | null = null

export function enableSdkStorage(data: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>): void {
  sdkDataReady = data
}

let memoryFallback: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> | null = null
function getMemoryFallback() {
  if (!memoryFallback) {
    const store = new Map<string, string>()
    memoryFallback = {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => { store.set(key, value) },
      removeItem: (key) => { store.delete(key) },
    }
  }
  return memoryFallback
}

export function getStorage(): Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> {
  if (sdkDataReady) return sdkDataReady
  try { localStorage.getItem('__test'); return localStorage } catch { return getMemoryFallback() }
}

export const StorageService = {
  load: (key: string) =>
    Effect.try({
      try: () => getStorage().getItem(key),
      catch: (e) => new StorageError({ message: String(e) }),
    }),

  save: (key: string, value: string) =>
    Effect.try({
      try: () => { getStorage().setItem(key, value) },
      catch: (e) => new StorageError({ message: String(e) }),
    }),

  loadJSON: <T>(key: string) =>
    Effect.try({
      try: () => {
        const raw = getStorage().getItem(key)
        return raw ? JSON.parse(raw) as T : null
      },
      catch: (e) => new StorageError({ message: String(e) }),
    }),

  saveJSON: <T>(key: string, value: T) =>
    Effect.try({
      try: () => { getStorage().setItem(key, JSON.stringify(value)) },
      catch: (e) => new StorageError({ message: String(e) }),
    }),

  remove: (key: string) =>
    Effect.try({
      try: () => { getStorage().removeItem(key) },
      catch: (e) => new StorageError({ message: String(e) }),
    }),
}
