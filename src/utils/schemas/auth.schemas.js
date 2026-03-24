// src/utils/schemas/auth.schemas.js
import { z } from "zod";

// El schema recibe t (traducciones) para que los mensajes respeten store.language
// z.coerce.number() para campos numéricos — los inputs HTML devuelven strings
// Sanitización: trim + replace /[<>]/g para prevenir inyecciones HTML básicas

export const createLoginSchema = (t) =>
  z.object({
    email: z
      .string()
      .min(1, t.forms.emailRequired)
      .email(t.forms.emailInvalid)
      .transform((val) => val.trim().toLowerCase().replace(/[<>]/g, "")),
    password: z
      .string()
      .min(1, t.forms.passwordRequired)
      .min(8, t.forms.passwordMinLength),
  });

export const createRegisterSchema = (t) =>
  z
    .object({
      name: z
        .string()
        .min(1, t.forms.nameRequired)
        .min(2, t.forms.nameMinLength)
        .max(50, t.forms.nameMaxLength)
        .transform((val) => val.trim().replace(/[<>]/g, "")),
      email: z
        .string()
        .min(1, t.forms.emailRequired)
        .email(t.forms.emailInvalid)
        .transform((val) => val.trim().toLowerCase().replace(/[<>]/g, "")),
      password: z
        .string()
        .min(8, t.forms.passwordMinLength)
        .regex(/[A-Z]/, t.forms.passwordUppercase)
        .regex(/[0-9]/, t.forms.passwordNumber),
      confirmPassword: z.string().min(1, t.forms.confirmPasswordRequired),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t.forms.passwordsMismatch,
      path: ["confirmPassword"],
    });
