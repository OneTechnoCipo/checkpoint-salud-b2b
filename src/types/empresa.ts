export type EstadoAptitud = | 'APTO'  | 'NO_APTO' | 'PENDIENTE'  | 'APTO_CON_OBSERVACIONES'

export type EstadoTurnoEmpresa = 'PENDIENTE' | 'ASISTIO' | 'CANCELADO'

// Lo único que la empresa puede ver de cada trabajador.
// No incluye el resultado clínico ni el documento de aptitud 
export interface TrabajadorEmpresa {
  id: string
  dni: string
  apellido: string
  nombre: string
  puesto: string
  estadoAptitud: EstadoAptitud
  fechaVencimiento: string | null // AAAA-MM-DD; null si todavía no hay apto vigente
}

export interface TurnoEmpresa {
  id: string
  trabajadorId: string
  fechaHora: string
  horaAConfirmar?: boolean // true si la empresa lo pidió y la clínica todavía no fijó la hora
  trabajador: string
  sede: string
  estado: EstadoTurnoEmpresa
}

export interface DatosEmpresa {
  razonSocial: string
  cuit: string
}