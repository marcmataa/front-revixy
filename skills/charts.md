# SKILL: CHARTS & DATA VISUALIZATION (Recharts + Financial Data)

## 1. ROLE & RESPONSIBILITY
You are a Senior Frontend Engineer specialized in financial data visualization for SaaS dashboards.
Your mission: build performant, accurate, and visually distinctive charts for REVIXY.
Every chart must display financial data correctly, perform well with real-time data, and respect the design system.

---

## 2. FINANCIAL DATA RULES (NON-NEGOTIABLE)

### Cents Conversion (CRITICAL)
- ALL monetary values from the API are in CENTS — always divide by 100 before passing to charts
- NEVER pass raw cent values to Recharts — charts will show "35220" instead of "352,20 €"
- ROAS values are NOT in cents — they are ratios, pass directly
- Percentages are NOT in cents — pass directly

### Formatters Import (MANDATORY)
All charts must import from `src/utils/formatters.js` — never from separate files.
Using separate files (`formatCurrency.js`, `formatDate.js`) causes import path errors.

```js
// ✅ Siempre esta importación en todos los charts y componentes
import { formatCurrency, formatDate, formatROAS, formatPercent } from "../../utils/formatters.js";

// ❌ Prohibido — importaciones separadas causan errores de ruta
import { formatCurrency } from "../../utils/formatCurrency.js";
import { formatDate } from "../../utils/formatDate.js";
```

### `src/utils/formatters.js` — SINGLE SOURCE OF TRUTH

```js
// src/utils/formatters.js
// Archivo único de formateo — todos los charts y componentes importan desde aquí
// Evita rutas incorrectas y duplicación de lógica de formateo

// Formatea céntimos a moneda con formato europeo
// IMPORTANTE: el valor de entrada debe estar en CÉNTIMOS — divide por 100 internamente
export const formatCurrency = (cents, currency = "EUR") => {
  if (cents === null || cents === undefined) return "N/A";
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(cents / 100);
};

// Formatea fecha ISO a string legible — "23 mar"
export const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
  }).format(new Date(dateString));
};

// Formatea ratio ROAS — NO es céntimos, no dividir
export const formatROAS = (roas) =>
  !roas ? "N/A" : `${Number(roas).toFixed(2)}x`;

// Formatea porcentaje — NO es céntimos, no dividir
export const formatPercent = (value) =>
  value == null ? "N/A" : `${Number(value).toFixed(1)}%`;
```

### Data Limits
- Maximum 30 visible data points — `dailyStats.slice(-30)` always
- For 14-day default view: show all 14 points
- Never show projected future data unless building a forecast feature

### Null & Zero Handling
- `blendedROAS` can be `null` when `adSpend === 0` — use `?? 0`
- `netProfit` can be negative — chart must display negative values correctly
- Always provide fallback: `value ?? 0` for all chart data points
- Use `connectNulls` on all `<Line>` and `<Area>` — prevents visual breaks when a day has missing data

```js
// ✅ Correcto — convertimos céntimos y aplicamos fallbacks
const chartData = useMemo(() =>
  dailyStats.slice(-30).map((day) => ({
    date: formatDate(day.date),
    profit: (day.netProfit ?? 0) / 100,   // céntimos → euros
    revenue: (day.netRevenue ?? 0) / 100, // céntimos → euros
    adSpend: (day.adSpend ?? 0) / 100,    // céntimos → euros
    roas: day.blendedROAS ?? 0,           // ratio — NO dividir
    margin: day.contributionMargin ?? 0,  // porcentaje — NO dividir
  })),
  [dailyStats]
);

// ❌ Incorrecto — pasa céntimos directamente sin conversión
const chartData = dailyStats.map((day) => ({
  profit: day.netProfit, // ← 35220 en lugar de 352,20
}));
```

---

## 3. PERFORMANCE RULES (MANDATORY)

### Memoization
```js
// Siempre memoizar datos antes de pasarlos a Recharts
// Recharts re-renderiza con cada cambio de referencia de los datos
const chartData = useMemo(() =>
  dailyStats.slice(-30).map((day) => ({
    date: formatDate(day.date),
    profit: (day.netProfit ?? 0) / 100,
    roas: day.blendedROAS ?? 0,
  })),
  [dailyStats]
);

// Memoizar componentes de gráfica — evita re-renders cuando el parent actualiza
export default React.memo(ProfitChart);
export default React.memo(ROASChart);
export default React.memo(SpendChart);
```

### No Inline Functions in Recharts (CRITICAL)
```jsx
// ❌ Prohibido — crea nueva referencia en cada render → Recharts re-renderiza infinitamente
<Tooltip formatter={(value) => formatCurrency(value * 100, currency)} />
<YAxis tickFormatter={(value) => `${value}€`} />

// ✅ Correcto — función memoizada con useCallback
const tooltipFormatter = useCallback(
  (value) => formatCurrency(value * 100, currency),
  [currency]
);
const yAxisFormatter = useCallback(
  (value) => formatCurrency(value * 100, currency),
  [currency]
);

<Tooltip formatter={tooltipFormatter} />
<YAxis tickFormatter={yAxisFormatter} />
```

### Responsive Container
```jsx
// Siempre envolver en ResponsiveContainer — nunca ancho/alto fijo en px
<ResponsiveContainer width="100%" height={240}>
  <LineChart data={chartData}>
    ...
  </LineChart>
</ResponsiveContainer>
```

---

## 4. DESIGN SYSTEM FOR CHARTS (MANDATORY)

### Colors
```js
// src/utils/constants.js
export const CHART_COLORS = {
  profit: "#34D399",         // var(--success) — profit positivo
  profitNegative: "#F87171", // var(--critical) — profit negativo
  revenue: "#6C63FF",        // var(--accent)
  adSpend: "#FB923C",        // var(--warning)
  roas: "#A78BFA",           // var(--accent2)
  breakEven: "#6B6B80",      // var(--muted) — línea de referencia
  grid: "rgba(255,255,255,0.05)",
};
```

### Typography
- Labels and titles: `DM Sans`
- Numeric values in tooltips and axes: `JetBrains Mono`

### Grid & Axes Standard
```jsx
// Grid sutil — nunca opaco ni dominante
<CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />

// Eje X — fechas en DM Sans
<XAxis
  dataKey="date"
  tick={{ fill: "var(--muted)", fontSize: 11, fontFamily: "DM Sans" }}
  axisLine={false}
  tickLine={false}
/>

// Eje Y — valores en JetBrains Mono con 10% padding para que las líneas no toquen los bordes
<YAxis
  tick={{ fill: "var(--muted)", fontSize: 11, fontFamily: "JetBrains Mono" }}
  axisLine={false}
  tickLine={false}
  tickFormatter={yAxisFormatter}
  domain={[
    (dataMin) => Math.floor(dataMin * 0.9), // 10% margen inferior
    (dataMax) => Math.ceil(dataMax * 1.1),  // 10% margen superior
  ]}
  padding={{ top: 20, bottom: 20 }}
  width={80}
/>
```

---

## 5. PROFIT CHART (MANDATORY)

```jsx
// src/components/charts/ProfitChart.jsx
// Gráfica de línea del Contribution Profit de los últimos 14 días
// Los valores negativos se muestran en rojo — crítico para la UX financiera
import { useMemo, useCallback } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer
} from "recharts";
import { formatCurrency, formatDate } from "../../utils/formatters.js";
import { CHART_COLORS } from "../../utils/constants.js";
import CustomTooltip from "./CustomTooltip.jsx";

const ProfitChart = ({ dailyStats, currency = "EUR" }) => {
  // Convertimos céntimos y limitamos a 30 puntos máximo
  const chartData = useMemo(() =>
    (dailyStats ?? []).slice(-30).map((day) => ({
      date: formatDate(day.date),
      profit: (day.netProfit ?? 0) / 100,
    })),
    [dailyStats]
  );

  // Memoizamos formateadores — evitamos re-renders infinitos en Recharts
  const yAxisFormatter = useCallback(
    (value) => formatCurrency(value * 100, currency),
    [currency]
  );

  // Color de línea según si hay valores negativos en el período
  const hasNegative = chartData.some((d) => d.profit < 0);

  if (!chartData.length) return <ChartEmptyState />;

  return (
    <ResponsiveContainer width="100%" height={240}>
      {/* syncId sincroniza el tooltip con ROASChart y SpendChart */}
      <LineChart
        data={chartData}
        syncId="dailyStats"
        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: "var(--muted)", fontSize: 11, fontFamily: "DM Sans" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "var(--muted)", fontSize: 11, fontFamily: "JetBrains Mono" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={yAxisFormatter}
          domain={[
            (dataMin) => Math.floor(dataMin * 0.9),
            (dataMax) => Math.ceil(dataMax * 1.1),
          ]}
          padding={{ top: 20, bottom: 20 }}
          width={80}
        />
        <Tooltip content={<CustomTooltip currency={currency} />} />
        {/* Línea de referencia en cero — crítica para visualizar pérdidas vs ganancias */}
        <ReferenceLine y={0} stroke={CHART_COLORS.breakEven} strokeDasharray="4 4" />
        <Line
          type="monotone"
          dataKey="profit"
          stroke={hasNegative ? CHART_COLORS.profitNegative : CHART_COLORS.profit}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
          connectNulls // evita rotura visual cuando falta un día de datos (Meta caída, etc.)
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default React.memo(ProfitChart);
```

---

## 6. ROAS CHART (MANDATORY)

```jsx
// src/components/charts/ROASChart.jsx
// Gráfica de área del ROAS con línea de break-even como referencia visual crítica
import { useMemo, useCallback } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer
} from "recharts";
import { formatDate } from "../../utils/formatters.js";
import { CHART_COLORS } from "../../utils/constants.js";
import CustomTooltip from "./CustomTooltip.jsx";

const ROASChart = ({ dailyStats, breakEven = 2.5 }) => {
  const chartData = useMemo(() =>
    (dailyStats ?? []).slice(-30).map((day) => ({
      date: formatDate(day.date),
      roas: day.blendedROAS ?? 0, // null cuando adSpend=0 → mostrar 0
    })),
    [dailyStats]
  );

  const yAxisFormatter = useCallback(
    (value) => `${Number(value).toFixed(1)}x`,
    []
  );

  if (!chartData.length) return <ChartEmptyState />;

  return (
    <ResponsiveContainer width="100%" height={240}>
      {/* syncId sincroniza el tooltip con ProfitChart y SpendChart */}
      <AreaChart
        data={chartData}
        syncId="dailyStats"
        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="roasGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CHART_COLORS.roas} stopOpacity={0.3} />
            <stop offset="95%" stopColor={CHART_COLORS.roas} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: "var(--muted)", fontSize: 11, fontFamily: "DM Sans" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "var(--muted)", fontSize: 11, fontFamily: "JetBrains Mono" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={yAxisFormatter}
          domain={[
            (dataMin) => Math.floor(dataMin * 0.9),
            (dataMax) => Math.ceil(dataMax * 1.1),
          ]}
          padding={{ top: 20, bottom: 20 }}
          width={50}
        />
        <Tooltip content={<CustomTooltip />} />
        {/* Línea del break-even — referencia visual crítica para detectar pérdidas */}
        <ReferenceLine
          y={breakEven}
          stroke={CHART_COLORS.breakEven}
          strokeDasharray="4 4"
          label={{ value: `BE ${breakEven}x`, fill: "var(--muted)", fontSize: 10 }}
        />
        <Area
          type="monotone"
          dataKey="roas"
          stroke={CHART_COLORS.roas}
          strokeWidth={2}
          fill="url(#roasGradient)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
          connectNulls // evita rotura visual cuando Meta cae o no hay adSpend
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default React.memo(ROASChart);
```

---

## 7. AD SPEND CHART (MANDATORY)

```jsx
// src/components/charts/SpendChart.jsx
// Gráfica de barras del Ad Spend diario — fácil de comparar entre días
import { useMemo, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { formatCurrency, formatDate } from "../../utils/formatters.js";
import { CHART_COLORS } from "../../utils/constants.js";
import CustomTooltip from "./CustomTooltip.jsx";

const SpendChart = ({ dailyStats, currency = "EUR" }) => {
  const chartData = useMemo(() =>
    (dailyStats ?? []).slice(-30).map((day) => ({
      date: formatDate(day.date),
      adSpend: (day.adSpend ?? 0) / 100, // céntimos → euros
    })),
    [dailyStats]
  );

  const yAxisFormatter = useCallback(
    (value) => formatCurrency(value * 100, currency),
    [currency]
  );

  if (!chartData.length) return <ChartEmptyState />;

  return (
    <ResponsiveContainer width="100%" height={200}>
      {/* syncId sincroniza el tooltip con ProfitChart y ROASChart */}
      <BarChart
        data={chartData}
        syncId="dailyStats"
        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: "var(--muted)", fontSize: 11, fontFamily: "DM Sans" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "var(--muted)", fontSize: 11, fontFamily: "JetBrains Mono" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={yAxisFormatter}
          domain={[
            (dataMin) => Math.floor(dataMin * 0.9),
            (dataMax) => Math.ceil(dataMax * 1.1),
          ]}
          padding={{ top: 20, bottom: 20 }}
          width={80}
        />
        <Tooltip content={<CustomTooltip currency={currency} />} />
        <Bar dataKey="adSpend" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, index) => (
            // Barra más brillante para el día más reciente — énfasis visual
            <Cell
              key={`cell-${index}`}
              fill={index === chartData.length - 1
                ? CHART_COLORS.adSpend
                : `${CHART_COLORS.adSpend}80`
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default React.memo(SpendChart);
```

---

## 8. CUSTOM TOOLTIP (SHARED)

```jsx
// src/components/charts/CustomTooltip.jsx
// Tooltip compartido por todas las gráficas — respeta el design system oscuro
import { formatCurrency } from "../../utils/formatters.js";

const CustomTooltip = ({ active, payload, label, currency = "EUR" }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-[var(--surface2)] border border-[var(--border)] rounded-xl p-3 shadow-xl min-w-[140px]">
      <p className="text-xs text-[var(--muted)] mb-2 font-[DM_Sans]">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <p className="text-sm font-mono font-bold" style={{ color: entry.color }}>
            {entry.name}:{" "}
            {/* Detectamos si es monetario (>100) o ratio — formateo diferente */}
            {entry.value > 100
              ? formatCurrency(entry.value * 100, currency)
              : `${Number(entry.value).toFixed(2)}x`
            }
          </p>
        </div>
      ))}
    </div>
  );
};

export default CustomTooltip;
```

---

## 9. CHART EMPTY STATE (MANDATORY)

```jsx
// src/components/charts/ChartEmptyState.jsx
// Estado vacío para gráficas sin datos — nunca renderizar gráfica vacía
const ChartEmptyState = ({ height = 240 }) => (
  <div
    className="flex items-center justify-center bg-[var(--surface2)] rounded-xl border border-[var(--border)]"
    style={{ height }}
  >
    <div className="text-center">
      <p className="text-[var(--muted)] text-sm mb-1">Sin datos disponibles</p>
      <p className="text-[var(--muted)] text-xs">Conecta tu tienda para ver métricas</p>
    </div>
  </div>
);

export default ChartEmptyState;
```

---

## 10. HEALTH SCORE GAUGE (MANDATORY)

```jsx
// src/components/ui/HealthScore.jsx
// Gauge circular SVG que promedia 4 KPIs en score 0-100
import { useMemo } from "react";
import { CHART_COLORS } from "../../utils/constants.js";

const calculateHealthScore = (stats, alerts) => {
  if (!stats?.length) return 0;
  const latest = stats[0]; // el más reciente es el primero del array
  if (!latest) return 0;

  // ROAS: máx 25 puntos — normalizado contra break-even
  const roasScore = latest.breakEvenROAS > 0
    ? Math.min((latest.blendedROAS / latest.breakEvenROAS) * 25, 25)
    : 0;

  // Profit: 25 puntos si positivo, 0 si negativo
  const profitScore = latest.netProfit > 0 ? 25 : 0;

  // Confidence: máx 25 puntos
  const confidenceScore = ((latest.confidenceScore ?? 0) / 100) * 25;

  // Alerts: 25 puntos si no hay CRITICAL, 0 si las hay
  const hasCritical = alerts?.some((a) => a.severity === "CRITICAL");
  const alertScore = hasCritical ? 0 : 25;

  return Math.round(roasScore + profitScore + confidenceScore + alertScore);
};

const HealthScore = ({ dailyStats, alerts }) => {
  const score = useMemo(
    () => calculateHealthScore(dailyStats, alerts),
    [dailyStats, alerts]
  );

  const color = score >= 71
    ? CHART_COLORS.profit
    : score >= 41
    ? CHART_COLORS.adSpend
    : CHART_COLORS.profitNegative;

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const label = score >= 71
    ? "Negocio saludable"
    : score >= 41
    ? "Requiere atención"
    : "Acción urgente";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          {/* Pista de fondo — representa el 100% disponible */}
          <circle
            cx="60" cy="60" r={radius}
            fill="none"
            stroke="var(--surface2)"
            strokeWidth="10"
          />
          {/* Arco animado — representa el score actual */}
          <circle
            cx="60" cy="60" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: "stroke-dashoffset 0.8s ease, stroke 0.3s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-mono font-bold" style={{ color }}>{score}</span>
          <span className="text-xs text-[var(--muted)]">/ 100</span>
        </div>
      </div>
      <p className="text-sm font-medium text-[var(--text)]">{label}</p>
    </div>
  );
};

export default React.memo(HealthScore);
```

---

## 11. CHART RULES (NON-NEGOTIABLE)
1. **Cents conversion first** — always divide monetary values by 100 before charting.
2. **ROAS and percentages are NOT cents** — never divide them.
3. **Max 30 data points** — `dailyStats.slice(-30)` always.
4. **Always `useMemo` for chart data** — never inline map in JSX.
5. **Always `useCallback` for formatters** — never inline functions in Recharts props.
6. **Always `React.memo`** on all chart components.
7. **Always `ResponsiveContainer`** — never fixed width/height in px.
8. **Null/zero handling** — `day.blendedROAS ?? 0` for all nullable values.
9. **`ReferenceLine` at `y={breakEven}`** in ROAS chart — always visible.
10. **`ReferenceLine` at `y={0}`** in Profit chart — always visible for loss detection.
11. **`ChartEmptyState`** — never render chart without data.
12. **`CustomTooltip`** — always use shared component, never unstyled default.
13. **`syncId="dailyStats"`** on all dashboard charts — synchronized tooltips across Profit, ROAS and Spend.
14. **YAxis `domain` with 10% padding** — `[(min) => min * 0.9, (max) => max * 1.1]` on all charts.
15. **`connectNulls`** on all `<Line>` and `<Area>` — prevents visual breaks on missing data.
16. **Always import from `formatters.js`** — never from separate utility files.

---

## 12. ANTI-PATTERNS (PROHIBITED)
- NO raw cent values in charts — always divide by 100 first
- NO inline functions in Recharts props — always `useCallback`
- NO chart components without `React.memo`
- NO fixed px dimensions — always `ResponsiveContainer`
- NO more than 30 data points visible
- NO charts without `ChartEmptyState` handling
- NO default unstyled Recharts tooltip — always `CustomTooltip`
- NO rendering null/undefined values — always `?? 0`
- NO white or light backgrounds on charts
- NO missing `ReferenceLine` for break-even in ROAS chart
- NO missing `ReferenceLine` at y=0 in Profit chart
- NO missing `syncId` on dashboard charts — tooltips must be synchronized
- NO missing `connectNulls` on Line and Area — lines must never break
- NO YAxis without domain padding — lines must never touch chart edges
- NO importing from `formatCurrency.js` or `formatDate.js` separately — always `formatters.js`