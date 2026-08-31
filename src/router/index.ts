import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

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
    { path: '/:pathMatch(.*)*', redirect: '/operacoes/hoje' }
  ]
})
