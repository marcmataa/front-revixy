import { Component } from "react";
import { useT } from "../hooks/useT.js";

class ErrorBoundaryClass extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // En producción: enviar a Sentry o servicio de monitoreo
    console.error("[REVIXY] Component error:", error, info);
  }

  render() {
    const { t } = this.props;

    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-[var(--text)] p-8">
          <div className="text-4xl mb-4" aria-hidden="true">
            ⚠️
          </div>
          <h2 className="text-xl font-semibold mb-2 font-[Syne]">{t.common.errorTitle}</h2>
          <p className="text-[var(--muted)] mb-6 text-center max-w-sm text-sm font-[DM_Sans]">
            {t.common.errorDescription}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="bg-[var(--accent)] text-[var(--text)] px-4 py-2 rounded-xl text-sm font-medium font-[DM_Sans] hover:bg-[#5B52E0] transition-colors"
              aria-label={t.common.retry}
            >
              {t.common.retry}
            </button>
            {/* window.location.reload() permitido solo aquí — recovery de ErrorBoundary */}
            <button
              onClick={() => window.location.reload()}
              className="bg-[var(--surface2)] text-[var(--text)] px-4 py-2 rounded-xl text-sm font-medium font-[DM_Sans] border border-[var(--border)] hover:border-[var(--muted)] transition-colors"
              aria-label={t.common.reload}
            >
              {t.common.reload}
            </button>
          </div>
          <a
            href="mailto:support@revixy.com"
            className="text-[var(--accent)] hover:underline text-xs mt-6 font-[DM_Sans]"
          >
            {t.common.contactSupport}
          </a>
        </div>
      );
    }

    return this.props.children;
  }
}

const ErrorBoundary = ({ children }) => {
  const t = useT();
  return <ErrorBoundaryClass t={t}>{children}</ErrorBoundaryClass>;
};

export default ErrorBoundary;
