import { z } from 'zod';

export const createTransactionSchema = z.object({
    amount: z.number()
        .positive('El monto debe ser mayor a 0'),
    description: z.string()
        .max(200, 'La descripción no puede exceder 200 caracteres')
        .trim()
        .optional(),
    type: z.enum(['income', 'expense', 'transfer'], {
        errorMap: () => ({ message: 'Tipo debe ser: income, expense o transfer' }),
    }),
    pocket_id: z.number().int().positive().optional().nullable(),
    category_id: z.number().int().positive().optional().nullable(),
    date: z.string().datetime().optional(), // ISO 8601
});

export const transactionFiltersSchema = z.object({
    type: z.enum(['income', 'expense', 'transfer']).optional(),
    category_id: z.coerce.number().int().positive().optional(),
    pocket_id: z.coerce.number().int().positive().optional(),
    from: z.string().optional(), // fecha inicio
    to: z.string().optional(),   // fecha fin
    limit: z.coerce.number().int().min(1).max(100).optional().default(50),
    offset: z.coerce.number().int().min(0).optional().default(0),
});
