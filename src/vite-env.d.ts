/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_STORAGE_PROVIDER?: string
  readonly VITE_STORAGE_BUCKET?: string
  readonly VITE_STORAGE_CDN_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}