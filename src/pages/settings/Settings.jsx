const PlaceholderPage = ({ name }) => (
  <div className="min-h-screen bg-[var(--bg)] p-8 text-[var(--text)]">
    <h1 className="text-2xl font-bold font-[Syne]">{name}</h1>
    <p className="text-[var(--muted)] mt-2">Próximamente...</p>
  </div>
);

const Settings = () => <PlaceholderPage name="Configuración" />;

export default Settings;
