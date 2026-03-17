import { Context, Effect } from 'effect'
import type { PlatformIAPError } from '../errors'

export interface PlatformIAPService {
  getProducts(): Effect.Effect<{ id: string; price: string }[], PlatformIAPError>
  purchase(productId: string): Effect.Effect<boolean, PlatformIAPError>
}

export const PlatformIAP = Context.GenericTag<PlatformIAPService>('PlatformIAP')
