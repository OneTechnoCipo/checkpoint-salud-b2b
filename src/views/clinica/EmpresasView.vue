<script setup lang="ts">
import { computed, ref } from 'vue'
import PanelPagina from '../../components/PanelPagina.vue'
import { empresasMock } from '../../services/clinicaMock'

const busqueda = ref('')

const empresas = computed(() => {
  const texto = busqueda.value.trim().toLowerCase()

  return empresasMock
    .filter(
      (empresa) =>
        !texto ||
        empresa.razonSocial.toLowerCase().includes(texto) ||
        empresa.cuit.includes(texto),
    )
    .sort((a, b) => a.razonSocial.localeCompare(b.razonSocial))
})
</script>

<template>
  <PanelPagina
    titulo="Empresas"
    descripcion="Gestioná las empresas contratistas atendidas por la clínica."
  >
    <section class="mx-auto max-w-[1500px]">

      <!-- Buscador y cantidad -->
      <div
        class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="relative w-full max-w-md">

          <!-- Icono lupa -->
          <svg
            class="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>

          <input
            v-model="busqueda"
            type="search"
            placeholder="Buscar por razón social o CUIT"
            class="w-full rounded-xl border border-[#dbe7ee] bg-white py-2.5 pl-10 pr-4 text-sm text-[#172033] outline-none placeholder:text-slate-400 focus:border-[#38b8cf] focus:ring-2 focus:ring-[#38b8cf]/10"
          />
        </div>

        <span class="text-sm text-slate-500">
          {{ empresas.length }}
          {{ empresas.length === 1 ? 'empresa' : 'empresas' }}
        </span>
      </div>

      <!-- Tarjetas de empresas -->
      <div
        v-if="empresas.length > 0"
        class="grid grid-cols-1 gap-5 xl:grid-cols-2"
      >
        <article
          v-for="empresa in empresas"
          :key="empresa.id"
          class="rounded-2xl border border-[#dbe7ee] bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <!-- Datos principales -->
          <div class="flex items-start gap-4">

            <!-- Icono empresa -->
            <div
              class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#e5f8fb] text-[#38b8cf]"
            >
              <svg
                class="h-7 w-7"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.7"
              >
                <path d="M4 21V7l8-4 8 4v14" />
                <path d="M9 21v-5h6v5" />
                <path d="M8 9h1M15 9h1M8 12h1M15 12h1" />
              </svg>
            </div>

            <!-- Información -->
            <div class="min-w-0">
              <h3 class="text-base font-bold text-[#173b70]">
                {{ empresa.razonSocial }}
              </h3>

              <p class="mt-1 text-sm text-slate-500">
                {{ empresa.trabajadores }} trabajadores
              </p>

              <p class="mt-1 text-xs text-slate-400">
                CUIT {{ empresa.cuit }}
              </p>
            </div>
          </div>

          <!-- Separador -->
          <div class="my-5 border-t border-[#edf1f5]"></div>

          <!-- Vencimientos -->
          <div
            class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div class="flex flex-wrap gap-6">

              <!-- Vencidos -->
              <div class="flex items-center gap-2">
                <span
                  class="h-2.5 w-2.5 rounded-full bg-red-500"
                ></span>

                <div>
                  <span class="text-sm font-bold text-[#173b70]">
                    {{ empresa.vencidos }}
                  </span>

                  <span class="ml-1 text-xs text-slate-500">
                    {{ empresa.vencidos === 1 ? 'vencido' : 'vencidos' }}
                  </span>
                </div>
              </div>

              <!-- Por vencer -->
              <div class="flex items-center gap-2">
                <span
                  class="h-2.5 w-2.5 rounded-full bg-amber-400"
                ></span>

                <div>
                  <span class="text-sm font-bold text-[#173b70]">
                    {{ empresa.porVencer }}
                  </span>

                  <span class="ml-1 text-xs text-slate-500">
                    por vencer
                  </span>
                </div>
              </div>
            </div>

            <!-- Acción -->
            <button
  type="button"
  class="flex items-center gap-1 self-end border-0 bg-transparent p-0 text-sm font-semibold text-[#168ca1] transition hover:text-[#173b70]"
>
  Ver empresa

  <svg
    class="h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
  >
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
</button>
          </div>
        </article>
      </div>

      <!-- Sin resultados -->
      <div
        v-else
        class="rounded-2xl border border-dashed border-[#dbe7ee] bg-white px-6 py-12 text-center"
      >
        <div
          class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#e5f8fb] text-[#38b8cf]"
        >
          <svg
            class="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
          >
            <path d="M4 21V7l8-4 8 4v14" />
            <path d="M9 21v-5h6v5" />
            <path d="M8 9h1M15 9h1M8 12h1M15 12h1" />
          </svg>
        </div>

        <p class="text-sm font-semibold text-[#173b70]">
          No encontramos empresas
        </p>

        <p class="mt-1 text-xs text-slate-500">
          Probá buscar con otra razón social o CUIT.
        </p>
      </div>

    </section>
  </PanelPagina>
</template>