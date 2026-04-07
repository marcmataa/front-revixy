import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useT } from "../../hooks/useT.js";
import Logo from "../../components/ui/logo.jsx";

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
function LegalLink({ to, children }) {
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

// Divisor horizontal entre secciones
function SectionDivider() {
  return (
    <div
      className="my-10"
      style={{ height: "1px", background: "var(--border)" }}
    />
  );
}

export default function PrivacyPage() {
  const t = useT();
  const p = t.legal.privacy;

  // Llevamos al usuario al inicio al navegar a esta página
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

      {/* ── Contenido principal ── */}
      <main className="max-w-3xl mx-auto px-6 py-20">
        {/* Título y fecha de actualización */}
        <div className="mb-14">
          <h1
            className="text-4xl mb-3"
            style={{
              fontFamily: "Syne, sans-serif",
              fontWeight: 800,
              color: "var(--text)",
              lineHeight: 1.15,
            }}
          >
            {p.title}
          </h1>
          <p
            className="text-sm"
            style={{
              fontFamily: "DM Sans, sans-serif",
              color: "var(--muted)",
            }}
          >
            {p.lastUpdated}
          </p>
        </div>

        {/* Secciones con id para anclas */}
        <Section
          id="dataCollection"
          heading={p.sections.dataCollection.heading}
          body={p.sections.dataCollection.body}
        />
        <SectionDivider />

        <Section
          id="shopifyMeta"
          heading={p.sections.shopifyMeta.heading}
          body={p.sections.shopifyMeta.body}
        />
        <SectionDivider />

        <Section
          id="aiProcessing"
          heading={p.sections.aiProcessing.heading}
          body={p.sections.aiProcessing.body}
        />
        <SectionDivider />

        <Section
          id="retention"
          heading={p.sections.retention.heading}
          body={p.sections.retention.body}
        />
        <SectionDivider />

        <Section
          id="userRights"
          heading={p.sections.userRights.heading}
          body={p.sections.userRights.body}
          items={p.sections.userRights.items}
        />
        <SectionDivider />

        <Section
          id="cookies"
          heading={p.sections.cookies.heading}
          body={p.sections.cookies.body}
        />
        <SectionDivider />

        <Section
          id="contact"
          heading={p.sections.contact.heading}
          body={p.sections.contact.body}
        />

        {/* Footer de página ── copyright + enlace a Términos */}
        <div
          className="mt-16 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm"
          style={{
            borderTop: "1px solid var(--border)",
            fontFamily: "DM Sans, sans-serif",
            color: "var(--muted)",
          }}
        >
          <span>{t.landing.footer.copyright}</span>
          <LegalLink to="/terms">{t.landing.footer.terms}</LegalLink>
        </div>
      </main>
    </div>
  );
}
