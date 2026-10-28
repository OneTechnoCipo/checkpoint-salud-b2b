<script setup lang="ts">
import { computed, ref } from 'vue'
import PanelPagina from '../../components/PanelPagina.vue'
import { empresasMock } from '../../services/clinicaMock.ts'

const busqueda = ref('')

const empresas = computed(() => {
  const texto = busqueda.value.trim().toLowerCase()

  return empresasMock
    .filter(
      (e) =>
        !texto ||
        e.razonSocial.toLowerCase().includes(texto) ||
        e.cuit.includes(texto),
    )
    .sort((a, b) => a.razonSocial.localeCompare(b.razonSocial))
})
</script>

<template>
  <PanelPagina
    titulo="Empresas"
    descripcion="Empresas contratistas atendidas por la clínica (datos de ejemplo)."
  >
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <input
        v-model="busqueda"
        type="search"
        placeholder="Buscar por razón social o CUIT"
        class="w-full max-w-xs rounded-lg border border-[#dce2eb] bg-white px-3 py-2 text-sm text-[#172033] placeholder:text-slate-400"
      />

      <div class="text-sm text-slate-500">{{ empresas.length }} empresas</div>
    </div>

    <div class="overflow-x-auto rounded-xl border border-[#e0e6ef] bg-white shadow-sm">
      <table class="w-full border-collapse text-left text-sm">
        <thead class="bg-[#f4f6fa] text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th class="px-4 py-3 font-semibold">Razón social</th>
            <th class="px-4 py-3 font-semibold">CUIT</th>
            <th class="px-4 py-3 font-semibold">Trabajadores</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="e in empresas" :key="e.id" class="border-t border-[#e0e6ef]">
            <td class="px-4 py-3 font-medium">{{ e.razonSocial }}</td>
            <td class="px-4 py-3">{{ e.cuit }}</td>
            <td class="px-4 py-3">{{ e.trabajadores }}</td>
          </tr>

          <tr v-if="empresas.length === 0">
            <td colspan="3" class="px-4 py-8 text-center text-slate-500">
              No hay empresas que coincidan con la búsqueda.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </PanelPagina>
</template>