import { federation } from '@module-federation/vite'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig, loadEnv } from 'vite'

function remoteEntry(value: string | undefined, fallback: string, name: string) {
  const entry = value || fallback
  const url = new URL(entry)
  if (!['http:', 'https:'].includes(url.protocol))
    throw new Error(`${name} deve usar uma URL HTTP(S).`)
  return url.toString()
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', 'VITE_')
  return {
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
          entry: remoteEntry(env.VITE_OPERATION_REMOTE_URL, 'http://localhost:4174/remoteEntry.js', 'VITE_OPERATION_REMOTE_URL'),
          shareScope: 'default'
        },
        moduleCommercial: {
          type: 'module',
          name: 'moduleCommercial',
          entry: remoteEntry(env.VITE_COMMERCIAL_REMOTE_URL, 'http://localhost:4175/remoteEntry.js', 'VITE_COMMERCIAL_REMOTE_URL'),
          shareScope: 'default'
        },
        moduleManagement: {
          type: 'module',
          name: 'moduleManagement',
          entry: remoteEntry(env.VITE_MANAGEMENT_REMOTE_URL, 'http://localhost:4176/remoteEntry.js', 'VITE_MANAGEMENT_REMOTE_URL'),
          shareScope: 'default'
        }
      },
      // The host already declares the remote module in src/env.d.ts.
      // Disabled here to keep this example concise.
      dts: false,
      shared: ['vue']
    })
  ]
  }
})
