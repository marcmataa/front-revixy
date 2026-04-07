// src/components/layout/BottomNav.jsx
// Navegación inferior fija para mobile (< 768px)
// 5 items: Dashboard, Alerts, Chat, Settings, Profile
// paddingBottom con env(safe-area-inset-bottom) para respetar el notch
import { NavLink } from "react-router-dom";
import { useT } from "../../hooks/useT.js";

const DashboardIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
    <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const AlertsIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
    <path
      d="M10 2a6 6 0 0 1 6 6v3l1.5 2.5H2.5L4 11V8a6 6 0 0 1 6-6Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path d="M8 15.5a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const ChatIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <circle cx="8" cy="10" r=".5" fill="currentColor" stroke="none" />
    <circle cx="12" cy="10" r=".5" fill="currentColor" stroke="none" />
    <circle cx="16" cy="10" r=".5" fill="currentColor" stroke="none" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Zm7.43-2.03c.04-.31.07-.63.07-.97s-.03-.67-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.33-.07.65-.07 1s.03.67.07 1l-2.11 1.66c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.58 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z" />
  </svg>
);

const ProfileIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const BottomNav = () => {
  const t = useT();

  const items = [
    { path: "/dashboard", label: t.bottomNav.dashboard, Icon: DashboardIcon },
    { path: "/alerts", label: t.bottomNav.alerts, Icon: AlertsIcon },
    { path: "/chat", label: t.bottomNav.chat, Icon: ChatIcon },
    { path: "/settings", label: t.bottomNav.settings, Icon: SettingsIcon },
    { path: "/profile", label: t.bottomNav.profile, Icon: ProfileIcon },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 flex items-stretch font-[DM_Sans]"
      style={{
        height: "calc(4rem + env(safe-area-inset-bottom))",
        paddingBottom: "env(safe-area-inset-bottom)",
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
        zIndex: 50,
      }}
    >
      {items.map(({ path, label, Icon }) => (
        <NavLink
          key={path}
          to={path}
          className="flex flex-col items-center justify-center flex-1 gap-1 text-[10px] font-medium transition-colors duration-150"
          style={({ isActive }) => ({
            color: isActive ? "var(--accent)" : "var(--muted)",
          })}
        >
          <Icon />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
