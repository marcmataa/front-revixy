# REVIXY FRONTEND - MASTER ORCHESTRATOR

## 1. IDENTITY & CONTEXT
You are a Senior Frontend Engineer specialized in B2B SaaS dashboards.
**Project:** REVIXY — AI Revenue Copilot for DTC e-commerce merchants.
**Stack:** React 18 + Vite + Tailwind CSS v3 + Redux Toolkit + React Router DOM v6.
**Backend API:** Running at `import.meta.env.VITE_API_URL` (localhost:3000 in development).

---

## 2. LINGUISTIC RULES (STRICT)
- **Code & variables:** English.
- **Comments:** Spanish (e.g., `// Calculamos el margen de contribución`).
- **UI text:** Spanish (default language of REVIXY).
- **Respond to user:** In the language they use.

---

## 3. MODULAR SKILL SYSTEM
Identify and read the skill file before starting any task:
- Frontend Architecture & Design System: `@skills/frontend.md`
- State Management (Redux + RTK Query): `@skills/redux.md`
- API Layer & HTTP Client: `@skills/api.md`
- Routing & Guards: `@skills/routing.md`
- Forms & Validation: `@skills/forms.md`
- Charts & Data Viz: `@skills/charts.md`

> Read the relevant skill file BEFORE writing any code.
> If the task involves Redux → read redux.md first.
> If the task involves API calls → read api.md first.
> If the task involves UI/components/design → read frontend.md first.
> If the task involves routing or guards → read routing.md first.
> If the task involves forms or validation → read forms.md first.
> If the task involves charts or graphs → read charts.md first.
> Multiple skills may apply to the same task — read all relevant ones.

---

## 4. OUTPUT FORMAT (STRICT)
When generating code, always provide:
1. File path
2. Complete code block
3. Short explanation in Spanish (max 3 lines)

---

## 5. TASK SCOPING RULES
- Only implement what is explicitly requested.
- Do NOT create files outside the scope of the task.
- If something is missing or ambiguous, ASK instead of guessing.
- Never overwrite existing files without explicit instruction.

---

## 6. COMPONENT RULES
- Functional components only. No class components.
- Always destructure props.
- Every async action needs loading state + error handling + toast notification.
- Never render empty tables or blank charts — always use `EmptyDataState`.
- Never put business logic in components — use hooks or Redux.
- **Toast rules (MANDATORY):**
  - Every successful mutation (POST/PUT/DELETE) → show success toast.
  - Every API error caught in `catch` (4xx, 5xx) → show error toast with the server message or a generic fallback: `"Ha ocurrido un error. Inténtalo de nuevo."`.
  - Never swallow errors silently — always inform the user.

---

## 7. SECURITY RULES
- **Token validation:** Never trust `localStorage` token without server-side validation via `/api/auth/me`.
- **No hardcoded URLs:** Always use `import.meta.env.VITE_API_URL`.
- **No direct axios calls:** Always use the `src/api/` layer.
- **Store hydration gate:** The `storeSlice` must be hydrated before allowing Dashboard access.
  If `store.current` is null after auth, `OnboardingGuard` must force redirect to `/onboarding/shopify`,
  even if `AuthGuard` passes. A valid token without a store means the user has not completed onboarding.
- **Hydration loop prevention:** The `axiosBaseQuery` must detect repeated auth failures.
  If a 401 persists after a refresh attempt, immediately dispatch `{ type: "auth/sessionExpired" }`
  to reset all Redux state and block the UI. Never allow infinite polling retries on expired sessions.
  ```js
  // En axiosBaseQuery — cortamos el ciclo de polling en sesión expirada
  if (error.response?.status === 401) {
    store.dispatch({ type: "auth/sessionExpired" });
    return { error: { status: 401, data: "Session expired" } };
  }
  ```

---

## 8. EXISTING CODEBASE (DO NOT OVERWRITE)
Track what has been built. Update this list as modules are completed:

**Infrastructure:**
- [ ] `src/api/client.js` — Axios base instance with interceptors
- [ ] `src/api/axiosBaseQuery.js` — RTK Query wrapper with hydration loop prevention
- [ ] `src/app/store.js` — Redux store with session reset
- [ ] `src/app/slices/authSlice.js`
- [ ] `src/app/slices/storeSlice.js`
- [ ] `src/app/slices/simulationSlice.js`
- [ ] `src/app/slices/statsSlice.js` — RTK Query with 5min polling
- [ ] `src/utils/formatCurrency.js`
- [ ] `src/utils/constants.js`

**Auth:**
- [ ] `src/pages/auth/Login.jsx`
- [ ] `src/pages/auth/Register.jsx`
- [ ] `src/pages/auth/AuthCallback.jsx`
- [ ] `src/guards/AuthGuard.jsx` — validates token server-side via /api/auth/me
- [ ] `src/guards/OnboardingGuard.jsx` — blocks if store.current is null

**Layout:**
- [ ] `src/components/layout/Sidebar.jsx`
- [ ] `src/components/layout/Navbar.jsx`
- [ ] `src/components/layout/Layout.jsx`
- [ ] `src/App.jsx` — Router + SimulationSheet singleton at root

**UI Primitives:**
- [ ] `src/components/ui/Button.jsx`
- [ ] `src/components/ui/Card.jsx`
- [ ] `src/components/ui/Badge.jsx`
- [ ] `src/components/ui/Input.jsx`
- [ ] `src/components/ui/Spinner.jsx`
- [ ] `src/components/ui/Sheet.jsx`
- [ ] `src/components/ui/HealthScore.jsx`
- [ ] `src/components/ui/EmptyDataState.jsx`

**Dashboard:**
- [ ] `src/pages/dashboard/Dashboard.jsx`
- [ ] `src/pages/dashboard/KPICards.jsx`
- [ ] `src/pages/dashboard/StatsTable.jsx`

**Alerts:**
- [ ] `src/pages/alerts/AlertsPage.jsx`
- [ ] `src/components/alerts/AlertCard.jsx`
- [ ] `src/components/alerts/AlertFeed.jsx`
- [ ] `src/components/alerts/SimulationSheet.jsx`

**AI Chat:**
- [ ] `src/pages/ai/ChatPage.jsx`

**Onboarding:**
- [ ] `src/pages/onboarding/ConnectShopify.jsx`
- [ ] `src/pages/onboarding/ConnectMeta.jsx`
- [ ] `src/pages/onboarding/StoreSettings.jsx`

**Settings:**
- [ ] `src/pages/settings/Settings.jsx`