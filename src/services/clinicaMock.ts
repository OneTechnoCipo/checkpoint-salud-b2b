import type { EmpresaClinica, TurnoClinica } from '../types/clinica'
import { enDias } from '../utils/fechas'
 // datos de ejemplo Mock para la clínica, incluyendo turnos y empresas.
export const turnosMock: TurnoClinica[] = [
  { id: 't1', fechaHora: enDias(-1, '08:30'), estado: 'ASISTIO', paciente: 'Gómez, Lucía', dni: '30111222', empresa: 'Petrolera Andina S.A.', sede: 'Neuquén Capital' },
  { id: 't2', fechaHora: enDias(0, '08:00'), estado: 'ASISTIO', paciente: 'Pérez, Martín', dni: '30999888', empresa: 'Perforaciones Norte S.A.', sede: 'Neuquén Capital' },
  { id: 't3', fechaHora: enDias(0, '10:30'), estado: 'PENDIENTE', paciente: 'Ríos, Mateo', dni: '31222333', empresa: 'Servicios Patagonia S.R.L.', sede: 'Neuquén Capital' },
  { id: 't4', fechaHora: enDias(0, '11:45'), estado: 'PENDIENTE', paciente: 'Sosa, Camila', dni: '32333444', empresa: 'Petrolera Andina S.A.', sede: 'Neuquén Capital' },
  { id: 't5', fechaHora: enDias(1, '09:00'), estado: 'PENDIENTE', paciente: 'Luna, Valentina', dni: '34555666', empresa: 'Perforaciones Norte S.A.', sede: 'Rincón de los Sauces' },
  { id: 't6', fechaHora: enDias(1, '10:15'), estado: 'CANCELADO', paciente: 'Paz, Joaquín', dni: '33444555', empresa: 'Transportes del Sur S.A.', sede: 'Rincón de los Sauces' },
  { id: 't7', fechaHora: enDias(2, '08:45'), estado: 'PENDIENTE', paciente: 'Vera, Tomás', dni: '35666777', empresa: 'Servicios Patagonia S.R.L.', sede: 'Neuquén Capital' },
  { id: 't8', fechaHora: enDias(3, '09:30'), estado: 'PENDIENTE', paciente: 'Díaz, Julieta', dni: '36777888', empresa: 'Transportes del Sur S.A.', sede: 'Neuquén Capital' },
]

export const empresasMock: EmpresaClinica[] = [
  {
    id: 'e1',
    razonSocial: 'Petrolera Andina S.A.',
    cuit: '30-00000001-1',
    trabajadores: 42,
    vencidos: 2,
    porVencer: 4,
  },
  {
    id: 'e2',
    razonSocial: 'Servicios Patagonia S.R.L.',
    cuit: '30-00000002-2',
    trabajadores: 27,
    vencidos: 1,
    porVencer: 2,
  },
  {
    id: 'e3',
    razonSocial: 'Transportes del Sur S.A.',
    cuit: '30-00000003-3',
    trabajadores: 18,
    vencidos: 0,
    porVencer: 2,
  },
  {
    id: 'e4',
    razonSocial: 'Perforaciones Norte S.A.',
    cuit: '30-00000004-4',
    trabajadores: 35,
    vencidos: 1,
    porVencer: 3,
  },
  {
    id: 'e5',
    razonSocial: 'Yacimientos Cuenca S.A.',
    cuit: '30-00000005-5',
    trabajadores: 31,
    vencidos: 0,
    porVencer: 1,
  },
  {
    id: 'e6',
    razonSocial: 'Logística Petrolera S.R.L.',
    cuit: '30-00000006-6',
    trabajadores: 22,
    vencidos: 0,
    porVencer: 0,
  },
]