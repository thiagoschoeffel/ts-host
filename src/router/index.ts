import { shallowRef } from 'vue'
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

export const remoteLoadError = shallowRef<Error>()

const OperationPage = () => import('moduleOperation/OperationPage')
const CommercialPage = () => import('moduleCommercial/CommercialPage')
const ManagementPage = () => import('moduleManagement/ManagementPage')

const operationRoutes: RouteRecordRaw[] = [
  { path: 'hoje', component: OperationPage, props: { section: 'hoje' }, meta: { label: 'Hoje' } },
  { path: 'atendimento', component: OperationPage, props: { section: 'atendimento' }, meta: { label: 'Atendimento' } },
  {
    path: 'pedidos',
    component: OperationPage,
    props: { section: 'pedidos', orderPage: 'list' },
    meta: { label: 'Pedidos' }
  },
  {
    path: 'pedidos/novo',
    component: OperationPage,
    props: { section: 'pedidos', orderPage: 'new' },
    meta: {
      label: 'Novo pedido',
      parentLabel: 'Pedidos',
      parentHref: '/operacoes/pedidos'
    }
  },
  {
    path: 'pedidos/:id/editar',
    component: OperationPage,
    props: (route) => ({
      section: 'pedidos',
      orderPage: 'edit',
      orderId: String(route.params.id)
    }),
    meta: {
      label: 'Editar pedido',
      parentLabel: 'Pedidos',
      parentHref: '/operacoes/pedidos'
    }
  },
  {
    path: 'pedidos/:id',
    component: OperationPage,
    props: (route) => ({
      section: 'pedidos',
      orderPage: 'detail',
      orderId: String(route.params.id)
    }),
    meta: {
      label: 'Pedido',
      parentLabel: 'Pedidos',
      parentHref: '/operacoes/pedidos'
    }
  },
  { path: 'producao', component: OperationPage, props: { section: 'producao' }, meta: { label: 'Produção' } },
  { path: 'embalagem', component: OperationPage, props: { section: 'embalagem' }, meta: { label: 'Embalagem' } },
  { path: 'entregas', component: OperationPage, props: { section: 'entregas' }, meta: { label: 'Entregas' } }
]

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/operacoes/hoje' },
    {
      path: '/operacoes',
      redirect: '/operacoes/hoje',
      children: operationRoutes,
      meta: { sectionLabel: 'Operações' }
    },
    {
      path: '/cardapios',
      component: CommercialPage,
      props: { section: 'cardapios', menuPage: 'list' },
      meta: { sectionLabel: 'Comercial', label: 'Cardápios' }
    },
    {
      path: '/cardapios/novo',
      component: CommercialPage,
      props: { section: 'cardapios', menuPage: 'new' },
      meta: {
        sectionLabel: 'Comercial', label: 'Novo cardápio', parentLabel: 'Cardápios', parentHref: '/cardapios'
      }
    },
    {
      path: '/cardapios/planejamento',
      component: CommercialPage,
      props: { section: 'cardapios', menuPage: 'planning' },
      meta: {
        sectionLabel: 'Comercial', label: 'Planejamento semanal', parentLabel: 'Cardápios', parentHref: '/cardapios'
      }
    },
    {
      path: '/cardapios/:date',
      component: CommercialPage,
      props: route => ({ section: 'cardapios', menuPage: 'edit', menuDate: String(route.params.date) }),
      meta: {
        sectionLabel: 'Comercial', label: 'Cardápio do dia', parentLabel: 'Cardápios', parentHref: '/cardapios'
      }
    },
    {
      path: '/clientes',
      component: CommercialPage,
      props: { section: 'clientes', customerPage: 'list' },
      meta: { sectionLabel: 'Comercial', label: 'Clientes' }
    },
    {
      path: '/clientes/novo',
      component: CommercialPage,
      props: { section: 'clientes', customerPage: 'new' },
      meta: {
        sectionLabel: 'Comercial',
        label: 'Novo cliente', parentLabel: 'Clientes', parentHref: '/clientes'
      }
    },
    {
      path: '/clientes/:id/editar',
      component: CommercialPage,
      props: route => ({ section: 'clientes', customerPage: 'edit', customerId: String(route.params.id) }),
      meta: {
        sectionLabel: 'Comercial',
        label: 'Editar cliente', parentLabel: 'Clientes', parentHref: '/clientes'
      }
    },
    {
      path: '/clientes/:id',
      component: CommercialPage,
      props: route => ({ section: 'clientes', customerPage: 'detail', customerId: String(route.params.id) }),
      meta: {
        sectionLabel: 'Comercial',
        label: 'Detalhe', parentLabel: 'Clientes', parentHref: '/clientes'
      }
    },
    {
      path: '/planos',
      component: CommercialPage,
      props: { section: 'planos', planPage: 'list' },
      meta: { sectionLabel: 'Comercial', label: 'Planos e Créditos' }
    },
    {
      path: '/planos/novo',
      component: CommercialPage,
      props: { section: 'planos', planPage: 'new' },
      meta: { sectionLabel: 'Comercial', label: 'Novo plano', parentLabel: 'Planos e Créditos', parentHref: '/planos' }
    },
    {
      path: '/planos/aquisicoes/nova',
      component: CommercialPage,
      props: { section: 'planos', planPage: 'new-acquisition' },
      meta: { sectionLabel: 'Comercial', label: 'Nova aquisição', parentLabel: 'Planos e Créditos', parentHref: '/planos' }
    },
    {
      path: '/planos/movimentacoes/nova',
      component: CommercialPage,
      props: { section: 'planos', planPage: 'new-movement' },
      meta: { sectionLabel: 'Comercial', label: 'Estornar consumo', parentLabel: 'Planos e Créditos', parentHref: '/planos' }
    },
    {
      path: '/planos/:id/editar',
      component: CommercialPage,
      props: route => ({ section: 'planos', planPage: 'edit', planId: String(route.params.id) }),
      meta: { sectionLabel: 'Comercial', label: 'Editar plano', parentLabel: 'Planos e Créditos', parentHref: '/planos' }
    },
    {
      path: '/financeiro',
      component: CommercialPage,
      props: { section: 'financeiro', financialPage: 'list' },
      meta: { sectionLabel: 'Comercial', label: 'Financeiro' }
    },
    {
      path: '/financeiro/pagamentos/novo',
      component: CommercialPage,
      props: { section: 'financeiro', financialPage: 'new-payment' },
      meta: { sectionLabel: 'Comercial', label: 'Registrar pagamento', parentLabel: 'Financeiro', parentHref: '/financeiro' }
    },
    {
      path: '/financeiro/cobrancas/:id',
      component: CommercialPage,
      props: route => ({ section: 'financeiro', financialPage: 'charge-detail', chargeId: String(route.params.id) }),
      meta: { sectionLabel: 'Comercial', label: 'Cobrança', parentLabel: 'Financeiro', parentHref: '/financeiro' }
    },
    {
      path: '/catalogo',
      component: ManagementPage,
      props: { section: 'catalogo', catalogPage: 'list' },
      meta: { sectionLabel: 'Gestão', label: 'Catálogo' }
    },
    {
      path: '/catalogo/novo',
      component: ManagementPage,
      props: { section: 'catalogo', catalogPage: 'new' },
      meta: { sectionLabel: 'Gestão', label: 'Nova oferta', parentLabel: 'Catálogo', parentHref: '/catalogo' }
    },
    {
      path: '/catalogo/:id/editar',
      component: ManagementPage,
      props: route => ({ section: 'catalogo', catalogPage: 'edit', offerId: String(route.params.id) }),
      meta: { sectionLabel: 'Gestão', label: 'Editar oferta', parentLabel: 'Catálogo', parentHref: '/catalogo' }
    },
    {
      path: '/catalogo/:id',
      component: ManagementPage,
      props: route => ({ section: 'catalogo', catalogPage: 'detail', offerId: String(route.params.id) }),
      meta: { sectionLabel: 'Gestão', label: 'Oferta', parentLabel: 'Catálogo', parentHref: '/catalogo' }
    },
    {
      path: '/produziveis',
      component: ManagementPage,
      props: { section: 'produziveis', produciblePage: 'list' },
      meta: { sectionLabel: 'Gestão', label: 'Produzíveis' }
    },
    {
      path: '/produziveis/novo',
      component: ManagementPage,
      props: { section: 'produziveis', produciblePage: 'new' },
      meta: {
        sectionLabel: 'Gestão', label: 'Novo item', parentLabel: 'Produzíveis', parentHref: '/produziveis'
      }
    },
    {
      path: '/produziveis/:id/editar',
      component: ManagementPage,
      props: route => ({ section: 'produziveis', produciblePage: 'edit', producibleId: String(route.params.id) }),
      meta: {
        sectionLabel: 'Gestão', label: 'Editar item', parentLabel: 'Produzíveis', parentHref: '/produziveis'
      }
    },
    {
      path: '/produziveis/:id/composicao/nova',
      component: ManagementPage,
      props: route => ({ section: 'produziveis', produciblePage: 'new-composition-version', producibleId: String(route.params.id) }),
      meta: {
        sectionLabel: 'Gestão', label: 'Nova composição', parentLabel: 'Produzíveis', parentHref: '/produziveis'
      }
    },
    {
      path: '/produziveis/:id',
      component: ManagementPage,
      props: route => ({ section: 'produziveis', produciblePage: 'detail', producibleId: String(route.params.id) }),
      meta: {
        sectionLabel: 'Gestão', label: 'Item produzível', parentLabel: 'Produzíveis', parentHref: '/produziveis'
      }
    },
    {
      path: '/congelados',
      component: ManagementPage,
      props: { section: 'congelados', frozenPage: 'list' },
      meta: { sectionLabel: 'Gestão', label: 'Congelados' }
    },
    {
      path: '/congelados/entrada',
      component: ManagementPage,
      props: { section: 'congelados', frozenPage: 'entry' },
      meta: {
        sectionLabel: 'Gestão', label: 'Registrar entrada', parentLabel: 'Congelados', parentHref: '/congelados'
      }
    },
    {
      path: '/congelados/lotes/:id',
      component: ManagementPage,
      props: route => ({ section: 'congelados', frozenPage: 'lot', frozenLotId: String(route.params.id) }),
      meta: {
        sectionLabel: 'Gestão', label: 'Lote de congelado', parentLabel: 'Congelados', parentHref: '/congelados'
      }
    },
    {
      path: '/entregadores',
      component: ManagementPage,
      props: { section: 'entregadores', deliveryDriverPage: 'list' },
      meta: { sectionLabel: 'Gestão', label: 'Entregadores' }
    },
    {
      path: '/entregadores/novo',
      component: ManagementPage,
      props: { section: 'entregadores', deliveryDriverPage: 'new' },
      meta: { sectionLabel: 'Gestão', label: 'Novo entregador', parentLabel: 'Entregadores', parentHref: '/entregadores' }
    },
    {
      path: '/entregadores/:id/editar',
      component: ManagementPage,
      props: route => ({ section: 'entregadores', deliveryDriverPage: 'edit', deliveryDriverId: String(route.params.id) }),
      meta: { sectionLabel: 'Gestão', label: 'Editar entregador', parentLabel: 'Entregadores', parentHref: '/entregadores' }
    },
    {
      path: '/usuarios',
      component: ManagementPage,
      props: { section: 'usuarios', userPage: 'list' },
      meta: { sectionLabel: 'Gestão', label: 'Usuários' }
    },
    {
      path: '/usuarios/novo',
      component: ManagementPage,
      props: { section: 'usuarios', userPage: 'new' },
      meta: { sectionLabel: 'Gestão', label: 'Novo usuário', parentLabel: 'Usuários', parentHref: '/usuarios' }
    },
    {
      path: '/usuarios/:id/editar',
      component: ManagementPage,
      props: route => ({ section: 'usuarios', userPage: 'edit', userId: String(route.params.id) }),
      meta: { sectionLabel: 'Gestão', label: 'Editar usuário', parentLabel: 'Usuários', parentHref: '/usuarios' }
    },
    { path: '/:pathMatch(.*)*', redirect: '/operacoes/hoje' }
  ]
})

router.beforeEach(() => {
  remoteLoadError.value = undefined
})

router.onError((error) => {
  remoteLoadError.value = error instanceof Error ? error : new Error(String(error))
})
