// src/utils/schemas/settings.schemas.js
import { z } from "zod";

export const createStoreSettingsSchema = (t) =>
  z.object({
    // z.coerce.number() obligatorio — los inputs HTML devuelven strings, no números
    defaultMarginPercent: z
      .coerce.number()
      .min(0, t.forms.marginMin)
      .max(100, t.forms.marginMax),
    executionMode: z.enum(["READ_ONLY", "COPILOT", "AUTOPILOT"], {
      errorMap: () => ({ message: t.forms.selectValid }),
    }),
    strategy: z.enum(["PROFIT", "GROWTH", "BALANCED"], {
      errorMap: () => ({ message: t.forms.selectValid }),
    }),
    industry: z.enum(
      ["FASHION", "ELECTRONICS", "COSMETICS", "FOOD", "HOME", "OTHER"],
      { errorMap: () => ({ message: t.forms.selectValid }) }
    ),
    language: z.enum(["es", "en", "ca"], {
      errorMap: () => ({ message: t.forms.selectValid }),
    }),
  });

export const createMonthlyGoalsSchema = (t) =>
  z.object({
    // Los objetivos de revenue y adSpend se envían en CÉNTIMOS al backend
    targetRevenue: z.coerce.number().min(0, t.forms.positiveNumber).optional(),
    targetROAS: z
      .coerce.number()
      .min(0, t.forms.positiveNumber)
      .max(50, t.forms.roasMax)
      .optional(),
    targetAdSpend: z.coerce.number().min(0, t.forms.positiveNumber).optional(),
  });
