import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useT } from "../../hooks/useT.js";
import Button from "../../components/ui/Button.jsx";

const ConnectMeta = () => {
  const t = useT();
  const navigate = useNavigate();

  const handleConnectMeta = () => {
    toast(t.onboarding.metaComingSoon);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-md space-y-6">
        <p className="text-sm text-[var(--muted)] font-[DM_Sans] text-center">
          {t.onboarding.step2of3}
        </p>

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold font-[Syne] text-[var(--text)]">
            {t.onboarding.connectMeta.title}
          </h1>
          <p className="text-sm text-[var(--muted)] font-[DM_Sans]">
            {t.onboarding.connectMeta.description}
          </p>
        </div>

        <div className="space-y-3">
          {/*
            aria-disabled="true" (not native disabled) so the click still fires the toast.
            Visually appears disabled via opacity + cursor-not-allowed.
            CRITICAL: metaConnected is never set to true — Meta backend not implemented.
          */}
          <button
            type="button"
            onClick={handleConnectMeta}
            aria-disabled="true"
            aria-label={t.onboarding.connectMeta.button}
            className="
              w-full flex items-center justify-center gap-2
              px-4 py-2.5 rounded-xl text-sm font-medium font-[DM_Sans]
              bg-[var(--accent)] text-[var(--text)]
              opacity-50 cursor-not-allowed
              transition-colors duration-150 outline-none
              focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]
            "
          >
            {t.onboarding.connectMeta.button}
          </button>
          <Button
            variant="ghost"
            onClick={() => navigate("/onboarding/settings")}
            className="w-full"
          >
            {t.onboarding.skipForNow}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConnectMeta;
