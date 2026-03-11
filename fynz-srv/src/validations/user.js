import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string()
    .email({ message: 'Email inválido' })
    .trim()
    .toLowerCase(),
  username: z.string()
    .min(3, { message: 'El nombre de usuario debe tener al menos 3 caracteres' })
    .max(20, { message: 'El nombre de usuario no puede exceder 20 caracteres' })
    .trim(),
  password: z.string()
    .min(8, { message: 'La contraseña debe tener al menos 8 caracteres' }),
});

export const loginSchema = z.object({
  email: z.string().email('Correo inválido').trim().toLowerCase(),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export const updateUserSchema = z.object({
  username: z.string().min(3).max(20).trim().optional(),
  email: z.string().email().trim().toLowerCase().optional(),
}).refine(data => data.username || data.email, {
  message: 'Debes enviar al menos un campo para actualizar',
});