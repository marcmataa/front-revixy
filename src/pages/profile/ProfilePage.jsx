// src/pages/profile/ProfilePage.jsx
// Placeholder — Phase 4+ implementará el perfil completo
import { useT } from "../../hooks/useT.js";

const ProfilePage = () => {
  const t = useT();

  return (
    <div className="space-y-6 font-[DM_Sans]">
      <h1 className="text-2xl font-bold font-[Syne]" style={{ color: "var(--text)" }}>
        {t.profile.title}
      </h1>
      <p style={{ color: "var(--muted)" }}>{t.common.loading}</p>
    </div>
  );
};

export default ProfilePage;
