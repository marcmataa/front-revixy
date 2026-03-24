import Spinner from "./Spinner.jsx";

const variantStyles = {
  primary: "bg-[var(--accent)] hover:bg-[#5B52E0] text-[var(--text)]",
  secondary:
    "bg-[var(--surface2)] hover:bg-[var(--surface)] text-[var(--text)] border border-[var(--border)]",
  ghost: "bg-transparent hover:bg-[var(--surface2)] text-[var(--text)]",
  danger:
    "bg-[var(--critical)]/20 hover:bg-[var(--critical)]/30 text-[var(--critical)] border border-[var(--critical)]/30",
};

const Button = ({
  children,
  variant = "primary",
  loading = false,
  disabled = false,
  className = "",
  type = "button",
  onClick,
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        flex items-center justify-center gap-2
        px-4 py-2.5 rounded-xl text-sm font-medium font-[DM_Sans]
        transition-colors duration-150 outline-none
        focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${className}
      `}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
};

export default Button;
