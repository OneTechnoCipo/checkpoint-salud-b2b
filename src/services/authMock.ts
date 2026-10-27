//creo usuarios de prueba para login solo en el frontend, no se hace en el backend
interface UsuarioMock{ //defino la estructura de un usuario mock
    id: string;
    email: string;
    rol: 'CLINICA' | 'EMPRESA' | 'ADMIN'; //defino los roles posibles
}
interface RespuestaMock{ //la respuesta que devuelve el login mock
    mensaje: string;
    token: string;
    usuario: UsuarioMock; 
}

//guardo los usuarios mock en un array
const usuariosMock = [
    {
        id: '1',
        email: 'clinicaMock@gmail.com',
        password: 'clinica123',
        rol: 'CLINICA',
    },
    {
        id: '2',
        email: 'empresaMock@gmail.com',
        password: 'empresa123',
        rol: 'EMPRESA',
    },
    {
        id: '3',
        email: 'adminMock@gmail.com',
        password: 'admin123',
        rol: 'ADMIN',
    }
] as const;

//funcion que simula el login

export async function iniciarSesionMock(
  email: string,
  password: string,
): Promise<RespuestaMock> {
  const correoIngresado = email.trim().toLowerCase()
  const passwordIngresada = password.trim()

  const usuario = usuariosMock.find(
    (u) =>
      u.email.trim().toLowerCase() === correoIngresado &&
      u.password.trim() === passwordIngresada,
  )

  console.log('Correo normalizado:', JSON.stringify(correoIngresado))
  console.log(
    'Correos registrados:',
    usuariosMock.map((u) => JSON.stringify(u.email.trim().toLowerCase())),
  )
  console.log('Usuario encontrado:', usuario?.rol ?? 'NINGUNO')

  if (!usuario) {
    throw new Error('Credenciales inválidas')
  }

  return {
    mensaje: 'Inicio de sesión exitoso',
    token: 'token-mock-123456',
    usuario: {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    },
  }
}
