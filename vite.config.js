import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import webExtension from 'vite-plugin-web-extension'

export default defineConfig({
  plugins: [
    tailwindcss(),
    webExtension()
  ]
})
