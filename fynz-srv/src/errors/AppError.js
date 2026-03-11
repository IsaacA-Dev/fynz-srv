/**
 * Error personalizado de la aplicación.
 * Permite lanzar errores con código HTTP y mensaje consistente.
 */
export class AppError extends Error {
    constructor(message, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'AppError';
    }
}

/**
 * Plugin de Fastify para manejar errores de forma centralizada.
 * Registra un handler global que intercepta todos los errores.
 */
export function errorHandlerPlugin(fastify, _opts, done) {
    fastify.setErrorHandler((error, _request, reply) => {
        // Si es un AppError nuestro, usamos su statusCode
        if (error instanceof AppError) {
            return reply.code(error.statusCode).send({
                success: false,
                message: error.message,
            });
        }

        // Error de validación de Fastify (schema validation)
        if (error.validation) {
            return reply.code(400).send({
                success: false,
                message: 'Datos de entrada inválidos',
                errors: error.validation,
            });
        }

        // Error inesperado — loguear y devolver 500 genérico
        fastify.log.error(error);
        return reply.code(500).send({
            success: false,
            message: 'Error interno del servidor',
        });
    });

    done();
}
