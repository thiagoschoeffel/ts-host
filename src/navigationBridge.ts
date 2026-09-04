import type { Router } from 'vue-router'

interface NavigationDetail {
  to: string
  replace?: boolean
}

export function installNavigationBridge(router: Router) {
  window.addEventListener('ts:navigate', (event) => {
    const detail = (event as CustomEvent<NavigationDetail>).detail
    if (!detail?.to.startsWith('/')) return
    event.preventDefault()
    void (detail.replace ? router.replace(detail.to) : router.push(detail.to))
  })

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const target = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null
    if (!target || target.target || target.hasAttribute('download')) return
    const url = new URL(target.href, window.location.href)
    if (url.origin !== window.location.origin) return
    event.preventDefault()
    void router.push(`${url.pathname}${url.search}${url.hash}`)
  })
}
