<script setup lang="ts">
import { computed, ref } from 'vue'
import PanelPagina from '../../components/PanelPagina.vue'
import { turnosMock } from '../../services/clinicaMock'
import type { EstadoTurno } from '../../types/clinica'
import { formatearFecha, formatearHora } from '../../utils/fechas'

const filtroEstado = ref<EstadoTurno | 'TODOS'>('TODOS')
const busqueda = ref('')

const turnos = computed(() => {
  const texto = busqueda.value.trim().toLowerCase()

  return turnosMock
    .filter(
      (turno) =>
        filtroEstado.value === 'TODOS' ||
        turno.estado === filtroEstado.value,
    )
    .filter(
      (turno) =>
        !texto ||
        turno.paciente.toLowerCase().includes(texto) ||
        turno.dni.includes(texto) ||
        turno.empresa.toLowerCase().includes(texto),
    )
    .sort(
      (a, b) =>
        new Date(a.fechaHora).getTime() -
        new Date(b.fechaHora).getTime(),
    )
})

const etiquetas: Record<EstadoTurno, string> = {
  PENDIENTE: 'Pendiente',
  ASISTIO: 'Asistió',
  CANCELADO: 'Cancelado',
}

const estilos: Record<EstadoTurno, string> = {
  PENDIENTE: 'bg-amber-50 text-amber-700',
  ASISTIO: 'bg-emerald-50 text-emerald-700',
  CANCELADO: 'bg-red-50 text-red-700',
}

const filtros: {
  valor: EstadoTurno | 'TODOS'
  etiqueta: string
}[] = [
  { valor: 'TODOS', etiqueta: 'Todos' },
  { valor: 'PENDIENTE', etiqueta: 'Pendientes' },
  { valor: 'ASISTIO', etiqueta: 'Asistió' },
  { valor: 'CANCELADO', etiqueta: 'Cancelados' },
]
</script>

<template>
  <PanelPagina
    titulo="Turnos solicitados"
    descripcion="Agenda de turnos de la clínica."
  >
    <section class="mx-auto max-w-[1500px]">

    <!-- Filtros y cantidad -->
     <div
     class="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
     >
     
     <!-- Filtro de estado -->
      <div class="flex items-center gap-3">
        <label
        for="filtroEstado"
        class="flex items-center gap-2 text-sm font-medium text-[#173b70]"
        >
        
        <!-- Icono filtro -->
         <span
         class="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e5f8fb] text-[#38b8cf]"
         >
         <svg
          class="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
        >
        <path d="M4 5h16" />
        <path d="M7 12h10" />
        <path d="M10 19h4" />
       </svg>
       </span>

      Estado
    </label>

    <div class="relative">
      <select
        id="filtroEstado"
        v-model="filtroEstado"
        class="cursor-pointer appearance-none rounded-xl border border-[#dbe7ee] bg-white py-2.5 pl-4 pr-10 text-sm font-medium text-[#172033] shadow-sm outline-none transition focus:border-[#38b8cf] focus:ring-2 focus:ring-[#38b8cf]/10 hover:border-[#b8dce5]"
      >
        <option value="TODOS">Todos</option>
        <option value="PENDIENTE">Pendiente</option>
        <option value="ASISTIO">Asistió</option>
        <option value="CANCELADO">Cancelado</option>
      </select>

      <!-- Flecha -->
      <svg
        class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  </div>
  
  <!-- Cantidad -->
   <div
    class="flex items-center gap-2 text-sm text-slate-500"
    >
    <span
      class="rounded-full bg-[#e5f8fb] px-3 py-1 font-semibold text-[#168ca1]"
    >
      {{ turnos.length }}
    </span>

    <span>
      {{ turnos.length === 1 ? 'turno encontrado' : 'turnos encontrados' }}
    </span>
  </div>
</div>

      <!-- Tabla -->
      <div
        class="overflow-hidden rounded-2xl border border-[#dbe7ee] bg-white shadow-sm"
      >
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-left text-sm">

            <!-- Encabezado -->
            <thead
              class="bg-[#f7fafc] text-xs uppercase tracking-wide text-slate-500"
            >
              <tr>
                <th class="px-5 py-4 font-semibold">Fecha</th>
                <th class="px-5 py-4 font-semibold">Hora</th>
                <th class="px-5 py-4 font-semibold">Paciente</th>
                <th class="px-5 py-4 font-semibold">DNI</th>
                <th class="px-5 py-4 font-semibold">Empresa</th>
                <th class="px-5 py-4 font-semibold">Sede</th>
                <th class="px-5 py-4 font-semibold">Estado</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="turno in turnos"
                :key="turno.id"
                class="border-t border-[#edf1f5] transition-colors hover:bg-[#f9fcfd]"
              >
                <!-- Fecha -->
                <td class="whitespace-nowrap px-5 py-4 text-slate-600">
                  {{ formatearFecha(turno.fechaHora) }}
                </td>

                <!-- Hora -->
                <td class="whitespace-nowrap px-5 py-4 text-slate-600">
                  {{ formatearHora(turno.fechaHora) }} hs
                </td>

                <!-- Paciente -->
                <td
                  class="whitespace-nowrap px-5 py-4 font-semibold text-[#173b70]"
                >
                  {{ turno.paciente }}
                </td>

                <!-- DNI -->
                <td class="whitespace-nowrap px-5 py-4 text-slate-600">
                  {{ turno.dni }}
                </td>

                <!-- Empresa -->
                <td class="px-5 py-4 text-slate-600">
                  {{ turno.empresa }}
                </td>

                <!-- Sede -->
                <td class="px-5 py-4 text-slate-600">
                  {{ turno.sede }}
                </td>

                <!-- Estado -->
                <td class="whitespace-nowrap px-5 py-4">
                  <span
                    class="inline-block rounded-full px-2.5 py-1 text-xs font-semibold"
                    :class="estilos[turno.estado]"
                  >
                    {{ etiquetas[turno.estado] }}
                  </span>
                </td>
              </tr>

              <!-- Sin resultados -->
              <tr v-if="turnos.length === 0">
                <td
                  colspan="7"
                  class="px-5 py-12 text-center"
                >
                  <p class="font-semibold text-[#173b70]">
                    No encontramos turnos
                  </p>

                  <p class="mt-1 text-sm text-slate-500">
                    Probá cambiando el filtro o la búsqueda.
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </section>
  </PanelPagina>
</template>