// src/pages/integrations/IntegrationsPage.jsx
// Página central de gestión de integraciones externas.
// Extensible: agregar una nueva integración = añadir un objeto al array INTEGRATIONS.
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { useT } from "../../hooks/useT.js";
import {
  selectShopifyConnected,
  selectIntegrationLoading,
  refreshIntegrationStatus,
  disconnectShopify,
} from "../../app/slices/storeSlice.js";
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import ShopifyImg from "../../assets/shopify.png";
import MetaImg from "../../assets/meta.png";

// ─── Componente de card individual ───────────────────────────────────────────

const IntegrationCard = ({
  logo,
  name,
  description,
  connected,
  onAction,
  actionLabel,
  actionDisabled,
  actionVariant,
  secondaryAction,
}) => {
  const t = useT();

  return (
    <Card className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
      {/* Logo */}
      <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-[var(--surface2)] border border-[var(--border)]">
        <img src={logo} alt={name} className="w-7 h-7 object-contain" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-[var(--text)] font-[DM_Sans]">{name}</span>
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${connected ? "text-green-500" : "text-[var(--muted)]"}`}>
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${connected ? "bg-green-500" : "bg-gray-400"}`} />
            {connected ? t.settings.integrations.connected : t.settings.integrations.disconnected}
          </span>
        </div>
        <p className="text-xs text-[var(--muted)] font-[DM_Sans] leading-relaxed">{description}</p>
      </div>

      {/* Acciones */}
      <div className="flex-shrink-0 flex items-center gap-2">
        {secondaryAction && (
          <button
            type="button"
            onClick={secondaryAction.onAction}
            aria-disabled="true"
            className="px-4 py-2 rounded-xl text-xs font-medium font-[DM_Sans] bg-[var(--accent)] text-white opacity-40 cursor-not-allowed transition-colors"
          >
            {secondaryAction.label}
          </button>
        )}
        {actionDisabled ? (
          <button
            type="button"
            onClick={onAction}
            aria-disabled="true"
            className="px-4 py-2 rounded-xl text-xs font-medium font-[DM_Sans] bg-[var(--accent)] text-white opacity-40 cursor-not-allowed transition-colors"
          >
            {actionLabel}
          </button>
        ) : (
          <Button variant={actionVariant ?? "primary"} onClick={onAction} className="text-xs px-4 py-2">
            {actionLabel}
          </Button>
        )}
      </div>
    </Card>
  );
};

// ─── Página principal ─────────────────────────────────────────────────────────

const IntegrationsPage = () => {
  const t = useT();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const shopifyConnected = useSelector(selectShopifyConnected);
  const integrationLoading = useSelector(selectIntegrationLoading);

  // Modal de confirmación — local state, no Redux
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);

  // Refresca el estado real de integraciones desde el backend al montar
  useEffect(() => {
    dispatch(refreshIntegrationStatus());
  }, [dispatch]);

  const handleConfirmDisconnect = async () => {
    const result = await dispatch(disconnectShopify());
    if (disconnectShopify.fulfilled.match(result)) {
      setShowDisconnectModal(false);
      dispatch(refreshIntegrationStatus());
      toast.success(t.settings.integrations.disconnectSuccess);
    } else {
      setShowDisconnectModal(false);
      toast.error(result.payload || t.common.error);
    }
  };

  // Configuración de integraciones — agregar TikTok Ads u otras aquí en el futuro
  const INTEGRATIONS = [
    {
      id: "shopify",
      logo: ShopifyImg,
      name: t.settings.integrations.shopify,
      description: t.integrations.shopifyDescription,
      connected: shopifyConnected,
      // conectado     → "Desconectar" (danger, abre modal de confirmación)
      // no conectado  → "Conectar Shopify" (mismo flujo que onboarding)
      actionLabel: shopifyConnected
        ? t.settings.integrations.disconnect
        : t.integrations.connect,
      actionDisabled: false,
      actionVariant: shopifyConnected ? "danger" : "primary",
      onAction: shopifyConnected
        ? () => setShowDisconnectModal(true)
        : () => navigate("/onboarding/shopify"),
      secondaryAction: null,
    },
    {
      id: "meta",
      logo: MetaImg,
      name: t.settings.integrations.meta,
      description: t.integrations.metaDescription,
      connected: false,
      actionLabel: t.integrations.comingSoon,
      actionDisabled: true,
      actionVariant: "primary",
      // Meta backend no implementado — aria-disabled, solo toast informativo
      onAction: () => toast(t.onboarding.metaComingSoon),
      secondaryAction: null,
    },
    // ── Próximas integraciones ──────────────────────────────────────────────
    // {
    //   id: "tiktok",
    //   logo: TikTokImg,
    //   name: "TikTok Ads",
    //   description: t.integrations.tiktokDescription,
    //   connected: false,
    //   actionLabel: t.integrations.comingSoon,
    //   actionDisabled: true,
    //   onAction: () => toast(t.integrations.comingSoon),
    //   secondaryAction: null,
    // },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 font-[DM_Sans]">
      {/* Cabecera */}
      <div>
        <h1 className="text-2xl font-bold font-[Syne] text-[var(--text)]">
          {t.integrations.pageTitle}
        </h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          {t.integrations.pageSubtitle}
        </p>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {INTEGRATIONS.map((integration) => (
          <IntegrationCard key={integration.id} {...integration} />
        ))}
      </div>

      {/* Modal de confirmación de desconexión */}
      {showDisconnectModal && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ zIndex: "var(--z-modal)", backgroundColor: "rgba(0,0,0,0.6)" }}
        >
          <div className="w-full max-w-sm bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-semibold font-[Syne] text-[var(--text)]">
              {t.settings.integrations.disconnectTitle}
            </h2>
            <p className="text-sm text-[var(--muted)] font-[DM_Sans] leading-relaxed">
              {t.settings.integrations.disconnectWarning}
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => setShowDisconnectModal(false)}
                disabled={integrationLoading}
                className="text-xs"
              >
                {t.settings.integrations.disconnectCancel}
              </Button>
              <Button
                variant="danger"
                loading={integrationLoading}
                onClick={handleConfirmDisconnect}
                className="text-xs"
              >
                {t.settings.integrations.disconnectConfirm}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationsPage;
