import { federation } from '@module-federation/vite'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig, loadEnv } from 'vite'

const sharedDependencies = {
  vue: { singleton: true, requiredVersion: '^3.5.42', strictVersion: true },
  '@thiagoschoeffel/ts-components': { singleton: true, requiredVersion: '^0.7.9', strictVersion: true },
}

function remoteEntry(value: string | undefined, fallback: string, name: string) {
  const entry = value || fallback
  const url = new URL(entry)
  if (!['http:', 'https:'].includes(url.protocol))
    throw new Error(`${name} deve usar uma URL HTTP(S).`)
  return url.toString()
}

function configuredRemote(value: string | undefined, fallback: string, name: string, mode: string) {
  if (!value && mode !== 'development') throw new Error(`${name} é obrigatória fora do ambiente de desenvolvimento.`)
  return remoteEntry(value, fallback, name)
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
          entry: configuredRemote(env.VITE_OPERATION_REMOTE_URL, 'http://localhost:4174/remoteEntry.js', 'VITE_OPERATION_REMOTE_URL', mode),
          shareScope: 'default'
        },
        moduleCommercial: {
          type: 'module',
          name: 'moduleCommercial',
          entry: configuredRemote(env.VITE_COMMERCIAL_REMOTE_URL, 'http://localhost:4175/remoteEntry.js', 'VITE_COMMERCIAL_REMOTE_URL', mode),
          shareScope: 'default'
        },
        moduleManagement: {
          type: 'module',
          name: 'moduleManagement',
          entry: configuredRemote(env.VITE_MANAGEMENT_REMOTE_URL, 'http://localhost:4176/remoteEntry.js', 'VITE_MANAGEMENT_REMOTE_URL', mode),
          shareScope: 'default'
        },
        modulePlatform: {
          type: 'module',
          name: 'modulePlatform',
          entry: configuredRemote(env.VITE_PLATFORM_REMOTE_URL, 'http://localhost:4177/remoteEntry.js', 'VITE_PLATFORM_REMOTE_URL', mode),
          shareScope: 'default'
        }
      },
      // The host already declares the remote module in src/env.d.ts.
      // Disabled here to keep this example concise.
      dts: false,
      shared: sharedDependencies
    })
  ]
  }
})
