<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import type { Rol } from '../types/auth'

const authStore = useAuthStore()
const router = useRouter()

interface UsuarioSistema {
  id: string
  email: string
  rol: Rol
  activo: boolean
}

// Datos iniciales de prueba para la gestión
const usuarios = ref<UsuarioSistema[]>([
  { id: '1', email: 'clinica.central@checkpoint.com', rol: 'CLINICA', activo: true },
  { id: '2', email: 'empresa.logistica@checkpoint.com', rol: 'EMPRESA', activo: true },
  { id: '3', email: 'admin.general@checkpoint.com', rol: 'ADMIN', activo: true }
])

const nuevoEmail = ref('')
const nuevoRol = ref<Rol>('CLINICA')

const crearUsuario = () => {
  if (!nuevoEmail.value.trim()) return
  usuarios.value.push({
    id: Date.now().toString(),
    email: nuevoEmail.value.trim(),
    rol: nuevoRol.value,
    activo: true
  })
  nuevoEmail.value = ''
}

const toggleEstado = (id: string) => {
  const usuario = usuarios.value.find(u => u.id === id)
  if (usuario) {
    usuario.activo = !usuario.activo
  }
}

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
        <p>Panel de Administración</p>
      </div>

      <button @click="cerrarSesion" class="btn-salir">
        Cerrar sesión
      </button>
    </header>

    <section class="contenido">
      <h2>Gestión de Accesos al Sistema</h2>
      <p>
        Panel de control exclusivo para dar de alta nuevos usuarios y gestionar el estado de sus credenciales de ingreso.
      </p>

      <div class="seccion-usuarios">
        <h3>Crear Nuevo Usuario</h3>
        <div class="formulario-alta">
          <div class="inputs-group">
            <input 
              v-model="nuevoEmail" 
              type="email" 
              placeholder="Correo electrónico corporativo" 
              class="input-texto"
            />
            <select v-model="nuevoRol" class="select-rol">
              <option value="CLINICA">CLINICA</option>
              <option value="EMPRESA">EMPRESA</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            <button @click="crearUsuario" class="btn-agregar">
              Crear Usuario
            </button>
          </div>
        </div>

        <h3>Usuarios Registrados</h3>
        <div class="tabla-contenedor">
          <table class="tabla-usuarios">
            <thead>
              <tr>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in usuarios" :key="user.id">
                <td>{{ user.email }}</td>
                <td>
                  <span class="badge-rol">{{ user.rol }}</span>
                </td>
                <td>
                  <span :class="user.activo ? 'estado-activo' : 'estado-inactivo'">
                    {{ user.activo ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td class="text-center">
                  <button 
                    @click="toggleEstado(user.id)" 
                    :class="user.activo ? 'btn-desactivar' : 'btn-activar'"
                  >
                    {{ user.activo ? 'Desactivar' : 'Activar' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
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

.btn-salir {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  background: #173b70;
  color: white;
  cursor: pointer;
}

.btn-salir:hover {
  background: #24518f;
}

.contenido {
  max-width: 1100px;
  margin: 40px auto;
}

.contenido h2 {
  margin-bottom: 10px;
  color: #173b70;
}

.contenido > p {
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 30px;
}

.seccion-usuarios {
  background: white;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #e0e6ef;
  box-shadow: 0 4px 12px rgb(15 23 42 / 5%);
}

.seccion-usuarios h3 {
  margin-top: 0;
  color: #173b70;
  margin-bottom: 16px;
}

.formulario-alta {
  background: #f8fafc;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 32px;
  border: 1px solid #e2e8f0;
}

.inputs-group {
  display: flex;
  gap: 12px;
}

.input-texto {
  flex: 1;
  padding: 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
}

.select-rol {
  padding: 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: white;
}

.btn-agregar {
  padding: 10px 20px;
  background: #0284c7;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn-agregar:hover {
  background: #0369a1;
}

.tabla-contenedor {
  overflow-x: auto;
}

.tabla-usuarios {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.tabla-usuarios th, 
.tabla-usuarios td {
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.tabla-usuarios th {
  background: #f1f5f9;
  color: #475569;
  font-weight: 600;
}

.badge-rol {
  background: #e0f2fe;
  color: #0369a1;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.estado-activo {
  color: #16a34a;
  font-weight: 600;
}

.estado-inactivo {
  color: #dc2626;
  font-weight: 600;
}

.text-center {
  text-align: center;
}

.btn-desactivar {
  background: #ef4444;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}

.btn-desactivar:hover {
  background: #dc2626;
}

.btn-activar {
  background: #22c55e;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}

.btn-activar:hover {
  background: #16a34a;
}
</style>