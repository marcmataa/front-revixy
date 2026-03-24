const sizeMap = {
  sm: "w-4 h-4 border-2",
  md: "w-8 h-8 border-2",
  lg: "w-12 h-12 border-[3px]",
};

const Spinner = ({ fullScreen = false, size = "md", label = "Cargando" }) => {
  const spinner = (
    <div
      className={`${sizeMap[size]} rounded-full border-[var(--surface2)] border-t-[var(--accent)] animate-spin`}
      role="status"
      aria-label={label}
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-[var(--bg)] flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default Spinner;
