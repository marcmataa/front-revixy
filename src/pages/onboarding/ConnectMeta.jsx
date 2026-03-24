const PlaceholderPage = ({ name }) => (
  <div className="min-h-screen bg-[var(--bg)] p-8 text-[var(--text)]">
    <h1 className="text-2xl font-bold font-[Syne]">{name}</h1>
    <p className="text-[var(--muted)] mt-2">Pr�ximamente...</p>
  </div>
);

const ConnectMeta = () => <PlaceholderPage name="Conectar Meta" />;

export default ConnectMeta;
