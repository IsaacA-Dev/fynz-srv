import { TransactionsService } from '../services/transactions.service.js';
import { createTransactionSchema, transactionFiltersSchema } from '../validations/transaction.js';
import { authMiddleware } from '../auth/auth.js';

export async function transactionsRoutes(fastify) {

    // Todas las rutas de transacciones requieren auth
    fastify.addHook('preHandler', authMiddleware);

    // ─── LISTAR (con filtros y paginación) ──────────────────
    fastify.get('/transactions', async (request, reply) => {
        const validation = transactionFiltersSchema.safeParse(request.query);

        if (!validation.success) {
            return reply.code(400).send({
                success: false,
                message: 'Filtros inválidos',
                errors: validation.error.format(),
            });
        }

        const result = await TransactionsService.getAll(request.user.id, validation.data);

        return {
            success: true,
            ...result,
        };
    });

    // ─── OBTENER UNA ────────────────────────────────────────
    fastify.get('/transactions/:id', async (request) => {
        const transaction = await TransactionsService.getById(
            request.user.id,
            Number(request.params.id),
        );

        return {
            success: true,
            data: transaction,
        };
    });

    // ─── CREAR ──────────────────────────────────────────────
    fastify.post('/transactions', async (request, reply) => {
        const validation = createTransactionSchema.safeParse(request.body);

        if (!validation.success) {
            return reply.code(400).send({
                success: false,
                message: 'Datos inválidos',
                errors: validation.error.format(),
            });
        }

        const transaction = await TransactionsService.create(request.user.id, validation.data);

        return reply.code(201).send({
            success: true,
            message: 'Transacción registrada',
            data: transaction,
        });
    });

    // ─── ELIMINAR ───────────────────────────────────────────
    fastify.delete('/transactions/:id', async (request) => {
        const result = await TransactionsService.delete(
            request.user.id,
            Number(request.params.id),
        );

        return {
            success: true,
            ...result,
        };
    });

    // ─── RESUMEN FINANCIERO ─────────────────────────────────
    fastify.get('/transactions/summary', async (request) => {
        const summary = await TransactionsService.getSummary(request.user.id);

        return {
            success: true,
            data: summary,
        };
    });
}
