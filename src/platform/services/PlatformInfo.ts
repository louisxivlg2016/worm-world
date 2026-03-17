import { Context } from 'effect'
import type { PlatformCapabilities } from '../types'

export interface PlatformInfoService {
  capabilities: PlatformCapabilities
}

export const PlatformInfo = Context.GenericTag<PlatformInfoService>('PlatformInfo')
