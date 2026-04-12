import { useEffect, useRef, useState } from "react";

// ── BADGE ──────────────────────────────────────────────────
const variantMap = {
  green: "bg-green-100 text-green-800",
  violet: "bg-violet-100 text-violet-600",
  gray: "bg-gray-100 text-gray-500",
  amber: "bg-amber-100 text-amber-600",
  "green-dark": "bg-green-100 text-green-800",
};

export function Badge({ variant = "green", dot = false, children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-2.5 py-1 rounded-full ${variantMap[variant]} ${className}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full bg-current ${variant === "green" ? "animate-pulse" : ""}`} />
      )}
      {children}
    </span>
  );
}

// ── BUTTONS ────────────────────────────────────────────────
export function BtnPrimary({ href = "#", children, className = "", white = false }) {
  return (
    <a
      href={href}
      className={`inline-flex items-center gap-2 text-[13.5px] font-semibold px-[18px] py-2 rounded-xl transition-all duration-200 hover:-translate-y-px hover:shadow-md
        ${white ? "bg-white text-black hover:bg-gray-100" : "bg-black text-white hover:bg-gray-800"} ${className}`}
    >
      {children}
    </a>
  );
}

export function BtnOutline({ href = "#", children, className = "", dark = false }) {
  return (
    <a
      href={href}
      className={`inline-flex items-center gap-2 text-[13.5px] font-medium px-[18px] py-2 rounded-xl border-[1.5px] transition-all duration-150
        ${dark ? "border-white/20 text-white hover:border-white/50" : "border-gray-200 text-black hover:border-gray-400"} ${className}`}
    >
      {children}
    </a>
  );
}

export function BtnHero({ href = "#", children, className = "", white = false }) {
  return (
    <a
      href={href}
      className={`inline-flex items-center gap-2 text-[15px] font-bold px-7 py-3.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(0,0,0,0.16)]
        ${white ? "bg-white text-black" : "bg-black text-white hover:bg-gray-800"} ${className}`}
    >
      {children}
    </a>
  );
}

// ── SECTION HEADER ─────────────────────────────────────────
export function SectionLabel({ children, light = false }) {
  return (
    <p className={`text-[11px] font-bold tracking-[0.1em] uppercase mb-3.5 ${light ? "text-white/40" : "text-gray-400"}`}>
      {children}
    </p>
  );
}

export function SectionTitle({ children, light = false, className = "" }) {
  return (
    <h2
      className={`text-[clamp(30px,3.8vw,50px)] font-extrabold leading-[1.08] tracking-[-1.5px] ${light ? "text-white" : "text-black"} ${className}`}
    >
      {children}
    </h2>
  );
}

// ── CHECK ICON ─────────────────────────────────────────────
export function CheckIcon() {
  return (
    <svg className="text-green-500 flex-shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3 7l3 3 5-5" stroke="#22C55E" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── ARROW ICON ─────────────────────────────────────────────
export function ArrowIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M3 8h10M9 4l4 4-4 4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── PLAY ICON ──────────────────────────────────────────────
export function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5.5 5.5l3 1.5-3 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── REVEAL HOOK ────────────────────────────────────────────
export function useReveal(threshold = 0.1) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

// ── REVEAL WRAPPER ─────────────────────────────────────────
export function Reveal({ children, delay = 0, className = "" }) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={`transition-all duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-7"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ── FEATURE IMAGE PLACEHOLDER ──────────────────────────────
export function FeaturePlaceholder({ height = 220, label, icon }) {
  return (
    <div
      className="w-full bg-gray-100 rounded-2xl border-[1.5px] border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 text-[11px] font-semibold uppercase tracking-[0.06em] text-center p-4"
      style={{ height }}
    >
      <div className="opacity-25">{icon}</div>
      {label}
    </div>
  );
}

// ── PERSONA PHOTO PLACEHOLDER ──────────────────────────────
export function PersonaPhoto({ label, bg = "bg-gray-100", border = "border-gray-200" }) {
  return (
    <div className={`w-16 h-16 rounded-xl ${bg} mb-[18px] overflow-hidden border-[1.5px] border-dashed ${border} flex items-center justify-center`}>
      <span className="text-[10px] text-gray-400 font-semibold text-center leading-snug uppercase px-1">{label}</span>
    </div>
  );
}
