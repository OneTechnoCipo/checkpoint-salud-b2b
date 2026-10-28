<script setup lang="ts">
import { computed, ref } from 'vue'
import PanelPagina from '../../components/PanelPagina.vue'

const EXTENSIONES = ['.xlsx', '.csv']

const archivo = ref<File | null>(null)
const error = ref('')
const aviso = ref('')

const tamano = computed(() => {
  if (!archivo.value) return ''

  const kb = archivo.value.size / 1024
  return kb < 1024 ? `${Math.round(kb)} KB` : `${(kb / 1024).toFixed(1)} MB`
})

function elegirArchivo(evento: Event) {
  const entrada = evento.target as HTMLInputElement
  const elegido = entrada.files?.[0] ?? null

  archivo.value = null
  error.value = ''
  aviso.value = ''

  if (!elegido) return

  const nombre = elegido.name.toLowerCase()

  if (!EXTENSIONES.some((ext) => nombre.endsWith(ext))) {
    error.value = 'El archivo tiene que ser .xlsx o .csv.'
    entrada.value = ''
    return
  }

  archivo.value = elegido
}

function procesar() {
  if (!archivo.value) {
    error.value = 'Elegí un archivo antes de procesar.'
    return
  }

  error.value = ''
  aviso.value =
    'La importación todavía no está disponible. Se implementará más adelante.'
}
</script>

<template>
  <PanelPagina
    titulo="Carga masiva"
    descripcion="Importación de la nómina de una empresa (vista de ejemplo)."
  >
    <label
      class="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-[#b8c4d6] bg-white px-6 py-12 text-center transition-colors hover:border-[#173b70] focus-within:border-[#173b70]"
    >
      <span class="text-base font-semibold text-[#173b70]">
        Elegí un archivo para cargar
      </span>
      <span class="mt-1 text-sm text-slate-500">
        Formatos admitidos: .xlsx y .csv
      </span>
      <input
        type="file"
        accept=".xlsx,.csv"
        class="sr-only"
        @change="elegirArchivo"
      />
    </label>

    <div v-if="archivo" class="mt-4 text-sm text-slate-600">
      Archivo seleccionado: <strong>{{ archivo.name }}</strong> ({{ tamano }})
    </div>

    <div v-if="error" role="alert" class="mt-4 text-sm text-red-700">
      {{ error }}
    </div>

    <div v-if="aviso" role="status" class="mt-4 text-sm text-slate-600">
      {{ aviso }}
    </div>

    <button
      type="button"
      class="mt-4 cursor-pointer rounded-lg border-0 bg-[#173b70] px-5 py-2.5 text-sm text-white transition-colors hover:bg-[#24518f]"
      @click="procesar"
    >
      Procesar archivo
    </button>
  </PanelPagina>
</template>