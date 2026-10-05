import { z } from "zod";

const NAME_TOO_LONG = "Имя слишком длинное";
const PHONE_TOO_LONG = "Телефон слишком длинный";

export const registerSchema = z.object({
  email: z
    .string()
    .email("Некорректный email")
    .max(120, "Слишком длинный email"),
  password: z
    .string()
    .min(8, "Минимум 8 символов")
    .max(72, "Максимум 72 символа"),
  name: z
    .string()
    .trim()
    .min(2, "Имя: минимум 2 символа")
    .max(80, NAME_TOO_LONG),
  phone: z.string().max(32, PHONE_TOO_LONG).optional().default(""),
});

export const loginSchema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(1, "Введите пароль"),
});

/*
  The two schemas below had no messages of their own, so a one-letter name
  came back to the customer as zod's English default ("Too small: expected
  string to have >=2 characters").
*/
export const profileUpdateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Имя: минимум 2 символа")
    .max(80, NAME_TOO_LONG)
    .optional(),
  phone: z.string().max(32, PHONE_TOO_LONG).optional(),
  password: z
    .string()
    .min(8, "Новый пароль: минимум 8 символов")
    .max(72, "Пароль слишком длинный")
    .optional(),
  currentPassword: z.string().optional(),
});

export const adminUserUpdateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Имя: минимум 2 символа")
    .max(80, NAME_TOO_LONG)
    .optional(),
  phone: z.string().max(32, PHONE_TOO_LONG).optional(),
  role: z.enum(["USER", "ADMIN"], "Неизвестная роль").optional(),
  password: z
    .string()
    .min(8, "Пароль: минимум 8 символов")
    .max(72, "Пароль слишком длинный")
    .optional(),
  /** Refuse sign-in without deleting the account. */
  blocked: z.boolean().optional(),
  /** Invalidate every session already issued to this account. */
  signOutEverywhere: z.boolean().optional(),
});
