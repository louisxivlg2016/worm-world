import { Data } from 'effect'

export class PlatformAuthError extends Data.TaggedError("PlatformAuthError")<{ readonly message: string }> {}
export class PlatformAdsError extends Data.TaggedError("PlatformAdsError")<{ readonly message: string }> {}
export class PlatformIAPError extends Data.TaggedError("PlatformIAPError")<{ readonly message: string }> {}
export class PlatformSocialError extends Data.TaggedError("PlatformSocialError")<{ readonly message: string }> {}
export class PlatformCloudDataError extends Data.TaggedError("PlatformCloudDataError")<{ readonly message: string }> {}
export class PlatformUnsupportedError extends Data.TaggedError("PlatformUnsupportedError")<{ readonly message: string }> {}
