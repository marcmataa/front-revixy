// src/components/ui/HealthScore.jsx
// SVG circular con arco de progreso para el HealthScore (0-100)
// Verde ≥ 71 / Naranja 41-70 / Rojo ≤ 40
// CRÍTICO: el CIRCUMFERENCE se calcula una sola vez aquí para evitar errores de math
const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ≈ 339.29

const HealthScore = ({ score = 0 }) => {
  const clamped = Math.max(0, Math.min(100, score));
  const offset = CIRCUMFERENCE - (clamped / 100) * CIRCUMFERENCE;

  const color =
    clamped >= 71
      ? "var(--color-success, #22c55e)"
      : clamped >= 41
      ? "var(--color-warning, #f59e0b)"
      : "var(--color-danger, #ef4444)";

  return (
    <svg width="140" height="140" viewBox="0 0 140 140" aria-label={`HealthScore: ${clamped}`}>
      {/* Track de fondo */}
      <circle
        cx="70"
        cy="70"
        r={RADIUS}
        fill="none"
        stroke="var(--surface2, #2a2a3a)"
        strokeWidth="12"
      />
      {/* Arco de progreso */}
      <circle
        cx="70"
        cy="70"
        r={RADIUS}
        fill="none"
        stroke={color}
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={offset}
        transform="rotate(-90 70 70)"
        style={{
          transition: "stroke-dashoffset 1s ease, stroke 0.3s ease",
        }}
      />
      {/* Número central */}
      <text
        x="70"
        y="70"
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          font: "bold 28px var(--font-sans, 'DM Sans', sans-serif)",
          fill: "var(--text)",
        }}
      >
        {clamped}
      </text>
    </svg>
  );
};

export default HealthScore;
