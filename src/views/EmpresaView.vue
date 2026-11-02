<script setup lang="ts">
import { computed } from 'vue'
import PanelPagina from '../components/PanelPagina.vue'
import {
  datosEmpresaMock,
  trabajadoresMock,
  turnosEmpresaMock,
} from '../services/empresaMock'
import { diasRestantes, formatearFecha, formatearHora } from '../utils/fechas'
// Datos de ejemplo de la empresa, incluyendo trabajadores y turnos.
const empresa = datosEmpresaMock

const resumen = computed(() => {
  const total = trabajadoresMock.length
  const aptos = trabajadoresMock.filter((t) => t.estadoAptitud === 'APTO')
  const noAptos = trabajadoresMock.filter((t) => t.estadoAptitud === 'NO_APTO').length
  const pendientes = trabajadoresMock.filter((t) => t.estadoAptitud === 'PENDIENTE').length

  const vencen30 = aptos.filter((t) => {
    if (!t.fechaVencimiento) return false

    const dias = diasRestantes(t.fechaVencimiento)
    return dias >= 0 && dias <= 30
  }).length

  const porPuesto = new Map<string, number>()
  for (const t of trabajadoresMock) {
    porPuesto.set(t.puesto, (porPuesto.get(t.puesto) ?? 0) + 1)
  }

  const puestos = [...porPuesto.entries()]
    .map(([puesto, cantidad]) => ({ puesto, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad || a.puesto.localeCompare(b.puesto))

  return { total, aptos: aptos.length, noAptos, pendientes, vencen30, puestos }
})

const proximosTurnos = computed(() =>
  turnosEmpresaMock
    .filter((t) => t.estado === 'PENDIENTE')
    .sort((a, b) => a.fechaHora.localeCompare(b.fechaHora)),
)
// Indicadores de aptitud y distribución de trabajadores por puesto.
const indicadores = computed(() => [
  { titulo: 'Aptos', valor: resumen.value.aptos, color: 'text-emerald-700' },
  { titulo: 'No aptos', valor: resumen.value.noAptos, color: 'text-red-700' },
  { titulo: 'Pendientes de examen', valor: resumen.value.pendientes, color: 'text-amber-700' },
  { titulo: 'Vencen en 30 días', valor: resumen.value.vencen30, color: 'text-[#173b70]' },
])

const distribucion = computed(() => [
  { nombre: 'Aptos', cantidad: resumen.value.aptos, barra: 'bg-emerald-500' },
  { nombre: 'No aptos', cantidad: resumen.value.noAptos, barra: 'bg-red-500' },
  { nombre: 'Pendientes', cantidad: resumen.value.pendientes, barra: 'bg-amber-400' },
])

function porcentaje(cantidad: number): string {
  return resumen.value.total
    ? `${Math.round((cantidad / resumen.value.total) * 100)}%`
    : '0%'
}
</script>

<template>
  <PanelPagina titulo="Panel de Empresa" :descripcion="empresa.razonSocial">
    <!-- Ficha de la empresa -->
    <section
      class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e0e6ef] bg-white px-4 py-3 shadow-sm"
    >
      <div>
        <div class="text-sm font-semibold text-[#173b70]">{{ empresa.razonSocial }}</div>
        <div class="mt-0.5 text-xs text-slate-500">CUIT {{ empresa.cuit }}</div>
      </div>

      <div class="flex gap-6">
        <div>
          <div class="text-xs text-slate-500">Trabajadores</div>
          <div class="text-lg font-bold text-[#173b70]">{{ resumen.total }}</div>
        </div>
        <div>
          <div class="text-xs text-slate-500">Puestos</div>
          <div class="text-lg font-bold text-[#173b70]">{{ resumen.puestos.length }}</div>
        </div>
        <div>
          <div class="text-xs text-slate-500">Turnos pendientes</div>
          <div class="text-lg font-bold text-[#173b70]">{{ proximosTurnos.length }}</div>
        </div>
      </div>
    </section>

    <!-- Indicadores -->
    <section
      class="mt-3 grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3"
      aria-label="Indicadores"
    >
      <RouterLink
        v-for="item in indicadores"
        :key="item.titulo"
        to="/empresa/trabajadores"
        class="rounded-lg border border-[#e0e6ef] bg-white px-3 py-2.5 text-inherit no-underline shadow-sm transition-colors hover:border-[#173b70]"
      >
        <div class="text-xs text-slate-500">{{ item.titulo }}</div>
        <div class="mt-1 text-2xl font-bold" :class="item.color">{{ item.valor }}</div>
      </RouterLink>
    </section>

    <!-- Distribución de aptitud -->
    <section class="mt-3 rounded-xl border border-[#e0e6ef] bg-white px-4 py-3 shadow-sm">
      <div class="mb-2 text-sm font-semibold">Estado de aptitud del personal</div>

      <div class="flex h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          v-for="d in distribucion"
          :key="d.nombre"
          :class="d.barra"
          :style="{ width: porcentaje(d.cantidad) }"
        ></div>
      </div>

      <div class="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-600">
        <div v-for="d in distribucion" :key="d.nombre" class="flex items-center gap-1.5">
          <span class="inline-block h-2 w-2 rounded-full" :class="d.barra"></span>
          {{ d.nombre }}: {{ d.cantidad }} ({{ porcentaje(d.cantidad) }})
        </div>
      </div>
    </section>

    <div class="mt-3 grid gap-3 lg:grid-cols-2">
      <!-- Trabajadores por puesto -->
      <section class="rounded-xl border border-[#e0e6ef] bg-white px-4 py-3 shadow-sm">
        <div class="mb-2 text-sm font-semibold">Trabajadores por puesto</div>

        <div
          v-for="p in resumen.puestos"
          :key="p.puesto"
          class="flex items-center justify-between border-t border-[#e0e6ef] py-1.5 text-sm first:border-t-0"
        >
          <span>{{ p.puesto }}</span>
          <span class="font-semibold text-[#173b70]">{{ p.cantidad }}</span>
        </div>
      </section>

      <!-- Próximos turnos -->
      <section class="rounded-xl border border-[#e0e6ef] bg-white px-4 py-3 shadow-sm">
        <div class="mb-2 flex items-center justify-between">
          <div class="text-sm font-semibold">Próximos turnos</div>
          <RouterLink to="/empresa/turnos" class="text-xs text-[#173b70] hover:underline">
            Ver todos
          </RouterLink>
        </div>

        <div
          v-for="t in proximosTurnos"
          :key="t.id"
          class="flex items-center justify-between gap-3 border-t border-[#e0e6ef] py-1.5 text-sm first:border-t-0"
        >
          <span class="font-medium">{{ t.trabajador }}</span>
          <span class="text-xs text-slate-500">
            {{ formatearFecha(t.fechaHora) }} · {{ formatearHora(t.fechaHora) }} hs
          </span>
        </div>

        <div v-if="proximosTurnos.length === 0" class="py-2 text-sm text-slate-500">
          No hay turnos pendientes.
        </div>
      </section>
    </div>
  </PanelPagina>
</template>