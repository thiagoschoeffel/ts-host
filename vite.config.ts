import { federation } from '@module-federation/vite'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    vue(),
    federation({
      name: 'host',
      dev: {
        remoteHmr: true
      },
      remotes: {
        moduleOperation: {
          type: 'module',
          name: 'moduleOperation',
          entry: 'http://localhost:4174/remoteEntry.js',
          shareScope: 'default'
        }
      },
      // The host already declares the remote module in src/env.d.ts.
      // Disabled here to keep this example concise.
      dts: false,
      shared: ['vue']
    })
  ]
})
