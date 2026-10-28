// Genera fechas relativas al dia actual 
export function enDias(dias: number, hora = '09:00'): string {
  const fecha = new Date()
  fecha.setDate(fecha.getDate() + dias)

  const anio = fecha.getFullYear()
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')

  return `${anio}-${mes}-${dia}T${hora}:00`
}
// Obtiene la fecha en formato dd/mm/yyyy 
export function formatearFecha(iso: string): string {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
// Obtiene la hora 
export function formatearHora(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}