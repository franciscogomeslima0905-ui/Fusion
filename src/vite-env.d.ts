/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Chave da Google Maps JavaScript API (defina no arquivo .env — nunca no código). */
  readonly VITE_GOOGLE_MAPS_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
