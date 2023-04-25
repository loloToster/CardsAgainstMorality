/// <reference types="vite/client" />
/// <reference types="vite-svg-loader" />

declare module "trim-canvas" {
  export default function trimCanvas(canvas: HTMLCanvasElement): void
}

interface ImportMetaEnv {
  readonly VITE_CAPTCHA_SITEKEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
