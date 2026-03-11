import { UsersService } from '../services/users.service.js';
import { registerSchema, loginSchema } from '../validations/user.js';
import { authMiddleware } from '../auth/auth.js';

export async function usersRoutes(fastify) {

    // ─── REGISTRO ───────────────────────────────────────────
    fastify.post('/auth/register', async (request, reply) => {
        const validation = registerSchema.safeParse(request.body);

        if (!validation.success) {
            return reply.code(400).send({
                success: false,
                message: 'Datos de registro inválidos',
                errors: validation.error.format(),
            });
        }

        const user = await UsersService.register(validation.data);

        return reply.code(201).send({
            success: true,
            message: 'Usuario creado con éxito',
            data: user,
        });
    });

    // ─── LOGIN ──────────────────────────────────────────────
    fastify.post('/auth/login', async (request, reply) => {
        const validation = loginSchema.safeParse(request.body);

        if (!validation.success) {
            return reply.code(400).send({
                success: false,
                message: 'Formato de datos incorrecto',
                errors: validation.error.format(),
            });
        }

        const result = await UsersService.login(validation.data);

        return {
            success: true,
            message: 'Login correcto',
            data: result,
        };
    });

    // ─── PERFIL (protegida) ─────────────────────────────────
    fastify.get('/users/me', { preHandler: authMiddleware }, async (request) => {
        const profile = await UsersService.getProfile(request.user.id);

        return {
            success: true,
            data: profile,
        };
    });
}
