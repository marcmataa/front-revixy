import { useEffect, useRef, useState, useMemo } from "react";
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
  User,
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
  const [mounted, setMounted] = useState(false);
   const t = useT();
  useEffect(() => { setMounted(true); }, []);

  const fadeInStyle = (delay) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0px)" : "translateY(20px)",
    transition: `0.8s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
  });

  const BRANDS = ["MANGO HOME", "PETFY", "NØRD STUDIO", "LUMIA WEAR", "ARKANA"];

  return (
    <section className="relative overflow-hidden flex flex-col" style={{ background: "rgb(18, 15, 29)", minHeight: "100svh", userSelect: "none" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, rgba(108, 99, 255, 0.08) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 30% 30%, rgba(108, 99, 255, 0.18) 0%, transparent 60%)" }} />
      <div className="absolute bottom-0 left-0 w-full h-80 pointer-events-none" style={{ background: "linear-gradient(transparent, rgb(8, 8, 12))" }} />

      {/* NAV MODIFICADO PARA RESPONSIVE */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-4 md:px-10 py-4 md:py-5 shrink-0" 
        style={{ background: "rgba(13, 11, 22, 0.85)", backdropFilter: "blur(28px) saturate(180%)", WebkitBackdropFilter: "blur(28px) saturate(180%)", borderBottom: "1px solid transparent", borderImage: "linear-gradient(to right, transparent, rgba(108, 99, 255, 0.45), rgba(255, 255, 255, 0.1), rgba(108, 99, 255, 0.45), transparent) 1 / 1 / 0 stretch", boxShadow: "rgba(0, 0, 0, 0.8) 0px 15px 40px -12px" }}>
        <Link to="/" className="nav-logo-link transition-all duration-300 active:scale-95">
          <div className="nav-logo-glow flex items-center">
            {/* Logo escalado para móvil */}
            <div className="w-[60px] h-[45px] md:w-[80px] md:h-[60px]" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img alt="Logo" src="/src/assets/logo.png" style={{ width: "100%", height: "100%", objectFit: "contain" }} className="scale-[1.3] md:scale-[1.6]" />
            </div>
            <span className="text-[18px] md:text-[25px]" style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, textTransform: "uppercase", letterSpacing: "-0.04em", color: "#e8e8f0", marginLeft: "-4px", marginTop: "4px" }}>
              REVI<span style={{ color: "rgb(108, 99, 255)" }}>XY</span>
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-2 md:gap-4">
          {/* Iniciar sesión: Texto corto o escondido en móviles muy pequeños */}
          <Link to="/login" className="nav-btn-secondary-pro px-3 md:px-5 py-2 rounded-lg text-xs md:text-sm font-medium transition-all" style={{ color: "rgba(255, 255, 255, 0.7)", background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", fontFamily: "DM Sans, sans-serif" }}>
            <span className="hidden xs:inline">{t.landing.nav.login}</span>
            <span className="xs:hidden">{t.landing.nav.login}</span>
          </Link>
          {/* Empezar: Texto dinámico */}
          <Link to="/register" className="nav-btn-primary-animated px-3 md:px-5 py-2 rounded-lg text-xs md:text-sm font-medium text-white transition-all whitespace-nowrap" style={{ background: "rgb(108, 99, 255)", fontFamily: "DM Sans, sans-serif", boxShadow: "0 0 25px rgba(108, 99, 255, 0.35)" }}>
            <span className="hidden xs:inline">{t.landing.nav.cta}</span>
            <span className="xs:hidden">{t.landing.nav.ctaRes}</span>
          </Link>
        </div>
      </nav>

      <div className="relative z-10 flex-1 flex items-center px-5 md:px-10 py-10">
        <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-stretch gap-10">
          <div className="w-full md:w-1/2 flex flex-col justify-between items-center md:items-start py-2 text-center md:text-left">
            <div>
              <div className="mb-6" style={fadeInStyle(0)}>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border max-w-full" style={{ background: "rgba(108, 99, 255, 0.08)", borderColor: "rgba(108, 99, 255, 0.22)" }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "rgb(108, 99, 255)" }} />
                  <span className="text-[9px] md:text-[11px] font-medium tracking-[0.1em] md:tracking-[0.2em] uppercase" style={{ color: "rgb(108, 99, 255)", fontFamily: "DM Sans, sans-serif" }}>{t.landing.hero.eyebrow}</span>
                </div>
              </div>
              <h1 className="leading-[1.1] mb-6" style={{ fontFamily: "Bricolage Grotesque, sans-serif", fontWeight: 800, fontSize: "clamp(2.2rem, 5vw, 4.2rem)", letterSpacing: "-0.04em", color: "white", ...fadeInStyle(120) }}>
                {t.landing.hero.headline} <span style={{ color: "rgb(108, 99, 255)" }}>{t.landing.hero.headlineAccent}</span>
              </h1>
              <p className="text-base md:text-lg leading-relaxed mb-8" style={{ fontFamily: "DM Sans, sans-serif", color: "rgba(255,255,255,0.5)", maxWidth: "480px", ...fadeInStyle(240) }}>
                {t.landing.hero.sub}
              </p>
              
              <div className="flex flex-col items-center md:items-start gap-5 mb-10" style={fadeInStyle(360)}>
                <Link to="/register" className="inline-flex items-center px-8 py-4 rounded-xl font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]" style={{ background: "linear-gradient(rgb(108, 99, 255) 0%, rgb(108, 99, 255) 100%)", boxShadow: "0 0 40px rgba(108,99,255,0.4), 0 10px 20px rgba(0,0,0,0.3)" }}>{t.landing.hero.cta}</Link>
                <div className="flex flex-col items-center md:items-start gap-3">
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "DM Sans, sans-serif" }}>{t.landing.hero.ctaSub}</span>
                  
                  {/* SOCIAL PROOF */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border mt-1" style={{ background: "rgba(34, 197, 94, 0.05)", borderColor: "rgba(34, 197, 94, 0.15)" }}>
                    <div className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </div>
                    <span className="text-[10px] md:text-[11px] font-medium" style={{ color: "rgba(34, 197, 94, 0.9)", fontFamily: "DM Sans, sans-serif" }}>
                      {t.landing.hero.socialProof}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="w-full" style={fadeInStyle(480)}>
              <LogoCarousel logos={BRANDS} />
            </div>
          </div>

          {/* DASHBOARD: Se mantiene visible pero se ajusta el padding en el layout general */}
          <div className="flex w-full md:w-1/2 relative" style={fadeInStyle(500)}>
            <div className="absolute inset-0 -z-10 pointer-events-none" style={{ background: "radial-gradient(circle, rgba(108, 99, 255, 0.2) 0%, transparent 70%)", filter: "blur(60px)", transform: "scale(1.1)" }} />
            <FakeDashboard />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-33.33%); } }
        .nav-btn-secondary-pro:hover { background: rgba(255, 255, 255, 0.08); border-color: rgba(108, 99, 255, 0.6) !important; color: white !important; transform: translateY(-1px); }
        .nav-btn-primary-animated:hover { transform: translateY(-2px); filter: brightness(1.1); box-shadow: 0 10px 25px rgba(108, 99, 255, 0.5); }
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
    <section 
      /* Mantenemos relative, py-24 y px-6 */
      className="relative py-24 px-6 overflow-hidden Seamless-Section" 
      /* Fondo plano idéntico a FeaturesSection */
      style={{ background: "var(--surface)" }} 
    >
      {/* ── PUENTE VISUAL: DIVISOR DE LUZ SUPERIOR ── */}
      <div 
        className="absolute top-0 left-0 w-full h-px"
        style={{ 
          background: "linear-gradient(to right, transparent, rgba(108, 99, 255, 0.3), transparent)",
          zIndex: 20 // Asegura que esté por encima de cualquier otro elemento
        }}
      />

      <div className="max-w-5xl mx-auto relative z-10">
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
            style={{ 
              fontFamily: "DM Sans, sans-serif", 
              color: "rgba(255, 255, 255, 0.5)" 
            }}
          >
            {t.landing.problem.sub}
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {problems.map((p, i) => (
            <Reveal key={p.title} delay={i * 80}>
              <div 
                className="problem-card-glow-border transition-all duration-500"
                style={{
                  border: "1px solid rgba(108, 99, 255, 0.2)",
                  borderRadius: "1.25rem",
                  background: "rgba(255, 255, 255, 0.02)",
                  backdropFilter: "blur(10px)",
                  padding: "2px" 
                }}
              >
                <ProblemCard {...p} />
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <style>{`
        .problem-card-glow-border:hover {
          border-color: rgba(108, 99, 255, 0.6) !important;
          background: rgba(108, 99, 255, 0.05);
          transform: translateY(-6px);
          box-shadow: 0 20px 40px -20px rgba(0,0,0,0.7), 0 0 20px rgba(108, 99, 255, 0.1);
        }
      `}</style>
    </section>
  );
}

function ProblemCard({ icon, title, desc }) {
  return (
    <>
      <div className="problem-card rounded-2xl p-6 border transition-colors duration-200 h-full">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
          style={{
            background: "rgba(108,99,255,0.12)",
            color: "var(--accent)",
          }}
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

      <style>{`
        .problem-card {
          background: var(--surface2);
          border-color: var(--border);
        }
        /* El hover de CSS es instantáneo y no se bloquea nunca */
        .problem-card:hover {
          border-color: var(--accent);
        }
      `}</style>
    </>
  );
}

// ─── Section 3 — The Solution ─────────────────────────────────────────────────
function HowItWorksSection() {
  const t = useT();
  const steps = [
    { num: "01", icon: <Plug size={24} strokeWidth={1.5} />, ...t.landing.solution.connect },
    { num: "02", icon: <BarChart3 size={24} strokeWidth={1.5} />, ...t.landing.solution.analyze },
    { num: "03", icon: <Zap size={24} strokeWidth={1.5} />, ...t.landing.solution.act },
  ];

  return (
    <section 
      className="relative py-32 px-6 overflow-hidden" 
      style={{ background: "#08080C" }}
    >
      <div className="absolute top-0 left-0 w-full h-px" style={{ background: "linear-gradient(to right, transparent, rgba(108, 99, 255, 0.3), transparent)" }} />

      <div className="max-w-5xl mx-auto relative z-10">
        <Reveal>
          <div className="text-center mb-14"> 
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
              className="text-center max-w-lg mx-auto"
              style={{ 
                fontFamily: "DM Sans, sans-serif", 
                color: "rgba(255, 255, 255, 0.5)" 
              }}
            >
              {t.landing.solution.sub}
            </p>
            {t.landing.solution.sub2 && (
              <p className="mt-2 opacity-30 text-xs" style={{ fontFamily: "DM Sans, sans-serif" }}>
                {t.landing.solution.sub2}
              </p>
            )}
          </div>
        </Reveal>

        <div className="relative">
          {/* ── LÍNEAS CONECTORAS (Ajustadas para visibilidad) ── */}
          <div className="hidden md:block absolute top-10 left-0 right-0 h-[2px] pointer-events-none" style={{ width: "66%", margin: "0 auto", zIndex: 0 }}>
            {/* Conexión 01 -> 02 */}
            <div 
              className="absolute top-0 left-0 h-full w-1/2"
              style={{
                paddingRight: "2rem",
                paddingLeft: "2rem",
                background: "linear-gradient(to right, #6C63FF, #8B85FF)",
                backgroundClip: "content-box",
                opacity: 0.4
              }}
            />
            {/* Conexión 02 -> 03 */}
            <div 
              className="absolute top-0 right-0 h-full w-1/2"
              style={{
                paddingLeft: "2rem",
                paddingRight: "2rem",
                background: "linear-gradient(to right, #8B85FF, #6C63FF)",
                backgroundClip: "content-box",
                opacity: 0.4
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative z-10">
            {steps.map((s, i) => (
              <Reveal key={s.num} delay={i * 100}>
                <div className="flex flex-col items-center group cursor-pointer">
                  {/* Círculo del Número */}
                  <div 
                    className="w-20 h-20 rounded-2xl flex items-center justify-center mb-10 relative transition-all duration-500 ease-out border" 
                    style={{ 
                      background: "rgba(8, 8, 12, 1)", // Fondo sólido para tapar la línea detrás
                      borderColor: "rgba(108, 99, 255, 0.4)", 
                      boxShadow: "inset 0 0 15px rgba(108, 99, 255, 0.1)" 
                    }}
                  >
                    <span className="font-mono text-2xl font-bold" style={{ color: "#8B85FF", textShadow: "0 0 10px rgba(108, 99, 255, 0.3)" }}>{s.num}</span>
                  </div>

                  <div className="mb-6 p-3 rounded-xl transition-all duration-500 bg-white/5" style={{ color: "#6C63FF", filter: "drop-shadow(0 0 8px rgba(108, 99, 255, 0.5))" }}>
                    {s.icon}
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4 transition-colors duration-300 text-white" style={{ fontFamily: "Syne, sans-serif" }}>
                    {s.title}
                  </h3>
                  
                  <p className="text-[15px] opacity-60 leading-relaxed text-center px-4 transition-all duration-300 group-hover:opacity-100" style={{ fontFamily: "DM Sans, sans-serif", color: "#E0E0FF" }}>
                    {s.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .group:hover div:first-of-type {
          transform: translateY(-12px);
          background: rgba(108, 99, 255, 0.15) !important;
          border-color: #6C63FF !important;
          box-shadow: 0 20px 40px -10px rgba(108, 99, 255, 0.5);
        }
        .group:hover div:nth-of-type(2) { 
          color: #8B85FF !important; 
          transform: scale(1.1); 
          filter: drop-shadow(0 0 12px rgba(108, 99, 255, 0.8)) !important; 
        }
      `}</style>
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
    /* He añadido 'relative' para posicionar el borde */
    <section className="relative py-24 px-6" style={{ background: "var(--surface)" }}>
      
      {/* ── PUENTE VISUAL: BORDE Y DEGRADADO SUPERIOR ── */}
      <div 
        className="absolute top-0 left-0 w-full h-px"
        style={{ 
          background: "linear-gradient(to right, transparent, rgba(108, 99, 255, 0.3), transparent)" 
        }}
      />

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
  // Eliminamos el useState y los eventos onMouseEnter/onMouseLeave
  return (
    <>
      <div className="feature-card rounded-2xl p-6 border transition-all duration-200 h-full">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
          style={{
            background: "rgba(108,99,255,0.12)",
            color: "var(--accent)",
          }}
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

      {/* Aplicamos exactamente el mismo comportamiento de color que tenías en el state */}
      <style>{`
        .feature-card {
          background: var(--surface2);
          border-color: var(--border);
        }
        /* El hover de CSS nunca falla, por muy rápido que muevas el ratón */
        .feature-card:hover {
          background: rgba(108,99,255,0.04);
          border-color: var(--accent);
        }
      `}</style>
    </>
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
    <section className="relative py-24 px-6" style={{ background: "var(--bg)" }}>
      
      {/* Divisor superior sutil */}
      <div 
        className="absolute top-0 left-0 w-full h-px"
        style={{ 
          background: "linear-gradient(to right, transparent, rgba(255, 255, 255, 0.1), transparent)" 
        }}
      />

      <div className="max-w-5xl mx-auto">
        <Reveal>
          <div className="text-center mb-16">
            <h2
              className="mb-4"
              style={{
                fontFamily: "Syne, sans-serif",
                fontWeight: 700,
                fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                letterSpacing: "-0.02em",
                color: "var(--text)",
              }}
            >
              {t.landing.metrics.heading}
            </h2>
            <p
              className="max-w-lg mx-auto"
              style={{
                fontFamily: "DM Sans, sans-serif",
                color: "var(--muted)",
              }}
            >
              {t.landing.metrics.sub}
            </p>
          </div>
        </Reveal>

        {/* Contenedor principal con borde marcado */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 rounded-2xl border overflow-hidden select-none"
          style={{
            borderColor: "rgba(255, 255, 255, 0.15)",
            background: "var(--surface2)",
          }}
        >
          {metrics.map((m, i) => (
            <div
              key={m.label}
              /* Bordes laterales y de base marcados para cada carta */
              className="metric-card relative border-r last:border-r-0 border-b md:border-b-0 border-white/10 flex transition-all duration-500 cursor-default"
            >
              <Reveal delay={i * 80} className="flex-1 flex w-full h-full">
                <div className="flex-1 flex flex-col items-center py-12 px-5 text-center">
                  
                  {/* Solo este contenedor sube (< 5 min, etc) */}
                  <div className="metric-value-container h-12 flex items-center justify-center mb-3 transition-all duration-500">
                    <span
                      className="font-mono font-semibold transition-colors duration-500"
                      style={{
                        fontSize: "clamp(1.5rem, 3vw, 2rem)",
                        color: "var(--accent)",
                      }}
                    >
                      {m.value}
                    </span>
                  </div>

                  {/* El subtítulo se queda fijo */}
                  <div
                    className="flex items-start justify-center"
                    style={{ minHeight: "2.5rem" }}
                  >
                    <span
                      className="text-[10px] sm:text-xs uppercase tracking-widest leading-tight transition-colors duration-500"
                      style={{
                        fontFamily: "DM Sans, sans-serif",
                        color: "var(--muted)",
                        maxWidth: "130px",
                      }}
                    >
                      {m.label}
                    </span>
                  </div>
                </div>
              </Reveal>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        /* Cambio al color específico #36363f solicitado */
        .metric-card:hover {
          background: #36363f !important;
          z-index: 10;
        }

        /* Solo sube el valor principal */
        .metric-card:hover .metric-value-container {
          transform: translateY(-10px);
        }

        /* Todo el texto pasa a blanco puro en hover */
        .metric-card:hover span {
          color: #ffffff !important;
        }

        /* Transiciones suaves para todos los elementos */
        .metric-card, .metric-value-container, span {
          transition: all 0.5s cubic-bezier(0.25, 1, 0.5, 1);
        }
      `}</style>
    </section>
  );
}
// ─── Section 6 — Pricing ──────────────────────────────────────────────────────
function PricingSection() {
  const t = useT();
  const { free, pro } = t.landing.pricing;

  return (
    <section className="relative py-24 px-6" style={{ background: "var(--surface)" }}>
      
      {/* ── DIVISOR DE SECCIÓN (5 a 6) ── */}
      <div 
        className="absolute top-0 left-0 w-full h-px"
        style={{ 
          background: "linear-gradient(to right, transparent, rgba(108, 99, 255, 0.3), transparent)" 
        }}
      />

      <div className="max-w-4xl mx-auto">
        <Reveal>
          {/* ── ENCABEZADO SINCRONIZADO CON PROBLEM SECTION ── */}
          <div className="text-center mb-14">
            <h2
              className="mb-4"
              style={{
                fontFamily: "Syne, sans-serif",
                fontWeight: 700,
                fontSize: "clamp(1.75rem, 4vw, 2.5rem)", // Sincronizado
                letterSpacing: "-0.02em",
                color: "var(--text)",
              }}
            >
              {t.landing.pricing.heading}
            </h2>
            <p
              className="max-w-lg mx-auto"
              style={{ 
                fontFamily: "DM Sans, sans-serif", 
                color: "rgba(255, 255, 255, 0.5)" // Color suavizado exacto
              }}
            >
              {t.landing.pricing.sub}
            </p>
          </div>
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
                className="pricing-btn-free w-full text-center py-3 rounded-xl text-sm font-semibold border transition-colors duration-150 block"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--text)",
                  fontFamily: "DM Sans, sans-serif",
                }}
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
                className="pricing-btn-pro w-full text-center py-3 rounded-xl text-sm font-semibold text-white transition-colors duration-150 block"
                style={{
                  background: "var(--accent)",
                  fontFamily: "DM Sans, sans-serif",
                }}
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

      <style>{`
        .pricing-btn-free:hover {
          border-color: var(--accent) !important;
        }
        .pricing-btn-pro:hover {
          background: var(--accent2) !important;
        }
      `}</style>
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
        className="absolute top-0 left-0 w-full h-px"
        style={{ 
          background: "linear-gradient(to right, transparent, rgba(108, 99, 255, 0.3), transparent)",
          zIndex: 20 
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(108,99,255,0.07) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <Reveal>
          <h2
            className="mb-6"
            style={{
              fontFamily: "Bricolage Grotesque, sans-serif",
              fontWeight: 800,
              // Usamos exactamente la misma medida del Hero
              fontSize: "clamp(2.2rem, 5vw, 4.2rem)", 
              lineHeight: "1.1",
              letterSpacing: "-0.04em",
              color: "var(--text)",
            }}
          >
            {cta.heading}{" "}
            <span style={{ color: "var(--accent)" }}>{cta.headingAccent}</span>
          </h2>
          <p
            className="mb-10 text-base md:text-lg mx-auto"
            style={{ 
              fontFamily: "DM Sans, sans-serif", 
              color: "var(--muted)",
              maxWidth: "540px", // Un poco más ancho para equilibrar el h2 más grande
              lineHeight: "1.6"
            }}
          >
            {cta.sub}
          </p>

          <Link
            to="/register"
            className="cta-final-btn inline-block px-10 py-4 rounded-xl text-base font-semibold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "var(--accent)",
              fontFamily: "DM Sans, sans-serif",
              boxShadow: "0 10px 30px rgba(108, 99, 255, 0.3)"
            }}
          >
            {cta.cta}
          </Link>

          <p
            className="mt-6 text-xs md:text-sm"
            style={{ color: "var(--muted)", fontFamily: "DM Sans, sans-serif", opacity: 0.6 }}
          >
            {cta.ctaSub}
          </p>
        </Reveal>
      </div>

      <style>{`
        .cta-final-btn:hover {
          background: var(--accent2) !important;
          box-shadow: 0 15px 40px rgba(108, 99, 255, 0.45);
        }
      `}</style>
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
      /* Eliminamos border-t para usar nuestro divisor de luz */
      className="relative px-6 py-10"
      style={{ background: "var(--surface)" }}
    >
      {/* ── DIVISOR DE SECCIÓN (7 a Footer) ── */}
      <div 
        className="absolute top-0 left-0 w-full h-px"
        style={{ 
          background: "linear-gradient(to right, transparent, rgba(108, 99, 255, 0.3), transparent)" 
        }}
      />

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:grid md:grid-cols-3 items-center gap-8 md:gap-4">
          <div className="w-full flex justify-center md:justify-start">
            <Link to="/">
              <Logo />
            </Link>
          </div>

          <div className="w-full flex items-center gap-6 sm:gap-8 justify-center order-3 md:order-2">
            {[
              { to: "/privacy", label: t.landing.footer.privacy },
              { to: "/terms", label: t.landing.footer.terms },
              { to: "/contact", label: t.landing.footer.contact },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="footer-nav-link text-sm transition-colors duration-150 whitespace-nowrap"
                style={{
                  color: "var(--muted)",
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="w-full flex justify-center md:justify-end order-2 md:order-3">
            <div className="flex items-center gap-1 rounded-lg border border-[var(--border)] p-1">
              {langs.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveLang(lang)}
                  className={`lang-btn px-3 py-1 rounded-md text-xs font-semibold transition-colors duration-150 ${
                    activeLang === lang ? "active" : ""
                  }`}
                  style={{ fontFamily: "DM Sans, sans-serif" }}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div
          className="mt-12 pt-6 text-center text-xs border-t"
          style={{
            borderColor: "var(--border)",
            color: "var(--muted)",
            fontFamily: "DM Sans, sans-serif",
          }}
        >
          {t.landing.footer.copyright}
        </div>
      </div>

      <style>{`
        .footer-nav-link:hover {
          color: var(--text) !important;
        }
        .lang-btn {
          background: transparent;
          color: var(--muted);
        }
        .lang-btn.active {
          background: var(--accent) !important;
          color: white !important;
        }
        .lang-btn:not(.active):hover {
          color: var(--text) !important;
          background: rgba(255, 255, 255, 0.05) !important;
        }
      `}</style>
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
