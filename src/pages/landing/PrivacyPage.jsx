import { Link } from "react-router-dom";
import Logo from "../../components/ui/logo.jsx";

export default function PrivacyPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-16"
      style={{ background: "var(--bg)" }}
    >
      <Link to="/" className="mb-12">
        <Logo />
      </Link>
      <div
        className="rounded-2xl border p-10 max-w-md w-full text-center"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <h1
          className="mb-3"
          style={{
            fontFamily: "Syne, sans-serif",
            fontWeight: 700,
            fontSize: "1.5rem",
            color: "var(--text)",
          }}
        >
          Política de privacidad
        </h1>
        <p
          className="mb-6"
          style={{ fontFamily: "DM Sans, sans-serif", color: "var(--muted)" }}
        >
          Próximamente. Estamos redactando nuestra política de privacidad
          conforme al RGPD.
        </p>
        <Link
          to="/"
          className="text-sm transition-colors duration-150"
          style={{ color: "var(--accent)", fontFamily: "DM Sans, sans-serif" }}
        >
          ← Volver al inicio
        </Link>
      </div>
    </div>
  );
}
