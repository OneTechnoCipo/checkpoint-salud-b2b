<script setup lang="ts">
import { computed, ref } from 'vue'
import PanelPagina from '../../components/PanelPagina.vue'
import { turnosMock } from '../../services/clinicaMock.ts'
import type { EstadoTurno } from '../../types/clinica'
import { formatearFecha, formatearHora } from '../../utils/fechas'

const filtroEstado = ref<EstadoTurno | 'TODOS'>('TODOS')

const turnos = computed(() =>
  turnosMock
    .filter((t) => filtroEstado.value === 'TODOS' || t.estado === filtroEstado.value)
    .sort((a, b) => a.fechaHora.localeCompare(b.fechaHora)),
)

const etiquetas: Record<EstadoTurno, string> = {
  PENDIENTE: 'Pendiente',
  ASISTIO: 'Asistió',
  CANCELADO: 'Cancelado',
}

const estilos: Record<EstadoTurno, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-800',
  ASISTIO: 'bg-emerald-100 text-emerald-800',
  CANCELADO: 'bg-red-100 text-red-800',
}
</script>

<template>
  <PanelPagina
    titulo="Turnos Solicitados"
    descripcion="Agenda de turnos de la clínica."
  >
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <label class="flex items-center gap-2 text-sm text-slate-600">
        Estado
        <select
          v-model="filtroEstado"
          class="rounded-lg border border-[#dce2eb] bg-white px-3 py-2 text-sm"
        >
          <option value="TODOS">Todos</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="ASISTIO">Asistió</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
      </label>

      <p class="m-0 text-sm text-slate-500">{{ turnos.length }} turnos</p>
    </div>

    <div class="overflow-x-auto rounded-xl border border-[#e0e6ef] bg-white shadow-sm">
      <table class="w-full border-collapse text-left text-sm">
        <thead class="bg-[#00dbe78c] text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th class="px-4 py-3 font-semibold">Fecha</th>
            <th class="px-4 py-3 font-semibold">Hora</th>
            <th class="px-4 py-3 font-semibold">Paciente</th>
            <th class="px-4 py-3 font-semibold">DNI</th>
            <th class="px-4 py-3 font-semibold">Empresa</th>
            <th class="px-4 py-3 font-semibold">Sede</th>
            <th class="px-4 py-3 font-semibold">Estado</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="t in turnos" :key="t.id" class="border-t border-[#e0e6ef]">
            <td class="px-4 py-3">{{ formatearFecha(t.fechaHora) }}</td>
            <td class="px-4 py-3">{{ formatearHora(t.fechaHora) }} hs</td>
            <td class="px-4 py-3 font-medium">{{ t.paciente }}</td>
            <td class="px-4 py-3">{{ t.dni }}</td>
            <td class="px-4 py-3">{{ t.empresa }}</td>
            <td class="px-4 py-3">{{ t.sede }}</td>
            <td class="px-4 py-3">
              <span
                class="inline-block rounded-full px-2.5 py-1 text-xs font-semibold"
                :class="estilos[t.estado]"
              >
                {{ etiquetas[t.estado] }}
              </span>
            </td>
          </tr>

          <tr v-if="turnos.length === 0">
            <td colspan="7" class="px-4 py-8 text-center text-slate-500">
              No hay turnos con ese estado.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </PanelPagina>
</template>