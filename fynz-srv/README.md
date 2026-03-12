# ⚙️ Fynz - API

API robusta y escalable para la gestión de finanzas personales. Diseñada para ser ultra-rápida y segura, proporcionando el motor principal para la aplicación Fynz.

## 🚀 Características

- **Autenticación Segura:** Implementación robusta con JWT y hashing de contraseñas mediante Bcrypt.
- **Gestión de Transacciones:** API RESTful completa para ingresos y egresos.
- **Bolsillos y Categorías:** Soporte nativo para organización de fondos y clasificación de gastos.
- **Validación de Datos:** Esquemas estrictos de validación con **Zod**.
- **Admin Engine:** Endpoints protegidos para la administración de usuarios y roles.
- **Documentación API:** Especificación técnica completa con **OpenAPI 3.0**.

## 🛠️ Stack Tecnológico

- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Fastify](https://www.fastify.io/) (Alto rendimiento)
- **Base de Datos:** [PostgreSQL](https://www.postgresql.org/)
- **Query Builder:** [Kysely](https://kysely.dev/) (Type-safe SQL)
- **Validación:** [Zod](https://zod.dev/)

## 📦 Instalación y Configuración

1. **Clona el repositorio:**
   ```bash
   cd fynz-srv/fynz-srv
   ```

2. **Instala las dependencias:**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno:**
   Crea un archivo `.env` basado en el siguiente ejemplo:
   ```env
   PORT=3000
   NODE_ENV=development
   DATABASE_URL=postgresql://user:password@localhost:5432/fynz
   JWT_SECRET=tu_secreto_super_seguro
   JWT_EXPIRES_IN=1d
   SALT_ROUNDS=10
   ```

4. **Inicia el servidor:**
   ```bash
   # Modo desarrollo (Nodemon)
   npm run dev

   # Modo producción
   npm start
   ```

## 📚 Documentación API

La documentación técnica se encuentra en el directorio `/docs`. Puedes visualizar la especificación OpenAPI en:
- `docs/openapi.yaml`

## 🏗️ Estructura del Proyecto

- `src/routes`: Definición de endpoints y rutas.
- `src/services`: Lógica de negocio y persistencia de datos.
- `src/auth`: Middleware y utilidades de seguridad.
- `src/database`: Configuración de Kysely y conexión a PostgreSQL.
- `src/validations`: Esquemas de Zod para validación de entrada.

## 📄 Licencia

Este proyecto está bajo la licencia MIT.
