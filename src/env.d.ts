/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_OIDC_AUTHORITY?: string
  readonly VITE_OIDC_CLIENT_ID?: string
}

interface ImportMetaEnv {
  readonly VITE_OPERATION_REMOTE_URL?: string
  readonly VITE_COMMERCIAL_REMOTE_URL?: string
  readonly VITE_MANAGEMENT_REMOTE_URL?: string
  readonly VITE_LABEL_PRINT_MODE?: 'auto' | 'browser' | 'zebra'
  readonly VITE_ZEBRA_BROWSER_PRINT_SCRIPT?: string
  readonly VITE_ZEBRA_DPI?: '203' | '300'
}

interface ZebraBrowserPrintDevice {
  send(data: string, success: () => void, error: (reason: unknown) => void): void
}

interface ZebraBrowserPrintApi {
  getDefaultDevice(type: 'printer', success: (device?: ZebraBrowserPrintDevice) => void, error: (reason: unknown) => void): void
}

interface Window {
  BrowserPrint?: ZebraBrowserPrintApi
  tsLabelPrinter?: {
    mode: 'auto' | 'browser' | 'zebra'
    dpi: 203 | 300
    loadBrowserPrint(): Promise<void>
  }
}

declare module 'moduleOperation/OperationPage' {
  import type { DefineComponent } from 'vue'
  type OperationSection = 'hoje' | 'atendimento' | 'pedidos' | 'producao' | 'embalagem' | 'entregas'
  type OrderPage = 'list' | 'new' | 'detail' | 'edit'
  const component: DefineComponent<{
    section?: OperationSection
    orderPage?: OrderPage
    orderId?: string
  }>
  export default component
}

declare module 'moduleCommercial/CommercialPage' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{
    section?: 'clientes' | 'cardapios' | 'planos' | 'financeiro'
    customerPage?: 'list' | 'new' | 'detail' | 'edit'
    customerId?: string
    menuPage?: 'list' | 'planning' | 'new' | 'edit'
    menuDate?: string
    planPage?: 'list' | 'new' | 'edit' | 'new-acquisition' | 'new-movement'
    planId?: string
    financialPage?: 'list' | 'charge-detail' | 'new-payment'
    chargeId?: string
  }>
  export default component
}

declare module 'moduleManagement/ManagementPage' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{
    section?: 'produziveis' | 'catalogo' | 'congelados' | 'entregadores' | 'usuarios'
    produciblePage?: 'list' | 'new' | 'detail' | 'edit' | 'new-composition-version'
    producibleId?: string
    catalogPage?: 'list' | 'new' | 'detail' | 'edit'
    offerId?: string
    frozenPage?: 'list' | 'entry' | 'lot'
    frozenLotId?: string
    apiRequest?: (path: string, init?: RequestInit) => Promise<Response>
    deliveryDriverPage?: 'list' | 'new' | 'edit'
    deliveryDriverId?: string
    userPage?: 'list' | 'new' | 'edit'
    userId?: string
  }>
  export default component
}
