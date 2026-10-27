
<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

// Datos simulados para el panel del paciente.
const turnosMock = [
  {
    usuarioId: '4',
    fecha: '15 de noviembre de 2026',
    dia: '15',
    mes: 'NOV',
    anio: '2026',
    hora: '09:30',
    sede: 'Neuquén',
    estado: 'Confirmado',
    tipo: 'Control de salud ocupacional',
  },
]

// Busca únicamente el turno del usuario autenticado.
const turnoProximo = computed(() =>
  turnosMock.find(
    (turno) => turno.usuarioId === authStore.usuario?.id,
  ),
)

const nombrePaciente = computed(() => {
  const email = authStore.usuario?.email ?? ''
  const nombre = email.split('@')[0] || 'Paciente'

  return nombre.charAt(0).toUpperCase() + nombre.slice(1)
})

function cerrarSesion() {
  authStore.cerrarSesion()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-[#080b14] font-sans text-[#f4f7ff]">
    <!-- Encabezado -->
    <header
      class="flex flex-wrap items-center justify-between gap-4 border-b border-[#20283a] bg-[#0a0e1a] px-5 py-5 sm:px-8 lg:px-12"
    >
      <div class="flex min-w-0 items-center gap-3">
        <div
          class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/5 text-2xl font-bold text-[#00e5ff] shadow-[0_0_25px_rgba(0,229,255,0.06)]"
          aria-hidden="true"
        >
          +
        </div>

        <div>
          <h1 class="text-lg font-extrabold tracking-tight sm:text-xl">
            CHECKPOINT <span class="text-[#00e5ff]">SALUD</span>
          </h1>
          <p class="mt-1 text-xs text-[#8794aa] sm:text-sm">
            Portal del paciente
          </p>
        </div>
      </div>

      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-lg border border-[#293449] bg-[#111827] px-3 py-2.5 text-sm font-medium text-[#aab6c9] transition hover:border-[#00e5ff]/50 hover:bg-[#131c2d] hover:text-[#00e5ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00e5ff] sm:px-4"
        @click="cerrarSesion"
      >
        <svg
          class="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          aria-hidden="true"
        >
          <path d="M10 17l5-5-5-5M15 12H3" />
          <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
        </svg>
        <span>Cerrar sesión</span>
      </button>
    </header>

    <!-- Contenido principal -->
    <main class="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
      <!-- Bienvenida -->
      <section class="mb-9 sm:mb-12">
        <div
          class="mb-5 inline-flex items-center gap-2 rounded-md border border-[#253146] bg-[#111827] px-3 py-2 text-[10px] font-bold tracking-[1.5px] text-[#8fa3bb] sm:text-xs"
        >
          <span
            class="h-2 w-2 rounded-full bg-[#00e5ff] shadow-[0_0_9px_rgba(0,229,255,0.55)]"
          ></span>
          MI PORTAL DE SALUD
        </div>

        <h2 class="text-3xl font-bold tracking-tight sm:text-4xl">
          ¡Hola, <span class="text-[#00e5ff]">{{ nombrePaciente }}</span>!
        </h2>

        <p class="mt-3 max-w-2xl text-sm leading-7 text-[#8794aa] sm:text-base">
          Consultá la información de tu próximo turno y conocé los datos
          necesarios para asistir a tu control de salud ocupacional.
        </p>
      </section>

      <!-- Sección de turnos -->
      <section
        class="rounded-2xl border border-[#20283a] bg-[#0c111d] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.12)] sm:p-7"
      >
        <div
          class="mb-6 flex items-center justify-between gap-4 border-b border-[#20283a] pb-5 sm:mb-7"
        >
          <div>
            <p
              class="mb-2 text-[10px] font-bold tracking-[1.8px] text-[#00d8f0] sm:text-xs"
            >
              AGENDA
            </p>
            <h3 class="text-xl font-bold sm:text-2xl">
              Tu próximo turno
            </h3>
            <p class="mt-2 text-sm text-[#8794aa]">
              Información de tu próxima cita médica.
            </p>
          </div>

          <div
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/5 text-[#00e5ff] sm:h-12 sm:w-12"
            aria-hidden="true"
          >
            <svg
              class="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
            >
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M16 3v4M8 3v4M3 10h18" />
              <path d="m9 15 2 2 4-4" />
            </svg>
          </div>
        </div>

        <!-- Cuando existe un turno -->
        <article
          v-if="turnoProximo"
          class="overflow-hidden rounded-xl border border-[#293449] bg-[#0a0e1a]"
        >
          <!-- Estado y tipo de turno -->
          <div
            class="flex items-start justify-between gap-4 border-b border-[#293449] bg-[#111827] p-5 sm:p-7"
          >
            <div class="min-w-0">
              <span
                class="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300"
              >
                <span class="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                {{ turnoProximo.estado }}
              </span>

              <h4 class="mt-4 text-lg font-bold leading-snug sm:text-xl">
                {{ turnoProximo.tipo }}
              </h4>

              <p class="mt-2 text-sm text-[#8794aa]">
                Control médico ocupacional
              </p>
            </div>

            <div
              class="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0b292e] text-[#00e5ff] sm:flex"
              aria-hidden="true"
            >
              <svg
                class="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.7"
              >
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M16 3v4M8 3v4M3 10h18" />
              </svg>
            </div>
          </div>

          <!-- Fecha, hora y sede -->
          <div class="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3 sm:gap-4 sm:p-6">
            <div
              class="flex min-w-0 items-center gap-3 rounded-lg border border-[#293449] bg-[#111827]/70 p-4"
            >
              <div
                class="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-[#0b292e] text-[#00e5ff]"
              >
                <span class="text-[9px] font-bold tracking-wider">
                  {{ turnoProximo.mes }}
                </span>
                <span class="text-lg font-extrabold leading-5">
                  {{ turnoProximo.dia }}
                </span>
              </div>

              <div class="min-w-0">
                <p class="text-xs text-[#8794aa]">Fecha</p>
                <p class="mt-1 text-sm font-semibold leading-5">
                  {{ turnoProximo.fecha }}
                </p>
              </div>
            </div>

            <div
              class="flex min-w-0 items-center gap-3 rounded-lg border border-[#293449] bg-[#111827]/70 p-4"
            >
              <div
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#0b292e] text-[#00e5ff]"
              >
                <svg
                  class="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.7"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
              </div>

              <div>
                <p class="text-xs text-[#8794aa]">Horario</p>
                <p class="mt-1 text-sm font-semibold">
                  {{ turnoProximo.hora }} hs.
                </p>
              </div>
            </div>

            <div
              class="flex min-w-0 items-center gap-3 rounded-lg border border-[#293449] bg-[#111827]/70 p-4"
            >
              <div
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#0b292e] text-[#00e5ff]"
              >
                <svg
                  class="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.7"
                  aria-hidden="true"
                >
                  <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
              </div>

              <div>
                <p class="text-xs text-[#8794aa]">Lugar</p>
                <p class="mt-1 text-sm font-semibold">
                  Sede {{ turnoProximo.sede }}
                </p>
              </div>
            </div>
          </div>

          <!-- Aviso -->
          <div class="px-4 pb-4 sm:px-6 sm:pb-6">
            <div
              class="flex items-start gap-3 rounded-lg border border-cyan-400/15 bg-cyan-400/5 p-4"
            >
              <svg
                class="mt-0.5 h-5 w-5 shrink-0 text-[#00e5ff]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.7"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 11v5M12 7h.01" />
              </svg>

              <div>
                <p class="text-sm font-semibold text-[#00e5ff]">
                  Recordatorio
                </p>
                <p class="mt-1 text-sm leading-6 text-[#aab6c9]">
                  Te recomendamos presentarte unos minutos antes del horario
                  indicado. Si necesitás modificar tu asistencia, comunicate
                  con tu empresa.
                </p>
              </div>
            </div>
          </div>
        </article>

        <!-- Cuando no hay turnos -->
        <article
          v-else
          class="flex flex-col items-center rounded-xl border border-dashed border-[#354158] bg-[#0a0e1a] px-5 py-12 text-center"
        >
          <div
            class="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/5 text-[#00e5ff]"
          >
            <svg
              class="h-8 w-8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.6"
              aria-hidden="true"
            >
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M16 3v4M8 3v4M3 10h18M9 15h6" />
            </svg>
          </div>

          <h4 class="text-lg font-bold">
            No tenés turnos próximos
          </h4>

          <p class="mt-3 max-w-md text-sm leading-6 text-[#8794aa]">
            Cuando tu empresa te asigne un turno, vas a poder consultar acá
            la fecha, el horario y la sede correspondiente.
          </p>
        </article>
      </section>

      <!-- Pie de página -->
      <footer
        class="mt-8 flex flex-col items-center justify-between gap-2 border-t border-[#20283a] py-6 text-center text-xs text-[#66738a] sm:flex-row sm:text-left"
      >
        <p>© 2026 CheckPoint Salud</p>
        <p class="flex items-center gap-2">
          <svg
            class="h-4 w-4 text-[#00bcd4]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
            aria-hidden="true"
          >
            <rect x="4" y="10" width="16" height="11" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          </svg>
          Tu información, de forma clara y segura.
        </p>
      </footer>
    </main>
  </div>
</template>
