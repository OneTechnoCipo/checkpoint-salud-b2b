
<script setup lang="ts">
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

function cerrarSesion() {
  authStore.cerrarSesion()
  router.push('/login')
}
</script>

<template>
  <main class="pagina">
    <header class="encabezado">
      <div>
        <h1>CheckPoint Salud</h1>
        <p>Panel de Empresa</p>
      </div>

      <button @click="cerrarSesion">
        Cerrar sesión
      </button>
    </header>

    <section class="contenido">
      <h2>Bienvenido al panel de Empresa</h2>
      <p>
        Desde este espacio se podrá consultar el estado de los
        aptos médicos de los trabajadores y realizar el
        seguimiento de sus vencimientos.
      </p>

      <div class="tarjetas">
        <article class="tarjeta">
          <h3>Trabajadores</h3>
          <p>Consulta de los trabajadores registrados.</p>
        </article>

        <article class="tarjeta">
          <h3>Estado de aptitud</h3>
          <p>Consulta del estado apto o no apto.</p>
        </article>

        <article class="tarjeta">
          <h3>Vencimientos</h3>
          <p>Seguimiento de las fechas de vencimiento de los aptos médicos.</p>
        </article>
      </div>
    </section>
  </main>
</template>

<style scoped>
.pagina {
  min-height: 100vh;
  padding: 32px;
  background: #f4f6fa;
  color: #172033;
  font-family: 'Segoe UI', Arial, sans-serif;
}

.encabezado {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding-bottom: 24px;
  border-bottom: 1px solid #dce2eb;
}

.encabezado h1 {
  margin: 0;
  color: #173b70;
}

.encabezado p {
  margin: 6px 0 0;
  color: #64748b;
}

button {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  background: #173b70;
  color: white;
  cursor: pointer;
}

button:hover {
  background: #24518f;
}

.contenido {
  max-width: 1100px;
  margin: 40px auto;
}

.contenido h2 {
  margin-bottom: 10px;
}

.contenido > p {
  color: #64748b;
  line-height: 1.6;
}

.tarjetas {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-top: 30px;
}

.tarjeta {
  padding: 24px;
  border: 1px solid #e0e6ef;
  border-radius: 12px;
  background: white;
  box-shadow: 0 4px 12px rgb(15 23 42 / 5%);
}

.tarjeta h3 {
  margin-top: 0;
  color: #173b70;
}

.tarjeta p {
  margin-bottom: 0;
  color: #64748b;
  line-height: 1.5;
}
</style>
