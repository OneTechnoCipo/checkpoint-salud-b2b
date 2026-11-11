import type { Rol } from '../types/auth'

export interface MenuItem {
  label: string
  route: string
  icon: string
}

export const menuPorRol: Record<Rol, MenuItem[]> = {
  CLINICA: [
    { label: 'Inicio', route: '/clinica', icon: 'home' },
    { label: 'Empresas', route: '/clinica/empresas', icon: 'building' },
    { label: 'Turnos', route: '/clinica/turnos', icon: 'calendar' },
    { label: 'Aptos y vencimientos', route: '/clinica/aptos', icon: 'check' },
    { label: 'Carga masiva', route: '/clinica/carga-masiva', icon: 'upload' },
  ],
  EMPRESA: [
    { label: 'Inicio', route: '/empresa', icon: 'home' },
    { label: 'Trabajadores', route: '/empresa/trabajadores', icon: 'users' },
    { label: 'Turnos', route: '/empresa/turnos', icon: 'calendar' },
    { label: 'Aptos y vencimientos', route: '/empresa/aptos', icon: 'check' },
    { label: 'Carga masiva', route: '/empresa/carga-masiva', icon: 'upload' },
  ],
  ADMIN: [
    { label: 'Inicio', route: '/admin', icon: 'home' },
  ],
  PACIENTE: [],
}