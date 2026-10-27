<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import AppSidebar from './components/AppSidebar.vue'
import { menuPorRol } from './config/menu.config'
import type { Rol } from './types/auth'

const route = useRoute()
const auth = useAuthStore()

const rol = computed<Rol | null>(() => {
  const actual = auth.usuario?.rol?.toUpperCase()
  return actual && actual in menuPorRol ? (actual as Rol) : null
})

const rutasSinMenu = ['/login', '/acceso-denegado']

const mostrarMenu = computed(
  () => !rutasSinMenu.includes(route.path) && rol.value !== null
  )
</script>

<template>
  <div class="layout">
    <AppSidebar v-if="mostrarMenu && rol" :rol="rol" />
    <div class="contenido">
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}
.contenido {
  flex: 1;
  min-width: 0;
}
</style>