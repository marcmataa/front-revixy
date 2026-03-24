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
          bg-[var(--surface2)] text-[var(--text)] border
          placeholder:text-[var(--muted)] outline-none transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? "border-[var(--critical)]" : "border-[var(--border)] hover:border-[var(--muted)]"}
        `}
        {...register(name)}
        {...props}
      />
      {error && (
        <p id={`${name}-error`} role="alert" className="text-xs text-[var(--critical)]">
          {error.message}
        </p>
      )}
    </div>
  );
};

export default Input;
