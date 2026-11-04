import type { Rol } from '../types/auth'

interface RespuestaLogin {
  mensaje: string
  token: string
  usuario: {
    id: string
    email: string
    rol: Rol
  }
}

export async function iniciarSesionApi(
  email: string,
  password: string,
): Promise<RespuestaLogin> {
  const respuesta = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  const datos = await respuesta.json()

  if (!respuesta.ok) {
    throw new Error(datos.mensaje || 'No se pudo iniciar sesión.')
  }

  return datos
}
