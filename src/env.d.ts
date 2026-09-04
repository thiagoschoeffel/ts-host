/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPERATION_REMOTE_URL?: string
  readonly VITE_COMMERCIAL_REMOTE_URL?: string
  readonly VITE_MANAGEMENT_REMOTE_URL?: string
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
    menuPage?: 'list' | 'new' | 'edit'
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
    deliveryDriverPage?: 'list' | 'new' | 'edit'
    deliveryDriverId?: string
    userPage?: 'list' | 'new' | 'edit'
    userId?: string
  }>
  export default component
}
