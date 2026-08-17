import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Некорректный email").max(120),
  password: z
    .string()
    .min(8, "Минимум 8 символов")
    .max(72, "Максимум 72 символа"),
  name: z.string().min(2, "Минимум 2 символа").max(80),
  phone: z.string().max(32).optional().default(""),
});

export const loginSchema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(1, "Введите пароль"),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  phone: z.string().max(32).optional(),
  password: z.string().min(8).max(72).optional(),
  currentPassword: z.string().optional(),
});

export const adminUserUpdateSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  phone: z.string().max(32).optional(),
  role: z.enum(["USER", "ADMIN"]).optional(),
  password: z.string().min(8).max(72).optional(),
  /** Refuse sign-in without deleting the account. */
  blocked: z.boolean().optional(),
  /** Invalidate every session already issued to this account. */
  signOutEverywhere: z.boolean().optional(),
});
