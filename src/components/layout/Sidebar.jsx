import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectUser } from "../../app/slices/authSlice.js";
import { selectCurrentStore } from "../../app/slices/storeSlice.js";
import { useT } from "../../hooks/useT.js";

// Tus imágenes originales
import ShopifyImg from "../../assets/shopify.png";
import MetaImg from "../../assets/meta.png";
import Logo from "../ui/logo.jsx";
import Badge from "../ui/Badge.jsx";

const Icons = {
  Dashboard: () => (
    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" /><rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" /><rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" /><rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" /></svg>
  ),
  Alerts: () => (
    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none"><path d="M10 2a6 6 0 0 1 6 6v3l1.5 2.5H2.5L4 11V8a6 6 0 0 1 6-6Z" stroke="currentColor" strokeWidth="1.5" /><path d="M8 15.5a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.5" /></svg>
  ),
  Chat: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      <circle cx="8" cy="10" r=".5" fill="currentColor" stroke="none"></circle>
      <circle cx="12" cy="10" r=".5" fill="currentColor" stroke="none"></circle>
      <circle cx="16" cy="10" r=".5" fill="currentColor" stroke="none"></circle>
    </svg>
  ),
  Settings: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Zm7.43-2.03c.04-.31.07-.63.07-.97s-.03-.67-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.33-.07.65-.07 1s.03.67.07 1l-2.11 1.66c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.58 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z"/>
    </svg>
  ),
  Logout: () => (
    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none"><path d="M13 15l4-5-4-5M17 10H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M8 3H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h4" stroke="currentColor" strokeWidth="1.5" /></svg>
  ),
};

const ICON_BLOCK = 80;

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const t = useT();
  const user = useSelector(selectUser);
  const currentStore = useSelector(selectCurrentStore);

  const shopifyConnected = !!currentStore?.shopifyDomain;
  const metaConnected = !!currentStore?.metaAdAccountId;

  const handleLogout = async () => {
    await dispatch(logout());
    navigate("/login", { replace: true });
  };

  const navItems = [
    { path: "/dashboard", label: t.dashboard.title, Icon: Icons.Dashboard },
    { path: "/alerts", label: t.alerts.title, Icon: Icons.Alerts },
    { path: "/chat", label: t.chat.title, Icon: Icons.Chat },
    { path: "/settings", label: t.settings.title, Icon: Icons.Settings },
  ];

  return (
    <aside
      className="relative flex flex-col h-full bg-[var(--surface)] border-r border-[var(--border)] flex-shrink-0 font-[DM_Sans]"
      style={{
        width: collapsed ? ICON_BLOCK : 240,
        minWidth: collapsed ? ICON_BLOCK : 240,
        transition: 'width 200ms ease-in-out',
        zIndex: "var(--z-sidebar)",
      }}
    >
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute top-8 right-0 translate-x-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center bg-[var(--surface)] border border-[var(--border)] rounded-full text-[var(--muted)] hover:text-[var(--text)] transition-colors duration-150 outline-none"
        style={{ zIndex: "calc(var(--z-sidebar) + 1)" }}
      >
        <svg className="w-2.5 h-2.5" style={{ transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 300ms' }} viewBox="0 0 16 16" fill="none">
          <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex items-center h-16 border-b border-[var(--border)] flex-shrink-0">
          <Logo collapsed={collapsed} />
        </div>

        <nav className="flex-1 py-3 space-y-1">
          {navItems.map(({ path, label, Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `relative flex items-center py-2.5 mx-2 rounded-xl text-sm transition-colors ${isActive ? "bg-[var(--accent)]/15 text-[var(--accent)] font-medium" : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface2)]"}`}
            >
              <div className="flex items-center justify-center flex-shrink-0" style={{ width: ICON_BLOCK - 16 }}>
                <Icon />
              </div>
              {!collapsed && <span className="absolute left-[64px] whitespace-nowrap">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* SECCIÓN INTEGRACIONES */}
        <div className="border-t border-[var(--border)] relative" style={{ padding: '1.5rem 0' }}>
          {!collapsed && (
            <p className="text-[10px] text-[var(--muted)] px-7 uppercase tracking-widest font-bold opacity-60 mb-6">{t.settings.tabs.integrations}</p>
          )}
          
          <div className="flex flex-col gap-7">
            {/* Shopify */}
            <div className="relative flex items-center h-8">
              <div className="flex items-center justify-center flex-shrink-0 w-[80px]">
                <div className="relative">
                  <img src={ShopifyImg} alt="Shopify" className="w-8 h-8 object-contain" />
                  {collapsed && (
                    <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-[var(--surface)] ${shopifyConnected ? "bg-green-500" : "bg-gray-500"}`} />
                  )}
                </div>
              </div>
              {!collapsed && (
                <div className="absolute left-[80px] flex items-center justify-between w-[145px]">
                  <span className="text-xs font-medium text-[var(--muted)]">{t.settings.integrations.shopify}</span>
                  <Badge variant={shopifyConnected ? "success" : "muted"} className="min-w-[90px] text-center justify-center py-1">
                    {shopifyConnected ? t.settings.integrations.connected : t.settings.integrations.disconnected}
                  </Badge>
                </div>
              )}
            </div>

            {/* Meta Ads */}
            <div className="relative flex items-center h-8">
              <div className="flex items-center justify-center flex-shrink-0 w-[80px]">
                <div className="relative">
                  <img src={MetaImg} alt="Meta" className="w-7 h-7 object-contain" />
                  {collapsed && (
                    <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-[var(--surface)] ${metaConnected ? "bg-green-500" : "bg-gray-500"}`} />
                  )}
                </div>
              </div>
              {!collapsed && (
                <div className="absolute left-[80px] flex items-center justify-between w-[145px]">
                  <span className="text-xs font-medium text-[var(--muted)]">{t.settings.integrations.meta}</span>
                  <Badge variant={metaConnected ? "success" : "muted"} className="min-w-[90px] text-center justify-center py-1">
                    {metaConnected ? t.settings.integrations.connected : t.settings.integrations.disconnected}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECCIÓN PERFIL / FOOTER */}
        <div className="border-t border-[var(--border)] mt-auto bg-[var(--surface2)]/10">
          <div className="py-2">
            <button 
              onClick={() => navigate("/profile")} 
              className="relative flex items-center w-full h-14 group hover:bg-[var(--surface2)]/50 transition-colors duration-200"
            >
              <div className="flex items-center justify-center flex-shrink-0 w-[80px]">
                <div className="w-10 h-10 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-bold text-sm shadow-md group-hover:scale-105 transition-transform">
                  {user?.name?.[0]?.toUpperCase() || "M"}
                </div>
              </div>
              {!collapsed && (
                <div className="absolute left-[80px] flex flex-col text-left">
                  <span className="text-xs font-bold text-[var(--text)] truncate">{user?.name || "Marc Mata"}</span>
                  <span className="text-[10px] text-[var(--muted)] truncate font-medium group-hover:text-[var(--accent)] transition-colors">{t.common.viewProfile}</span>
                </div>
              )}
            </button>
          </div>

          <div className="border-t border-[var(--border)]" />

          <div className="py-2">
          <button 
      onClick={handleLogout} 
      className="relative flex items-center py-2.5 mx-2 rounded-xl text-sm text-[var(--muted)] hover:text-red-500 hover:bg-red-500/5 transition-colors duration-200 w-[calc(100%-16px)]"
    >
      <div className="flex items-center justify-center flex-shrink-0" style={{ width: ICON_BLOCK - 16 }}>
        <Icons.Logout />
      </div>
      {!collapsed && <span className="absolute left-[64px] text-sm font-medium whitespace-nowrap">Cerrar sesión</span>}
    </button>
  </div>
</div>
      </div>
    </aside>
  );
};

export default Sidebar;