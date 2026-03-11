import { usersRoutes } from './users.routes.js';
import { categoriesRoutes } from './categories.routes.js';
import { pocketsRoutes } from './pockets.routes.js';
import { transactionsRoutes } from './transactions.routes.js';

/**
 * Registra todas las rutas de la API bajo el prefijo /api.
 */
export async function registerRoutes(fastify) {
    fastify.register(usersRoutes, { prefix: '/api' });
    fastify.register(categoriesRoutes, { prefix: '/api' });
    fastify.register(pocketsRoutes, { prefix: '/api' });
    fastify.register(transactionsRoutes, { prefix: '/api' });
}
