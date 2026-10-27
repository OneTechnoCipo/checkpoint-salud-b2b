# 🏥 CheckPoint Salud

> **Plataforma web para la autogestión de nóminas corporativas, control automático de vigencias y emisión de certificados de aptitud médica laboral.**

## 🎯 1. Visión general y contexto

CheckPoint Salud centraliza y automatiza la logística de medicina ocupacional entre la clínica (sedes Neuquén Capital y Rincón de los Sauces) y sus empresas clientes.

* **Problema a resolver:** La revisión manual de carpetas físicas genera vencimientos inadvertidos de certificados médicos, provocando el rechazo de trabajadores al intentar ingresar a los yacimientos u obras.

* **Solución principal:** Un motor automatizado de vigencias y alertas preventivas, parametrizado por empresa y puesto laboral.

* **Confidencialidad (Regla de Oro):** Segregación estricta de la información. El personal médico administra el historial clínico; los trabajadores consultan sus turnos; las empresas contratistas **únicamente visualizan el estado de aptitud (Apto / No Apto / Por vencer)** sin acceso a datos médicos sensibles.

## 📦 2. Alcance y Pilares Funcionales

El sistema se compone de 4 módulos principales diseñados para operar en conjunto:

1. **🔔 Motor de vencimientos y avisos**
   * Parametrización de reglas de vigencia por empresa y puesto de trabajo.
   * Cálculo dinámico de fechas de caducidad.
   * Disparo de alertas automáticas preventivas vía correo electrónico y dashboard.

2. **📅 Agenda de turnos multisede**
   * Gestión centralizada de agendas operativas para Neuquén y Rincón de los Sauces.
   * Procesamiento de cargas masivas de nóminas enviadas por los clientes corporativos.

3. **🏢 Portal para empresas**
   * Panel de control exclusivo para clientes.
   * Visualización del estado de aptitud de los empleados y gestión de la nómina activa.

4. **🧑‍⚕️ Portal de consulta para el trabajador**
   * Interfaz pública y segura (sin inicio de sesión) para que el operario consulte su turno asignado y la fecha de vencimiento de su apto actual validando su identidad.

## 🏗️ 3. Arquitectura técnica y stack

El proyecto utiliza un entorno de desarrollo tipado de extremo a extremo, estructurado en un esquema *Monorepo*.

* **Lenguaje Unificado:** TypeScript (TS).
* **Frontend:** Vue.js 3 (Composition API) + Pinia (estado global para sesiones/permisos) + Vue Router.
* **Backend:** Node.js con Express (API REST no bloqueante, middlewares de seguridad y validación de roles JWT).
* **Base de Datos:** PostgreSQL (propiedades ACID) + Prisma ORM.
* **Infraestructura:** VPS Linux, Nginx (Proxy Inverso), PM2 (Gestor de procesos 24/7), y Let's Encrypt (Certificados SSL/HTTPS).

## 🗄️ 4. Modelo de Datos Relacional (DER)

La base de datos está optimizada para la alta rotación del sector petrolero y el cumplimiento legal, implementando *Soft Deletes* (auditoría de borrado lógico) en todas sus tablas.

| Entidad | Descripción y Alcance | 
| ----- | ----- | 
| **Usuarios** | Credenciales de acceso y asignación de rol (`ADMIN`, `MEDICO`, `RECEPCION`, `EMPRESA`). | 
| **Empresas** | Organizaciones clientes (Razón social, CUIT, tipo: Petrolera/Contratista). | 
| **Puestos_Requisitos** | Catálogo de vigencias (en meses) exigidas para cada puesto según la empresa. | 
| **Sedes** | Puntos de atención física de la clínica. | 
| **Pacientes** | Registro físico del trabajador (Independiente de la empresa para soportar rotación laboral). | 
| **Turnos** | Evento que une al paciente, la sede, la empresa facturable y el puesto. Estados: `PENDIENTE`, `CONFIRMADO`, `CANCELADO`, `AUSENTE`. | 
| **Aptos_Medicos** | Resultado clínico (Apto, No apto, Pendiente). El detalle médico es exclusivo del rol `MEDICO`. | 
| **Cargas_Masivas** | Trazabilidad y registro de los archivos de nóminas subidos por los clientes. | 
| **Registro_Notificaciones** | Control de envíos de alertas por correo para evitar el spam a las empresas. | 

### Comandos de Ejecución

```bash
# Levantar el servidor backend (Puerto 3000 por defecto)
npm run dev

# Levantar el cliente frontend (Vite - Puerto 5173 por defecto)
npm run dev
```