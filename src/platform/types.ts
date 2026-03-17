export interface PlatformCapabilities {
  platformId: string
  auth: boolean
  ads: boolean
  iap: boolean
  social: boolean
  cloudData: boolean
}

export interface PlatformUser {
  id: string
  username: string
  avatar?: string
  token?: string
}

export interface VideoAdResult {
  completed: boolean
}

export interface RewardedAdResult {
  completed: boolean
  rewardType?: string
  rewardAmount?: number
}

export interface CloudSaveSlot {
  slotId: string
  metadata?: Record<string, unknown>
  updatedAt?: string
}
