import { z } from 'zod';

export const createPocketSchema = z.object({
    name: z.string()
        .min(1, 'El nombre es requerido')
        .max(50, 'El nombre no puede exceder 50 caracteres')
        .trim(),
    target_amount: z.number()
        .min(0, 'La meta no puede ser negativa')
        .optional()
        .default(0),
    color: z.string()
        .regex(/^#[0-9a-fA-F]{6}$/, 'Color debe ser un hex válido (#RRGGBB)')
        .optional(),
    icon: z.string().max(10).optional(),
});

export const updatePocketSchema = z.object({
    name: z.string().min(1).max(50).trim().optional(),
    target_amount: z.number().min(0).optional(),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
    icon: z.string().max(10).optional(),
}).refine(data => Object.values(data).some(v => v !== undefined), {
    message: 'Debes enviar al menos un campo para actualizar',
});
