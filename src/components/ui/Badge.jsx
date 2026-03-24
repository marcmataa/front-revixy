// variant: "critical" | "warning" | "opportunity" | "success" | "muted" | "accent"
// Usado en AlertCard, conexión Shopify/Meta, estado de la tienda

const variantStyles = {
  critical:
    "bg-[var(--critical)]/20 text-[var(--critical)] border border-[var(--critical)]/20",
  warning:
    "bg-[var(--warning)]/20 text-[var(--warning)] border border-[var(--warning)]/20",
  opportunity:
    "bg-[var(--success)]/20 text-[var(--success)] border border-[var(--success)]/20",
  success:
    "bg-[var(--success)]/20 text-[var(--success)] border border-[var(--success)]/20",
  muted: "bg-[var(--surface2)] text-[var(--muted)] border border-[var(--border)]",
  accent: "bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/20",
};

const Badge = ({ children, variant = "muted", className = "" }) => {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-2.5 py-1 rounded-lg text-xs font-medium font-[DM_Sans]
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

export default Badge;
