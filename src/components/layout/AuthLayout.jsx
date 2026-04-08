import { Link } from "react-router-dom";
import Logo from "../ui/logo.jsx";
import { useT } from "../../hooks/useT.js";

// Espaciado asimétrico: más aire arriba que entre logo y card.
// Cambiar estos valores actualiza todas las páginas de auth simultáneamente.
const AUTH_SPACING_TOP = "1.0rem"; // 56px — respiro generoso desde el top
const AUTH_SPACING_BELOW_LOGO = "0.5rem"; // 40px — distancia logo → card

// Escala visual del logo en páginas de auth.
// Natural: ~147px ancho × 54px alto.
// A LOGO_SCALE=2.9 → ~426px ancho × 157px alto (casi el ancho de la carta max-w-md=448px).
// No modificar sin actualizar LOGO_MIN_HEIGHT en consecuencia.
const LOGO_SCALE = 2.0;

// Altura mínima del contenedor del logo = altura visual renderizada a LOGO_SCALE.
// Previene layout shift (FOUT) mientras el isotipo termina de cargar.
// Fórmula: Math.ceil(54 * LOGO_SCALE) → 157px
const LOGO_MIN_HEIGHT = "108px";

const AuthLayout = ({ children }) => {
  const t = useT();

  return (
    <div
      className="min-h-screen bg-[var(--bg)] flex flex-col items-center px-4 pb-8"
      style={{ paddingTop: AUTH_SPACING_TOP }}
    >
      {/* Contenedor del logo — altura fija evita salto de layout mientras carga */}
      <div
        className="flex items-center"
        style={{
          marginBottom: AUTH_SPACING_BELOW_LOGO,
          minHeight: LOGO_MIN_HEIGHT,
        }}
      >
        {/* Enlace de regreso al inicio — hitbox mínimo 44px (WCAG 2.1) */}
        <Link
          to="/"
          aria-label={t.auth.backToHomeAriaLabel}
          className="
    flex items-center px-2
    min-h-[44px]
    /* Estado Base */
    transition-all duration-300 ease-out
    
    /* Hover: Elevación + Brillo + Escala sutil */
    hover:-translate-y-1
    hover:brightness-110
    hover:drop-shadow-[0_0_15px_rgba(108,99,255,0.3)]
    active:scale-[0.98] /* Feedback táctil al hacer clic */
    
    cursor-pointer
    rounded-lg
    focus:outline-none
    focus-visible:ring-2
    focus-visible:ring-[var(--accent)]
  "
        >
          <Logo variant="full" scale={LOGO_SCALE} />
        </Link>
      </div>

      {/* Contenido de la página — formulario de auth */}
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
};

export default AuthLayout;
