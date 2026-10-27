import type { Rol } from '../types/auth'

export interface MenuItem {
  label: string
  route: string
  icon: string
}

export const menuPorRol: Record<Rol, MenuItem[]> = {
  CLINICA: [
    { label: 'Inicio', route: '/clinica', icon: 'home' },
    { label: 'Empresas', route: '/empresas', icon: 'building' },
    { label: 'Turnos', route: '/turnos', icon: 'calendar' },
    { label: 'Aptos y vencimientos', route: '/aptos', icon: 'check' },
    { label: 'Carga masiva', route: '/carga-masiva', icon: 'upload' },
  ],
  EMPRESA: [
    { label: 'Inicio', route: '/empresa', icon: 'home' },
    { label: 'Trabajadores', route: '/trabajadores', icon: 'users' },
    { label: 'Turnos', route: '/turnos', icon: 'calendar' },
    { label: 'Aptos y vencimientos', route: '/aptos', icon: 'check' },
    { label: 'Carga masiva', route: '/carga-masiva', icon: 'upload' },
  ],
  ADMIN: [
    { label: 'Inicio', route: '/admin', icon: 'home' },
    { label: 'Usuarios', route: '/usuarios', icon: 'users' },
    { label: 'Empresas', route: '/empresas', icon: 'building' },
    { label: 'Puestos y requisitos', route: '/puestos', icon: 'clipboard' },
  ],
  PACIENTE: [],
}