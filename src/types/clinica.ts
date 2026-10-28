export type EstadoTurno = 'PENDIENTE' | 'ASISTIO' | 'CANCELADO'

export interface TurnoClinica {
  id: string
  fechaHora: string
  estado: EstadoTurno
  paciente: string
  dni: string
  empresa: string
  sede: string
}

export interface EmpresaClinica {
  id: string
  razonSocial: string
  cuit: string
  trabajadores: number
  vencidos: number
  porVencer: number
}