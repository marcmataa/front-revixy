const Button = ({ type = "button", loading = false, disabled = false, className = "", children, ...props }) => {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`px-4 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--text)] font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity ${className}`}
      {...props}
    >
      {loading ? "..." : children}
    </button>
  );
};

export default Button;
