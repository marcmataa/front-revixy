import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useT } from "../../hooks/useT.js";
import { connectShopify, selectStoreLoading } from "../../app/slices/storeSlice.js";
import Button from "../../components/ui/Button.jsx";

// Acepta con o sin prefijo https:// y con trailing slash — sanitizamos antes del dispatch
const SHOPIFY_DOMAIN_REGEX = /^(https?:\/\/)?[a-zA-Z0-9-]+\.myshopify\.com\/?$/;

const ConnectShopify = () => {
  const t = useT();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loading = useSelector(selectStoreLoading);

  const [domain, setDomain] = useState("");
  const [touched, setTouched] = useState(false);

  const isValid = SHOPIFY_DOMAIN_REGEX.test(domain);
  const showError = touched && !isValid;

  const handleConnect = async () => {
    if (!isValid) return;
    // Sanitizamos antes del dispatch — Shopify requiere exactamente: mystore.myshopify.com
    const cleanDomain = domain
      .trim()
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "")
      .toLowerCase();
    if (import.meta.env.DEV) {
      console.log("[Shopify OAuth] shop param sent:", cleanDomain);
    }
    const result = await dispatch(connectShopify(cleanDomain));
    if (connectShopify.fulfilled.match(result)) {
      window.location.href = result.payload.oauthUrl;
    } else {
      toast.error(t.onboarding.connectShopifyError);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-md space-y-6">
        <p className="text-sm text-[var(--muted)] font-[DM_Sans] text-center">
          {t.onboarding.step1of3}
        </p>

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold font-[Syne] text-[var(--text)]">
            {t.onboarding.connectShopify.title}
          </h1>
          <p className="text-sm text-[var(--muted)] font-[DM_Sans]">
            {t.onboarding.connectShopify.description}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="shopify-domain"
            className="text-sm font-medium text-[var(--text)] font-[DM_Sans]"
          >
            Shopify
            <span className="text-[var(--critical)] ml-1" aria-hidden="true">
              *
            </span>
          </label>
          <input
            id="shopify-domain"
            type="text"
            value={domain}
            placeholder={t.onboarding.shopifyPlaceholder}
            aria-label={t.onboarding.shopifyPlaceholder}
            aria-required="true"
            aria-invalid={showError}
            aria-describedby={showError ? "shopify-domain-error" : undefined}
            onChange={(e) => setDomain(e.target.value)}
            onBlur={() => setTouched(true)}
            className={`
              w-full px-4 py-2.5 rounded-xl text-sm font-[DM_Sans]
              bg-[var(--surface2)] text-[var(--text)]
              border transition-colors outline-none
              placeholder:text-[var(--muted)]
              focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]
              ${showError
                ? "border-[var(--critical)]"
                : "border-[var(--border)] hover:border-[var(--muted)]"
              }
            `}
          />
          {showError && (
            <p
              id="shopify-domain-error"
              role="alert"
              className="text-xs text-[var(--critical)] flex items-center gap-1 font-[DM_Sans]"
            >
              <span aria-hidden="true">⚠</span>
              {t.onboarding.shopifyDomainError}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleConnect}
            loading={loading}
            disabled={!isValid}
            className="w-full"
            aria-label={t.onboarding.connectShopify.button}
          >
            {t.onboarding.connectShopify.button}
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate("/onboarding/meta")}
            className="w-full"
          >
            {t.onboarding.skipForNow}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConnectShopify;
