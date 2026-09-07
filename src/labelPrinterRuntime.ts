export type LabelPrintMode = 'auto' | 'browser' | 'zebra'
export type ZebraPrinterDpi = 203 | 300

function configuredMode(): LabelPrintMode {
  const value = import.meta.env.VITE_LABEL_PRINT_MODE
  return value === 'browser' || value === 'zebra' ? value : 'auto'
}

export function installLabelPrinterRuntime() {
  const mode = configuredMode()
  const dpi: ZebraPrinterDpi = import.meta.env.VITE_ZEBRA_DPI === '300' ? 300 : 203
  const scriptUrl = import.meta.env.VITE_ZEBRA_BROWSER_PRINT_SCRIPT
  let scriptLoad: Promise<void> | undefined

  function removeFailedScript() {
    document.querySelector('script[data-zebra-browser-print="true"]')?.remove()
  }

  window.tsLabelPrinter = {
    mode,
    dpi,
    async loadBrowserPrint() {
      if (mode === 'browser' || window.BrowserPrint) return
      if (!scriptUrl) {
        if (mode === 'zebra')
          throw new Error('Configure VITE_ZEBRA_BROWSER_PRINT_SCRIPT no host para usar a impressão direta.')
        return
      }

      scriptLoad ??= new Promise<void>((resolve, reject) => {
        const timeout = window.setTimeout(() => reject(new Error('O carregamento da biblioteca Zebra Browser Print excedeu o tempo limite.')), 10_000)
        const script = document.createElement('script')
        script.src = scriptUrl
        script.async = true
        script.dataset.zebraBrowserPrint = 'true'
        script.addEventListener('load', () => {
          window.clearTimeout(timeout)
          window.BrowserPrint ? resolve() : reject(new Error('A biblioteca Zebra Browser Print foi carregada, mas não ficou disponível.'))
        }, { once: true })
        script.addEventListener('error', () => {
          window.clearTimeout(timeout)
          reject(new Error('Não foi possível carregar a biblioteca Zebra Browser Print.'))
        }, { once: true })
        document.head.append(script)
      })
      try {
        await scriptLoad
      }
      catch (error) {
        scriptLoad = undefined
        removeFailedScript()
        throw error
      }
    }
  }

  // Inicia o carregamento cedo, mas deixa cada fluxo decidir entre falha e fallback.
  void window.tsLabelPrinter.loadBrowserPrint().catch(() => undefined)
}
