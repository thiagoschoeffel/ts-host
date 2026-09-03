import type { Config } from 'tailwindcss'

export default {
  // The host owns the canonical utility cascade. Remote styles may be loaded
  // in any order without overriding responsive variants from another module.
  important: 'body'
} satisfies Config
