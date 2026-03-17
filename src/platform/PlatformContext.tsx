import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { Effect } from 'effect'
import { buildPlatformLayer, } from './PlatformLayer'
import type { PlatformLayer } from './resolve'
import { PlatformAuth } from './services/PlatformAuth'
import { PlatformAds } from './services/PlatformAds'
import { PlatformCloudData } from './services/PlatformCloudData'
import { PlatformMultiplayer } from './services/PlatformMultiplayer'
import { PlatformInfo } from './services/PlatformInfo'
import type { PlatformCapabilities, PlatformUser } from './types'

interface PlatformContextValue {
  loading: boolean
  capabilities: PlatformCapabilities | null
  runEffect: <A, E>(effect: Effect.Effect<A, E, never>) => Promise<A>
}

const PlatformCtx = createContext<PlatformContextValue>({
  loading: true,
  capabilities: null,
  runEffect: () => Promise.reject('Platform not ready'),
})

export function PlatformProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [capabilities, setCapabilities] = useState<PlatformCapabilities | null>(null)
  const [layer, setLayer] = useState<PlatformLayer | null>(null)

  useEffect(() => {
    buildPlatformLayer().then((l) => {
      setLayer(l)

      // Extract capabilities from the info service
      const program = Effect.gen(function* () {
        const info = yield* PlatformInfo
        return info.capabilities
      })

      Effect.runPromise(Effect.provide(program, l)).then((caps) => {
        setCapabilities(caps)
        setLoading(false)
      })
    })
  }, [])

  const runEffect = async <A, E>(effect: Effect.Effect<A, E, never>): Promise<A> => {
    if (!layer) throw new Error('Platform not ready')
    return Effect.runPromise(Effect.provide(effect, layer) as Effect.Effect<A, never, never>)
  }

  return (
    <PlatformCtx.Provider value={{ loading, capabilities, runEffect }}>
      {children}
    </PlatformCtx.Provider>
  )
}

export function usePlatformContext() {
  return useContext(PlatformCtx)
}
