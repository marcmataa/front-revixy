import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../../app/slices/authSlice.js";
import { useT } from "../../hooks/useT.js";
import Logo from "../../components/ui/logo.jsx";
import {
  TrendingDown,
  TableProperties,
  EyeOff,
  Plug,
  BarChart3,
  Zap,
  Activity,
  BellRing,
  Sliders,
  MessageSquare,
  Bot,
  ChevronDown,
  X,
  Menu,
} from "lucide-react";

// ─── Entry animation helper ───────────────────────────────────────────────────
function fadeIn(mounted, delayMs = 0) {
  return {
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(20px)",
    transition: `opacity 0.65s cubic-bezier(0.22,1,0.36,1) ${delayMs}ms,
                 transform 0.65s cubic-bezier(0.22,1,0.36,1) ${delayMs}ms`,
  };
}

// ─── Scroll-reveal ──────────────────────────────
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          io.unobserve(el);
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, visible];
}

export function Reveal({ children, delay = 0, className = "" }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.55s ease-out ${delay}ms, transform 0.55s ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Fake Dashboard ───────────────────────────────────────────────────────────
function FakeDashboard() {
  const t = useT();
  const points = [20, 25, 22, 30, 28, 35, 40, 38, 45, 60, 80, 95];
  const W = 500;
  const H = 120;

  const svgRef = useRef(null);
  const [dotStyle, setDotStyle] = useState(null);
  const [startDotStyle, setStartDotStyle] = useState(null);
  const [clipRx, setClipRx] = useState({ rx: 12, ry: 12 });

  const coords = points.map((p, i) => ({
    x: (i * W) / (points.length - 1),
    y: H - (p * H) / 100,
  }));

  const catmullRom2bezier = (crp) => {
    let d = `M ${crp[0].x},${crp[0].y}`;
    for (let i = 0; i < crp.length - 1; i++) {
      let p0 = crp[i === 0 ? i : i - 1];
      let p1 = crp[i];
      let p2 = crp[i + 1];
      let p3 = crp[i + 2 === crp.length ? i + 1 : i + 2];
      let cp1x = p1.x + (p2.x - p0.x) / 6;
      let cp1y = p1.y + (p2.y - p0.y) / 6;
      let cp2x = p2.x - (p3.x - p1.x) / 6;
      let cp2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    return d;
  };

  const linePath = catmullRom2bezier(coords);
  const areaPath = `${linePath} L ${coords[coords.length - 1].x},${H} L ${coords[0].x},${H} Z`;
  const firstPoint = coords[0];
  const lastPoint = coords[coords.length - 1];

  useEffect(() => {
    const update = () => {
      const svg = svgRef.current;
      if (!svg) return;
      const { width, height } = svg.getBoundingClientRect();
      const scaleX = width / W;
      const scaleY = height / H;
      setStartDotStyle({
        left: firstPoint.x * scaleX,
        top: firstPoint.y * scaleY,
      });
      setDotStyle({
        left: lastPoint.x * scaleX,
        top: lastPoint.y * scaleY,
      });
      setClipRx({ rx: 12 / scaleX, ry: 12 / scaleY });
    };
    update();
    const observer = new ResizeObserver(update);
    if (svgRef.current) observer.observe(svgRef.current);
    return () => observer.disconnect();
  }, [firstPoint.x, firstPoint.y, lastPoint.x, lastPoint.y]);

  const isReady = startDotStyle !== null && dotStyle !== null;
  const badgeBaseStyle =
    "absolute flex items-center gap-1.5 rounded-full border px-2.5 py-1 z-20 opacity-0";

  return (
    <div
      className="w-full max-w-[600px] mx-auto flex flex-col rounded-2xl border"
      style={{
        borderColor: "rgba(255, 255, 255, 0.08)",
        background: "#0a0a0b",
        boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
        overflow: "visible",
      }}
    >
      {/* Browser chrome bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.05)]">
        <div className="flex gap-1.5 w-16">
          <div className="w-2 h-2 rounded-full bg-[#ef4444]" />
          <div className="w-2 h-2 rounded-full bg-[#f59e0b]" />
          <div className="w-2 h-2 rounded-full bg-[#10b981]" />
        </div>
        <div className="flex items-center px-4 rounded h-[22px] bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.05)]">
          <span className="text-[10px] font-mono text-gray-500 italic">
            app.revixy.com/dashboard
          </span>
        </div>
        <div className="w-16"></div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-2 p-4 flex-none">
        {[
          {
            label: t.landing.hero.dashValue,
            value: "██████",
            color: "#6c63ff",
            primary: true,
          },
          { label: t.landing.hero.dashRoas, value: "████", color: "#ffffff" },
          { label: t.landing.hero.dashSpend, value: "█████", color: "#ffffff" },
          { label: t.landing.hero.dashHealth, value: "███", color: "#6c63ff" },
        ].map((card) => (
          <div
            key={card.label}
            className={`rounded-xl p-4 border ${card.primary ? "bg-[rgba(108,99,255,0.06)] border-[rgba(108,99,255,0.25)]" : "bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)]"}`}
          >
            <div className="text-[10px] mb-2 text-gray-400 font-bold uppercase tracking-wider">
              {card.label}
            </div>
            <div
              className="font-mono text-sm font-semibold"
              style={{ color: card.color, filter: "blur(5px)" }}
            >
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Gráfica */}
      <div className="px-4 pb-4 flex-1 flex flex-col min-h-[220px] relative">
        {/* Contenedor con borde */}
        <div
          className="flex-1 w-full border rounded-xl relative bg-[rgba(255,255,255,0.01)] border-[rgba(255,255,255,0.08)]"
          style={{ overflow: "visible" }}
        >
          {/* TÍTULO DENTRO DEL RECUADRO */}
          <div className="absolute top-3 left-4 z-10">
            <div
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: "#afa99e" }}
            >
              {t.landing.hero.dashGraphTitle}
            </div>
          </div>

          {isReady && (
            <>
              {/* ROAS INICIAL - ABAJO */}
              <div
                className="absolute w-[1px] border-l border-dashed border-[#ef4444] opacity-40"
                style={{
                  left: `0px`,
                  top: `${startDotStyle.top}px`,
                  height: "30px",
                  animation: "fadeOnly 0.5s ease-out 0.2s forwards",
                }}
              />
              <div
                className={`${badgeBaseStyle} shadow-[0_0_15px_rgba(239,68,68,0.1)]`}
                style={{
                  left: `0px`,
                  top: `${startDotStyle.top + 26}px`,
                  background: "rgba(239, 68, 68, 0.15)",
                  backdropFilter: "blur(6px)",
                  borderColor: "rgba(239, 68, 68, 0.4)",
                  opacity: 0,
                  animation: "fadeOnly 0.5s ease-out 0.2s forwards",
                }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
                <span className="text-[9px] font-black text-[#ef4444] tracking-tighter uppercase whitespace-nowrap">
                  {t.landing.hero.floatingBadRoas}
                </span>
              </div>

              {/* ROAS FINAL - ARRIBA */}
              <div
                className="absolute w-[1px] border-l border-dashed border-[#10b981] opacity-40"
                style={{
                  right: `0px`,
                  top: `${dotStyle.top - 30}px`,
                  height: "30px",
                  animation: "fadeOnly 0.5s ease-out 2s forwards",
                }}
              />
              <div
                className={`${badgeBaseStyle} shadow-[0_0_15px_rgba(16,185,129,0.1)]`}
                style={{
                  right: `0px`,
                  top: `${dotStyle.top - 52}px`,
                  background: "rgba(16, 185, 129, 0.15)",
                  backdropFilter: "blur(6px)",
                  borderColor: "rgba(16, 185, 129, 0.4)",
                  opacity: 0,
                  animation: "fadeOnly 0.5s ease-out 2s forwards",
                }}
              >
                <span className="text-[9px] font-black text-[#10b981] tracking-tighter uppercase whitespace-nowrap">
                  {t.landing.hero.floatingRoas}
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
              </div>
            </>
          )}

          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            width="100%"
            height="100%"
            preserveAspectRatio="none"
            style={{ display: "block", overflow: "visible" }}
          >
            <defs>
              <clipPath id="graphClip">
                <rect
                  x="0"
                  y="0"
                  width={W}
                  height={H}
                  rx={clipRx.rx}
                  ry={clipRx.ry}
                />
              </clipPath>
              <clipPath id="revealClip">
                <rect x="0" y="0" height={H} width="0">
                  <animate
                    attributeName="width"
                    from="0"
                    to={W}
                    dur="2s"
                    begin="0.2s"
                    fill="freeze"
                    calcMode="spline"
                    keySplines="0.4 0 0.2 1"
                  />
                </rect>
              </clipPath>
              <linearGradient id="gradientArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
            </defs>
            <g clipPath="url(#graphClip)">
              <g clipPath="url(#revealClip)">
                <path d={areaPath} fill="url(#gradientArea)" />
                <path
                  d={linePath}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  style={{ vectorEffect: "non-scaling-stroke" }}
                />
              </g>
            </g>
          </svg>
        </div>
      </div>
      <style>{`@keyframes fadeOnly { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </div>
  );
}
// ─── Logo pills ───────────────────────────────────────────────────────────────
const LOGOS = ["MANGO HOME", "PETFY", "NØRD STUDIO", "LUMIA WEAR", "ARKANA"];

// ─── Logo Marquee (infinite lateral scroll) ───────────────────────────────────
function LogoCarousel({ logos }) {
  // 1. Triplicamos para un bucle perfecto al 33.33%
  const repeated = [...logos, ...logos, ...logos];

  return (
    <div
      className="mt-12" // Separación del bloque de texto superior
      style={{
        width: "100%", // Ocupa el 100% del bloque izquierdo
        maxWidth: "480px", // CRÍTICO: Alinea el carrusel con el ancho del texto superior
        overflow: "hidden", // Contiene los logos
        position: "relative",
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)",
        maskImage:
          "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "12px", // Espacio entre logos
          width: "max-content", // El flexbox se estira
          animation: "marquee 35s linear infinite", // Movimiento lento UX
          justifyContent: "flex-start", // Alineación forzada al inicio
        }}
      >
        {repeated.map((name, i) => (
          <div
            key={i}
            className="px-3 py-1.5 rounded-lg border text-[10px] font-semibold tracking-widest shrink-0"
            style={{
              borderColor: "rgba(255,255,255,0.1)", // Borde sutil
              background: "rgba(255,255,255,0.02)", // Fondo Premium
              color: "rgba(255,255,255,0.4)", // Texto atenuado
              fontFamily: "DM Sans, sans-serif",
              textTransform: "uppercase",
            }}
          >
            {name}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
export function Hero() {
  const t = useT();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section
      className="relative overflow-hidden flex flex-col"
      style={{
        background:
          "linear-gradient(to bottom, rgba(20,18,35,1) 0%, rgba(14,12,28,1) 60%, rgba(12,10,24,1) 100%)",
        minHeight: "100svh",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(108,99,255,0.07) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />

      {/* ── Navbar ───────────────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-5 md:px-10 py-5 shrink-0 border-b"
        style={{
          background: "rgba(8, 8, 12, 0.75)",
          borderColor: "rgba(255, 255, 255, 0.06)",
          backdropFilter: "blur(28px) saturate(180%)",
          WebkitBackdropFilter: "blur(28px) saturate(180%)",
          boxShadow:
            "0 1px 0 rgba(255,255,255,0.04), 0 4px 24px rgba(0,0,0,0.35), 0 0 0 1px rgba(108,99,255,0.06)",
        }}
      >
        <Link to="/">
          <Logo />
        </Link>

        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors duration-150"
            style={{
              color: "var(--text)",
              borderColor: "var(--border)",
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            {t.landing.nav.login}
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors duration-150"
            style={{
              background: "var(--accent)",
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            {t.landing.nav.cta}
          </Link>
        </div>

        <button
          className="md:hidden p-2"
          style={{ color: "var(--text)" }}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>
      <div
        className="pointer-events-none w-full shrink-0"
        style={{
          height: "1px",
          background:
            "linear-gradient(to right, transparent, rgba(108,99,255,0.4), rgba(255,255,255,0.08), rgba(108,99,255,0.4), transparent)",
        }}
      />

      {/* ── Main content area ────────────────────────────────────────────── */}
      <div className="relative z-10 flex-1 flex items-center px-5 md:px-10 py-10">
        <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-stretch gap-10">
          {/* LEFT — text + CTA */}
          <div className="w-full md:w-1/2 flex flex-col justify-between items-center md:items-start py-2 text-center md:text-left">
            <div>
              {/* 1 — Eyebrow */}
              <div style={fadeIn(mounted, 0)} className="mb-6">
                <div
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border"
                  style={{
                    background: "rgba(108,99,255,0.08)",
                    borderColor: "rgba(108,99,255,0.22)",
                  }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: "var(--accent2)" }}
                  />
                  <span
                    className="text-[11px] font-medium tracking-widest uppercase"
                    style={{
                      color: "var(--accent2)",
                      fontFamily: "DM Sans, sans-serif",
                    }}
                  >
                    {t.landing.hero.eyebrow}
                  </span>
                </div>
              </div>

              {/* 2 — H1 */}
              <h1
                className="leading-[1.1] mb-6"
                style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontWeight: 800,
                  fontSize: "clamp(2.5rem, 5vw, 4.2rem)",
                  letterSpacing: "-0.03em",
                  color: "var(--text)",
                  maxWidth: "600px",
                  ...fadeIn(mounted, 120),
                }}
              >
                {t.landing.hero.headline}{" "}
                <span style={{ color: "var(--accent)" }}>
                  {t.landing.hero.headlineAccent}
                </span>
              </h1>

              {/* 3 — Subtitle */}
              <p
                className="text-base md:text-lg leading-relaxed mb-8"
                style={{
                  fontFamily: "DM Sans, sans-serif",
                  color: "var(--muted)",
                  maxWidth: "480px",
                  ...fadeIn(mounted, 240),
                }}
              >
                {t.landing.hero.sub}
              </p>

              {/* 4 — CTA */}
              <div
                className="flex flex-col items-center md:items-start gap-6 mb-10"
                style={fadeIn(mounted, 360)}
              >
                {/* Grupo Botón */}
                <div className="flex flex-col items-center md:items-start gap-2">
                  <Link
                    to="/register"
                    className="inline-flex items-center px-8 py-4 rounded-xl font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      background: "var(--accent)",
                      fontFamily: "DM Sans, sans-serif",
                      // MEJORA: Glow exterior sutil pero presente
                      boxShadow:
                        "0 0 40px rgba(108,99,255,0.4), 0 10px 20px rgba(0,0,0,0.3)",
                    }}
                  >
                    {t.landing.hero.cta}
                  </Link>
                  <span
                    className="text-xs"
                    style={{
                      color: "var(--muted)",
                      fontFamily: "DM Sans, sans-serif",
                    }}
                  >
                    {t.landing.hero.ctaSub}
                  </span>
                </div>

                {/* MEJORA: Social proof subido aquí para reforzar el CTA */}
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: "var(--success)",
                      animation: "pulseDot 2s infinite",
                    }}
                  />
                  <span
                    className="text-xs"
                    style={{
                      color: "var(--muted)",
                      fontFamily: "DM Sans, sans-serif",
                    }}
                  >
                    {t.landing.hero.socialProof
                      .split("150")
                      .map((part, i, arr) =>
                        i < arr.length - 1 ? (
                          <span key={i}>
                            {part}
                            <span
                              style={{
                                color: "var(--success)",
                                fontWeight: 600,
                              }}
                            >
                              150
                            </span>
                          </span>
                        ) : (
                          part
                        ),
                      )}
                  </span>
                </div>
              </div>
            </div>

            {/* 5 — Carrusel de Logos (Ahora solo contiene el carrusel) */}
            <div className="w-full" style={fadeIn(mounted, 480)}>
              <LogoCarousel logos={LOGOS} />
            </div>
          </div>
          {/* END LEFT */}

          {/* RIGHT — Dashboard */}
          <div
            className="flex w-full md:w-1/2 relative"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted
                ? "translateY(0) scale(1)"
                : "translateY(20px) scale(0.98)",
              transition:
                "opacity 0.8s cubic-bezier(0.22,1,0.36,1) 550ms, transform 0.8s cubic-bezier(0.22,1,0.36,1) 550ms",
            }}
          >
            <div
              className="absolute -z-10 pointer-events-none rounded-3xl"
              style={{
                top: "15%",
                left: "10%",
                right: "10%",
                bottom: "15%",
                background:
                  "radial-gradient(circle, var(--accent) 0%, transparent 70%)",
                opacity: 0.07,
                filter: "blur(50px)",
              }}
            />

            <FakeDashboard />
          </div>
          {/* END RIGHT */}
        </div>
      </div>

      <style>{`
  @keyframes heroFloat {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-6px); }
  }
  @keyframes pulseDot {
    0%, 100% { opacity: 1;   box-shadow: 0 0 0 0 rgba(239,68,68,0.6); }
    50%       { opacity: 0.3; box-shadow: 0 0 0 5px rgba(239,68,68,0); }
  }
  @keyframes marquee {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-33.33%); } /* Cambiado a 33% para encajar con el triplicado */
}
`}</style>
    </section>
  );
}

// ─── Section 2 — The Problem ──────────────────────────────────────────────────
function ProblemSection() {
  const t = useT();
  const problems = [
    {
      icon: <TrendingDown size={22} strokeWidth={1.5} />,
      ...t.landing.problem.roas,
    },
    {
      icon: <TableProperties size={22} strokeWidth={1.5} />,
      ...t.landing.problem.spreadsheet,
    },
    {
      icon: <EyeOff size={22} strokeWidth={1.5} />,
      ...t.landing.problem.invisible,
    },
  ];

  return (
    <section className="py-24 px-6" style={{ background: "var(--surface)" }}>
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <h2
            className="text-center mb-4"
            style={{
              fontFamily: "Syne, sans-serif",
              fontWeight: 700,
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              letterSpacing: "-0.02em",
              color: "var(--text)",
            }}
          >
            {t.landing.problem.heading}
          </h2>
          <p
            className="text-center mb-14 max-w-lg mx-auto"
            style={{ fontFamily: "DM Sans, sans-serif", color: "var(--muted)" }}
          >
            {t.landing.problem.sub}
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {problems.map((p, i) => (
            <Reveal key={p.title} delay={i * 80}>
              <ProblemCard {...p} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProblemCard({ icon, title, desc }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="rounded-2xl p-6 border transition-colors duration-200 h-full"
      style={{
        background: "var(--surface2)",
        borderColor: hovered ? "var(--accent)" : "var(--border)",
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
        style={{ background: "rgba(108,99,255,0.12)", color: "var(--accent)" }}
      >
        {icon}
      </div>
      <h3
        className="mb-2 font-semibold"
        style={{
          fontFamily: "Syne, sans-serif",
          color: "var(--text)",
          fontSize: "1rem",
        }}
      >
        {title}
      </h3>
      <p
        className="text-sm leading-relaxed"
        style={{ fontFamily: "DM Sans, sans-serif", color: "var(--muted)" }}
      >
        {desc}
      </p>
    </div>
  );
}

// ─── Section 3 — The Solution ─────────────────────────────────────────────────
function HowItWorksSection() {
  const t = useT();
  const steps = [
    {
      num: "01",
      icon: <Plug size={20} strokeWidth={1.5} />,
      ...t.landing.solution.connect,
    },
    {
      num: "02",
      icon: <BarChart3 size={20} strokeWidth={1.5} />,
      ...t.landing.solution.analyze,
    },
    {
      num: "03",
      icon: <Zap size={20} strokeWidth={1.5} />,
      ...t.landing.solution.act,
    },
  ];

  return (
    <section className="py-24 px-6" style={{ background: "var(--bg)" }}>
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <h2
            className="text-center mb-4"
            style={{
              fontFamily: "Syne, sans-serif",
              fontWeight: 700,
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              letterSpacing: "-0.02em",
              color: "var(--text)",
            }}
          >
            {t.landing.solution.heading}
          </h2>
          <p
            className="text-center mb-16 max-w-md mx-auto"
            style={{ fontFamily: "DM Sans, sans-serif", color: "var(--muted)" }}
          >
            {t.landing.solution.sub}
          </p>
        </Reveal>

        <div className="relative">
          {/* Connector line — desktop only */}
          <div
            className="hidden md:block absolute top-8 left-0 right-0 h-px"
            style={{
              background:
                "linear-gradient(to right, transparent, var(--accent), var(--accent2), transparent)",
              opacity: 0.3,
              marginLeft: "calc(16.666% + 2rem)",
              marginRight: "calc(16.666% + 2rem)",
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {steps.map((s, i) => (
              <Reveal key={s.num} delay={i * 100}>
                <div className="flex flex-col items-center text-center">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 relative z-10 border border-[var(--border)]"
                    style={{ background: "var(--surface2)" }}
                  >
                    <span
                      className="font-mono font-semibold"
                      style={{ fontSize: "1.1rem", color: "var(--accent)" }}
                    >
                      {s.num}
                    </span>
                  </div>
                  <div className="mb-2" style={{ color: "var(--accent2)" }}>
                    {s.icon}
                  </div>
                  <h3
                    className="mb-2 font-semibold"
                    style={{
                      fontFamily: "Syne, sans-serif",
                      color: "var(--text)",
                      fontSize: "1.1rem",
                    }}
                  >
                    {s.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed max-w-xs"
                    style={{
                      fontFamily: "DM Sans, sans-serif",
                      color: "var(--muted)",
                    }}
                  >
                    {s.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section 4 — Features ─────────────────────────────────────────────────────
function FeaturesSection() {
  const t = useT();
  const features = [
    {
      icon: <Activity size={20} strokeWidth={1.5} />,
      ...t.landing.features.healthScore,
    },
    {
      icon: <BellRing size={20} strokeWidth={1.5} />,
      ...t.landing.features.alerts,
    },
    {
      icon: <Sliders size={20} strokeWidth={1.5} />,
      ...t.landing.features.simulator,
    },
    {
      icon: <MessageSquare size={20} strokeWidth={1.5} />,
      ...t.landing.features.chat,
    },
  ];

  return (
    <section className="py-24 px-6" style={{ background: "var(--surface)" }}>
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <h2
            className="text-center mb-4"
            style={{
              fontFamily: "Syne, sans-serif",
              fontWeight: 700,
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              letterSpacing: "-0.02em",
              color: "var(--text)",
            }}
          >
            {t.landing.features.heading}
          </h2>
          <p
            className="text-center mb-14 max-w-lg mx-auto"
            style={{ fontFamily: "DM Sans, sans-serif", color: "var(--muted)" }}
          >
            {t.landing.features.sub}
          </p>
        </Reveal>

        {/* 2×2 grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 70}>
              <FeatureCard {...f} />
            </Reveal>
          ))}
        </div>

        {/* Full-width Autopilot card */}
        <Reveal delay={300}>
          <AutopilotCard />
        </Reveal>
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, desc }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="rounded-2xl p-6 border transition-all duration-200 h-full"
      style={{
        background: hovered ? "rgba(108,99,255,0.04)" : "var(--surface2)",
        borderColor: hovered ? "var(--accent)" : "var(--border)",
      }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
        style={{ background: "rgba(108,99,255,0.12)", color: "var(--accent)" }}
      >
        {icon}
      </div>
      <h3
        className="mb-2 font-semibold"
        style={{
          fontFamily: "Syne, sans-serif",
          color: "var(--text)",
          fontSize: "1rem",
        }}
      >
        {title}
      </h3>
      <p
        className="text-sm leading-relaxed"
        style={{ fontFamily: "DM Sans, sans-serif", color: "var(--muted)" }}
      >
        {desc}
      </p>
    </div>
  );
}

function AutopilotCard() {
  const t = useT();
  const ap = t.landing.features.autopilot;
  return (
    <div
      className="rounded-2xl p-8 border relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, rgba(108,99,255,0.08) 0%, rgba(167,139,250,0.05) 100%)",
        borderColor: "var(--accent)",
        boxShadow: "0 0 40px rgba(108,99,255,0.08)",
      }}
    >
      <div className="flex items-center gap-3 mb-5">
        <span
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-widest"
          style={{
            background: "rgba(108,99,255,0.18)",
            color: "var(--accent)",
            fontFamily: "DM Sans, sans-serif",
          }}
        >
          <span
            className="w-2 h-2 rounded-full inline-block"
            style={{
              background: "var(--success)",
              animation: "pulse-dot 2s ease-in-out infinite",
            }}
          />
          {ap.badge}
        </span>
        <Bot size={20} strokeWidth={1.5} color="var(--accent2)" />
      </div>

      <h3
        className="mb-4 font-bold"
        style={{
          fontFamily: "Syne, sans-serif",
          color: "var(--text)",
          fontSize: "1.3rem",
          letterSpacing: "-0.01em",
        }}
      >
        {ap.title}
      </h3>

      <p
        className="leading-relaxed max-w-3xl"
        style={{
          fontFamily: "DM Sans, sans-serif",
          color: "var(--muted)",
          fontSize: "0.95rem",
        }}
      >
        {ap.desc}{" "}
        <strong style={{ color: "var(--text)" }}>{ap.descStrong}</strong>
      </p>

      <div
        className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}

// ─── Section 5 — Metrics ──────────────────────────────────────────────────────
function MetricsSection() {
  const t = useT();
  const metrics = [
    t.landing.metrics.setup,
    t.landing.metrics.history,
    t.landing.metrics.response,
    t.landing.metrics.languages,
  ];

  return (
    <section className="py-20 px-6" style={{ background: "var(--bg)" }}>
      <div className="max-w-5xl mx-auto">
        <div
          className="grid grid-cols-2 md:grid-cols-4 rounded-2xl border overflow-hidden"
          style={{ borderColor: "var(--border)" }}
        >
          {metrics.map((m, i) => (
            <Reveal key={m.label} delay={i * 80}>
              <div
                className="flex flex-col items-center justify-center py-10 px-6 text-center border-b md:border-b-0 border-r last:border-r-0 border-[var(--border)]"
                style={{ background: "var(--surface2)" }}
              >
                <span
                  className="font-mono font-semibold mb-2"
                  style={{
                    fontSize: "clamp(1.5rem, 3vw, 2rem)",
                    color: "var(--accent)",
                  }}
                >
                  {m.value}
                </span>
                <span
                  className="text-xs text-center leading-tight"
                  style={{
                    fontFamily: "DM Sans, sans-serif",
                    color: "var(--muted)",
                  }}
                >
                  {m.label}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section 6 — Pricing ──────────────────────────────────────────────────────
function PricingSection() {
  const t = useT();
  const { free, pro } = t.landing.pricing;

  return (
    <section className="py-24 px-6" style={{ background: "var(--surface)" }}>
      <div className="max-w-4xl mx-auto">
        <Reveal>
          <h2
            className="text-center mb-4"
            style={{
              fontFamily: "Syne, sans-serif",
              fontWeight: 700,
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              letterSpacing: "-0.02em",
              color: "var(--text)",
            }}
          >
            {t.landing.pricing.heading}
          </h2>
          <p
            className="text-center mb-14"
            style={{ fontFamily: "DM Sans, sans-serif", color: "var(--muted)" }}
          >
            {t.landing.pricing.sub}
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free card */}
          <Reveal delay={0}>
            <div
              className="rounded-2xl p-8 border h-full flex flex-col"
              style={{
                background: "var(--surface2)",
                borderColor: "var(--border)",
              }}
            >
              <div
                className="text-xs font-semibold tracking-widest mb-2"
                style={{
                  color: "var(--muted)",
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                {free.plan}
              </div>
              <div
                className="font-mono font-bold mb-1"
                style={{ fontSize: "2.5rem", color: "var(--text)" }}
              >
                {free.price}
              </div>
              <div
                className="text-sm mb-8"
                style={{
                  color: "var(--muted)",
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                {free.period}
              </div>

              <ul className="flex flex-col gap-3 mb-8 flex-1">
                {free.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <CheckIcon color="var(--success)" />
                    <span
                      className="text-sm"
                      style={{
                        color: "var(--text)",
                        fontFamily: "DM Sans, sans-serif",
                      }}
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                to="/register"
                className="w-full text-center py-3 rounded-xl text-sm font-semibold border transition-colors duration-150 block"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--text)",
                  fontFamily: "DM Sans, sans-serif",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = "var(--accent)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = "var(--border)")
                }
              >
                {free.cta}
              </Link>
            </div>
          </Reveal>

          {/* Pro card */}
          <Reveal delay={100}>
            <div
              className="rounded-2xl p-8 border h-full flex flex-col relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, rgba(108,99,255,0.1) 0%, rgba(167,139,250,0.05) 100%)",
                borderColor: "var(--accent)",
                boxShadow: "0 0 30px rgba(108,99,255,0.1)",
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-xs font-semibold tracking-widest"
                  style={{
                    color: "var(--accent)",
                    fontFamily: "DM Sans, sans-serif",
                  }}
                >
                  {pro.plan}
                </span>
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={{
                    background: "rgba(108,99,255,0.2)",
                    color: "var(--accent)",
                    fontFamily: "DM Sans, sans-serif",
                  }}
                >
                  {pro.badge}
                </span>
              </div>
              <div
                className="font-mono font-bold mb-1"
                style={{ fontSize: "2rem", color: "var(--text)" }}
              >
                {pro.price}
              </div>
              <div
                className="text-sm mb-8"
                style={{
                  color: "var(--muted)",
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                {pro.period}
              </div>

              <ul className="flex flex-col gap-3 mb-8 flex-1">
                {pro.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <CheckIcon color="var(--accent)" />
                    <span
                      className="text-sm"
                      style={{
                        color: "var(--text)",
                        fontFamily: "DM Sans, sans-serif",
                      }}
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                to="/register"
                className="w-full text-center py-3 rounded-xl text-sm font-semibold text-white transition-colors duration-150 block"
                style={{
                  background: "var(--accent)",
                  fontFamily: "DM Sans, sans-serif",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--accent2)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "var(--accent)")
                }
              >
                {pro.cta}
              </Link>

              <div
                className="absolute -top-10 -right-10 w-32 h-32 rounded-full pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 70%)",
                }}
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function CheckIcon({ color }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className="mt-0.5 shrink-0"
    >
      <circle cx="8" cy="8" r="7" stroke={color} strokeWidth="1.5" />
      <path
        d="M5 8l2 2 4-4"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Section 7 — Final CTA ────────────────────────────────────────────────────
function FinalCTASection() {
  const t = useT();
  const cta = t.landing.finalCta;

  return (
    <section
      className="py-28 px-6 relative overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(108,99,255,0.07) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <Reveal>
          <h2
            className="mb-5"
            style={{
              fontFamily: "Syne, sans-serif",
              fontWeight: 800,
              fontSize: "clamp(2rem, 5vw, 3.25rem)",
              letterSpacing: "-0.03em",
              color: "var(--text)",
            }}
          >
            {cta.heading}{" "}
            <span style={{ color: "var(--accent)" }}>{cta.headingAccent}</span>
          </h2>
          <p
            className="mb-10 text-lg"
            style={{ fontFamily: "DM Sans, sans-serif", color: "var(--muted)" }}
          >
            {cta.sub}
          </p>

          <Link
            to="/register"
            className="inline-block px-10 py-4 rounded-xl text-base font-semibold text-white transition-colors duration-150"
            style={{
              background: "var(--accent)",
              fontFamily: "DM Sans, sans-serif",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--accent2)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "var(--accent)")
            }
          >
            {cta.cta}
          </Link>

          <p
            className="mt-5 text-sm"
            style={{ color: "var(--muted)", fontFamily: "DM Sans, sans-serif" }}
          >
            {cta.ctaSub}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Section 8 — Footer ───────────────────────────────────────────────────────
function Footer() {
  const t = useT();
  const langs = ["ES", "EN", "CA"];
  const [activeLang, setActiveLang] = useState("ES");

  return (
    <footer
      className="border-t px-6 py-10"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <Link to="/">
            <Logo />
          </Link>

          <div className="flex items-center gap-6 flex-wrap justify-center">
            {[
              { to: "/privacy", label: t.landing.footer.privacy },
              { to: "/terms", label: t.landing.footer.terms },
              { to: "/contact", label: t.landing.footer.contact },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="text-sm transition-colors duration-150"
                style={{
                  color: "var(--muted)",
                  fontFamily: "DM Sans, sans-serif",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--text)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--muted)")
                }
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Static language selector */}
          <div className="flex items-center gap-1 rounded-lg border border-[var(--border)] p-1">
            {langs.map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveLang(lang)}
                className="px-3 py-1 rounded-md text-xs font-semibold transition-colors duration-150"
                style={{
                  fontFamily: "DM Sans, sans-serif",
                  background:
                    activeLang === lang ? "var(--accent)" : "transparent",
                  color: activeLang === lang ? "white" : "var(--muted)",
                }}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        <div
          className="mt-8 pt-6 text-center text-xs border-t"
          style={{
            borderColor: "var(--border)",
            color: "var(--muted)",
            fontFamily: "DM Sans, sans-serif",
          }}
        >
          {t.landing.footer.copyright}
        </div>
      </div>
    </footer>
  );
}

// ─── Root component ────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Hero />
      <ProblemSection />
      <HowItWorksSection />
      <FeaturesSection />
      <MetricsSection />
      <PricingSection />
      <FinalCTASection />
      <Footer />
    </div>
  );
}
