<script setup lang="ts">
import { computed, ref } from 'vue'
import PanelPagina from '../../components/PanelPagina.vue'
import { trabajadoresMock } from '../../services/empresaMock'
import { diasRestantes, formatearFecha } from '../../utils/fechas'

// Estados de filtro
const filtroEstado = ref<string>('TODOS')
const filtroEmpresa = ref<string>('TODOS')
const busqueda = ref('')

const filtrosEstado = [
  { valor: 'TODOS', etiqueta: 'Todos los estados' },
  { valor: 'CRITICO', etiqueta: 'Críticos (≤ 7 días)' },
  { valor: 'ADVERTENCIA', etiqueta: 'Advertencia (> 7 días)' },
]

// Lista procesada de aptos vinculando la empresa real coherente con el sistema
const aptosLista = computed(() => {
  const lista = []

  for (const t of trabajadoresMock) {
    if (t.estadoAptitud === 'APTO' && t.fechaVencimiento) {
      const dias = diasRestantes(t.fechaVencimiento)
      
      let estadoFiltro = 'ADVERTENCIA'
      if (dias <= 7) {
        estadoFiltro = 'CRITICO'
      }

      const texto =
        dias < 0
          ? `Vencido hace ${-dias} días`
          : dias === 0
            ? 'Vence hoy'
            : dias === 1
              ? 'Vence mañana'
              : `Vence en ${dias} días`

      // Mapeo exacto de empresas reales usadas en la vista de Turnos
      let nombreEmpresa = 'Petrolera Andina S.A.'
      if (t.id === 'w2' || t.id === 'w6') {
        nombreEmpresa = 'Servicios Patagonia S.R.L.'
      } else if (t.id === 'w3') {
        nombreEmpresa = 'Transportes del Sur S.A.'
      }

      lista.push({
        id: t.id,
        nombre: `${t.apellido}, ${t.nombre}`,
        empresa: nombreEmpresa,
        puesto: t.puesto,
        fechaVencimiento: t.fechaVencimiento,
        dias,
        texto,
        estadoFiltro,
        urgente: dias <= 7,
      })
    }
  }

  return lista.sort((a, b) => a.dias - b.dias)
})

// Extraer lista única de empresas reales para el selector desplegable
const empresasDisponibles = computed(() => {
  const empresasSet = new Set<string>()
  for (const item of aptosLista.value) {
    if (item.empresa) {
      empresasSet.add(item.empresa)
    }
  }
  return Array.from(empresasSet)
})

// Filtrado combinado por texto, estado y empresa real
const aptosFiltrados = computed(() => {
  return aptosLista.value.filter((item) => {
    const coincideFiltroEstado =
      filtroEstado.value === 'TODOS' || item.estadoFiltro === filtroEstado.value
    
    const coincideFiltroEmpresa =
      filtroEmpresa.value === 'TODOS' || item.empresa === filtroEmpresa.value

    const coincideTexto =
      item.nombre.toLowerCase().includes(busqueda.value.toLowerCase()) ||
      item.empresa.toLowerCase().includes(busqueda.value.toLowerCase()) ||
      item.puesto.toLowerCase().includes(busqueda.value.toLowerCase())

    return coincideFiltroEstado && coincideFiltroEmpresa && coincideTexto
  })
})
</script>

<template>
  <PanelPagina
    titulo="Aptos y vencimientos"
    descripcion="Listado de seguimiento para control de vencimientos próximos."
  >
    <!-- Controles de búsqueda y filtros con el margen exacto -->
    <div class="mt-5 mb-3 flex flex-wrap items-center justify-between gap-3">
      <!-- Buscador -->
      <div class="relative flex-1 max-w-sm">
        <input
          v-model="busqueda"
          type="text"
          placeholder="Buscar por paciente, puesto o empresa..."
          class="w-full rounded-lg border border-[#dce2eb] bg-white px-3 py-2 text-sm text-[#172033] focus:outline-none focus:border-[#173b70]"
        />
      </div>

      <!-- Filtros y contador -->
      <div class="flex flex-wrap items-center gap-3">
        <!-- Selector por Empresa real con margen izquierdo (ml-4) respecto al buscador -->
        <select
          v-model="filtroEmpresa"
          class="ml-4 rounded-lg border border-[#dce2eb] bg-white px-3 py-2 text-sm text-[#172033] cursor-pointer focus:outline-none focus:border-[#173b70]"
        >
          <option value="TODOS">Todas las empresas</option>
          <option v-for="emp in empresasDisponibles" :key="emp" :value="emp">
            {{ emp }}
          </option>
        </select>

        <!-- Selector por Estado -->
        <select
          v-model="filtroEstado"
          class="rounded-lg border border-[#dce2eb] bg-white px-3 py-2 text-sm text-[#172033] cursor-pointer focus:outline-none focus:border-[#173b70]"
        >
          <option v-for="f in filtrosEstado" :key="f.valor" :value="f.valor">
            {{ f.etiqueta }}
          </option>
        </select>

        <div class="text-sm text-slate-500 whitespace-nowrap">{{ aptosFiltrados.length }} registros</div>
      </div>
    </div>

    <!-- Tabla con diseño unificado -->
    <div class="overflow-x-auto rounded-xl border border-[#e0e6ef] bg-white shadow-sm">
      <table class="w-full border-collapse text-left text-sm">
        <thead class="bg-[#f4f6fa] text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th class="px-4 py-3 font-semibold">Paciente</th>
            <th class="px-4 py-3 font-semibold">Empresa</th>
            <th class="px-4 py-3 font-semibold">Fecha de Vencimiento</th>
            <th class="px-4 py-3 font-semibold">Días Restantes</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="item in aptosFiltrados" :key="item.id" class="border-t border-[#e0e6ef]">
            <td class="px-4 py-3 font-medium">{{ item.nombre }}</td>
            <td class="px-4 py-3 text-slate-600">{{ item.empresa }}</td>
            <td class="px-4 py-3">{{ formatearFecha(item.fechaVencimiento) }}</td>
            <td class="px-4 py-3">
              <span
                class="inline-block rounded-full px-2.5 py-1 text-xs font-semibold"
                :class="item.urgente ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'"
              >
                {{ item.texto }}
              </span>
            </td>
          </tr>

          <tr v-if="aptosFiltrados.length === 0">
            <td colspan="4" class="px-4 py-8 text-center text-slate-500">
              No hay aptos médicos con esos filtros.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </PanelPagina>
</template>