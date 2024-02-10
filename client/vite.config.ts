import { resolve } from "path"
import { ProxyOptions, defineConfig, UserConfigFn, UserConfig } from "vite"

import vue from "@vitejs/plugin-vue"
import svgLoader from "vite-svg-loader"

const devServer: ProxyOptions = {
  target: "http://localhost:3000/",
  secure: false
}

const configFn: UserConfigFn = () => {
  return defineConfig({
    resolve: {
      alias: {
        "@": resolve(__dirname, "./src"),
        "@backend": resolve(__dirname, "../server/src")
      }
    },
    server: {
      proxy: {
        "/auth": devServer,
        "/api": devServer,
        "/socket.io": {
          ...devServer,
          ws: true,
          changeOrigin: true
        }
      }
    },
    plugins: [vue(), svgLoader()]
  }) as UserConfig
}

export default configFn
