<script setup lang="ts">
import { computed } from 'vue'
import PanelPagina from '../components/PanelPagina.vue'
import { empresasMock, turnosMock } from '../services/clinicaMock'
import { formatearFecha, formatearHora } from '../utils/fechas'

const turnosPendientes = computed(() =>
  turnosMock.filter((turno) => turno.estado === 'PENDIENTE'),
)

const proximosTurnos = computed(() =>
  turnosMock
    .filter((turno) => turno.estado === 'PENDIENTE')
    .sort(
      (a, b) =>
        new Date(a.fechaHora).getTime() -
        new Date(b.fechaHora).getTime(),
    )
    .slice(0, 4),
)

const tarjetas = computed(() => [
  {
    titulo: 'Empresas',
    valor: empresasMock.length,
    descripcion: 'Empresas atendidas por la clínica.',
    icono: 'empresa',
  },
  {
    titulo: 'Turnos',
    valor: turnosMock.length,
    descripcion: 'Turnos registrados en la agenda.',
    icono: 'turno',
  },
  {
    titulo: 'Pendientes',
    valor: turnosPendientes.value.length,
    descripcion: 'Turnos que todavía deben atenderse.',
    icono: 'pendiente',
  },
  {
    titulo: 'Próximos',
    valor: proximosTurnos.value.length,
    descripcion: 'Próximos turnos de la agenda.',
    icono: 'proximo',
  },
])
</script>

<template>
  <PanelPagina
    titulo="Panel de Clínica"
    descripcion="Resumen general de la actividad de la clínica."
  >
    <section class="mx-auto max-w-[1500px]">

      <!-- Bienvenida -->
      <div class="mb-7">

        <p class="text-sm text-slate-500">
          Desde aquí podés consultar la actividad de la clínica,
          gestionar empresas y revisar los turnos programados.
        </p>
      </div>

      <!-- Tarjetas de resumen -->
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="tarjeta in tarjetas"
          :key="tarjeta.titulo"
          class="rounded-2xl border border-[#dbe7ee] bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="mb-1 text-sm text-slate-500">
                {{ tarjeta.titulo }}
              </p>

              <p class="text-3xl font-bold text-[#173b70]">
                {{ tarjeta.valor }}
              </p>
            </div>

            <div
              class="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e5f8fb] text-[#38b8cf]"
            >
              <!-- Empresa -->
              <svg
                v-if="tarjeta.icono === 'empresa'"
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

              <!-- Turno -->
              <svg
                v-else-if="tarjeta.icono === 'turno'"
                class="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.7"
              >
                <rect x="3" y="4" width="18" height="17" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
                <path d="M8 14h2M14 14h2M8 17h2" />
              </svg>

              <!-- Pendiente -->
              <svg
                v-else-if="tarjeta.icono === 'pendiente'"
                class="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.7"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>

              <!-- Próximo -->
              <svg
                v-else
                class="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.7"
              >
                <path d="M5 12h14" />
                <path d="m13 6 6 6-6 6" />
              </svg>
            </div>
          </div>

          <p class="mt-4 text-xs leading-relaxed text-slate-500">
            {{ tarjeta.descripcion }}
          </p>
        </article>
      </div>

      <!-- Contenido inferior -->
      <div class="mt-7 grid grid-cols-1 gap-6 xl:grid-cols-2">

        <!-- Empresas -->
        <section
          class="rounded-2xl border border-[#dbe7ee] bg-white p-6 shadow-sm"
        >
          <div class="mb-5 flex items-center justify-between">
            <div>
              <h3 class="text-lg font-bold text-[#173b70]">
                Empresas atendidas
              </h3>

              <p class="mt-1 text-sm text-slate-500">
                Empresas registradas en la clínica.
              </p>
            </div>

            <span
              class="rounded-full bg-[#e5f8fb] px-3 py-1 text-xs font-semibold text-[#168ca1]"
            >
              {{ empresasMock.length }}
            </span>
          </div>

          <div class="space-y-3">
            <article
              v-for="empresa in empresasMock"
              :key="empresa.id"
              class="flex items-center justify-between gap-4 rounded-xl border border-[#edf1f5] bg-[#f9fcfd] px-4 py-3"
            >
              <div class="flex min-w-0 items-center gap-3">
                <div
                  class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#e5f8fb] text-[#38b8cf]"
                >
                  <svg
                    class="h-5 w-5"
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

                <div class="min-w-0">
                  <p class="truncate text-sm font-semibold text-[#173b70]">
                    {{ empresa.razonSocial }}
                  </p>

                  <p class="mt-0.5 text-xs text-slate-500">
                    {{ empresa.trabajadores }} trabajadores
                  </p>
                </div>
              </div>

              <span class="shrink-0 text-xs text-slate-400">
                {{ empresa.cuit }}
              </span>
            </article>
          </div>
        </section>

        <!-- Próximos turnos -->
        <section
          class="rounded-2xl border border-[#dbe7ee] bg-white p-6 shadow-sm"
        >
          <div class="mb-5">
            <h3 class="text-lg font-bold text-[#173b70]">
              Próximos turnos
            </h3>

            <p class="mt-1 text-sm text-slate-500">
              Turnos pendientes de atención.
            </p>
          </div>

          <div class="space-y-3">
            <article
              v-for="turno in proximosTurnos"
              :key="turno.id"
              class="rounded-xl border border-[#edf1f5] bg-[#f9fcfd] p-4"
            >
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="text-sm font-semibold text-[#173b70]">
                    {{ turno.paciente }}
                  </p>

                  <p class="mt-1 text-xs text-slate-500">
                    {{ turno.empresa }}
                  </p>
                </div>

                <span
                  class="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700"
                >
                  Pendiente
                </span>
              </div>

              <div
                class="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500"
              >
                <span>
                  {{ formatearFecha(turno.fechaHora) }}
                </span>

                <span>
                  {{ formatearHora(turno.fechaHora) }} hs
                </span>

                <span>
                  {{ turno.sede }}
                </span>
              </div>
            </article>

            <div
              v-if="proximosTurnos.length === 0"
              class="rounded-xl border border-dashed border-[#dce2eb] px-5 py-8 text-center text-sm text-slate-500"
            >
              No hay próximos turnos pendientes.
            </div>
          </div>
        </section>
      </div>
    </section>
  </PanelPagina>
</template>