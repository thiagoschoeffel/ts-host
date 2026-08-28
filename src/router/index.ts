import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const OperationPage = () => import('moduleOperation/OperationPage')

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
    { path: '/:pathMatch(.*)*', redirect: '/operacoes/hoje' }
  ]
})
