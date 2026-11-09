<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { AptoPorVencer } from '../../types/clinica';
import { clinicaMock } from '../../services/clinicaMock';

const aptosPorVencer = ref<AptoPorVencer[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    aptosPorVencer.value = await clinicaMock.getAptosPorVencer();
  } catch (error) {
    console.error('Error al cargar los aptos por vencer:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Aptos Médicos por Vencer</h1>
      <p class="text-sm text-gray-500">Listado de seguimiento para control de vencimientos próximos.</p>
    </div>

    <div v-if="loading" class="text-gray-600">Cargando registros...</div>

    <div v-else class="overflow-x-auto bg-white shadow-md rounded-lg border border-gray-200">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Vencimiento</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Días Restantes</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="apto in aptosPorVencer" :key="apto.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ apto.paciente.nombre }} {{ apto.paciente.apellido }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ apto.empresa.razonSocial }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ apto.fechaVencimiento }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <span :class="[
                'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                apto.diasRestantes <= 15 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
              ]">
                {{ apto.diasRestantes }} días
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>