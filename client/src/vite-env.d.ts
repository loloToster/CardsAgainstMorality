/// <reference types="vite/client" />
/// <reference types="vite-svg-loader" />

interface ImportMetaEnv {
  readonly VITE_CAPTCHA_SITEKEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
