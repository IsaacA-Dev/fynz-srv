import Fastify from 'fastify';
import * as dotenv from 'dotenv';
import { initDatabase } from './database/init.js';
import { setupRoutes } from './routes/setup.js'; // <-- Importar

dotenv.config();
const fastify = Fastify({ logger: true });

await initDatabase();

// Registrar las rutas
fastify.register(setupRoutes);

fastify.get('/health', async () => {
  return { status: 'ok', service: 'fynz-srv' };
});

const start = async () => {
  try {
    await fastify.listen({ port: process.env.PORT || 3000, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();