import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import { useAuthStore } from '../stores/auth'
import type { Rol } from '../types/auth'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    roles?: Rol[]
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/clinica',
      meta: { requiresAuth: true, roles: ['CLINICA'] },
      children: [
        {
          path: '',
          name: 'clinica',
          component: () => import('../views/ClinicaView.vue'),
        },
        {
          path: 'empresas',
          name: 'clinica-empresas',
          component: () => import('../views/clinica/EmpresasView.vue'),
          props: { titulo: 'Empresas' },
        },
        {
          path: 'turnos',
          name: 'clinica-turnos',
          component: () => import('../views/clinica/TurnosView.vue'),
          props: { titulo: 'Turnos solicitados' },
        },
        {
          path: 'aptos',
          name: 'clinica-aptos',
          component: () => import('../views/clinica/AptosVencimientoView.vue'),
          props: { titulo: 'Aptos y vencimientos' },
        },
        {
          path: 'carga-masiva',
          name: 'clinica-carga-masiva',
          component: () => import('../views/clinica/CargaMasivaView.vue'),
          props: { titulo: 'Carga masiva' },
        },
      ],
    },
    {
      path: '/empresa',
      meta: { requiresAuth: true, roles: ['EMPRESA'] },
      children: [
        {
          path: '',
          name: 'empresa',
          component: () => import('../views/EmpresaView.vue'),
        },
        {
          path: 'trabajadores',
          name: 'empresa-trabajadores',
          component: () => import('../views/empresa/TrabajadoresView.vue'),
          props: { titulo: 'Trabajadores' },
        },
        {
          path: 'turnos',
          name: 'empresa-turnos',
          component: () => import('../views/empresa/TurnosView.vue'),
          props: { titulo: 'Turnos solicitados' },
        },
        {
          path: 'aptos',
          name: 'empresa-aptos',
          component: () => import('../views/empresa/AptosVencimientoView.vue'),
          props: { titulo: 'Aptos y vencimientos' },
        },
        {
          path: 'carga-masiva',
          name: 'empresa-carga-masiva',
          component: () => import('../views/empresa/CargaMasivaView.vue'),
          props: { titulo: 'Carga masiva' },
        },
      ],
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminView.vue'),
      meta: { requiresAuth: true, roles: ['ADMIN'] },
    },
    {
      path: '/paciente',
      name: 'paciente',
      component: () => import('../views/PacienteView.vue'),
      meta: { requiresAuth: true, roles: ['PACIENTE'] },
    },
    {
      path: '/acceso-denegado',
      name: 'acceso-denegado',
      component: () => import('../views/AccesoDenegadoView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach((to) => {
  if (!to.meta.requiresAuth) return true

  const auth = useAuthStore()

  if (!auth.estaAutenticado) {
    return { name: 'login' }
  }

  const rol = auth.usuario?.rol?.toUpperCase() as Rol | undefined

  if (to.meta.roles && (!rol || !to.meta.roles.includes(rol))) {
    return { name: 'acceso-denegado' }
  }

  return true
})

export default router