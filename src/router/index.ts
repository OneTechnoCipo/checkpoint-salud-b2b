import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'

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
      meta: { requiresAuth: true, roles: ['CLINICA', 'ADMIN'] },
    },
    {
      path: '/empresa',
      name: 'empresa',
      component: () => import('../views/EmpresaView.vue'),
      meta: { requiresAuth: true, roles: ['EMPRESA', 'ADMIN'] },
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminView.vue'),
      meta: { requiresAuth: true, roles: ['ADMIN'] }, // Restringido solo a ADMIN
    },
    {
      path: '/usuarios',
      name: 'usuarios',
      component: () => import('../views/AdminView.vue'),
      meta: { requiresAuth: true, roles: ['ADMIN'] }, // Mapeo del menu.config.ts
    },
  ],
})

// Middleware Guard de navegación
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  const userRole = localStorage.getItem('role')

  if (to.meta.requiresAuth && !token) {
    return next({ name: 'login' })
  }

  if (to.meta.roles && Array.isArray(to.meta.roles)) {
    if (!userRole || !to.meta.roles.includes(userRole)) {
      if (userRole === 'CLINICA') return next({ name: 'clinica' })
      if (userRole === 'EMPRESA') return next({ name: 'empresa' })
      return next({ name: 'login' })
    }
  }

  next()
})

export default router