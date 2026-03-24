// Base container para widgets, KPIs y panels del dashboard
// noPadding: útil para cards con charts a sangre
// hover: efecto hover sutil para cards interactivas
// onClick: convierte la card en botón semántico — aria-label obligatorio

const Card = ({
  children,
  className = "",
  noPadding = false,
  hover = false,
  onClick,
  ariaLabel,
}) => {
  const Tag = onClick ? "button" : "div";

  return (
    <Tag
      onClick={onClick}
      aria-label={onClick ? ariaLabel : undefined}
      className={`
        bg-[var(--surface)] border border-[var(--border)] rounded-2xl
        ${noPadding ? "" : "p-6"}
        ${hover ? "hover:border-[var(--accent)]/40 transition-colors cursor-pointer" : ""}
        ${onClick ? "text-left w-full focus-visible:ring-2 focus-visible:ring-[var(--accent)] outline-none" : ""}
        ${className}
      `}
    >
      {children}
    </Tag>
  );
};

export default Card;
