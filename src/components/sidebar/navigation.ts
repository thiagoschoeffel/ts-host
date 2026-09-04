import type { Component } from 'vue'
import {
  BadgeDollarSignIcon,
  BikeIcon,
  BookOpenIcon,
  BoxesIcon,
  CalendarDaysIcon,
  CircleDollarSignIcon,
  ClipboardListIcon,
  CookingPotIcon,
  FactoryIcon,
  MessagesSquareIcon,
  PackageCheckIcon,
  SnowflakeIcon,
  TruckIcon,
  UserRoundCogIcon,
  UsersIcon
} from '@thiagoschoeffel/ts-components'

export interface NavigationItem {
  label: string
  icon: Component
  to?: string
}

export interface NavigationSection {
  label: string
  items: NavigationItem[]
}

export const navigationSections: NavigationSection[] = [
  {
    label: 'Operação',
    items: [
      { label: 'Hoje', icon: CalendarDaysIcon, to: '/operacoes/hoje' },
      { label: 'Atendimento', icon: MessagesSquareIcon, to: '/operacoes/atendimento' },
      { label: 'Pedidos', icon: ClipboardListIcon, to: '/operacoes/pedidos' },
      { label: 'Produção', icon: CookingPotIcon, to: '/operacoes/producao' },
      { label: 'Embalagem', icon: PackageCheckIcon, to: '/operacoes/embalagem' },
      { label: 'Entregas', icon: TruckIcon, to: '/operacoes/entregas' }
    ]
  },
  {
    label: 'Comercial',
    items: [
      { label: 'Cardápios', icon: BookOpenIcon, to: '/cardapios' },
      { label: 'Clientes', icon: UsersIcon, to: '/clientes' },
      { label: 'Planos e Créditos', icon: BadgeDollarSignIcon, to: '/planos' },
      { label: 'Financeiro', icon: CircleDollarSignIcon, to: '/financeiro' }
    ]
  },
  {
    label: 'Gestão',
    items: [
      { label: 'Catálogo', icon: BoxesIcon, to: '/catalogo' },
      { label: 'Produzíveis', icon: FactoryIcon, to: '/produziveis' },
      { label: 'Congelados', icon: SnowflakeIcon, to: '/congelados' },
      { label: 'Entregadores', icon: BikeIcon, to: '/entregadores' },
      { label: 'Usuários', icon: UserRoundCogIcon, to: '/usuarios' }
    ]
  }
]
