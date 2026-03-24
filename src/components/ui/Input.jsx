const Input = ({
  label,
  name,
  type = "text",
  placeholder,
  register,
  error,
  disabled = false,
  required = false,
  className = "",
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={name}
          className="text-sm font-medium text-[var(--text)] font-[DM_Sans]"
        >
          {label}
          {required && (
            <span className="text-[var(--critical)] ml-1" aria-hidden="true">
              *
            </span>
          )}
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
          w-full px-4 py-2.5 rounded-xl text-sm font-[DM_Sans]
          bg-[var(--surface2)] text-[var(--text)]
          border transition-colors outline-none
          placeholder:text-[var(--muted)]
          focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]
          disabled:opacity-50 disabled:cursor-not-allowed
          ${
            error
              ? "border-[var(--critical)]"
              : "border-[var(--border)] hover:border-[var(--muted)]"
          }
          ${className}
        `}
        {...(register ? register(name) : {})}
        {...props}
      />
      {error && (
        <p
          id={`${name}-error`}
          role="alert"
          className="text-xs text-[var(--critical)] flex items-center gap-1 font-[DM_Sans]"
        >
          <span aria-hidden="true">⚠</span>
          {error.message}
        </p>
      )}
    </div>
  );
};

export default Input;
