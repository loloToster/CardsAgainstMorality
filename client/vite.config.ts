import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/auth": {
        target: "http://localhost:3000/",
        secure: false
      },
      "/api": {
        target: "http://localhost:3000/",
        secure: false
      },
      "/socket.io": {
        target: "http://localhost:3000/",
        secure: false,
        ws: true,
        changeOrigin: true
      }
    }
  },
  plugins: [vue()]
})
