//creo usuarios de prueba para login solo en el frontend, no se hace en el backend
interface UsuarioMock{ //defino la estructura de un usuario mock
    id: string;
    email: string;
    rol: 'CLINICA' | 'EMPRESA' | 'ADMIN'|'PACIENTE'; //defino los roles posibles
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
    },
    {
        id: '4',
        email: 'pacienteMock@gmail.com',
        password: 'paciente123',
        rol: 'PACIENTE',
    }
] as const;

//funcion que simula el login

export async function iniciarSesionMock(
  email: string, //entra el correo
  password: string, //entra la contraseña
): Promise<RespuestaMock> { //devuelve una promesa, es la respuesta del login
  const correoIngresado = email.trim().toLowerCase() //normalizo el correo ingresado, se eliminan espacios y se pasa a minusculas
  const passwordIngresada = password.trim() //normalizo la contraseña ingresada, se eliminan espacios

  const usuario = usuariosMock.find( //busco ese usuario ingresado en usuarios mock
    (u) => //
      u.email.trim().toLowerCase() === correoIngresado &&
      u.password.trim() === passwordIngresada, //comparo el correo y la contraseña con los que ya tengo guardados en el array de usuarios mock
  )

  //mensaje en la consola de que el correo ingreso (solo para errores posibles)
  console.log('Correo normalizado:', JSON.stringify(correoIngresado)) 
  console.log( 
    'Correos registrados:',
    usuariosMock.map((u) => JSON.stringify(u.email.trim().toLowerCase())),
  ) 
  console.log('Usuario encontrado:', usuario?.rol ?? 'NINGUNO')

  if (!usuario) { //si el usuario no se encuentra, lanza un error
    throw new Error('Credenciales inválidas')
  }

  return { //si el usuario se encuentra, devuelve un objeto con el mensaje, token y usuario
    mensaje: 'Inicio de sesión exitoso',
    token: 'token-mock-123456',
    usuario: {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    },
  }
}
