import { resolvePlatformLayer, type PlatformLayer } from './resolve'

let cachedLayer: PlatformLayer | null = null

export async function buildPlatformLayer(): Promise<PlatformLayer> {
  if (cachedLayer) return cachedLayer
  cachedLayer = await resolvePlatformLayer()
  return cachedLayer
}
