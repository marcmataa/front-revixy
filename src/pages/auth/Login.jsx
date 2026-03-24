import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { login, selectAuthLoading } from "../../app/slices/authSlice.js";
import { createLoginSchema } from "../../utils/schemas/auth.schemas.js";
import { useT } from "../../hooks/useT.js";
import Input from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector(selectAuthLoading);
  const t = useT();
  const [failCount, setFailCount] = useState(0);

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
    // Añadimos retraso tras múltiples intentos fallidos para frenar abuso de UI.
    if (failCount >= 3) {
      await new Promise((r) => setTimeout(r, 1000));
    }

    const result = await dispatch(login(data));

    if (result.meta.requestStatus === "fulfilled") {
      navigate("/dashboard", { replace: true });
      return;
    }

    setFailCount((c) => c + 1);
    toast.error(result.payload || t.common.error);
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  const isLoading = loading || isSubmitting;

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-[var(--text)] font-[Syne] mb-2">{t.auth.loginTitle}</h1>
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
            placeholder="********"
            register={register}
            error={errors.password}
            autoComplete="current-password"
            disabled={isLoading}
            required
          />
          <Button type="submit" loading={isLoading} disabled={isLoading} className="w-full">
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
