<script setup lang="ts">
import { computed } from 'vue'
import type { Rol } from '../types/auth'
import { menuPorRol } from '../config/menu.config'

const props = defineProps<{
  rol: Rol
}>()

const opcionesMenu = computed(() => menuPorRol[props.rol] ?? [])
</script>

<template>
  <aside class="sidebar">
    <div class="logo">
      <h2>ITS</h2>
      <span>SOLUCIONES</span>
    </div>

    <nav class="menu">
      <RouterLink
        v-for="item in opcionesMenu"
        :key="item.route"
        :to="item.route"
        class="menu-item"
      >
        {{ item.label }}
      </RouterLink>
    </nav>

    <div class="rol">{{ rol }}</div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 210px;
  min-height: 100vh;
  padding: 26px 10px;
  background: #0B0F21;
  color: white;
}
.logo {
  margin-bottom: 50px;
  text-align: center;
}
.logo h2 {
  margin: 0;
}
.logo span {
  font-size: 20px;
}
.menu {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.menu-item {
  padding: 12px;
  border-radius: 6px;
  color: #d8e2eb;
  text-decoration: none;
}
.menu-item:hover {
  background: #111e35;
  color: white;
}
.menu-item.router-link-active {
  color: #00dbe7;
  border-bottom: 2px solid #00dbe7;
}
.rol {
  margin-top: 40px;
  padding: 12px;
  color: #8fa4b8;
  font-size: 12px;
}
</style>