import { Link } from "react-router-dom";
import { useT } from "../../hooks/useT.js";
import Logo from "../../components/ui/logo.jsx";

// Orden de anclas sincronizado con el array toc[]
const TOC_ANCHORS = [
  "acceptance",
  "service",
  "ip",
  "liability",
  "prohibited",
  "billing",
  "modifications",
  "governingLaw",
  "contact",
];

// Parsea **texto** → <strong> para énfasis en contenido legal
function parseInline(text) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} style={{ fontWeight: 600, color: "var(--text)" }}>
        {part}
      </strong>
    ) : (
      part
    )
  );
}

// Renderiza párrafos con soporte para **bold** y \n\n como separador
function BodyText({ text }) {
  return text.split("\n\n").map((paragraph, i) => (
    <p
      key={i}
      className="mb-4 leading-relaxed"
      style={{
        fontFamily: "DM Sans, sans-serif",
        color: "var(--text)",
        fontSize: "0.9375rem",
      }}
    >
      {parseInline(paragraph)}
    </p>
  ));
}

// Enlace con estilo accent2, sin subrayado por defecto, subrayado en hover
function LegalLink({ to, href, children }) {
  if (href) {
    return (
      <a
        href={href}
        style={{ color: "var(--accent2)", textDecoration: "none" }}
        onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
        onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
      >
        {children}
      </a>
    );
  }
  return (
    <Link
      to={to}
      style={{ color: "var(--accent2)", textDecoration: "none" }}
      onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
      onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
    >
      {children}
    </Link>
  );
}

// Sección legal con id para navegación por ancla
function Section({ id, heading, body, items }) {
  return (
    <section id={id}>
      <h2
        className="text-xl mb-4"
        style={{
          fontFamily: "Syne, sans-serif",
          fontWeight: 700,
          color: "var(--accent)",
        }}
      >
        {heading}
      </h2>
      {body && <BodyText text={body} />}
      {items && items.length > 0 && (
        <ul className="mt-2 space-y-3">
          {items.map((item, i) => (
            <li
              key={i}
              className="flex gap-3 leading-relaxed"
              style={{
                fontFamily: "DM Sans, sans-serif",
                color: "var(--text)",
                fontSize: "0.9375rem",
              }}
            >
              <span
                className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full"
                style={{ background: "var(--accent2)" }}
              />
              <span>{parseInline(item)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// Bloque de aviso importante — envuelve la sección de responsabilidad
function NoticeBlock({ notice, children }) {
  return (
    <div
      className="rounded-xl px-5 py-4 mb-6"
      style={{
        background: "rgba(251, 146, 60, 0.07)",
        border: "1px solid rgba(251, 146, 60, 0.22)",
      }}
    >
      <p
        className="text-sm font-semibold mb-4"
        style={{
          fontFamily: "DM Sans, sans-serif",
          color: "var(--warning)",
        }}
      >
        {notice}
      </p>
      {children}
    </div>
  );
}

// Divisor horizontal entre secciones
function SectionDivider() {
  return (
    <div
      className="my-10"
      style={{ height: "1px", background: "var(--border)" }}
    />
  );
}

export default function TermsPage() {
  const t = useT();
  const terms = t.legal.terms;
  const s = terms.sections;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* ── Header sticky con logo y volver ── */}
      <header
        className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between"
        style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <Link to="/">
          <Logo />
        </Link>
        <LegalLink to="/">← {t.common.back}</LegalLink>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-20">
        {/* Título y fecha de actualización */}
        <div className="mb-10">
          <h1
            className="text-4xl mb-3"
            style={{
              fontFamily: "Syne, sans-serif",
              fontWeight: 800,
              color: "var(--text)",
              lineHeight: 1.15,
            }}
          >
            {terms.title}
          </h1>
          <p
            className="text-sm"
            style={{
              fontFamily: "DM Sans, sans-serif",
              color: "var(--muted)",
            }}
          >
            {terms.lastUpdated}
          </p>
        </div>

        {/* ── Tabla de contenidos ── */}
        <nav
          className="mb-14 p-6 rounded-xl"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
          aria-label={terms.tocTitle}
        >
          <p
            className="text-sm font-semibold mb-4"
            style={{
              fontFamily: "Syne, sans-serif",
              fontWeight: 700,
              color: "var(--muted)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {terms.tocTitle}
          </p>
          <ol className="space-y-2">
            {terms.toc.map((label, i) => (
              <li key={i}>
                <LegalLink href={`#${TOC_ANCHORS[i]}`}>
                  <span
                    style={{
                      fontFamily: "DM Sans, sans-serif",
                      fontSize: "0.9375rem",
                    }}
                  >
                    {i + 1}. {label}
                  </span>
                </LegalLink>
              </li>
            ))}
          </ol>
        </nav>

        {/* ── Secciones ── */}
        <Section id="acceptance" heading={s.acceptance.heading} body={s.acceptance.body} />
        <SectionDivider />

        <Section id="service" heading={s.service.heading} body={s.service.body} />
        <SectionDivider />

        <Section id="ip" heading={s.ip.heading} body={s.ip.body} />
        <SectionDivider />

        {/* Sección 4 — Limitación de Responsabilidad con bloque de aviso */}
        <section id="liability">
          <h2
            className="text-xl mb-4"
            style={{
              fontFamily: "Syne, sans-serif",
              fontWeight: 700,
              color: "var(--accent)",
            }}
          >
            {s.liability.heading}
          </h2>
          <NoticeBlock notice={s.liability.notice}>
            <BodyText text={s.liability.body} />
          </NoticeBlock>
        </section>
        <SectionDivider />

        <Section id="prohibited" heading={s.prohibited.heading} body={s.prohibited.body} items={s.prohibited.items} />
        <SectionDivider />

        <Section id="billing" heading={s.billing.heading} body={s.billing.body} />
        <SectionDivider />

        <Section id="modifications" heading={s.modifications.heading} body={s.modifications.body} />
        <SectionDivider />

        <Section id="governingLaw" heading={s.governingLaw.heading} body={s.governingLaw.body} />
        <SectionDivider />

        <Section id="contact" heading={s.contact.heading} body={s.contact.body} />

        {/* Footer de página ── copyright + enlace a Privacidad */}
        <div
          className="mt-16 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm"
          style={{
            borderTop: "1px solid var(--border)",
            fontFamily: "DM Sans, sans-serif",
            color: "var(--muted)",
          }}
        >
          <span>{t.landing.footer.copyright}</span>
          <LegalLink to="/privacy">{t.landing.footer.privacy}</LegalLink>
        </div>
      </main>
    </div>
  );
}
