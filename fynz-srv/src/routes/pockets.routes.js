import { PocketsService } from '../services/pockets.service.js';
import { createPocketSchema, updatePocketSchema } from '../validations/pocket.js';
import { authMiddleware } from '../auth/auth.js';

export async function pocketsRoutes(fastify) {

    // Todas las rutas de pockets requieren auth
    fastify.addHook('preHandler', authMiddleware);

    // ─── LISTAR ─────────────────────────────────────────────
    fastify.get('/pockets', async (request) => {
        const pockets = await PocketsService.getAll(request.user.id);

        return {
            success: true,
            data: pockets,
        };
    });

    // ─── OBTENER UNO ────────────────────────────────────────
    fastify.get('/pockets/:id', async (request) => {
        const pocket = await PocketsService.getById(
            request.user.id,
            Number(request.params.id),
        );

        return {
            success: true,
            data: pocket,
        };
    });

    // ─── CREAR ──────────────────────────────────────────────
    fastify.post('/pockets', async (request, reply) => {
        const validation = createPocketSchema.safeParse(request.body);

        if (!validation.success) {
            return reply.code(400).send({
                success: false,
                message: 'Datos inválidos',
                errors: validation.error.format(),
            });
        }

        const pocket = await PocketsService.create(request.user.id, validation.data);

        return reply.code(201).send({
            success: true,
            message: 'Bolsillo creado',
            data: pocket,
        });
    });

    // ─── ACTUALIZAR ─────────────────────────────────────────
    fastify.put('/pockets/:id', async (request, reply) => {
        const validation = updatePocketSchema.safeParse(request.body);

        if (!validation.success) {
            return reply.code(400).send({
                success: false,
                message: 'Datos inválidos',
                errors: validation.error.format(),
            });
        }

        const result = await PocketsService.update(
            request.user.id,
            Number(request.params.id),
            validation.data,
        );

        return {
            success: true,
            message: 'Bolsillo actualizado',
            data: result,
        };
    });

    // ─── ELIMINAR ───────────────────────────────────────────
    fastify.delete('/pockets/:id', async (request) => {
        const result = await PocketsService.delete(
            request.user.id,
            Number(request.params.id),
        );

        return {
            success: true,
            ...result,
        };
    });
}
