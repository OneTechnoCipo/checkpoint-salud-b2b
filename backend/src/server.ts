
import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "./lib/prisma.js";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    mensaje: "Backend de CheckPoint Salud funcionando correctamente",
  });
});

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

    // Mensaje idéntico si el correo no existe o la contraseña es incorrecta.
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

    // No devolver el hash de la contraseña al frontend.
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
    // No registrar el cuerpo de la solicitud ni las contraseñas.
    res.status(500).json({
      mensaje: "Ocurrió un error al iniciar sesión.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor de CheckPoint Salud en http://localhost:${PORT}`);
});
