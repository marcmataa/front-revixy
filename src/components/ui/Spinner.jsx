const Spinner = ({ fullScreen = false }) => {
  const wrapperClass = fullScreen
    ? "min-h-screen bg-[var(--bg)] flex items-center justify-center"
    : "flex items-center justify-center";

  return (
    <div className={wrapperClass}>
      <div className="h-8 w-8 rounded-full border-2 border-[var(--border)] border-t-[var(--accent)] animate-spin" />
    </div>
  );
};

export default Spinner;
