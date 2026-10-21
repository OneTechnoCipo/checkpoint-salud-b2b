
import { defineStore } from 'pinia'

interface Usuario {
  id: string
  email: string
  rol: string
}

interface Sesion {
  token: string
  usuario: Usuario
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
    usuario: null as Usuario | null,
  }),

  getters: {
    estaAutenticado: (state) => Boolean(state.token && state.usuario),
  },

  actions: {
    iniciarSesion(sesion: Sesion) {
      this.token = sesion.token
      this.usuario = sesion.usuario
    },

    cerrarSesion() {
      this.token = null
      this.usuario = null
    },
  },
})
