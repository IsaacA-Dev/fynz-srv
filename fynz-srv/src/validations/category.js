import { z } from 'zod';

export const createCategorySchema = z.object({
    name: z.string()
        .min(1, 'El nombre es requerido')
        .max(50, 'El nombre no puede exceder 50 caracteres')
        .trim(),
    icon: z.string().max(10).optional(),
    color: z.string()
        .regex(/^#[0-9a-fA-F]{6}$/, 'Color debe ser un hex válido (#RRGGBB)')
        .optional(),
});

export const updateCategorySchema = z.object({
    name: z.string().min(1).max(50).trim().optional(),
    icon: z.string().max(10).optional(),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
}).refine(data => data.name || data.icon || data.color, {
    message: 'Debes enviar al menos un campo para actualizar',
});
