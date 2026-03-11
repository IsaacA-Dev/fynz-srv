import cors from '@fastify/cors';

/**
 * Plugin para registrar CORS como modulo separado.
 * En producción, cambiar `origin` a la URL del frontend.
 */
export async function corsPlugin(fastify) {
    await fastify.register(cors, {
        origin: true, // En dev: permite cualquier origen
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });
}
