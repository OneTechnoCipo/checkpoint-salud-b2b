<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

function cerrarSesion() {
  authStore.cerrarSesion()
  router.push('/login')
}

// Estructura del usuario en la vista de administración
interface UsuarioItem {
  id: number
  email: string
  password: string
  rol: 'CLINICA' | 'EMPRESA' | 'ADMIN' | 'PACIENTE'
  activo: boolean
}

const nuevoEmail = ref('')
const nuevoRol = ref<'CLINICA' | 'EMPRESA' | 'ADMIN' | 'PACIENTE'>('CLINICA')

// Lista inicial de usuarios simulados en el panel
const usuarios = ref<UsuarioItem[]>([
  { id: 1, email: 'adminMock@gmail.com', password: 'admin123', rol: 'ADMIN', activo: true },
  { id: 2, email: 'clinicaMock@gmail.com', password: 'clinica123', rol: 'CLINICA', activo: true },
  { id: 3, email: 'empresaMock@gmail.com', password: 'empresa123', rol: 'EMPRESA', activo: true },
  { id: 4, email: 'pacienteMock@gmail.com', password: 'paciente123', rol: 'PACIENTE', activo: true },
])

onMounted(() => {
  const guardados = localStorage.getItem('checkpoint_usuarios')
  if (guardados) {
    usuarios.value = JSON.parse(guardados)
  }
})

// Función auxiliar para guardar en localStorage cada vez que modifiquemos algo
function sincronizarStorage() {
  localStorage.setItem('checkpoint_usuarios', JSON.stringify(usuarios.value))
}

// Función para dar de alta un nuevo usuario con contraseña única y diferente cada vez
function crearUsuario() {
  if (!nuevoEmail.value.trim()) {
    alert('Por favor, ingresa un correo electrónico válido.')
    return
  }

  const numeroAleatorio = Math.floor(1000 + Math.random() * 9000)
  const passwordGenerada = `${nuevoRol.value.toLowerCase()}_${numeroAleatorio}`

  usuarios.value.push({
    id: Date.now(),
    email: nuevoEmail.value.trim(),
    password: passwordGenerada,
    rol: nuevoRol.value,
    activo: true,
  })

  sincronizarStorage() // <-- Guardamos los cambios

  alert(`¡Usuario creado con éxito!\nCorreo: ${nuevoEmail.value.trim()}\nContraseña asignada: ${passwordGenerada}`)
  nuevoEmail.value = ''
}

// Funcion para alternar el estado (Activo / Inactivo - Baja lógica)
function toggleEstado(id: number) {
  const usuario = usuarios.value.find((u) => u.id === id)
  if (usuario) {
    usuario.activo = !usuario.activo
    sincronizarStorage() // <-- Guardamos los cambios
  }
}

function eliminarUsuario(emailAEliminar: string) {
  // Filtramos la lista sacando al usuario que coincide
  usuarios.value = usuarios.value.filter(u => u.email !== emailAEliminar)
  // Actualizamos el localStorage para que persista el cambio
  sincronizarStorage()
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
      <h2>Bienvenido al panel de Administración</h2>
      <p class="subtitulo-seccion">
        Desde este espacio se podrán administrar los usuarios
        y consultar la configuración general del sistema.
      </p>

      <!-- Sección de Gestión de Usuarios (Alta y Baja lógica) -->
      <div class="seccion-gestion-usuarios">
        <h3>Gestión de Usuarios</h3>
        
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
              <option value="PACIENTE">PACIENTE</option>
            </select>

            <button @click="crearUsuario" class="btn-agregar">
              Crear Usuario
            </button>
          </div>
        </div>

        <h4>Usuarios Registrados</h4>
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
                  <div style="display: flex; gap: 8px; justify-content: center; align-items: center;">
                    <button 
                      @click="toggleEstado(user.id)" 
                      :class="user.activo ? 'btn-desactivar' : 'btn-activar'"
                    >
                      {{ user.activo ? 'Desactivar' : 'Activar' }}
                    </button>

                    <button 
                      @click="eliminarUsuario(user.email)" 
                      class="btn-borrar"
                      title="Eliminar usuario definitivamente"
                      aria-label="Eliminar usuario"
                    >
                      <svg 
                        viewBox="0 0 24 24" 
                        width="16" 
                        height="16" 
                        stroke="currentColor" 
                        stroke-width="2" 
                        fill="none" 
                        stroke-linecap="round" 
                        stroke-linejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="tarjetas">
        <article class="tarjeta">
          <h3>Usuarios</h3>
          <p>Administración de los accesos al sistema.</p>
        </article>

        <article class="tarjeta">
          <h3>Empresas</h3>
          <p>Gestión de las empresas registradas.</p>
        </article>

        <article class="tarjeta">
          <h3>Configuración</h3>
          <p>Consulta de las opciones generales del sistema.</p>
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
  font-size: 28px;
}

.encabezado p {
  margin: 6px 0 0;
  color: #64748b;
}

.btn-salir {
  padding: 10px 18px;
  border: none;
  border-radius: 8px;
  background: #173b70;
  color: white;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}

.btn-salir:hover {
  background: #24518f;
}

.contenido {
  max-width: 1100px;
  margin: 30px auto;
}

.contenido h2 {
  margin-bottom: 8px;
  color: #173b70;
}

.subtitulo-seccion {
  color: #64748b;
  line-height: 1.5;
  margin-bottom: 24px;
}

.seccion-gestion-usuarios {
  background: white;
  padding: 28px;
  border-radius: 12px;
  border: 1px solid #e0e6ef;
  box-shadow: 0 4px 12px rgb(15 23 42 / 4%);
}

.seccion-gestion-usuarios h3 {
  color: #173b70;
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 20px;
}

.seccion-gestion-usuarios h4 {
  color: #173b70;
  margin-top: 28px;
  margin-bottom: 14px;
  font-size: 16px;
}

.formulario-alta {
  margin-bottom: 10px;
  background: #f8fafc;
  padding: 18px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.inputs-group {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  align-items: center;
}

.input-texto, .select-rol {
  padding: 11px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  background: white;
  color: #1e293b;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-texto {
  flex: 1;
  min-width: 260px;
}

.input-texto:focus, .select-rol:focus {
  border-color: #173b70;
  box-shadow: 0 0 0 3px rgba(23, 59, 112, 0.1);
}

.select-rol {
  min-width: 150px;
  cursor: pointer;
}

.btn-agregar {
  background: #10b981;
  color: white;
  padding: 11px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-agregar:hover {
  background: #059669;
}

.tabla-contenedor {
  overflow-x: auto;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.tabla-usuarios {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 14px;
}

.tabla-usuarios th, 
.tabla-usuarios td {
  padding: 14px 18px;
  border-bottom: 1px solid #e2e8f0;
}

.tabla-usuarios tr:last-child td {
  border-bottom: none;
}

.tabla-usuarios th {
  background: #f8fafc;
  color: #475569;
  font-weight: 600;
}

.badge-rol {
  background: #e0f2fe;
  color: #0369a1;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.estado-activo {
  color: #059669;
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
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-desactivar:hover {
  background: #dc2626;
}

.btn-activar {
  background: #10b981;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-activar:hover {
  background: #059669;
}

/* Botón de borrado definitivo con ícono de tacho */
.btn-borrar {
  background: #ef4444;
  color: white;
  border: none;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.btn-borrar:hover {
  background: #dc2626;
}

.tarjetas {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-top: 30px;
}

.tarjeta {
  padding: 24px;
  border: 1px solid #e0e6ef;
  border-radius: 12px;
  background: white;
  box-shadow: 0 4px 12px rgb(15 23 42 / 4%);
}

.tarjeta h3 {
  margin-top: 0;
  color: #173b70;
  font-size: 18px;
}

.tarjeta p {
  margin-bottom: 0;
  color: #64748b;
  line-height: 1.5;
  font-size: 14px;
}
</style>