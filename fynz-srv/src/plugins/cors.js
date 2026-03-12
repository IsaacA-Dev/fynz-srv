import cors from '@fastify/cors';

/**
 * Plugin para registrar CORS como modulo separado.
 * En producción usa CORS_ORIGIN, en dev permite cualquier origen.
 */
export async function corsPlugin(fastify) {
    const originEnv = process.env.CORS_ORIGIN;

    // Orígenes permitidos por defecto (desarrollo y producción)
    const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://isaaca-dev.github.io'
    ];

    let origin;
    if (originEnv) {
        // Combinamos los orígenes de entorno con los permitidos por defecto
        const envOrigins = originEnv.split(',').map(o => o.trim().replace(/\/$/, ''));
        origin = [...new Set([...envOrigins, ...allowedOrigins])];
    } else {
        // En desarrollo si no hay variable, permitimos todo
        origin = true;
    }

    console.log(`📡 CORS configurado para: ${origin === true ? '*' : origin.join(', ')}`);

    await fastify.register(cors, {
        origin,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
        credentials: true,
    });
}
