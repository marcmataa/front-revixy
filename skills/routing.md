# SKILL: ROUTING & GUARDS ARCHITECT (React Router DOM v6)

## 1. ROLE & RESPONSIBILITY
You are a Senior Frontend Engineer specialized in React Router DOM v6 and application security.
Your mission: implement a secure, predictable, and user-friendly navigation system for REVIXY.
Every route must be protected correctly — wrong guard logic leads to security vulnerabilities or broken UX.

---

## 2. ROUTE ARCHITECTURE OVERVIEW

```
Public routes (no auth required — wrapped in PublicGuard):
├── /login
└── /register

Special public routes (no guard — handle own auth logic):
└── /auth/callback         ← Google OAuth handoff

Onboarding routes (auth required, no store required):
├── /onboarding/shopify
├── /onboarding/meta
└── /onboarding/settings

Protected routes (auth + store required):
├── /dashboard
├── /alerts
├── /chat
└── /settings
```

---

## 3. GUARD HIERARCHY (MANDATORY)
Guards must always be applied in this exact order:

```
1. PublicGuard     → Is the user already authenticated?
                     Yes → redirect to /dashboard (login loop prevention)
                     No  → render public page

2. AuthGuard       → Is the user authenticated?
                     No  → redirect to /login
                     Yes → continue

3. OnboardingGuard → Does the user have a connected store?
                     No  → redirect to /onboarding/shopify
                     Yes → render page
```

**NEVER apply OnboardingGuard without AuthGuard first.**
**NEVER apply AuthGuard to public routes.**
**NEVER apply PublicGuard to /auth/callback — it handles its own logic.**

---

## 4. APP ROUTER STRUCTURE (MANDATORY)

```jsx
// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./app/store.js";
import { Toaster } from "react-hot-toast";

import AuthGuard from "./guards/AuthGuard.jsx";
import OnboardingGuard from "./guards/OnboardingGuard.jsx";
import PublicGuard from "./guards/PublicGuard.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import SimulationSheet from "./components/alerts/SimulationSheet.jsx";
import Layout from "./components/layout/Layout.jsx";

import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import AuthCallback from "./pages/auth/AuthCallback.jsx";
import ConnectShopify from "./pages/onboarding/ConnectShopify.jsx";
import ConnectMeta from "./pages/onboarding/ConnectMeta.jsx";
import StoreSettings from "./pages/onboarding/StoreSettings.jsx";
import Dashboard from "./pages/dashboard/Dashboard.jsx";
import AlertsPage from "./pages/alerts/AlertsPage.jsx";
import ChatPage from "./pages/ai/ChatPage.jsx";
import Settings from "./pages/settings/Settings.jsx";

export default function App() {
  return (
    <Provider store={store}>
      <Router>
        {/* SimulationSheet singleton — siempre disponible desde cualquier página */}
        <SimulationSheet />
        {/* Toast notifications globales con estilos del design system */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "var(--surface2)",
              color: "var(--text)",
              border: "1px solid var(--border)",
            },
            success: { iconTheme: { primary: "var(--success)", secondary: "var(--bg)" } },
            error: { iconTheme: { primary: "var(--critical)", secondary: "var(--bg)" } },
          }}
        />
        <Routes>
          {/* Rutas públicas — con PublicGuard para evitar login loop */}
          <Route
            path="/login"
            element={<PublicGuard><Login /></PublicGuard>}
          />
          <Route
            path="/register"
            element={<PublicGuard><Register /></PublicGuard>}
          />

          {/* Callback de Google OAuth — sin PublicGuard, maneja su propia lógica */}
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Rutas de onboarding — solo requieren auth */}
          <Route
            path="/onboarding/shopify"
            element={
              <AuthGuard>
                <ErrorBoundary>
                  <ConnectShopify />
                </ErrorBoundary>
              </AuthGuard>
            }
          />
          <Route
            path="/onboarding/meta"
            element={
              <AuthGuard>
                <ErrorBoundary>
                  <ConnectMeta />
                </ErrorBoundary>
              </AuthGuard>
            }
          />
          <Route
            path="/onboarding/settings"
            element={
              <AuthGuard>
                <ErrorBoundary>
                  <StoreSettings />
                </ErrorBoundary>
              </AuthGuard>
            }
          />

          {/* Rutas protegidas — requieren auth + store */}
          {/* ErrorBoundary va DENTRO de Layout para mantener el Sidebar visible */}
          <Route
            path="/dashboard"
            element={
              <AuthGuard>
                <OnboardingGuard>
                  <Layout>
                    <ErrorBoundary>
                      <Dashboard />
                    </ErrorBoundary>
                  </Layout>
                </OnboardingGuard>
              </AuthGuard>
            }
          />
          <Route
            path="/alerts"
            element={
              <AuthGuard>
                <OnboardingGuard>
                  <Layout>
                    <ErrorBoundary>
                      <AlertsPage />
                    </ErrorBoundary>
                  </Layout>
                </OnboardingGuard>
              </AuthGuard>
            }
          />
          <Route
            path="/chat"
            element={
              <AuthGuard>
                <OnboardingGuard>
                  <Layout>
                    <ErrorBoundary>
                      <ChatPage />
                    </ErrorBoundary>
                  </Layout>
                </OnboardingGuard>
              </AuthGuard>
            }
          />
          <Route
            path="/settings"
            element={
              <AuthGuard>
                <OnboardingGuard>
                  <Layout>
                    <ErrorBoundary>
                      <Settings />
                    </ErrorBoundary>
                  </Layout>
                </OnboardingGuard>
              </AuthGuard>
            }
          />

          {/* Redirects por defecto */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </Provider>
  );
}
```

---

## 5. PUBLIC GUARD (MANDATORY — login loop prevention)

```jsx
// src/guards/PublicGuard.jsx
// Evita que usuarios ya autenticados vean /login o /register
// Si hay token + user → redirige al dashboard automáticamente
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser, selectIsHydrating } from "../app/slices/authSlice.js";
import Spinner from "../components/ui/Spinner.jsx";

const PublicGuard = ({ children }) => {
  const user = useSelector(selectUser);
  const isHydrating = useSelector(selectIsHydrating);
  const token = localStorage.getItem("accessToken");

  // Mientras rehidrata con token presente → spinner para evitar redirect prematuro
  if (token && isHydrating) return <Spinner fullScreen />;

  // Usuario ya autenticado → redirige al dashboard sin mostrar login
  if (user) return <Navigate to="/dashboard" replace />;

  return children;
};

export default PublicGuard;
```

---

## 6. AUTH GUARD (MANDATORY)

```jsx
// src/guards/AuthGuard.jsx
import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth, selectUser, selectIsHydrating } from "../app/slices/authSlice.js";
import { fetchCurrentStore } from "../app/slices/storeSlice.js";
import { selectCurrentStore } from "../app/slices/storeSlice.js";
import Spinner from "../components/ui/Spinner.jsx";

const AuthGuard = ({ children }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isHydrating = useSelector(selectIsHydrating);
  const currentStore = useSelector(selectCurrentStore);
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    if (token && !user) {
      // Validamos el token en el servidor — nunca confiar solo en localStorage
      dispatch(checkAuth()).then((result) => {
        // Si checkAuth fue exitoso y no hay store cargada, la cargamos
        if (result.meta.requestStatus === "fulfilled" && !currentStore) {
          dispatch(fetchCurrentStore());
        }
      });
    }
  }, []);

  // Sin token → redirigir a login inmediatamente
  if (!token) return <Navigate to="/login" replace />;

  // Mientras se rehidrata la sesión → spinner de pantalla completa
  // Evita el "flash of unauthenticated content"
  if (isHydrating) return <Spinner fullScreen />;

  // Token inválido y checkAuth falló → redirigir a login
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

export default AuthGuard;
```

---

## 7. ONBOARDING GUARD (MANDATORY)

```jsx
// src/guards/OnboardingGuard.jsx
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentStore, selectStoreLoading } from "../app/slices/storeSlice.js";
import Spinner from "../components/ui/Spinner.jsx";

const OnboardingGuard = ({ children }) => {
  const currentStore = useSelector(selectCurrentStore);
  const storeLoading = useSelector(selectStoreLoading);

  // Mientras carga la store → spinner para evitar flash de redirect incorrecto
  if (storeLoading) return <Spinner fullScreen />;

  // Sin store → usuario no ha completado el onboarding
  // Token válido sin store = registro exitoso pero onboarding pendiente
  if (!currentStore) return <Navigate to="/onboarding/shopify" replace />;

  return children;
};

export default OnboardingGuard;
```

---

## 8. AUTH CALLBACK — Google OAuth (MANDATORY)

```jsx
// src/pages/auth/AuthCallback.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchCurrentStore } from "../../app/slices/storeSlice.js";
import { authApi } from "../../api/auth.api.js";
import Spinner from "../../components/ui/Spinner.jsx";
import toast from "react-hot-toast";

const AuthCallback = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const exchangeToken = async () => {
      try {
        // Intercambiamos la cookie oauth_handoff por el accessToken
        // El backend limpia la cookie inmediatamente tras este intercambio
        const { data } = await authApi.getOAuthToken();
        const { accessToken } = data.data;

        if (!accessToken) throw new Error("No token received");

        localStorage.setItem("accessToken", accessToken);

        // Cargamos la store para decidir a dónde redirigir
        const storeResult = await dispatch(fetchCurrentStore());

        if (storeResult.meta.requestStatus === "fulfilled" && storeResult.payload) {
          // Usuario con store conectada → dashboard
          navigate("/dashboard", { replace: true });
        } else {
          // Usuario nuevo → onboarding
          navigate("/onboarding/shopify", { replace: true });
        }
      } catch {
        // Limpiamos cualquier token basura antes de redirigir
        // Evita que un handoff fallido deje un accessToken inválido en localStorage
        localStorage.removeItem("accessToken");
        toast.error("Error al iniciar sesión con Google. Inténtalo de nuevo.");
        navigate("/login", { replace: true });
      }
    };

    exchangeToken();
  }, []);

  return <Spinner fullScreen />;
};

export default AuthCallback;
```

---

## 9. ERROR BOUNDARY (MANDATORY)
Must be placed INSIDE Layout on protected routes to keep Sidebar visible on error.

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
        // ErrorBoundary dentro de Layout → Sidebar sigue visible
        // El usuario puede navegar a otra sección sin recargar toda la app
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-[var(--text)] p-8">
          <h2 className="text-xl font-semibold mb-2 font-[Syne]">
            Algo ha fallado
          </h2>
          <p className="text-[var(--muted)] mb-6 text-center max-w-sm">
            Ha ocurrido un error inesperado en esta sección.
            El resto de la aplicación sigue funcionando.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="bg-[var(--accent)] text-white px-4 py-2 rounded-lg text-sm"
            >
              Reintentar
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-[var(--surface2)] text-[var(--text)] px-4 py-2 rounded-lg text-sm border border-[var(--border)]"
            >
              Recargar aplicación
            </button>
          </div>
          <p className="text-[var(--muted)] text-xs mt-6">
            Si el problema persiste,{" "}
            <a href="mailto:support@revixy.com" className="text-[var(--accent)]">
              contacta con soporte
            </a>
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
```

**ErrorBoundary placement rule:**
```jsx
// ✅ Correcto — Sidebar visible cuando la página falla
<Layout>
  <ErrorBoundary>
    <Dashboard />
  </ErrorBoundary>
</Layout>

// ❌ Incorrecto — Sidebar desaparece cuando la página falla
<ErrorBoundary>
  <Layout>
    <Dashboard />
  </Layout>
</ErrorBoundary>
```

---

## 10. PROGRAMMATIC NAVIGATION (MANDATORY)

```js
// ✅ Correcto — navegación interna SPA
const navigate = useNavigate();
navigate("/dashboard", { replace: true });

// ✅ Permitido solo para reset completo de sesión
window.location.href = "/login";

// ❌ Prohibido — rompe el historial de React Router
window.location.href = "/dashboard";

// Siempre navegar DESPUÉS de que el dispatch se resuelva
const handleLogin = async (credentials) => {
  const result = await dispatch(login(credentials));
  if (result.meta.requestStatus === "fulfilled") {
    navigate("/dashboard", { replace: true });
  }
};
```

---

## 11. REDIRECT LOGIC MAP
```
User state                                          → Redirect to
─────────────────────────────────────────────────────────────────
No token                                            → /login
Token + checkAuth fails                             → /login
Token + user OK + no store                          → /onboarding/shopify
Token + user OK + store OK                          → /dashboard
Already authenticated + visits /login               → /dashboard
Already authenticated + visits /register            → /dashboard
Google OAuth success + no store                     → /onboarding/shopify
Google OAuth success + store OK                     → /dashboard
Google OAuth error                                  → /login
Visit / or unknown route                            → /dashboard
```

---

## 12. ROUTING RULES (NON-NEGOTIABLE)
1. **Guard order is strict** — PublicGuard → AuthGuard → OnboardingGuard.
2. **PublicGuard on /login and /register** — prevents login loop for authenticated users.
3. **No guard on /auth/callback** — it handles its own auth exchange internally.
4. **`replace: true` on all auth redirects** — prevents back button exposing auth pages.
5. **Never use `window.location.href` inside SPA** — except for full session reset.
6. **Navigate AFTER dispatch resolves** — never navigate optimistically.
7. **`isHydrating` spinner in AuthGuard** — prevents flash of unauthenticated content.
8. **`storeLoading` spinner in OnboardingGuard** — prevents flash of wrong redirect.
9. **SimulationSheet at App root** — outside Routes, always mounted.
10. **ErrorBoundary INSIDE Layout** — keeps Sidebar visible when a page crashes.
11. **Clear localStorage in AuthCallback catch** — never leave stale tokens after OAuth failure.
12. **ErrorBoundary on every protected page** — never let one page crash the whole app.

---

## 13. ANTI-PATTERNS (PROHIBITED)
- NO `window.location.href` for internal navigation
- NO guards applied in wrong order
- NO PublicGuard on /auth/callback
- NO AuthGuard on /login or /register
- NO navigation before async dispatch resolves
- NO flash of wrong content — always spinner during hydration
- NO `<Redirect>` from React Router v5 — use `<Navigate>` from v6
- NO `history.push()` — use `useNavigate()` hook
- NO token in URL after OAuth — use cookie handoff pattern
- NO ErrorBoundary outside Layout on protected pages
- NO `replace: false` on auth redirects
- NO stale tokens left in localStorage after OAuth failure