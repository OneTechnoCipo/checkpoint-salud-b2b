
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

const CLAVE_SESION = 'checkpoint-sesion'

function leerSesion(): Sesion | null {
  try {
    const guardada = localStorage.getItem(CLAVE_SESION)
    if (!guardada) return null

    const sesion = JSON.parse(guardada) as Sesion
    return sesion.token && sesion.usuario ? sesion : null
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => {
    const sesion = leerSesion()

    return {
      token: (sesion?.token ?? null) as string | null,
      usuario: (sesion?.usuario ?? null) as Usuario | null,
    }
  },

  getters: {
    estaAutenticado: (state) => Boolean(state.token && state.usuario),
  },

  actions: {
    iniciarSesion(sesion: Sesion) {
      this.token = sesion.token
      this.usuario = sesion.usuario
      localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion))
    },

    cerrarSesion() {
      this.token = null
      this.usuario = null
      localStorage.removeItem(CLAVE_SESION)
    },
  },
})
