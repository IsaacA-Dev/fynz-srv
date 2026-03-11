import { CategoriesService } from '../services/categories.service.js';
import { createCategorySchema, updateCategorySchema } from '../validations/category.js';
import { authMiddleware } from '../auth/auth.js';

export async function categoriesRoutes(fastify) {

    // Todas las rutas de categorías requieren auth
    fastify.addHook('preHandler', authMiddleware);

    // ─── LISTAR ─────────────────────────────────────────────
    fastify.get('/categories', async (request) => {
        const categories = await CategoriesService.getAll(request.user.id);

        return {
            success: true,
            data: categories,
        };
    });

    // ─── CREAR ──────────────────────────────────────────────
    fastify.post('/categories', async (request, reply) => {
        const validation = createCategorySchema.safeParse(request.body);

        if (!validation.success) {
            return reply.code(400).send({
                success: false,
                message: 'Datos inválidos',
                errors: validation.error.format(),
            });
        }

        const category = await CategoriesService.create(request.user.id, validation.data);

        return reply.code(201).send({
            success: true,
            message: 'Categoría creada',
            data: category,
        });
    });

    // ─── ACTUALIZAR ─────────────────────────────────────────
    fastify.put('/categories/:id', async (request, reply) => {
        const validation = updateCategorySchema.safeParse(request.body);

        if (!validation.success) {
            return reply.code(400).send({
                success: false,
                message: 'Datos inválidos',
                errors: validation.error.format(),
            });
        }

        const result = await CategoriesService.update(
            request.user.id,
            Number(request.params.id),
            validation.data,
        );

        return {
            success: true,
            message: 'Categoría actualizada',
            data: result,
        };
    });

    // ─── ELIMINAR ───────────────────────────────────────────
    fastify.delete('/categories/:id', async (request) => {
        const result = await CategoriesService.delete(
            request.user.id,
            Number(request.params.id),
        );

        return {
            success: true,
            ...result,
        };
    });
}
