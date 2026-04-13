import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useT } from "../../hooks/useT.js";
import {
  updateStoreSettings,
  invalidateStatsCache,
  selectCurrentStore,
  selectStoreLoading,
  selectShopifyConnected,
  selectStoreId,
} from "../../app/slices/storeSlice.js";
import { setLanguage } from "../../app/slices/uiSlice.js";
import { useStats } from "../../hooks/useStats.js";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import EmptyDataState from "../../components/ui/EmptyDataState.jsx";

const createStoreSettingsSchema = (t) =>
  z.object({
    contributionMargin: z
      .coerce.number()
      .min(0, t.forms.marginMin)
      .max(80, t.forms.marginMax),
    executionMode: z.enum(["READ_ONLY", "COPILOT", "AUTOPILOT"], {
      errorMap: () => ({ message: t.forms.selectValid }),
    }),
    strategy: z.enum(["PROFIT", "GROWTH", "BALANCED"], {
      errorMap: () => ({ message: t.forms.selectValid }),
    }),
    sector: z.enum(["FASHION", "ELECTRONICS", "COSMETICS", "FOOD", "HOME", "OTHER"], {
      errorMap: () => ({ message: t.forms.selectValid }),
    }),
    language: z.enum(["es", "en", "ca"], {
      errorMap: () => ({ message: t.forms.selectValid }),
    }),
  });

const SelectField = ({ id, label, error, required = true, children, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label
      htmlFor={id}
      className="text-sm font-medium text-[var(--text)] font-[DM_Sans]"
    >
      {label}
      {required && (
        <span className="text-[var(--critical)] ml-1" aria-hidden="true">*</span>
      )}
    </label>
    <select
      id={id}
      aria-label={label}
      aria-required="true"
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
      className={`
        w-full px-4 py-2.5 rounded-xl text-sm font-[DM_Sans]
        bg-[var(--surface2)] text-[var(--text)]
        border transition-colors outline-none
        focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]
        disabled:opacity-50 disabled:cursor-not-allowed
        ${error
          ? "border-[var(--critical)]"
          : "border-[var(--border)] hover:border-[var(--muted)]"
        }
      `}
      {...props}
    >
      {children}
    </select>
    {error && (
      <p
        id={`${id}-error`}
        role="alert"
        className="text-xs text-[var(--critical)] flex items-center gap-1 font-[DM_Sans]"
      >
        <span aria-hidden="true">⚠</span>
        {error.message}
      </p>
    )}
  </div>
);

const StoreSettings = () => {
  const t = useT();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loading = useSelector(selectStoreLoading);
  const isShopifyConnected = useSelector(selectShopifyConnected);
  const storeId = useSelector(selectStoreId);
  const currentStore = useSelector(selectCurrentStore);
  const { kpis, currency } = useStats();

  const schema = createStoreSettingsSchema(t);

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      contributionMargin: currentStore?.settings?.defaultMarginPercent ?? 30,
      executionMode: currentStore?.settings?.executionMode ?? "READ_ONLY",
      strategy: currentStore?.settings?.strategy ?? "PROFIT",
      sector: currentStore?.settings?.sector ?? "OTHER",
      language: currentStore?.language ?? "es",
    },
  });

  const contributionMarginValue = Number(watch("contributionMargin")) || 0;

  // Revenue is in cents — multiply by margin to get theoretical profit in cents
  const revenue = kpis?.revenue ?? null;
  const showLiveProfit = isShopifyConnected && revenue !== null;
  const theoreticalProfitCents = showLiveProfit
    ? (contributionMarginValue / 100) * revenue
    : null;

  const onSubmit = async (formData) => {
    const result = await dispatch(updateStoreSettings(formData));
    if (updateStoreSettings.fulfilled.match(result)) {
      dispatch(invalidateStatsCache(storeId));
      navigate("/dashboard", { replace: true });
    } else {
      toast.error(t.onboarding.saveError);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] p-4 sm:p-8">
      <div className="max-w-xl mx-auto space-y-6">
        <p className="text-sm text-[var(--muted)] font-[DM_Sans] text-center">
          {t.onboarding.step3of3}
        </p>

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold font-[Syne] text-[var(--text)]">
            {t.onboarding.settings.title}
          </h1>
          <p className="text-sm text-[var(--muted)] font-[DM_Sans]">
            {t.onboarding.settings.description}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {/* Margin calculator card */}
          <Card>
            <div className="space-y-4">
              <h2 className="text-base font-semibold font-[DM_Sans] text-[var(--text)]">
                {t.onboarding.settings.calculatorTitle}
              </h2>

              {/* Slider — synced bidirectionally with contributionMargin field */}
              <div className="space-y-2">
                <label
                  htmlFor="slider-margin"
                  className="text-sm font-medium text-[var(--text)] font-[DM_Sans]"
                >
                  {t.onboarding.contributionMargin}
                </label>
                <input
                  id="slider-margin"
                  type="range"
                  min={0}
                  max={80}
                  step={1}
                  value={contributionMarginValue}
                  aria-label={t.onboarding.contributionMargin}
                  aria-valuemin={0}
                  aria-valuemax={80}
                  aria-valuenow={contributionMarginValue}
                  onChange={(e) =>
                    setValue("contributionMargin", Number(e.target.value), {
                      shouldValidate: true,
                    })
                  }
                  className="w-full accent-[var(--accent)]"
                />
                <div className="flex justify-between text-xs text-[var(--muted)] font-[DM_Sans]">
                  <span>0%</span>
                  <span className="font-semibold text-[var(--text)]">
                    {contributionMarginValue}%
                  </span>
                  <span>80%</span>
                </div>
              </div>

              {/* Live profit or empty state */}
              {showLiveProfit ? (
                <div className="text-center py-3 border-t border-[var(--border)]">
                  <p className="text-xs text-[var(--muted)] font-[DM_Sans] mb-1">
                    {t.onboarding.theoreticalProfit}
                  </p>
                  <p
                    className="text-2xl font-bold font-[DM_Sans]"
                    style={{
                      color:
                        theoreticalProfitCents >= 0
                          ? "var(--success)"
                          : "var(--critical)",
                    }}
                  >
                    {theoreticalProfitCents >= 0 ? "+" : ""}
                    {(theoreticalProfitCents / 100).toLocaleString(undefined, {
                      style: "currency",
                      currency: currency || "EUR",
                    })}
                  </p>
                </div>
              ) : (
                <EmptyDataState
                  title={t.onboarding.calculatorNoData}
                  height={80}
                />
              )}
            </div>
          </Card>

          {/* Contribution margin — numeric input synced with slider */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="contributionMargin"
              className="text-sm font-medium text-[var(--text)] font-[DM_Sans]"
            >
              {t.onboarding.contributionMargin}
              <span className="text-[var(--critical)] ml-1" aria-hidden="true">
                *
              </span>
            </label>
            <input
              id="contributionMargin"
              type="number"
              min={0}
              max={80}
              aria-required="true"
              aria-invalid={!!errors.contributionMargin}
              aria-describedby={
                errors.contributionMargin
                  ? "contributionMargin-error"
                  : undefined
              }
              className={`
                w-full px-4 py-2.5 rounded-xl text-sm font-[DM_Sans]
                bg-[var(--surface2)] text-[var(--text)]
                border transition-colors outline-none
                placeholder:text-[var(--muted)]
                focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]
                ${
                  errors.contributionMargin
                    ? "border-[var(--critical)]"
                    : "border-[var(--border)] hover:border-[var(--muted)]"
                }
              `}
              {...register("contributionMargin")}
            />
            {errors.contributionMargin && (
              <p
                id="contributionMargin-error"
                role="alert"
                className="text-xs text-[var(--critical)] flex items-center gap-1 font-[DM_Sans]"
              >
                <span aria-hidden="true">⚠</span>
                {errors.contributionMargin.message}
              </p>
            )}
          </div>

          {/* Execution mode */}
          <SelectField
            id="executionMode"
            label={t.onboarding.executionMode}
            error={errors.executionMode}
            {...register("executionMode")}
          >
            {["READ_ONLY", "COPILOT", "AUTOPILOT"].map((val) => (
              <option key={val} value={val}>
                {t.onboarding.executionModes[val]}
              </option>
            ))}
          </SelectField>

          {/* Strategy */}
          <SelectField
            id="strategy"
            label={t.onboarding.strategy}
            error={errors.strategy}
            {...register("strategy")}
          >
            {["PROFIT", "GROWTH", "BALANCED"].map((val) => (
              <option key={val} value={val}>
                {t.onboarding.strategies[val]}
              </option>
            ))}
          </SelectField>

          {/* Sector */}
          <SelectField
            id="sector"
            label={t.onboarding.sector}
            error={errors.sector}
            {...register("sector")}
          >
            {["FASHION", "ELECTRONICS", "COSMETICS", "FOOD", "HOME", "OTHER"].map((val) => (
              <option key={val} value={val}>
                {t.onboarding.sectors[val]}
              </option>
            ))}
          </SelectField>

          {/* Language — dispatches setLanguage immediately on change */}
          <Controller
            name="language"
            control={control}
            render={({ field }) => (
              <SelectField
                id="language"
                label={t.onboarding.language}
                error={errors.language}
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  dispatch(setLanguage(e.target.value));
                }}
              >
                {[
                  { value: "es", label: t.languages.es },
                  { value: "en", label: t.languages.en },
                  { value: "ca", label: t.languages.ca },
                ].map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </SelectField>
            )}
          />

          <Button
            type="submit"
            loading={loading}
            disabled={loading}
            className="w-full"
          >
            {t.onboarding.saveAndContinue}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default StoreSettings;
