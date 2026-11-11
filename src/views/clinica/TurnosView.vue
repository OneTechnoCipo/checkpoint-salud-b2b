
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import PanelPagina from '../../components/PanelPagina.vue'
import { apiFetch } from '../../services/api'
import { formatearFecha, formatearHora } from '../../utils/fechas'

interface PacienteApi {
  nombre: string
  apellido: string
  dni: string
  empresa?: { razonSocial: string }
  puesto?: { nombrePuesto: string }
}

interface SedeApi {
  nombre: string
  direccion?: string
}

interface SolicitudApi {
  id: string
  fechaPreferida: string
  estado: string
  paciente: PacienteApi
  sede: SedeApi
}

interface SolicitudesResponse {
  mensaje: string
  solicitudes: SolicitudApi[]
}

interface TurnoApi {
  id: string
  fechaHora: string
  estado: string
  paciente?: {
    nombre: string
    apellido: string
    dni: string
    empresa?: { razonSocial: string }
  }
  sede?: { nombre: string }
}

const solicitudes = ref<SolicitudApi[]>([])
const turnos = ref<TurnoApi[]>([])

const cargando = ref(true)
const error = ref('')
const mensaje = ref('')
const filtroEstado = ref<string>('TODOS')
const busqueda = ref('')

const fechasAsignadas = ref<Record<string, string>>({})
const procesandoId = ref('')

async function cargarDatos() {
  try {
    cargando.value = true
    error.value = ''
    
    const [respuestaSolicitudes, respuestaTurnos] = await Promise.all([
      apiFetch<SolicitudesResponse>('/api/turnos/solicitudes'),
      apiFetch<TurnoApi[]>('/api/turnos'),
    ])

    solicitudes.value = respuestaSolicitudes.solicitudes
    turnos.value = respuestaTurnos

    // Inicializar la fecha y hora sugerida para cada solicitud.
    solicitudes.value.forEach((solicitud) => {
      if (!fechasAsignadas.value[solicitud.id]) {
        const fecha = new Date(solicitud.fechaPreferida)
        fecha.setHours(9, 0, 0, 0)

        const offset = fecha.getTimezoneOffset()
        const fechaLocal = new Date(fecha.getTime() - offset * 60000)

        fechasAsignadas.value[solicitud.id] = fechaLocal
          .toISOString()
          .slice(0, 16)
      }
    })
  } catch (e) {
    error.value = e instanceof Error
      ? e.message
      : 'No se pudieron cargar los datos.'
  } finally {
    cargando.value = false
  }
}

async function confirmarSolicitud(solicitud: SolicitudApi) {
  const fechaHoraLocal = fechasAsignadas.value[solicitud.id]

  if (!fechaHoraLocal) {
    error.value = 'Seleccioná la fecha y hora del turno.'
    return
  }

  const fechaHora = new Date(fechaHoraLocal)

  if (Number.isNaN(fechaHora.getTime()) || fechaHora <= new Date()) {
    error.value = 'El turno debe asignarse para una fecha y hora futuras.'
    return
  }

  try {
    procesandoId.value = solicitud.id
    error.value = ''
    mensaje.value = ''

    const respuesta = await apiFetch<{ mensaje: string }>(
      `/api/turnos/solicitudes/${solicitud.id}/confirmar`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          fechaHora: fechaHora.toISOString(),
        }),
      },
    )

    mensaje.value = respuesta.mensaje
    await cargarDatos()
  } catch (e) {
    error.value = e instanceof Error
      ? e.message
      : 'No se pudo confirmar la solicitud.'
  } finally {
    procesandoId.value = ''
  }
}

async function rechazarSolicitud(solicitud: SolicitudApi) {
  const confirmar = window.confirm(
    `¿Estás segura de que querés rechazar la solicitud de ${solicitud.paciente.apellido}, ${solicitud.paciente.nombre}?`,
  )

  if (!confirmar) return

  try {
    procesandoId.value = solicitud.id
    error.value = ''
    mensaje.value = ''

    const respuesta = await apiFetch<{ mensaje: string }>(
      `/api/turnos/solicitudes/${solicitud.id}/rechazar`,
      {
        method: 'PATCH',
      },
    )

    mensaje.value = respuesta.mensaje
    await cargarDatos()
  } catch (e) {
    error.value = e instanceof Error
      ? e.message
      : 'No se pudo rechazar la solicitud.'
  } finally {
    procesandoId.value = ''
  }
}

const solicitudesPendientes = computed(() =>
  solicitudes.value.filter((solicitud) => solicitud.estado === 'PENDIENTE'),
)

const solicitudesProcesadas = computed(() =>
  solicitudes.value.filter((solicitud) => solicitud.estado !== 'PENDIENTE'),
)

const turnosFiltrados = computed(() => {
  const texto = busqueda.value.trim().toLowerCase()

  return turnos.value
    .filter((turno) => {
      const cumpleEstado =
        filtroEstado.value === 'TODOS' ||
        turno.estado === filtroEstado.value

      const pacienteNombre =
        `${turno.paciente?.nombre || ''} ${turno.paciente?.apellido || ''}`.toLowerCase()

      const pacienteDni = turno.paciente?.dni || ''
      const empresaNombre = turno.paciente?.empresa?.razonSocial || ''

      const cumpleTexto =
        !texto ||
        pacienteNombre.includes(texto) ||
        pacienteDni.includes(texto) ||
        empresaNombre.toLowerCase().includes(texto)

      return cumpleEstado && cumpleTexto
    })
    .sort((a, b) => a.fechaHora.localeCompare(b.fechaHora))
})

const etiquetas: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  ASISTIO: 'Asistió',
  CANCELADO: 'Cancelado',
}

const estilos: Record<string, string> = {
  PENDIENTE: 'bg-amber-50 text-amber-700',
  ASISTIO: 'bg-emerald-50 text-emerald-700',
  CANCELADO: 'bg-red-50 text-red-700',
}

onMounted(cargarDatos)
</script>

<template>
  <PanelPagina
    titulo="Gestión de Turnos"
    descripcion="Administrá las solicitudes recibidas y los turnos programados de la clínica."
  >
    <section class="mx-auto max-w-[1500px] space-y-8">

      <!-- Mensajes -->
      <div
        v-if="mensaje"
        class="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
      >
        {{ mensaje }}
      </div>

      <div
        v-if="error"
        role="alert"
        class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
      >
        {{ error }}
      </div>

      <div v-if="cargando" class="rounded-2xl border border-[#dbe7ee] bg-white p-8 text-center text-sm text-slate-500">
        Cargando información desde el servidor...
      </div>

      <template v-else>
        <!-- SOLICITUDES PENDIENTES -->
        <section>
          <div class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 class="text-lg font-bold text-[#173b70]">
                Solicitudes recibidas
              </h2>
              <p class="text-sm text-slate-500">
                Solicitudes enviadas por las empresas para sus trabajadores.
              </p>
            </div>

            <span class="w-fit rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
              {{ solicitudesPendientes.length }} pendientes
            </span>
          </div>

          <div class="overflow-hidden rounded-2xl border border-[#dbe7ee] bg-white shadow-sm">
            <div
              v-if="solicitudesPendientes.length === 0"
              class="p-8 text-center"
            >
              <p class="font-semibold text-[#173b70]">
                No hay solicitudes pendientes.
              </p>
              <p class="mt-1 text-sm text-slate-500">
                Cuando una empresa solicite un turno, aparecerá en esta sección.
              </p>
            </div>

            <div v-else class="overflow-x-auto">
              <table class="w-full border-collapse text-left">
                <thead>
                  <tr class="border-b border-[#dbe7ee] bg-[#f9fcfd] text-xs font-semibold text-[#173b70]">
                    <th class="px-5 py-4">Trabajador</th>
                    <th class="px-5 py-4">DNI</th>
                    <th class="px-5 py-4">Empresa</th>
                    <th class="px-5 py-4">Puesto</th>
                    <th class="px-5 py-4">Fecha preferida</th>
                    <th class="px-5 py-4">Sede solicitada</th>
                    <th class="px-5 py-4">Asignar turno</th>
                    <th class="px-5 py-4">Acciones</th>
                  </tr>
                </thead>

                <tbody class="divide-y divide-[#edf1f5] text-sm">
                  <tr
                    v-for="solicitud in solicitudesPendientes"
                    :key="solicitud.id"
                    class="transition-colors hover:bg-[#f9fcfd]/60"
                  >
                    <td class="px-5 py-4 font-semibold text-[#173b70]">
                      {{ solicitud.paciente.apellido }}, {{ solicitud.paciente.nombre }}
                    </td>

                    <td class="px-5 py-4 text-slate-600">
                      {{ solicitud.paciente.dni }}
                    </td>

                    <td class="px-5 py-4 text-slate-600">
                      {{ solicitud.paciente.empresa?.razonSocial || 'N/A' }}
                    </td>

                    <td class="px-5 py-4 text-slate-600">
                      {{ solicitud.paciente.puesto?.nombrePuesto || 'N/A' }}
                    </td>

                    <td class="px-5 py-4 text-slate-600">
                      {{ formatearFecha(solicitud.fechaPreferida) }}
                    </td>

                    <td class="px-5 py-4 text-slate-600">
                      {{ solicitud.sede.nombre }}
                      <p class="text-xs text-slate-400">
                        {{ solicitud.sede.direccion }}
                      </p>
                    </td>

                    <td class="min-w-[220px] px-5 py-4">
                      <input
                        v-model="fechasAsignadas[solicitud.id]"
                        type="datetime-local"
                        class="w-full rounded-lg border border-[#dbe7ee] bg-white px-3 py-2 text-xs text-[#173b70] focus:border-[#38b8cf] focus:outline-none"
                      />
                    </td>

                    <td class="px-5 py-4">
                      <div class="flex flex-col gap-2">
                        <button
                          type="button"
                          :disabled="procesandoId === solicitud.id"
                          @click="confirmarSolicitud(solicitud)"
                          class="rounded-lg bg-[#173b70] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#24518e] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {{ procesandoId === solicitud.id ? 'Procesando...' : 'Confirmar' }}
                        </button>

                        <button
                          type="button"
                          :disabled="procesandoId === solicitud.id"
                          @click="rechazarSolicitud(solicitud)"
                          class="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Rechazar
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- SOLICITUDES PROCESADAS -->
        <section v-if="solicitudesProcesadas.length > 0">
          <h2 class="mb-4 text-lg font-bold text-[#173b70]">
            Solicitudes procesadas
          </h2>

          <div class="overflow-hidden rounded-2xl border border-[#dbe7ee] bg-white shadow-sm">
            <div class="overflow-x-auto">
              <table class="w-full border-collapse text-left">
                <thead>
                  <tr class="border-b border-[#dbe7ee] bg-[#f9fcfd] text-xs font-semibold text-[#173b70]">
                    <th class="px-5 py-4">Trabajador</th>
                    <th class="px-5 py-4">Empresa</th>
                    <th class="px-5 py-4">Fecha solicitada</th>
                    <th class="px-5 py-4">Sede</th>
                    <th class="px-5 py-4">Estado</th>
                  </tr>
                </thead>

                <tbody class="divide-y divide-[#edf1f5] text-sm">
                  <tr
                    v-for="solicitud in solicitudesProcesadas"
                    :key="solicitud.id"
                  >
                    <td class="px-5 py-4 font-semibold text-[#173b70]">
                      {{ solicitud.paciente.apellido }}, {{ solicitud.paciente.nombre }}
                    </td>

                    <td class="px-5 py-4 text-slate-600">
                      {{ solicitud.paciente.empresa?.razonSocial || 'N/A' }}
                    </td>

                    <td class="px-5 py-4 text-slate-600">
                      {{ formatearFecha(solicitud.fechaPreferida) }}
                    </td>

                    <td class="px-5 py-4 text-slate-600">
                      {{ solicitud.sede.nombre }}
                    </td>

                    <td class="px-5 py-4">
                      <span
                        :class="[
                          'rounded-full px-2.5 py-1 text-xs font-semibold',
                          solicitud.estado === 'CONFIRMADA'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-red-50 text-red-700',
                        ]"
                      >
                        {{ solicitud.estado === 'CONFIRMADA' ? 'Confirmada' : 'Rechazada' }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- TURNOS PROGRAMADOS -->
        <section>
          <div class="mb-4">
            <h2 class="text-lg font-bold text-[#173b70]">
              Turnos programados
            </h2>
            <p class="text-sm text-slate-500">
              Listado general de turnos vinculados en el sistema.
            </p>
          </div>

          <div class="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <input
              v-model="busqueda"
              type="text"
              placeholder="Buscar por paciente, DNI o empresa..."
              class="rounded-xl border border-[#dbe7ee] bg-white px-4 py-2 text-sm text-[#173b70] shadow-sm placeholder:text-slate-400 focus:border-[#38b8cf] focus:outline-none"
            />

            <select
              v-model="filtroEstado"
              class="rounded-xl border border-[#dbe7ee] bg-white px-4 py-2 text-sm font-medium text-[#173b70] shadow-sm focus:border-[#38b8cf] focus:outline-none"
            >
              <option value="TODOS">Todos los estados</option>
              <option value="PENDIENTE">Pendientes</option>
              <option value="ASISTIO">Asistidos</option>
              <option value="CANCELADO">Cancelados</option>
            </select>
          </div>

          <div class="overflow-hidden rounded-2xl border border-[#dbe7ee] bg-white shadow-sm">
            <div
              v-if="turnosFiltrados.length === 0"
              class="p-8 text-center text-sm text-slate-500"
            >
              No se encontraron turnos con los filtros seleccionados.
            </div>

            <div v-else class="overflow-x-auto">
              <table class="w-full border-collapse text-left">
                <thead>
                  <tr class="border-b border-[#dbe7ee] bg-[#f9fcfd] text-xs font-semibold text-[#173b70]">
                    <th class="px-5 py-4">Paciente</th>
                    <th class="px-5 py-4">DNI</th>
                    <th class="px-5 py-4">Empresa</th>
                    <th class="px-5 py-4">Fecha y hora</th>
                    <th class="px-5 py-4">Sede</th>
                    <th class="px-5 py-4">Estado</th>
                  </tr>
                </thead>

                <tbody class="divide-y divide-[#edf1f5] text-sm">
                  <tr
                    v-for="turno in turnosFiltrados"
                    :key="turno.id"
                    class="transition-colors hover:bg-[#f9fcfd]/60"
                  >
                    <td class="px-5 py-4 font-semibold text-[#173b70]">
                      {{ turno.paciente?.apellido }}, {{ turno.paciente?.nombre }}
                    </td>

                    <td class="px-5 py-4 text-slate-600">
                      {{ turno.paciente?.dni || 'N/A' }}
                    </td>

                    <td class="px-5 py-4 text-slate-600">
                      {{ turno.paciente?.empresa?.razonSocial || 'N/A' }}
                    </td>

                    <td class="px-5 py-4 text-slate-600">
                      {{ formatearFecha(turno.fechaHora) }} -
                      {{ formatearHora(turno.fechaHora) }} hs
                    </td>

                    <td class="px-5 py-4 text-slate-600">
                      {{ turno.sede?.nombre || 'Central' }}
                    </td>

                    <td class="px-5 py-4">
                      <span
                        :class="[
                          'rounded-full px-2.5 py-1 text-xs font-semibold',
                          estilos[turno.estado] || 'bg-slate-100 text-slate-700',
                        ]"
                      >
                        {{ etiquetas[turno.estado] || turno.estado }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </template>
    </section>
  </PanelPagina>
</template>
