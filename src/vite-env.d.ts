/// <reference types="vite/client" />

declare const __BUILD_HASH__: string

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_PLATFORM_SDK: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
