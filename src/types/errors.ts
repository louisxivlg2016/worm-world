import { Data } from 'effect'

export class StorageError extends Data.TaggedError("StorageError")<{ readonly message: string }> {}
export class SessionError extends Data.TaggedError("SessionError")<{ readonly message: string }> {}
export class AudioError extends Data.TaggedError("AudioError")<{ readonly message: string }> {}
export class RoomError extends Data.TaggedError("RoomError")<{ readonly message: string }> {}
export class MultiplayerError extends Data.TaggedError("MultiplayerError")<{ readonly message: string }> {}
