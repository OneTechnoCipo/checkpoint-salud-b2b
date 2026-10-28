import { defineStore } from 'pinia'

interface Usuario {
  id: string
  email: string
  rol: string
  activo?: boolean
}

interface Sesion {
  token: string
  usuario: Usuario
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || (null as string | null),
    usuario: null as Usuario | null,
  }),

  getters: {
    estaAutenticado: (state) => Boolean(state.token && state.usuario && state.usuario.activo !== false),
  },

  actions: {
    iniciarSesion(sesion: Sesion) {
      if (sesion.usuario.activo === false) {
        throw new Error('Tu cuenta se encuentra desactivada. No podés iniciar sesión.')
      }

      this.token = sesion.token
      this.usuario = sesion.usuario

      localStorage.setItem('token', sesion.token)
      localStorage.setItem('role', sesion.usuario.rol)
    },

    cerrarSesion() {
      this.token = null
      this.usuario = null
      localStorage.removeItem('token')
      localStorage.removeItem('role')
    },
  },
})
