<script setup lang="ts">
import { computed, ref } from 'vue'
import PanelPagina from '../../components/PanelPagina.vue'
import { trabajadoresMock, turnosEmpresaMock } from '../../services/empresaMock'
import type { EstadoTurnoEmpresa, TrabajadorEmpresa, TurnoEmpresa, } from '../../types/empresa'
import { diasRestantes, enDias, formatearFecha, formatearHora, } from '../../utils/fechas'

const SEDES = ['Neuquén Capital', 'Rincón de los Sauces']
const manana = enDias(1).slice(0, 10)

// Los turnos viven en memoria. Con el backend real, solicitar un turno será un POST.
const turnos = ref<TurnoEmpresa[]>([...turnosEmpresaMock])
const filtroEstado = ref<EstadoTurnoEmpresa | 'TODOS'>('TODOS')

const formularioAbierto = ref(false)
const trabajadorId = ref('')
const fechaPreferida = ref('')
const sede = ref('Neuquén Capital')
const error = ref('')
const aviso = ref('')

const filtros: { valor: EstadoTurnoEmpresa | 'TODOS'; etiqueta: string }[] = [
  { valor: 'TODOS', etiqueta: 'Todos' },
  { valor: 'PENDIENTE', etiqueta: 'Pendientes' },
  { valor: 'ASISTIO', etiqueta: 'Asistió' },
  { valor: 'CANCELADO', etiqueta: 'Cancelados' },
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
      turnos.value.filter((t) => t.estado === 'PENDIENTE').map((t) => t.trabajadorId),
    ),
)

interface PorSolicitar {
  trabajador: TrabajadorEmpresa
  texto: string
  urgente: boolean
  orden: number
}

// Trabajadores con el apto por vencer, vencido o pendiente de examen, sin turno pendiente.
const necesitanTurno = computed(() => {
  const lista: PorSolicitar[] = []

  for (const t of trabajadoresMock) {
    if (conTurnoPendiente.value.has(t.id)) continue

    if (t.estadoAptitud === 'PENDIENTE') {
      lista.push({ trabajador: t, texto: 'Pendiente de examen', urgente: false, orden: 31 })
      continue
    }

    if (t.estadoAptitud === 'APTO' && t.fechaVencimiento) {
      const dias = diasRestantes(t.fechaVencimiento)

      if (dias <= 30) {
        const texto =
          dias < 0
            ? `Apto vencido hace ${-dias} días`
            : dias === 0
              ? 'Vence hoy'
              : dias === 1
                ? 'Vence mañana'
                : `Vence en ${dias} días`

        lista.push({ trabajador: t, texto, urgente: dias <= 7, orden: dias })
      }
    }
  }

  return lista.sort((a, b) => a.orden - b.orden)
})

// A quiénes se les puede pedir turno desde el formulario.
const solicitables = computed(() =>
  trabajadoresMock
    .filter((t) => t.estadoAptitud !== 'NO_APTO' && !conTurnoPendiente.value.has(t.id))
    .sort((a, b) => a.apellido.localeCompare(b.apellido)),
)

const turnosFiltrados = computed(() =>
  turnos.value
    .filter((t) => filtroEstado.value === 'TODOS' || t.estado === filtroEstado.value)
    .sort((a, b) => a.fechaHora.localeCompare(b.fechaHora)),
)

function abrirFormulario(id = '') {
  trabajadorId.value = id
  error.value = ''
  aviso.value = ''
  formularioAbierto.value = true
}

function cancelar() {
  formularioAbierto.value = false
  error.value = ''
}

function solicitar() {
  const trabajador = trabajadoresMock.find((t) => t.id === trabajadorId.value)

  if (!trabajador) {
    error.value = 'Elegí un trabajador.'
    return
  }

  if (!fechaPreferida.value || fechaPreferida.value < manana) {
    error.value = 'Elegí una fecha a partir de mañana.'
    return
  }

  const nombre = `${trabajador.apellido}, ${trabajador.nombre}`

  turnos.value.push({
    id: `s${Date.now()}`,
    trabajadorId: trabajador.id,
    fechaHora: `${fechaPreferida.value}T00:00:00`,
    horaAConfirmar: true,
    trabajador: nombre,
    sede: sede.value,
    estado: 'PENDIENTE',
  })

  aviso.value = `Solicitud enviada para ${nombre} el ${formatearFecha(fechaPreferida.value)}. La clínica confirmará el horario.`
  formularioAbierto.value = false
  fechaPreferida.value = ''
  trabajadorId.value = ''
  error.value = ''
}
</script>

<template>
  <PanelPagina
    titulo="Turnos"
    descripcion="Pedí turnos para tus trabajadores y seguí su estado (datos de ejemplo)."
  >
    <div
      v-if="aviso"
      role="status"
      class="mb-3 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
    >
      {{ aviso }}
    </div>

    <!-- Necesitan turno -->
    <section class="rounded-xl border border-[#e0e6ef] bg-white px-4 py-3 shadow-sm">
      <div class="mb-2 flex items-center justify-between gap-3">
        <div class="text-sm font-semibold">Necesitan turno</div>
        <div class="text-xs text-slate-500">{{ necesitanTurno.length }} trabajadores</div>
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
          <div class="text-xs text-slate-500">{{ p.trabajador.puesto }}</div>
        </div>

        <div class="flex items-center gap-3">
          <span
            class="rounded-full px-2.5 py-1 text-xs font-semibold"
            :class="p.urgente ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'"
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

      <div v-if="necesitanTurno.length === 0" class="py-2 text-sm text-slate-500">
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
            <option v-for="t in solicitables" :key="t.id" :value="t.id">
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
            v-model="sede"
            class="rounded-lg border border-[#dce2eb] bg-white px-3 py-2 text-sm text-[#172033]"
          >
            <option v-for="s in SEDES" :key="s" :value="s">{{ s }}</option>
          </select>
        </label>
      </div>

      <div v-if="error" role="alert" class="mt-3 text-sm text-red-700">{{ error }}</div>

      <div class="mt-3 flex gap-2">
        <button
          type="button"
          class="cursor-pointer rounded-lg border-0 bg-[#173b70] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#24518f]"
          @click="solicitar"
        >
          Enviar solicitud
        </button>
        <button
          type="button"
          class="cursor-pointer rounded-lg border border-[#dce2eb] bg-white px-4 py-2 text-sm text-slate-600 transition-colors hover:bg-[#f4f6fa]"
          @click="cancelar"
        >
          Cancelar
        </button>
      </div>

      <div class="mt-2 text-xs text-slate-500">
        La clínica confirma el horario del turno.
      </div>
    </section>

    <!-- Turnos -->
    <div class="mt-5 mb-3 flex flex-wrap items-center justify-between gap-3">
      <label class="flex items-center gap-2 text-sm text-slate-600">
        Estado
        <select
          v-model="filtroEstado"
          class="rounded-lg border border-[#dce2eb] bg-white px-3 py-2 text-sm text-[#172033]"
        >
          <option v-for="f in filtros" :key="f.valor" :value="f.valor">
            {{ f.etiqueta }}
          </option>
        </select>
      </label>

      <div class="flex items-center gap-3">
        <div class="text-sm text-slate-500">{{ turnosFiltrados.length }} turnos</div>

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
          <tr v-for="t in turnosFiltrados" :key="t.id" class="border-t border-[#e0e6ef]">
            <td class="px-4 py-3">{{ formatearFecha(t.fechaHora) }}</td>
            <td class="px-4 py-3">
              <span v-if="t.horaAConfirmar" class="text-slate-500">A confirmar</span>
              <template v-else>{{ formatearHora(t.fechaHora) }} hs</template>
            </td>
            <td class="px-4 py-3 font-medium">{{ t.trabajador }}</td>
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

          <tr v-if="turnosFiltrados.length === 0">
            <td colspan="5" class="px-4 py-8 text-center text-slate-500">
              No hay turnos con ese estado.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </PanelPagina>
</template>