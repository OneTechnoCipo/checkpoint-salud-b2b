
import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "./lib/prisma.js";
import { autenticar, permitirRoles } from "./middlewares/auth.js";
import { aptosRouter } from "./routes/aptos.js";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());
app.use("/api/aptos", aptosRouter); 

// Ruta principal
app.get("/", (_req, res) => {
  res.json({
    mensaje: "Backend de CheckPoint Salud funcionando correctamente",
  });
});

// Comprobar conexión con la base de datos
app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      estado: "OK",
      servidor: "funcionando",
      baseDeDatos: "conectada",
    });
  } catch (error) {
    console.error("Error al comprobar la base de datos:", error);

    res.status(500).json({
      estado: "ERROR",
      mensaje: "No se pudo conectar con la base de datos",
    });
  }
});

// Inicio de sesión
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};

    // Validar que los campos estén completos.
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      res.status(400).json({
        mensaje: "Ingresá tu correo electrónico y contraseña.",
      });
      return;
    }

    // Validar el formato del correo.
    const correo = email.trim().toLowerCase();
    const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formatoEmail.test(correo)) {
      res.status(400).json({
        mensaje: "Ingresá un correo electrónico válido.",
      });
      return;
    }

    // Buscar al usuario por correo.
    const usuario = await prisma.usuario.findUnique({
      where: { email: correo },
    });

    // Validar correo y contraseña.
    if (
      !usuario ||
      !(await bcrypt.compare(password, usuario.passwordHash))
    ) {
      res.status(401).json({
        mensaje: "Correo electrónico o contraseña incorrectos.",
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      res.status(500).json({
        mensaje: "El servicio de autenticación no está configurado.",
      });
      return;
    }

    // Crear un token sin incluir la contraseña.
    const token = jwt.sign(
      { rol: usuario.rol },
      jwtSecret,
      {
        subject: usuario.id,
        expiresIn: "2h",
      },
    );

    // Devolver los datos básicos del usuario.
    res.json({
      mensaje: "Inicio de sesión exitoso.",
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
      },
    });
  } catch {
    res.status(500).json({
      mensaje: "Ocurrió un error al iniciar sesión.",
    });
  }
});

// RUTA PROTEGIDA: CLÍNICA
app.get(
  "/api/clinica",
  autenticar,
  permitirRoles("CLINICA"),
  (_req, res) => {
    res.json({
      mensaje: "Acceso permitido: panel de Clínica.",
    });
  },
);

// RUTA PROTEGIDA: EMPRESA
app.get(
  "/api/empresa",
  autenticar,
  permitirRoles("EMPRESA"),
  (_req, res) => {
    res.json({
      mensaje: "Acceso permitido: panel de Empresa.",
    });
  },
);

// RUTA PROTEGIDA: ADMINISTRADOR
app.get(
  "/api/admin",
  autenticar,
  permitirRoles("ADMIN"),
  (_req, res) => {
    res.json({
      mensaje: "Acceso permitido: panel de Administración.",
    });
  },
);

// RUTA PROTEGIDA: PRÓXIMOS TURNOS DEL PACIENTE
app.get(
  "/api/paciente/turnos",
  autenticar,
  permitirRoles("PACIENTE"),
  async (req, res) => {
    try {
      const usuarioId = req.usuario?.id;

      if (!usuarioId) {
        res.status(401).json({
          mensaje: "Necesitás iniciar sesión.",
        });
        return;
      }

      // Buscar el paciente asociado al usuario autenticado.
      const usuario = await prisma.usuario.findUnique({
        where: { id: usuarioId },
        select: {
          pacienteId: true,
        },
      });

      if (!usuario || !usuario.pacienteId) {
        res.status(404).json({
          mensaje: "El usuario no tiene un paciente asociado.",
        });
        return;
      }

      // Obtener únicamente los próximos turnos de ese paciente.
      const turnos = await prisma.turno.findMany({
        where: {
          pacienteId: usuario.pacienteId,
          fechaHora: {
            gte: new Date(),
          },
          estado: "PENDIENTE",
        },
        orderBy: {
          fechaHora: "asc",
        },
        select: {
          id: true,
          fechaHora: true,
          estado: true,
          sede: {
            select: {
              nombre: true,
              direccion: true,
            },
          },
        },
      });

      res.json({
        mensaje: "Próximos turnos obtenidos correctamente.",
        turnos,
      });
    } catch (error) {
      console.error("Error al obtener los turnos del paciente:", error);

      res.status(500).json({
        mensaje: "No se pudieron obtener los próximos turnos.",
      });
    }
  },
);

// Endpoint para obtener empresas
app.get("/api/empresas", autenticar, permitirRoles("CLINICA", "ADMIN"), async (_req, res) => {
  try {
    const empresas = await prisma.empresa.findMany({
      include: { pacientes: { select: { id: true } } }, // solo la cantidad, sin datos personales
    });
    res.json(empresas);
  } catch {
    res.status(500).json({ error: "Error al obtener empresas" });
  }
});
// Endpoint para obtener turnos
app.get("/api/turnos", autenticar, permitirRoles("CLINICA"), async (_req, res) => {
  try {
    const turnos = await prisma.turno.findMany({
      include: {
        paciente: {
          include: { empresa: true },
        },
        sede: true,
      },
    });

    res.json(turnos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener turnos' });
  }
});

// Endpoint para carga masiva de trabajadores
app.post('/api/trabajadores/carga-masiva', autenticar, permitirRoles("CLINICA"), async (req, res) => {
  try {
    const { trabajadores } = req.body; // Espera un array de objetos { dni, nombre, apellido, cuitEmpresa, nombrePuesto }
    
    if (!Array.isArray(trabajadores) || trabajadores.length === 0) {
      res.status(400).json({ error: "La lista de trabajadores está vacía o es inválida." });
      return;
    }

    let importados = 0;
    const errores = [];

    for (const [index, t] of trabajadores.entries()) {
      try {
        // Buscar la empresa por CUIT
        const empresa = await prisma.empresa.findUnique({
          where: { cuit: t.cuitEmpresa },
        });

        if (!empresa) {
          errores.push(`Fila ${index + 1}: Empresa con CUIT ${t.cuitEmpresa} no encontrada.`);
          continue;
        }

        // Buscar el puesto requerido para esa empresa
        const puesto = await prisma.puestoRequisito.findFirst({
          where: {
            nombrePuesto: t.nombrePuesto,
            empresaId: empresa.id,
          },
        });

        if (!puesto) {
          errores.push(`Fila ${index + 1}: Puesto "${t.nombrePuesto}" no registrado para la empresa.`);
          continue;
        }

        // Crear o actualizar el paciente/trabajador
        await prisma.paciente.upsert({
          where: { dni: t.dni },
          update: {
            nombre: t.nombre,
            apellido: t.apellido,
            empresaId: empresa.id,
            puestoId: puesto.id,
          },
          create: {
            dni: t.dni,
            nombre: t.nombre,
            apellido: t.apellido,
            empresaId: empresa.id,
            puestoId: puesto.id,
          },
        });

        importados++;
      } catch (err: any) {
        errores.push(`Fila ${index + 1}: Error al procesar DNI ${t.dni} (${err.message})`);
      }
    }

    res.json({
      mensaje: `Proceso finalizado. Se importaron ${importados} trabajadores correctamente.`,
      totalErrores: errores.length,
      detallesErrores: errores,
    });
  } catch (error: any) {
    console.error('Error en carga masiva:', error);
    res.status(500).json({ error: 'Error interno en la carga masiva' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor de CheckPoint Salud en http://localhost:${PORT}`);
});
