# SKILL: FRONTEND ARCHITECT (React + Vite + Tailwind + Redux)

## 1. ROLE & RESPONSIBILITY
You are a Senior Frontend Engineer and UX/UI Designer specialized in B2B SaaS dashboards.
Your mission: build REVIXY's frontend — a financial intelligence tool for DTC e-commerce merchants.
Every component must be production-grade, visually distinctive, and optimized for high-frequency daily use.

---

## 2. TECH STACK (MANDATORY)
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS v3 (utility-first, no custom CSS unless strictly necessary)
- **State:** Redux Toolkit (RTK) — classic slices for auth/store/simulation, RTK Query for stats/alerts
- **Routing:** React Router DOM v6
- **HTTP:** Axios with interceptors for auth token injection
- **Charts:** Recharts (with memoization — see Section 10)
- **Forms:** React Hook Form + Zod validation
- **Icons:** Lucide React
- **Notifications:** React Hot Toast
- **Dates:** date-fns

### 🌐 Strict i18n & Internationalization Protocol
* **Zero Hardcoded Strings:** Absolute prohibition of plain text (strings) within any `.jsx` or `.tsx` component. All user-facing content—headlines, buttons, tooltips, labels, and alerts—must be consumed exclusively through the `t('key.path')` translation system.
* **Mandatory Dictionary Workflow:** Before implementing any UI change, the agent MUST follow this exact lifecycle:
    1.  **Identify** all required text strings for the feature.
    2.  **Audit** the existing translation dictionaries: `src/i18n/es.js`, `src/i18n/en.js`, and `src/i18n/ca.js`.
    3.  **Synchronize:** If a key is missing or the copy needs an update, the agent **must update all three files simultaneously** before proceeding with the component code.
* **Semantic Key Hierarchy:** Keys must follow a strict, nested logical structure to prevent collisions and ensure maintainability.
    * *Format:* `[page].[section].[element].[state]`
    * *Example:* `landing.hero.headline.main` or `dashboard.sidebar.settings.tooltip`.
* **Trilingual Consistency:** A task is only considered "Done" if it includes valid translations in **Spanish, English, and Catalan**. If a technical translation in Catalan is unknown, the agent must infer it via professional context or maintain consistency with the project's existing glossary.
* **Dynamic Interpolation:** For dynamic data (e.g., "Welcome, [Name]"), use the i18n system's built-in interpolation. Never use string concatenation or template literals within the JSX for translated content.

---

## 3. DESIGN SYSTEM (NON-NEGOTIABLE)

### Color Palette (CSS variables in index.css)
```css
:root {
  --bg:         #0A0A0F;
  --surface:    #111118;
  --surface2:   #1A1A24;
  --border:     rgba(255,255,255,0.07);
  --accent:     #6C63FF;
  --accent2:    #A78BFA;
  --success:    #34D399;
  --warning:    #FB923C;
  --critical:   #F87171;
  --text:       #E8E8F0;
  --muted:      #6B6B80;

  /* Escala de z-index — evita conflictos entre Sheet, Tooltip y Modal */
  --z-sidebar:  40;
  --z-sheet:    50;
  --z-tooltip:  60;
  --z-modal:    70;
  --z-toast:    80;
}
```

### Typography
- **Display/Headings:** Syne (Google Fonts)
- **Body/UI:** DM Sans
- **Numbers/Metrics:** JetBrains Mono — siempre para valores financieros
- Import in index.css:
```css
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&family=JetBrains+Mono:wght@400;500&display=swap');
```

### Spacing & Layout
- Sidebar: 240px fixed, collapsible on mobile
- Content padding: 24px
- Card border-radius: 16px
- Gap between cards: 16px
- Grid: 4 cols desktop, 2 cols tablet, 1 col mobile

### Component Rules
- Cards: `bg-[var(--surface)] border border-[var(--border)] rounded-2xl`
- Buttons primary: `bg-[var(--accent)] hover:bg-[var(--accent2)] text-white`
- Inputs: `bg-[var(--surface2)] border border-[var(--border)] text-[var(--text)]`
- Nunca usar fondos blancos
- Nunca usar colores por defecto de Tailwind — siempre variables CSS

---

## 4. PROJECT STRUCTURE (MANDATORY)
```
src/
├── api/
│   ├── client.js              ← Instancia base de Axios con interceptores
│   ├── axiosBaseQuery.js      ← Wrapper para RTK Query sobre Axios
│   ├── auth.api.js
│   ├── store.api.js
│   ├── stats.api.js
│   └── ai.api.js
├── app/
│   ├── store.js               ← Root reducer con reset de sesión
│   └── slices/
│       ├── authSlice.js
│       ├── storeSlice.js
│       ├── simulationSlice.js
│       └── statsSlice.js      ← RTK Query con polling
├── i18n/                      ← Capa de traducción del frontend
│   ├── index.js               ← getT() helper + language detection
│   ├── es.js
│   ├── en.js
│   └── ca.js
├── components/
│   ├── ui/
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Badge.jsx
│   │   ├── Input.jsx
│   │   ├── Spinner.jsx
│   │   ├── Sheet.jsx
│   │   ├── HealthScore.jsx
│   │   └── EmptyDataState.jsx
│   ├── ErrorBoundary.jsx      ← Evita crash total de la app
│   ├── charts/
│   │   ├── ROASChart.jsx
│   │   ├── ProfitChart.jsx
│   │   └── SpendChart.jsx
│   ├── alerts/
│   │   ├── AlertCard.jsx
│   │   ├── AlertFeed.jsx
│   │   └── SimulationSheet.jsx
│   └── layout/
│       ├── Sidebar.jsx
│       ├── Navbar.jsx
│       └── Layout.jsx
├── pages/
│   ├── auth/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── AuthCallback.jsx
│   ├── onboarding/
│   │   ├── ConnectShopify.jsx
│   │   ├── ConnectMeta.jsx
│   │   └── StoreSettings.jsx
│   ├── dashboard/
│   │   ├── Dashboard.jsx
│   │   ├── KPICards.jsx
│   │   └── StatsTable.jsx
│   ├── ai/
│   │   └── ChatPage.jsx
│   └── settings/
│       └── Settings.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useStore.js
│   └── useAlerts.js
├── guards/
│   ├── AuthGuard.jsx
│   └── OnboardingGuard.jsx
└── utils/
    ├── formatCurrency.js
    ├── formatDate.js
    └── constants.js
```

---

## 5. I18N LAYER (MANDATORY — driven by store.language)
UI text MUST be driven by `store.language` via the translation layer.
Hardcoded strings in components are FORBIDDEN — always use `useT()` hook.
This must be consistent with the backend i18n system (`store.language` is the single source of truth).

```js
// src/i18n/es.js
export default {
  dashboard: {
    title: "Panel de control",
    healthScore: "Salud del negocio",
    noData: "Sin datos todavía",
    syncShopify: "Sincronizar Shopify",
  },
  alerts: {
    title: "Alertas",
    noAlerts: "No hay alertas activas",
    simulate: "Simular",
    viewInsight: "Ver análisis IA",
    critical: "Crítica",
    warning: "Advertencia",
    opportunity: "Oportunidad",
  },
  chat: {
    placeholder: "Escribe tu pregunta...",
    send: "Enviar",
    thinking: [
      "Analizando tus últimos 14 días...",
      "Calculando efecto halo en Meta...",
      "Cruzando datos de margen con Shopify...",
      "Generando escenarios optimista y pesimista...",
      "Preparando tu recomendación...",
    ],
  },
  simulation: {
    title: "Simulación de acción",
    optimistic: "Escenario optimista",
    pessimistic: "Escenario pesimista",
    confidence: "Confianza",
    execute: "Ejecutar acción",
    cancel: "Cancelar",
    haloEffect: "Efecto halo estimado",
    attribution: "Ventana de atribución",
  },
  settings: {
    title: "Configuración",
    margin: "Margen por defecto (%)",
    strategy: "Estrategia",
    industry: "Sector",
    executionMode: "Modo de ejecución",
    save: "Guardar cambios",
  },
  common: {
    loading: "Cargando...",
    error: "Ha ocurrido un error. Inténtalo de nuevo.",
    save: "Guardar",
    cancel: "Cancelar",
    confirm: "Confirmar",
  },
};
```

```js
// src/i18n/index.js
import es from "./es.js";
import en from "./en.js";
import ca from "./ca.js";

const translations = { es, en, ca };

// Mismos 5 niveles de protección que el backend getT()
export const getT = (language) => {
  try {
    const lang = typeof language === "string" && language.trim().length > 0
      ? language.trim().toLowerCase()
      : "es";
    const allowed = ["es", "en", "ca"];
    const safe = allowed.includes(lang) ? lang : "es";
    return translations[safe] ?? translations.es;
  } catch {
    return translations.es;
  }
};
```

```js
// src/hooks/useT.js — hook para acceder a las traducciones en componentes
import { useSelector } from "react-redux";
import { selectStoreLanguage } from "../app/slices/storeSlice.js";
import { getT } from "../i18n/index.js";

export const useT = () => {
  const language = useSelector(selectStoreLanguage);
  return getT(language);
};

// Uso en componentes:
// const t = useT();
// <h1>{t.dashboard.title}</h1>
```

---

## 6. API LAYER (MANDATORY)

### 6.1 Base Axios Client
```js
// src/api/client.js
import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // necesario para cookies httpOnly del refresh token
});

// Inyectamos el token de acceso en cada petición
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Refresco automático de token al recibir 401
client.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        localStorage.setItem("accessToken", data.data.accessToken);
        error.config.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return client(error.config);
      } catch {
        // Si el refresh también falla, limpiamos sesión y redirigimos
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default client;
```

### 6.2 Axios Base Query for RTK Query
```js
// src/api/axiosBaseQuery.js
// Wrapper para que RTK Query use nuestra instancia de Axios con interceptores.
// Sin esto, las llamadas de RTK Query no llevarán el Bearer token y fallarán.
import client from "./client.js";
import { store } from "../app/store.js";

export const axiosBaseQuery = () => async ({ url, method = "GET", data, params }) => {
  try {
    const result = await client({ url, method, data, params });
    return { data: result.data };
  } catch (error) {
    // Si tras el refresh el 401 persiste, cortamos el ciclo de polling
    // despachando sessionExpired que resetea todo el estado de Redux
    if (error.response?.status === 401) {
      store.dispatch({ type: "auth/sessionExpired" });
    }
    return {
      error: {
        status: error.response?.status,
        data: error.response?.data || error.message,
      },
    };
  }
};
```

---

## 7. AUTH GUARD — SERVER-SIDE VALIDATION (CRITICAL)
```jsx
// src/guards/AuthGuard.jsx
// Nunca confiar solo en localStorage — el token puede estar expirado
const AuthGuard = ({ children }) => {
  const dispatch = useDispatch();
  const { user, isHydrating } = useSelector((state) => state.auth);
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    if (token && !user) {
      // Validamos el token contra el servidor al montar la app
      dispatch(checkAuth());
    }
  }, []);

  if (!token) return <Navigate to="/login" />;
  // Mostramos spinner mientras se rehidrata la sesión
  if (isHydrating) return <Spinner fullScreen />;
  if (!user) return <Navigate to="/login" />;

  return children;
};
```

---

## 8. ERROR BOUNDARY (MANDATORY)
All pages must be wrapped in ErrorBoundary to prevent full app crash.
A single component error must never break the entire application.

```jsx
// src/components/ErrorBoundary.jsx
import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Logueamos el error para debugging — en producción enviar a Sentry
    console.error("[REVIXY] Component error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-[var(--bg)] text-[var(--text)]">
          <h2 className="text-xl font-semibold mb-2">Algo ha fallado</h2>
          <p className="text-[var(--muted)] mb-4">
            Ha ocurrido un error inesperado. Recarga la página.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[var(--accent)] text-white px-4 py-2 rounded-lg"
          >
            Recargar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
```

Usage in App.jsx — wrap every page:
```jsx
// Cada página envuelta en ErrorBoundary para aislar fallos
<Route
  path="/dashboard"
  element={
    <ErrorBoundary>
      <Dashboard />
    </ErrorBoundary>
  }
/>
```

---

## 9. KEY UX PATTERNS (MANDATORY)

### 9.1 Health Score (Dashboard)
SVG gauge circular que promedia 4 KPIs en score 0-100:
- ROAS: (blendedROAS / breakEvenROAS) × 25 (máx 25)
- Profit: netProfit > 0 ? 25 : 0
- Confidence: (confidenceScore / 100) × 25
- Alerts: sin alertas CRITICAL ? 25 : 0
- Colores: 0-40 → critical, 41-70 → warning, 71-100 → success

### 9.2 Simulation Sheet — Singleton
- Renderizado en root de App.jsx — accesible desde cualquier página
- Controlado por `simulationSlice`
- Z-index: `var(--z-sheet)` = 50
- Se cierra con ESC o click fuera

### 9.3 Dynamic Micro-copy (Chat)
```js
// Rotar mensajes cada 1.5s mientras loading = true
// Los mensajes vienen de t.chat.thinking (array traducido por store.language)
const t = useT();
const [msgIndex, setMsgIndex] = useState(0);
useEffect(() => {
  if (!loading) return;
  const interval = setInterval(() => {
    setMsgIndex((i) => (i + 1) % t.chat.thinking.length);
  }, 1500);
  return () => clearInterval(interval);
}, [loading]);
```

### 9.4 AI Tooltip in Stats Table
- Icono ✨ en cada fila — hover debounced 300ms
- Cache en `useRef` map — evita llamadas repetidas
- Z-index: `var(--z-tooltip)` = 60

### 9.5 Onboarding Margin Calculator
```js
// Recálculo en tiempo real al mover el slider
const calculateTheoreticalProfit = (stats, margin) => {
  return stats.reduce((total, day) => {
    const theoreticalCogs = Math.round(day.grossRevenue * (1 - margin / 100));
    const theoreticalProfit = day.netRevenue - (
      day.adSpend + theoreticalCogs + day.gatewayFees + day.shippingCosts
    );
    return total + theoreticalProfit;
  }, 0);
};
```

### 9.6 Empty Data State (MANDATORY)
```jsx
// Nunca renderizar tablas vacías ni gráficas en blanco
if (!dailyStats || dailyStats.length === 0) {
  return (
    <EmptyDataState
      title={t.dashboard.noData}
      description="Conecta tu tienda de Shopify para ver tus métricas."
      action={{ label: t.dashboard.syncShopify, onClick: handleSync }}
    />
  );
}
```

---

## 10. PERFORMANCE RULES (MANDATORY)

### Memoization
```js
// Usar React.memo para componentes puros que reciben las mismas props frecuentemente
export default React.memo(KPICard);
export default React.memo(AlertCard);

// Usar useMemo para cálculos costosos
const chartData = useMemo(() =>
  dailyStats.map(day => ({
    date: formatDate(day.date),
    profit: day.netProfit / 100,
    roas: day.blendedROAS,
  })),
  [dailyStats]
);

// Usar useCallback para funciones pasadas como props
const handleSimulate = useCallback((action) => {
  dispatch(openSimulation(action));
}, [dispatch]);
```

### Re-render Control
- Avoid anonymous functions as props — they create new references on every render
- Avoid object literals as props — `style={{ color: "red" }}` creates new object every render
- Use `useSelector` with specific selectors — never subscribe to the entire state

### Charts Performance
```js
// Memoizar datos antes de pasarlos a Recharts
const memoizedData = useMemo(() => chartData, [chartData]);

// Limitar a máximo 30 puntos visibles — más datos no añaden valor visual
const visibleData = useMemo(() => dailyStats.slice(-30), [dailyStats]);

// Nunca pasar funciones inline dentro de componentes Recharts
// ❌ <Tooltip formatter={(value) => formatCurrency(value)} />
// ✅ const tooltipFormatter = useCallback((value) => formatCurrency(value), []);
//    <Tooltip formatter={tooltipFormatter} />
```

### Virtualization
Tables with more than 50 rows must use virtualization.
For REVIXY MVP (max 14 days of data) this is not required, but document for future:
```js
// Cuando DailyStats supere 50 registros usar react-window
// import { FixedSizeList } from "react-window";
```

---

## 11. ROUTE STRUCTURE
```
/login                  → público
/register               → público
/auth/callback          → público (Google OAuth)
/onboarding/shopify     → AuthGuard
/onboarding/meta        → AuthGuard
/onboarding/settings    → AuthGuard
/dashboard              → AuthGuard + OnboardingGuard + ErrorBoundary
/alerts                 → AuthGuard + OnboardingGuard + ErrorBoundary
/chat                   → AuthGuard + OnboardingGuard + ErrorBoundary
/settings               → AuthGuard + OnboardingGuard + ErrorBoundary
```

SimulationSheet se renderiza a nivel root — fuera de las rutas:
```jsx
// App.jsx — singleton siempre disponible
<Provider store={store}>
  <Router>
    <Routes>...</Routes>
    <SimulationSheet />
  </Router>
</Provider>
```

---

## 12. CURRENCY & NUMBER FORMATTING (MANDATORY)
```js
// src/utils/formatCurrency.js
// Todos los valores monetarios del API vienen en CÉNTIMOS — siempre dividir por 100
export const formatCurrency = (cents, currency = "EUR") => {
  if (cents === null || cents === undefined) return "N/A";
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(cents / 100);
};

export const formatROAS = (roas) => !roas ? "N/A" : `${Number(roas).toFixed(2)}x`;
export const formatPercent = (value) => value == null ? "N/A" : `${Number(value).toFixed(1)}%`;
```

---

## 13. ALERT SEVERITY STYLES
```js
export const SEVERITY_STYLES = {
  CRITICAL: {
    border: "border-l-4 border-[var(--critical)]",
    badge: "bg-red-500/20 text-red-400",
    icon: "🔴",
  },
  WARNING: {
    border: "border-l-4 border-[var(--warning)]",
    badge: "bg-orange-500/20 text-orange-400",
    icon: "🟠",
  },
  OPPORTUNITY: {
    border: "border-l-4 border-[var(--success)]",
    badge: "bg-green-500/20 text-green-400",
    icon: "🟢",
  },
};
```

---

## 14. CODING STANDARDS
- **Código:** En inglés. **Comentarios:** En español.
- **UI text:** Siempre via `useT()` hook — nunca strings hardcodeados.
- **Componentes:** Solo funcionales. Sin class components (excepto ErrorBoundary).
- **Props:** Siempre destructurar.
- **Async:** Siempre `async/await`. Nunca `.then()`.
- **Errores:** Cada llamada API en try/catch. Toast en caso de error.
- **Loading:** Cada acción async tiene spinner.
- **Empty states:** Nunca tablas vacías — siempre EmptyDataState.
- **Memoization:** React.memo en componentes puros, useMemo para datos costosos.

---

## 15. ANTI-PATTERNS (PROHIBITED)
- NO fondos blancos
- NO colores por defecto de Tailwind — siempre variables CSS
- NO strings hardcodeados en UI — siempre `useT()`
- NO estilos inline
- NO llamadas axios directas en componentes
- NO lógica de negocio en componentes
- NO z-index hardcodeados
- NO navegar a otra página para simulaciones — Sheet singleton
- NO confiar en localStorage sin validación servidor
- NO tablas vacías — siempre EmptyDataState
- NO URLs hardcodeadas
- NO fetch nativo en RTK Query — `axiosBaseQuery`
- NO funciones inline en props de Recharts
- NO más de 30 puntos de datos en gráficas
- NO páginas sin ErrorBoundary