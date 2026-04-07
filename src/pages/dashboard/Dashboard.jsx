// src/pages/dashboard/Dashboard.jsx
// Placeholder con HealthScore SVG listo para Phase 5
// El score real vendrá de Redux (statsApi/getDashboardStats)
import { useT } from "../../hooks/useT.js";
import HealthScore from "../../components/ui/HealthScore.jsx";

const Dashboard = () => {
  const t = useT();

  return (
    <div className="space-y-6 font-[DM_Sans]">
      <h1 className="text-2xl font-bold font-[Syne]" style={{ color: "var(--text)" }}>
        {t.dashboard.title}
      </h1>

      {/* HealthScore — ya funciona, solo falta conectar el score real en Phase 5 */}
      <div
        className="flex flex-col items-center gap-3 p-6 rounded-2xl"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <p className="text-sm font-medium" style={{ color: "var(--muted)" }}>
          {t.dashboard.healthScore}
        </p>
        <HealthScore score={0} />
        <p className="text-xs" style={{ color: "var(--muted)" }}>
          {t.dashboard.noData}
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
