import { Context, Effect } from 'effect'
import type { CloudSaveSlot } from '../types'
import type { PlatformCloudDataError } from '../errors'

export interface PlatformCloudDataService {
  save(slotId: string, data: string, metadata?: Record<string, unknown>): Effect.Effect<void, PlatformCloudDataError>
  load(slotId: string): Effect.Effect<string | null, PlatformCloudDataError>
  listSlots(): Effect.Effect<CloudSaveSlot[], PlatformCloudDataError>
  deleteSlot(slotId: string): Effect.Effect<void, PlatformCloudDataError>
}

export const PlatformCloudData = Context.GenericTag<PlatformCloudDataService>('PlatformCloudData')
