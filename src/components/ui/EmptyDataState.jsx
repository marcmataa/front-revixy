// Estado vacío — nunca dejar un área de datos en blanco
// title y description deben venir de useT() en el componente padre

const EmptyDataState = ({ title, description, action, height = 240, icon }) => {
  return (
    <div
      className="flex flex-col items-center justify-center bg-[var(--surface2)] rounded-xl border border-[var(--border)] text-center p-8"
      style={{ minHeight: height }}
    >
      {icon && (
        <div className="text-[var(--muted)] mb-4 opacity-50" aria-hidden="true">
          {icon}
        </div>
      )}
      <p className="text-[var(--text)] text-sm font-medium mb-1 font-[DM_Sans]">{title}</p>
      {description && (
        <p className="text-[var(--muted)] text-xs mb-4 max-w-xs font-[DM_Sans]">
          {description}
        </p>
      )}
      {action && action}
    </div>
  );
};

export default EmptyDataState;
