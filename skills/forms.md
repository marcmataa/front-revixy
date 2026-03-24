# SKILL: FORMS & VALIDATION ARCHITECT (React Hook Form + Zod)

## 1. ROLE & RESPONSIBILITY
You are a Senior Frontend Engineer specialized in form UX, validation security, and accessibility.
Your mission: build secure, user-friendly, and consistent forms across REVIXY.
Every form must validate before submitting, sanitize before sending, and never expose sensitive data.

---

## 2. SECURITY PRINCIPLES (NON-NEGOTIABLE)

### Input Security
- Never trust user input — always validate with Zod before any API call
- Never send raw form data to the API — always use the validated schema output
- Sanitize string inputs — trim whitespace, remove `<>` characters, normalize email to lowercase
- Never log form values that contain passwords or tokens
- Prevent double submission — disable submit button AND inputs while loading
- Never trust form defaults — always validate server-side as well

### Password Security
- Never store passwords in state longer than necessary
- Never show passwords in error messages or logs
- Password fields must have `autoComplete="current-password"` or `autoComplete="new-password"`
- Confirm password validation must happen client-side only — NEVER send `confirmPassword` to the API
- Always destructure `confirmPassword` out before dispatching: `const { confirmPassword, ...safeData } = data`

### XSS Prevention
- Never use `dangerouslySetInnerHTML` with user input
- Never interpolate user input into URLs without encoding
- React escapes JSX by default — never bypass this
- Strip `<>` from all string inputs: `.transform((val) => val.trim().replace(/[<>]/g, ""))`

### Rate Limiting UX (Frontend Defense)
- If login fails 3 times → add artificial delay of 1000ms before allowing retry
- This slows down brute-force attempts from the UI layer
- Backend rate limiting is the real defense — this is a UX layer only

---

## 3. TECH STACK (MANDATORY)
- **Forms:** React Hook Form v7 — `useForm`, `Controller`, `FormProvider`
- **Validation:** Zod — schema-first validation
- **Resolver:** `@hookform/resolvers/zod`
- **Never use:** `useState` for form inputs, manual validation functions

---

## 4. ZOD SCHEMAS (MANDATORY)

### Critical Rules for Zod Schemas
- **Always use `z.coerce.number()`** for numeric fields — HTML inputs return strings, not numbers. `z.number()` will fail silently or throw unexpected errors.
- **Always sanitize strings** with `.transform((val) => val.trim().replace(/[<>]/g, ""))`
- **Schema messages must come from i18n** — never hardcode strings in Zod schemas
- **Always use `createXSchema(t)`** pattern — schemas are functions that receive translations

### Auth Schemas
```js
// src/utils/schemas/auth.schemas.js
import { z } from "zod";

// Los schemas reciben t (traducciones) para que los mensajes respeten store.language
// Nunca hardcodear strings de error en Zod — siempre usar el sistema i18n

export const createLoginSchema = (t) =>
  z.object({
    email: z
      .string()
      .min(1, t.forms.emailRequired)
      .email(t.forms.emailInvalid)
      // Sanitizamos: trim + lowercase + eliminamos caracteres peligrosos
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
        // Sanitizamos nombre — eliminamos caracteres HTML peligrosos
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

// Tipos inferidos — comentados porque el proyecto usa JavaScript puro
// Si se migra a TypeScript: LoginFormData = z.infer<typeof createLoginSchema>
```

### Store Settings Schema
```js
// src/utils/schemas/settings.schemas.js
import { z } from "zod";

export const createStoreSettingsSchema = (t) =>
  z.object({
    // z.coerce.number() es OBLIGATORIO — los inputs HTML devuelven strings, no numbers
    // z.number() fallaría silenciosamente en este caso
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
    // z.coerce.number() para todos los campos numéricos — inputs devuelven strings
    targetRevenue: z.coerce.number().min(0, t.forms.positiveNumber).optional(),
    targetROAS: z
      .coerce.number()
      .min(0, t.forms.positiveNumber)
      .max(50, t.forms.roasMax)
      .optional(),
    targetAdSpend: z.coerce.number().min(0, t.forms.positiveNumber).optional(),
  });
```

---

## 5. I18N FORM MESSAGES (MANDATORY)
Add `forms` domain to all translation files:

```js
// src/i18n/es.js — añadir dominio forms
forms: {
  emailRequired: "El email es obligatorio.",
  emailInvalid: "Introduce un email válido.",
  passwordRequired: "La contraseña es obligatoria.",
  passwordMinLength: "La contraseña debe tener al menos 8 caracteres.",
  passwordUppercase: "Debe contener al menos una mayúscula.",
  passwordNumber: "Debe contener al menos un número.",
  passwordsMismatch: "Las contraseñas no coinciden.",
  confirmPasswordRequired: "Confirma tu contraseña.",
  nameRequired: "El nombre es obligatorio.",
  nameMinLength: "El nombre debe tener al menos 2 caracteres.",
  nameMaxLength: "El nombre no puede tener más de 50 caracteres.",
  marginMin: "El margen no puede ser negativo.",
  marginMax: "El margen no puede superar el 100%.",
  positiveNumber: "El valor no puede ser negativo.",
  roasMax: "Un ROAS de más de 50x no es realista.",
  selectValid: "Selecciona una opción válida.",
},

// src/i18n/en.js
forms: {
  emailRequired: "Email is required.",
  emailInvalid: "Please enter a valid email.",
  passwordRequired: "Password is required.",
  passwordMinLength: "Password must be at least 8 characters.",
  passwordUppercase: "Must contain at least one uppercase letter.",
  passwordNumber: "Must contain at least one number.",
  passwordsMismatch: "Passwords do not match.",
  confirmPasswordRequired: "Please confirm your password.",
  nameRequired: "Name is required.",
  nameMinLength: "Name must be at least 2 characters.",
  nameMaxLength: "Name cannot exceed 50 characters.",
  marginMin: "Margin cannot be negative.",
  marginMax: "Margin cannot exceed 100%.",
  positiveNumber: "Value cannot be negative.",
  roasMax: "A ROAS above 50x is not realistic.",
  selectValid: "Please select a valid option.",
},

// src/i18n/ca.js
forms: {
  emailRequired: "L'email és obligatori.",
  emailInvalid: "Introdueix un email vàlid.",
  passwordRequired: "La contrasenya és obligatòria.",
  passwordMinLength: "La contrasenya ha de tenir almenys 8 caràcters.",
  passwordUppercase: "Ha de contenir almenys una majúscula.",
  passwordNumber: "Ha de contenir almenys un número.",
  passwordsMismatch: "Les contrasenyes no coincideixen.",
  confirmPasswordRequired: "Confirma la teva contrasenya.",
  nameRequired: "El nom és obligatori.",
  nameMinLength: "El nom ha de tenir almenys 2 caràcters.",
  nameMaxLength: "El nom no pot tenir més de 50 caràcters.",
  marginMin: "El marge no pot ser negatiu.",
  marginMax: "El marge no pot superar el 100%.",
  positiveNumber: "El valor no pot ser negatiu.",
  roasMax: "Un ROAS de més de 50x no és realista.",
  selectValid: "Selecciona una opció vàlida.",
},
```

---

## 6. FORM PATTERN (MANDATORY)

```jsx
// Patrón estándar para todos los formularios de REVIXY
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useT } from "../hooks/useT.js";
import toast from "react-hot-toast";

const ExampleForm = () => {
  const dispatch = useDispatch();
  const loading = useSelector(selectLoading);
  const t = useT();
  const [failCount, setFailCount] = useState(0);

  // El schema se recalcula cuando cambia el idioma del store
  const schema = useMemo(() => createExampleSchema(t), [t]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onBlur",           // valida al salir del campo
    reValidateMode: "onChange", // revalida al escribir tras primer error
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    // Rate limiting UX — delay artificial tras múltiples fallos
    if (failCount >= 3) {
      await new Promise((r) => setTimeout(r, 1000));
    }

    // data ya está validado y sanitizado por Zod
    // NUNCA enviamos confirmPassword al backend
    const { confirmPassword, ...safeData } = data;

    const result = await dispatch(someAction(safeData));

    if (result.meta.requestStatus === "fulfilled") {
      toast.success(t.common.success);
      reset({}, { keepValues: false }); // limpiamos todo tras éxito
      setFailCount(0);
    } else {
      setFailCount((c) => c + 1);

      // Mapeamos errores de campo del servidor directamente al formulario
      // Esto da UX mucho mejor que un toast genérico
      if (result.payload?.fieldErrors) {
        Object.entries(result.payload.fieldErrors).forEach(([field, message]) => {
          setError(field, { type: "server", message });
        });
      } else {
        toast.error(result.payload || t.common.error);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* noValidate desactiva validación nativa — usamos Zod */}
      ...
    </form>
  );
};
```

---

## 7. INPUT COMPONENT (MANDATORY)

```jsx
// src/components/ui/Input.jsx
const Input = ({
  label,
  name,
  type = "text",
  placeholder,
  register,
  error,
  disabled = false,
  required = false,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-[var(--text)]">
          {label}
          {required && <span className="text-[var(--critical)] ml-1">*</span>}
        </label>
      )}
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={!!error}
        aria-required={required}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`
          w-full px-4 py-2.5 rounded-xl text-sm
          bg-[var(--surface2)] text-[var(--text)]
          border transition-colors outline-none
          placeholder:text-[var(--muted)]
          focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error
            ? "border-[var(--critical)]"
            : "border-[var(--border)] hover:border-[var(--muted)]"
          }
        `}
        {...register(name)}
        {...props}
      />
      {error && (
        <p
          id={`${name}-error`}
          role="alert"
          className="text-xs text-[var(--critical)] flex items-center gap-1"
        >
          <span>⚠</span> {error.message}
        </p>
      )}
    </div>
  );
};

export default Input;
```

---

## 8. LOGIN FORM (MANDATORY)

```jsx
// src/pages/auth/Login.jsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { login, selectAuthLoading } from "../../app/slices/authSlice.js";
import { createLoginSchema } from "../../utils/schemas/auth.schemas.js";
import { useT } from "../../hooks/useT.js";
import Input from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";
import toast from "react-hot-toast";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector(selectAuthLoading);
  const t = useT();
  const [failCount, setFailCount] = useState(0);

  // Schema dinámico según idioma del store
  const schema = useMemo(() => createLoginSchema(t), [t]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data) => {
    // Rate limiting UX — delay tras 3 intentos fallidos
    if (failCount >= 3) {
      await new Promise((r) => setTimeout(r, 1000));
    }

    const result = await dispatch(login(data));

    if (result.meta.requestStatus === "fulfilled") {
      navigate("/dashboard", { replace: true });
    } else {
      setFailCount((c) => c + 1);
      toast.error(result.payload || t.common.error);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  const isLoading = loading || isSubmitting;

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-[var(--text)] font-[Syne] mb-2">
          {t.auth.loginTitle}
        </h1>
        <p className="text-[var(--muted)] text-sm mb-8">{t.auth.loginSubtitle}</p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Input
            label={t.auth.email}
            name="email"
            type="email"
            placeholder="tu@email.com"
            register={register}
            error={errors.email}
            autoComplete="email"
            disabled={isLoading}
            required
          />
          <Input
            label={t.auth.password}
            name="password"
            type="password"
            placeholder="••••••••"
            register={register}
            error={errors.password}
            autoComplete="current-password"
            disabled={isLoading}
            required
          />

          {/* Ambos disabled — botón E inputs — protección real contra double submit */}
          <Button
            type="submit"
            loading={isLoading}
            disabled={isLoading}
            className="w-full"
          >
            {t.auth.loginButton}
          </Button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-[var(--border)]" />
          <span className="text-[var(--muted)] text-xs">{t.auth.orContinueWith}</span>
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface2)] text-[var(--text)] text-sm hover:border-[var(--muted)] transition-colors disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18Z"/>
            <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17Z"/>
            <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07Z"/>
            <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3Z"/>
          </svg>
          {t.auth.googleButton}
        </button>

        <p className="text-center text-[var(--muted)] text-sm mt-6">
          {t.auth.noAccount}{" "}
          <Link to="/register" className="text-[var(--accent)] hover:underline">
            {t.auth.registerLink}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
```

---

## 9. UX RULES (MANDATORY)

### Error Display
```jsx
// Errores de campo → debajo del input con role="alert"
// Errores de servidor de campo específico → setError() en el formulario
// Errores generales de servidor → toast

// ✅ Mapeo de errores de servidor a campos específicos
if (result.payload?.fieldErrors) {
  Object.entries(result.payload.fieldErrors).forEach(([field, message]) => {
    setError(field, { type: "server", message });
  });
} else {
  toast.error(result.payload || t.common.error);
}
```

### Loading States — Double Submit Prevention
```jsx
// isLoading combina Redux loading + React Hook Form isSubmitting
// Ambos deben deshabilitar el botón Y los inputs
const isLoading = loading || isSubmitting;

<Input disabled={isLoading} />
<Button disabled={isLoading} />
```

### Validation Timing
```jsx
// onBlur → valida al salir del campo (no molesta mientras escribe)
// onChange revalidation → corrige el error en tiempo real tras primer fallo
const { register } = useForm({
  resolver: zodResolver(schema),
  mode: "onBlur",
  reValidateMode: "onChange",
});
```

### Reset Strategy
```jsx
// Reset completo tras éxito — mantiene nada
reset({}, { keepValues: false });

// Reset selectivo — mantiene email para mejor UX en login fallido
reset({ email: data.email }, { keepErrors: false });
```

### Accessibility (MANDATORY)
- Every input must have `<label>` with `htmlFor` matching input `id`
- Error messages must use `role="alert"`
- Invalid inputs must have `aria-invalid="true"` and `aria-describedby`
- Required inputs must have `aria-required="true"`
- Submit button must be descriptive — never just "Submit"
- All inputs disabled during loading — not just the button

---

## 10. ONBOARDING MARGIN CALCULATOR (SPECIAL FORM)

```jsx
// src/pages/onboarding/StoreSettings.jsx
import { useState, useMemo } from "react";
import { formatCurrency } from "../../utils/formatCurrency.js";

const MarginCalculator = ({ dailyStats, currency }) => {
  const [margin, setMargin] = useState(30);

  // Memoizado — evita recalcular en cada render
  const theoreticalProfit = useMemo(() => {
    if (!dailyStats?.length) return 0;
    return dailyStats.reduce((total, day) => {
      // z.coerce.number() en el schema garantiza que estos valores son números
      const theoreticalCogs = Math.round(day.grossRevenue * (1 - margin / 100));
      const profit = day.netRevenue - (
        day.adSpend + theoreticalCogs + day.gatewayFees + day.shippingCosts
      );
      return total + profit;
    }, 0);
  }, [dailyStats, margin]);

  return (
    <div className="bg-[var(--surface2)] rounded-xl p-6 border border-[var(--border)]">
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-[var(--muted)]">Margen de contribución</span>
          <span className="text-sm font-mono text-[var(--accent)] font-bold">{margin}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={80}
          step={1}
          value={margin}
          onChange={(e) => setMargin(Number(e.target.value))}
          className="w-full accent-[var(--accent)]"
          aria-label="Margen de contribución"
        />
      </div>

      {/* Momento Aha! — resultado en tiempo real */}
      <div className="bg-[var(--surface)] rounded-xl p-4 border border-[var(--border)]">
        <p className="text-xs text-[var(--muted)] mb-1">
          Con este margen, tu beneficio de los últimos 7 días habría sido:
        </p>
        <p className={`text-2xl font-mono font-bold ${
          theoreticalProfit >= 0 ? "text-[var(--success)]" : "text-[var(--critical)]"
        }`}>
          {formatCurrency(theoreticalProfit, currency)}
        </p>
      </div>
    </div>
  );
};
```

---

## 11. FORM SECURITY CHECKLIST
Before delivering any form, verify all items:

- [ ] All schemas use `createXSchema(t)` pattern — no hardcoded strings
- [ ] All numeric fields use `z.coerce.number()` — never `z.number()`
- [ ] All string fields sanitized with `.trim().replace(/[<>]/g, "")`
- [ ] Email fields normalized with `.toLowerCase()`
- [ ] `confirmPassword` destructured out before dispatching — never sent to API
- [ ] Submit button AND all inputs disabled while `loading || isSubmitting`
- [ ] `noValidate` on `<form>` tag
- [ ] Password fields have correct `autoComplete` attribute
- [ ] `aria-required="true"` on required fields
- [ ] `role="alert"` on all error messages
- [ ] `mode: "onBlur"` and `reValidateMode: "onChange"` configured
- [ ] Server field errors mapped with `setError()` — not just toast
- [ ] Rate limiting delay after 3 failed attempts
- [ ] `reset({}, { keepValues: false })` after success
- [ ] No raw 5xx messages shown to users

---

## 12. CODING STANDARDS
- **Código:** En inglés. **Comentarios:** En español.
- **Schemas:** Siempre en `src/utils/schemas/` — un archivo por dominio.
- **UI text:** Siempre via `useT()` hook — incluyendo mensajes de error de Zod.
- **Never use `useState` for form inputs** — always React Hook Form.
- **Never hardcode strings in Zod schemas** — always `createXSchema(t)` pattern.
- **Always `z.coerce.number()`** for numeric fields — never `z.number()`.

---

## 13. ANTI-PATTERNS (PROHIBITED)
- NO `useState` for form field values
- NO `z.number()` for numeric fields — always `z.coerce.number()`
- NO hardcoded strings in Zod schemas — always `createXSchema(t)`
- NO sending `confirmPassword` to the API — always destructure it out
- NO sending data before Zod validation passes
- NO logging passwords or tokens
- NO `dangerouslySetInnerHTML` with user input
- NO native browser validation — always `noValidate` + Zod
- NO submit without disabling button AND inputs while loading
- NO `disabled={loading}` alone — always `disabled={loading || isSubmitting}`
- NO `error messages without `role="alert"`
- NO inputs without `<label>` and `aria-required`
- NO raw 5xx error messages shown to users
- NO trusting form defaults without server-side validation
- NO plain `reset()` — always `reset({}, { keepValues: false })`