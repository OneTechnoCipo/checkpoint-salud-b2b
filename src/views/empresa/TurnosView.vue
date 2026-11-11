
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import PanelPagina from '../../components/PanelPagina.vue'
import { apiFetch } from '../../services/api'
import type { EstadoAptitud } from '../../types/empresa'
import {
  diasRestantes,
  enDias,
  formatearFecha,
  formatearHora,
} from '../../utils/fechas'

interface TrabajadorEmpresa {
  id: string
  dni: string
  nombre: string
  apellido: string
  puesto: {
    id: string
    nombrePuesto: string
    mesesVigencia: number
  } | null
  estadoAptitud: EstadoAptitud
  fechaVencimiento: string | null
}

interface Sede {
  id: string
  nombre: string
  direccion: string
}

type EstadoTurnoEmpresa = 'PENDIENTE' | 'ASISTIO' | 'CANCELADO'

interface TurnoEmpresa {
  id: string
  trabajadorId: string
  trabajador: string
  fechaHora: string
  horaAConfirmar: boolean
  sedeId: string
  sede: string
  direccionSede?: string | null
  estado: EstadoTurnoEmpresa
  estadoSolicitud?: string
}

interface RespuestaTrabajadores {
  mensaje: string
  trabajadores: TrabajadorEmpresa[]
}

interface RespuestaSedes {
  mensaje: string
  sedes: Sede[]
}

interface RespuestaTurnos {
  mensaje: string
  turnos: TurnoEmpresa[]
}

const manana = enDias(1).slice(0, 10)

const trabajadores = ref<TrabajadorEmpresa[]>([])
const sedes = ref<Sede[]>([])
const turnos = ref<TurnoEmpresa[]>([])

const cargando = ref(true)
const enviando = ref(false)
const errorCarga = ref('')

const filtroEstado = ref<EstadoTurnoEmpresa | 'TODOS'>('TODOS')

const formularioAbierto = ref(false)
const trabajadorId = ref('')
const fechaPreferida = ref('')
const sedeId = ref('')
const error = ref('')
const aviso = ref('')

const filtros: { valor: EstadoTurnoEmpresa | 'TODOS'; etiqueta: string }[] = [
  { valor: 'TODOS', etiqueta: 'Todos' },
  { valor: 'PENDIENTE', etiqueta: 'Pendientes' },
  { valor: 'ASISTIO', etiqueta: 'Asistió' },
  { valor: 'CANCELADO', etiqueta: 'Cancelados / rechazados' },
]

const etiquetas: Record<EstadoTurnoEmpresa, string> = {
  PENDIENTE: 'Pendiente',
  ASISTIO: 'Asistió',
  CANCELADO: 'Cancelado',
}

const estilos: Record<EstadoTurnoEmpresa, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-800',
  ASISTIO: 'bg-emerald-100 text-emerald-800',
  CANCELADO: 'bg-red-100 text-red-800',
}

const conTurnoPendiente = computed(
  () =>
    new Set(
      turnos.value
        .filter((turno) => turno.estado === 'PENDIENTE')
        .map((turno) => turno.trabajadorId),
    ),
)

interface PorSolicitar {
  trabajador: TrabajadorEmpresa
  texto: string
  urgente: boolean
  orden: number
}

// Trabajadores con apto pendiente o próximo a vencer.
const necesitanTurno = computed(() => {
  const lista: PorSolicitar[] = []

  for (const trabajador of trabajadores.value) {
    if (conTurnoPendiente.value.has(trabajador.id)) continue

    if (trabajador.estadoAptitud === 'PENDIENTE') {
      lista.push({
        trabajador,
        texto: 'Pendiente de examen',
        urgente: false,
        orden: 31,
      })
      continue
    }

    if (
      (trabajador.estadoAptitud === 'APTO' ||
        trabajador.estadoAptitud === 'APTO_CON_OBSERVACIONES') &&
      trabajador.fechaVencimiento
    ) {
      const dias = diasRestantes(trabajador.fechaVencimiento)

      if (dias <= 30) {
        const texto =
          dias < 0
            ? `Apto vencido hace ${-dias} días`
            : dias === 0
              ? 'Vence hoy'
              : dias === 1
                ? 'Vence mañana'
                : `Vence en ${dias} días`

        lista.push({
          trabajador,
          texto,
          urgente: dias <= 7,
          orden: dias,
        })
      }
    }
  }

  return lista.sort((a, b) => a.orden - b.orden)
})

// Trabajadores disponibles para solicitar turno.
const solicitables = computed(() =>
  trabajadores.value
    .filter(
      (trabajador) =>
        trabajador.estadoAptitud !== 'NO_APTO' &&
        !conTurnoPendiente.value.has(trabajador.id),
    )
    .sort((a, b) => a.apellido.localeCompare(b.apellido)),
)

const turnosFiltrados = computed(() =>
  turnos.value
    .filter(
      (turno) =>
        filtroEstado.value === 'TODOS' ||
        turno.estado === filtroEstado.value,
    )
    .sort((a, b) => a.fechaHora.localeCompare(b.fechaHora)),
)

async function cargarDatos() {
  cargando.value = true
  errorCarga.value = ''

  try {
    const [respuestaTrabajadores, respuestaTurnos, respuestaSedes] =
      await Promise.all([
        apiFetch<RespuestaTrabajadores>('/api/empresa/trabajadores'),
        apiFetch<RespuestaTurnos>('/api/empresa/turnos'),
        apiFetch<RespuestaSedes>('/api/empresa/sedes'),
      ])

    trabajadores.value = respuestaTrabajadores.trabajadores
    turnos.value = respuestaTurnos.turnos
    sedes.value = respuestaSedes.sedes

    if (!sedeId.value && sedes.value.length > 0) {
      sedeId.value = sedes.value[0].id
    }
  } catch (err) {
    errorCarga.value =
      err instanceof Error
        ? err.message
        : 'No se pudieron cargar los datos de turnos.'
  } finally {
    cargando.value = false
  }
}

function abrirFormulario(id = '') {
  trabajadorId.value = id
  fechaPreferida.value = ''
  sedeId.value = sedes.value[0]?.id ?? ''
  error.value = ''
  aviso.value = ''
  formularioAbierto.value = true
}

function cancelar() {
  formularioAbierto.value = false
  error.value = ''
}

async function solicitar() {
  error.value = ''
  aviso.value = ''

  const trabajador = trabajadores.value.find(
    (t) => t.id === trabajadorId.value,
  )

  if (!trabajador) {
    error.value = 'Elegí un trabajador.'
    return
  }

  if (!fechaPreferida.value || fechaPreferida.value < manana) {
    error.value = 'Elegí una fecha a partir de mañana.'
    return
  }

  if (!sedeId.value) {
    error.value = 'Elegí una sede.'
    return
  }

  if (trabajador.estadoAptitud === 'NO_APTO') {
    error.value = 'Este trabajador tiene estado NO APTO y no puede solicitar turno.'
    return
  }

  if (conTurnoPendiente.value.has(trabajador.id)) {
    error.value = 'Este trabajador ya tiene una solicitud o turno pendiente.'
    return
  }

  enviando.value = true

  try {
    await apiFetch('/api/turnos/solicitudes', {
      method: 'POST',
      body: JSON.stringify({
        pacienteId: trabajador.id,
        fechaPreferida: fechaPreferida.value,
        sedeId: sedeId.value,
      }),
    })

    const nombre = `${trabajador.apellido}, ${trabajador.nombre}`

    aviso.value = `Solicitud enviada para ${nombre} el ${formatearFecha(fechaPreferida.value)}. La clínica confirmará el horario.`

    formularioAbierto.value = false
    trabajadorId.value = ''
    fechaPreferida.value = ''

    await cargarDatos()
  } catch (err) {
    error.value =
      err instanceof Error
        ? err.message
        : 'No se pudo enviar la solicitud.'
  } finally {
    enviando.value = false
  }
}

onMounted(() => {
  cargarDatos()
})
</script>

<template>
  <PanelPagina
    titulo="Turnos"
    descripcion="Solicitá turnos para tus trabajadores y consultá el estado de cada solicitud."
  >
    <div
      v-if="aviso"
      role="status"
      class="mb-3 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
    >
      {{ aviso }}
    </div>

    <div
      v-if="errorCarga"
      role="alert"
      class="mb-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ errorCarga }}

      <button
        type="button"
        class="ml-2 font-semibold underline"
        @click="cargarDatos"
      >
        Reintentar
      </button>
    </div>

    <div
      v-if="cargando"
      class="rounded-xl border border-[#e0e6ef] bg-white px-4 py-8 text-center text-sm text-slate-500 shadow-sm"
    >
      Cargando información de turnos...
    </div>

    <template v-else>
      <!-- Necesitan turno -->
      <section class="rounded-xl border border-[#e0e6ef] bg-white px-4 py-3 shadow-sm">
        <div class="mb-2 flex items-center justify-between gap-3">
          <div class="text-sm font-semibold">Necesitan turno</div>
          <div class="text-xs text-slate-500">
            {{ necesitanTurno.length }} trabajadores
          </div>
        </div>

        <div
          v-for="p in necesitanTurno"
          :key="p.trabajador.id"
          class="flex flex-wrap items-center justify-between gap-2 border-t border-[#e0e6ef] py-2 first:border-t-0"
        >
          <div>
            <div class="text-sm font-medium">
              {{ p.trabajador.apellido }}, {{ p.trabajador.nombre }}
            </div>
            <div class="text-xs text-slate-500">
              {{ p.trabajador.puesto?.nombrePuesto ?? 'Sin puesto asignado' }}
            </div>
          </div>

          <div class="flex items-center gap-3">
            <span
              class="rounded-full px-2.5 py-1 text-xs font-semibold"
              :class="
                p.urgente
                  ? 'bg-red-100 text-red-800'
                  : 'bg-amber-100 text-amber-800'
              "
            >
              {{ p.texto }}
            </span>

            <button
              type="button"
              class="cursor-pointer rounded-lg border-0 bg-[#173b70] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#24518f]"
              @click="abrirFormulario(p.trabajador.id)"
            >
              Solicitar turno
            </button>
          </div>
        </div>

        <div
          v-if="necesitanTurno.length === 0"
          class="py-2 text-sm text-slate-500"
        >
          Ningún trabajador necesita turno por ahora.
        </div>
      </section>

      <!-- Formulario de solicitud -->
      <section
        v-if="formularioAbierto"
        class="mt-3 rounded-xl border border-[#173b70]/30 bg-white px-4 py-4 shadow-sm"
      >
        <div class="mb-3 text-sm font-semibold">Solicitar turno</div>

        <div class="grid gap-3 sm:grid-cols-3">
          <label class="flex flex-col gap-1 text-xs text-slate-600">
            Trabajador
            <select
              v-model="trabajadorId"
              class="rounded-lg border border-[#dce2eb] bg-white px-3 py-2 text-sm text-[#172033]"
            >
              <option value="">Elegí un trabajador</option>
              <option
                v-for="t in solicitables"
                :key="t.id"
                :value="t.id"
              >
                {{ t.apellido }}, {{ t.nombre }}
              </option>
            </select>
          </label>

          <label class="flex flex-col gap-1 text-xs text-slate-600">
            Fecha preferida
            <input
              v-model="fechaPreferida"
              type="date"
              :min="manana"
              class="rounded-lg border border-[#dce2eb] bg-white px-3 py-2 text-sm text-[#172033]"
            />
          </label>

          <label class="flex flex-col gap-1 text-xs text-slate-600">
            Sede
            <select
              v-model="sedeId"
              class="rounded-lg border border-[#dce2eb] bg-white px-3 py-2 text-sm text-[#172033]"
            >
              <option value="">Elegí una sede</option>
              <option
                v-for="s in sedes"
                :key="s.id"
                :value="s.id"
              >
                {{ s.nombre }}
              </option>
            </select>
          </label>
        </div>

        <div
          v-if="sedes.length === 0"
          class="mt-2 text-xs text-amber-700"
        >
          No hay sedes registradas en el sistema.
        </div>

        <div v-if="error" role="alert" class="mt-3 text-sm text-red-700">
          {{ error }}
        </div>

        <div class="mt-3 flex gap-2">
          <button
            type="button"
            :disabled="enviando || sedes.length === 0"
            class="cursor-pointer rounded-lg border-0 bg-[#173b70] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#24518f] disabled:cursor-not-allowed disabled:opacity-50"
            @click="solicitar"
          >
            {{ enviando ? 'Enviando...' : 'Enviar solicitud' }}
          </button>

          <button
            type="button"
            :disabled="enviando"
            class="cursor-pointer rounded-lg border border-[#dce2eb] bg-white px-4 py-2 text-sm text-slate-600 transition-colors hover:bg-[#f4f6fa]"
            @click="cancelar"
          >
            Cancelar
          </button>
        </div>

        <div class="mt-2 text-xs text-slate-500">
          La clínica revisará la solicitud y confirmará el horario del turno.
        </div>
      </section>

      <!-- Listado de turnos -->
      <div class="mt-5 mb-3 flex flex-wrap items-center justify-between gap-3">
        <label class="flex items-center gap-2 text-sm text-slate-600">
          Estado
          <select
            v-model="filtroEstado"
            class="rounded-lg border border-[#dce2eb] bg-white px-3 py-2 text-sm text-[#172033]"
          >
            <option
              v-for="f in filtros"
              :key="f.valor"
              :value="f.valor"
            >
              {{ f.etiqueta }}
            </option>
          </select>
        </label>

        <div class="flex items-center gap-3">
          <div class="text-sm text-slate-500">
            {{ turnosFiltrados.length }} turnos
          </div>

          <button
            v-if="!formularioAbierto"
            type="button"
            class="cursor-pointer rounded-lg border-0 bg-[#173b70] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#24518f]"
            @click="abrirFormulario()"
          >
            Solicitar turno
          </button>
        </div>
      </div>

      <div class="overflow-x-auto rounded-xl border border-[#e0e6ef] bg-white shadow-sm">
        <table class="w-full border-collapse text-left text-sm">
          <thead class="bg-[#f4f6fa] text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th class="px-4 py-3 font-semibold">Fecha</th>
              <th class="px-4 py-3 font-semibold">Hora</th>
              <th class="px-4 py-3 font-semibold">Trabajador</th>
              <th class="px-4 py-3 font-semibold">Sede</th>
              <th class="px-4 py-3 font-semibold">Estado</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="t in turnosFiltrados"
              :key="t.id"
              class="border-t border-[#e0e6ef]"
            >
              <td class="px-4 py-3">
                {{ formatearFecha(t.fechaHora) }}
              </td>

              <td class="px-4 py-3">
                <span v-if="t.horaAConfirmar" class="text-slate-500">
                  A confirmar
                </span>
                <template v-else>
                  {{ formatearHora(t.fechaHora) }} hs
                </template>
              </td>

              <td class="px-4 py-3 font-medium">
                {{ t.trabajador }}
              </td>

              <td class="px-4 py-3">
                {{ t.sede }}
              </td>

              <td class="px-4 py-3">
                <span
                  class="inline-block rounded-full px-2.5 py-1 text-xs font-semibold"
                  :class="estilos[t.estado]"
                >
                  {{
                    t.estadoSolicitud === 'RECHAZADA'
                      ? 'Rechazado'
                      : etiquetas[t.estado]
                  }}
                </span>
              </td>
            </tr>

            <tr v-if="turnosFiltrados.length === 0">
              <td colspan="5" class="px-4 py-8 text-center text-slate-500">
                No hay turnos con ese estado.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </PanelPagina>
</template>
