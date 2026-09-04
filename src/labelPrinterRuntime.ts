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
        const script = document.createElement('script')
        script.src = scriptUrl
        script.async = true
        script.dataset.zebraBrowserPrint = 'true'
        script.addEventListener('load', () => window.BrowserPrint
          ? resolve()
          : reject(new Error('A biblioteca Zebra Browser Print foi carregada, mas não ficou disponível.')), { once: true })
        script.addEventListener('error', () => reject(new Error('Não foi possível carregar a biblioteca Zebra Browser Print.')), { once: true })
        document.head.append(script)
      })
      await scriptLoad
    }
  }

  // Inicia o carregamento cedo, mas deixa cada fluxo decidir entre falha e fallback.
  void window.tsLabelPrinter.loadBrowserPrint().catch(() => undefined)
}
