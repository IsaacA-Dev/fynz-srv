---
description: Levantar el servidor de desarrollo de Fynz API
---

# Desarrollo local — Fynz API

## Requisitos previos
- Node.js >= 20.19 o >= 22.12
- Variables de entorno en `.env`

## Pasos

// turbo-all

1. Instalar dependencias (si no se ha hecho):
```bash
cd /Users/isaacabdiel/Isaac/fynz-srv/fynz-srv && npm install
```

2. Verificar que exista el archivo `.env`:
```bash
cat /Users/isaacabdiel/Isaac/fynz-srv/fynz-srv/.env
```

Debe contener:
```
PORT=3000
NODE_ENV=development
JWT_SECRET=<tu_secret>
JWT_EXPIRES_IN=1d
SALT_ROUNDS=10
```

3. Levantar el servidor con hot-reload:
```bash
cd /Users/isaacabdiel/Isaac/fynz-srv/fynz-srv && npm run dev
```

El servidor estará en `http://localhost:3000`.

## Verificar que funcione

4. En otra terminal, hacer health check:
```bash
curl http://localhost:3000/health
```

Debe responder: `{"status":"ok","service":"fynz-srv","timestamp":"..."}`

## Endpoints disponibles
- `POST /api/auth/register` — Registro
- `POST /api/auth/login` — Login (devuelve JWT)
- `GET  /api/users/me` — Perfil + balance
- `GET/POST/PUT/DELETE /api/categories` — Categorías
- `GET/POST/PUT/DELETE /api/pockets` — Bolsillos
- `GET/POST/DELETE /api/transactions` — Transacciones
- `GET /api/transactions/summary` — Resumen financiero

## Base de datos
- SQLite en archivo `fynz.db` (se crea automáticamente)
- Tablas se crean al iniciar si no existen
- 10 categorías del sistema se seedean al primer arranque
