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
      name: 'clinica',
      component: () => import('../views/ClinicaView.vue'),
      meta: { requiresAuth: true, roles: ['CLINICA'] },
    },
    {
      path: '/empresa',
      name: 'empresa',
      component: () => import('../views/EmpresaView.vue'),
      meta: { requiresAuth: true, roles: ['EMPRESA'] },
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
  meta: {requiresAuth: true,roles: ['PACIENTE'],
  },
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