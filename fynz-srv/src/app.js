import Fastify from 'fastify';
import * as dotenv from 'dotenv';
import { corsPlugin } from './plugins/cors.js';
import { errorHandlerPlugin } from './errors/AppError.js';
import { initDatabase } from './database/init.js';
import { registerRoutes } from './routes/index.js';

dotenv.config();

const isDev = process.env.NODE_ENV !== 'production';

const fastify = Fastify({
  ignoreTrailingSlash: true,
  ignoreDuplicateSlashes: true,
  logger: {
    level: isDev ? 'warn' : 'info',
    ...(isDev && {
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname',
          colorize: true,
        },
      },
    }),
  },
});

// ─── Plugins ────────────────────────────────────────────
await fastify.register(corsPlugin);
fastify.register(errorHandlerPlugin);

// ─── Base de datos ──────────────────────────────────────
await initDatabase();

// ─── Rutas ──────────────────────────────────────────────
await fastify.register(registerRoutes);

// ─── Health check ───────────────────────────────────────
fastify.get('/health', async () => {
  return { status: 'ok', service: 'fynz-srv', timestamp: new Date().toISOString() };
});

// ─── Arrancar servidor ──────────────────────────────────
const start = async () => {
  try {
    const port = process.env.PORT || 3000;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 Fynz API corriendo en http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();