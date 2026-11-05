<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import PanelPagina from '../../components/PanelPagina.vue'
import { apiFetch } from '../../services/api'
import { formatearFecha, formatearHora } from '../../utils/fechas'

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

const turnos = ref<TurnoApi[]>([])
const cargando = ref(true)
const error = ref('')
const filtroEstado = ref<string>('TODOS')
const busqueda = ref('')

async function cargarTurnos() {
  try {
    cargando.value = true
    error.value = ''
    turnos.value = await apiFetch<TurnoApi[]>('/api/turnos')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'No se pudieron cargar los turnos.'
  } finally {
    cargando.value = false
  }
}

onMounted(cargarTurnos)

const turnosFiltrados = computed(() => {
  const texto = busqueda.value.trim().toLowerCase()

  return turnos.value
    .filter((turno) => {
      const cumpleEstado = filtroEstado.value === 'TODOS' || turno.estado === filtroEstado.value
      const pacienteNombre = `${turno.paciente?.nombre || ''} ${turno.paciente?.apellido || ''}`.toLowerCase()
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
</script>

<template>
  <PanelPagina
    titulo="Gestión de Turnos"
    descripcion="Administrá la agenda y los turnos programados de la clínica."
  >
    <section class="mx-auto max-w-[1500px]">
      <!-- Filtros y Búsqueda -->
      <div class="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-sm text-slate-500">
          Listado general de turnos vinculados en el sistema.
        </p>

        <div class="flex flex-wrap items-center gap-3">
          <input
            v-model="busqueda"
            type="text"
            placeholder="Buscar por paciente o DNI..."
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
      </div>

      <!-- Listado de Turnos -->
      <div class="rounded-2xl border border-[#dbe7ee] bg-white shadow-sm overflow-hidden">
        <div v-if="cargando" class="p-8 text-center text-sm text-slate-500">
          Cargando turnos desde el servidor...
        </div>

        <div v-else-if="error" role="alert" class="p-8 text-center text-sm text-red-700">
          {{ error }}
        </div>

          <div v-else-if="error" role="alert" class="p-8 text-center text-sm text-red-700">
          {{ error }}
        </div>

        <div v-else-if="turnosFiltrados.length === 0" class="p-8 text-center text-sm text-slate-500">
          No se encontraron turnos con los filtros seleccionados.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-[#dbe7ee] bg-[#f9fcfd] text-xs font-semibold text-[#173b70]">
                <th class="px-5 py-4">Paciente</th>
                <th class="px-5 py-4">DNI</th>
                <th class="px-5 py-4">Empresa</th>
                <th class="px-5 py-4">Fecha y Hora</th>
                <th class="px-5 py-4">Sede</th>
                <th class="px-5 py-4">Estado</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#edf1f5] text-sm">
              <tr v-for="turno in turnosFiltrados" :key="turno.id" class="hover:bg-[#f9fcfd]/60 transition-colors">
                <td class="px-5 py-4 font-semibold text-[#173b70]">
                  {{ turno.paciente?.apellido }}, {{ turno.paciente?.nombre }}
                </td>
                <td class="px-5 py-4 text-slate-600">{{ turno.paciente?.dni || 'N/A' }}</td>
                <td class="px-5 py-4 text-slate-600">{{ turno.paciente?.empresa?.razonSocial || 'N/A' }}</td>
                <td class="px-5 py-4 text-slate-600">
                  {{ formatearFecha(turno.fechaHora) }} - {{ formatearHora(turno.fechaHora) }} hs
                </td>
                <td class="px-5 py-4 text-slate-600">{{ turno.sede?.nombre || 'Central' }}</td>
                <td class="px-5 py-4">
                  <span :class="['rounded-full px-2.5 py-1 text-xs font-semibold', estilos[turno.estado as string] || 'bg-slate-100 text-slate-700']">
                    {{ etiquetas[turno.estado as string] || turno.estado }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </PanelPagina>
</template>