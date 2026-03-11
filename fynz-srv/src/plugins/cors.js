import cors from '@fastify/cors';

/**
 * Plugin para registrar CORS como modulo separado.
 * En producción usa CORS_ORIGIN, en dev permite cualquier origen.
 */
export async function corsPlugin(fastify) {
    const originEnv = process.env.CORS_ORIGIN;

    // Si no hay variable (dev), permitimos todo (true)
    // Si hay, limpiamos cada origen para evitar errores de coincidencia (espacios y barras finales)
    const origin = originEnv
        ? originEnv.split(',').map(o => o.trim().replace(/\/$/, ''))
        : true;

    console.log(`📡 CORS configurado para: ${origin === true ? '*' : origin.join(', ')}`);

    await fastify.register(cors, {
        origin,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    });
}
