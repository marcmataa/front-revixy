import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { store } from "./app/store.js";
import AuthGuard from "./guards/AuthGuard.jsx";
import OnboardingGuard from "./guards/OnboardingGuard.jsx";
import PublicGuard from "./guards/PublicGuard.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import SimulationSheet from "./components/alerts/SimulationSheet.jsx";
import Layout from "./components/layout/Layout.jsx";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import AuthCallback from "./pages/auth/AuthCallback.jsx";
import ShopifyCallback from "./pages/auth/ShopifyCallback.jsx";
import ConnectShopify from "./pages/onboarding/ConnectShopify.jsx";
import ConnectMeta from "./pages/onboarding/ConnectMeta.jsx";
import StoreSettings from "./pages/onboarding/StoreSettings.jsx";
import Dashboard from "./pages/dashboard/Dashboard.jsx";
import AlertsPage from "./pages/alerts/AlertsPage.jsx";
import ChatPage from "./pages/ai/ChatPage.jsx";
import Settings from "./pages/settings/Settings.jsx";
import ProfilePage from "./pages/profile/ProfilePage.jsx";
import IntegrationsPage from "./pages/integrations/IntegrationsPage.jsx";
import LandingPage from "./pages/landing/LandingPage.jsx";
import PrivacyPage from "./pages/landing/PrivacyPage.jsx";
import TermsPage from "./pages/landing/TermsPage.jsx";
import LandingLanguageInterceptor from "./providers/LandingLanguageInterceptor.jsx";
import ScrollToTop from "./components/utils/ScrollToTop.jsx";

export default function App() {
  useEffect(() => {
    // Safety net: remove any stored theme that could trigger dark mode in future refactors
    localStorage.removeItem("theme");
    localStorage.removeItem("darkMode");
    localStorage.removeItem("color-scheme");
    // DO NOT add className="dark" on <html> — the purple theme is the only theme
    document.documentElement.classList.remove("dark");
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <ScrollToTop />
        <LandingLanguageInterceptor />
        <SimulationSheet />

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "var(--surface2)",
              color: "var(--text)",
              border: "1px solid var(--border)",
              fontFamily: "DM Sans, sans-serif",
            },
            success: {
              iconTheme: { primary: "var(--success)", secondary: "var(--bg)" },
            },
            error: {
              iconTheme: { primary: "var(--critical)", secondary: "var(--bg)" },
            },
          }}
        />

        <Routes>
          <Route
            path="/login"
            element={
              <PublicGuard>
                <Login />
              </PublicGuard>
            }
          />
          <Route
            path="/register"
            element={
              <PublicGuard>
                <Register />
              </PublicGuard>
            }
          />

          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Callback de Shopify OAuth — requiere auth (JWT activo), sin OnboardingGuard ni Layout */}
          <Route
            path="/auth/shopify/callback"
            element={
              <AuthGuard>
                <ErrorBoundary>
                  <ShopifyCallback />
                </ErrorBoundary>
              </AuthGuard>
            }
          />

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
          <Route
            path="/profile"
            element={
              <AuthGuard>
                <OnboardingGuard>
                  <Layout>
                    <ErrorBoundary>
                      <ProfilePage />
                    </ErrorBoundary>
                  </Layout>
                </OnboardingGuard>
              </AuthGuard>
            }
          />
          <Route
            path="/integrations"
            element={
              <AuthGuard>
                <OnboardingGuard>
                  <Layout>
                    <ErrorBoundary>
                      <IntegrationsPage />
                    </ErrorBoundary>
                  </Layout>
                </OnboardingGuard>
              </AuthGuard>
            }
          />

          {/* Rutas públicas de marketing — sin guard */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </Provider>
  );
}
