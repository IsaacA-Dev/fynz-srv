---
description: Desplegar Fynz API en Render.com (hosting gratuito)
---

# Deploy — Fynz API en Render.com

## Cómo funciona
El deploy usa **GitHub Actions** (`.github/workflows/deploy.yaml`).
Cada push a `main` dispara el Deploy Hook de Render automáticamente.

## Configuración inicial (solo una vez)

### 1. Crear servicio en Render
1. Ve a [dashboard.render.com](https://dashboard.render.com) → **New +** → **Web Service**
2. Conecta el repo `fynz-srv` de GitHub
3. Configura:

| Campo | Valor |
|-------|-------|
| **Name** | `fynz-api` |
| **Branch** | `main` |
| **Root Directory** | `fynz-srv` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | Free |

4. En **Environment**, agrega:

| Variable | Valor |
|----------|-------|
| `PORT` | `10000` |
| `NODE_ENV` | `production` |
| `JWT_SECRET` | (genera con `openssl rand -hex 32`) |
| `JWT_EXPIRES_IN` | `1d` |
| `SALT_ROUNDS` | `10` |

### 2. Obtener el Deploy Hook
1. En Render → tu servicio → **Settings** → **Deploy Hook**
2. Copia la URL del hook

### 3. Configurar secret en GitHub
1. Ve a **Settings** → **Secrets** → **Actions** en el repo `fynz-srv`
2. Crea un **Repository secret**:

| Name | Value |
|------|-------|
| `RENDER_DEPLOY_HOOK_URL` | `https://api.render.com/deploy/srv-...?key=...` |

### 4. Push y deploy
```bash
cd /Users/isaacabdiel/Isaac/fynz-srv
git add -A
git commit -m "ci: agregar GitHub Actions para deploy"
git push origin main
```

## URL del API
`https://fynz-api.onrender.com`

## Nota sobre Free Tier
- El servicio duerme tras 15 min de inactividad
- La primera request tarda ~30s en despertar
- La DB SQLite se recreará en cada deploy (sin persistent disk)
- Para datos persistentes: considerar **Turso** (SQLite cloud, free tier)
