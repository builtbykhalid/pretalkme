import { useEffect, useRef, useState } from "react";

// ── BADGE ──────────────────────────────────────────────────
const V = { green:"bg-green-100 text-green-700", violet:"bg-violet-100 text-violet-600", gray:"bg-gray-100 text-gray-500", amber:"bg-amber-100 text-amber-600", black:"bg-black text-white", white:"bg-white text-black" };
export function Badge({ variant="green", dot=false, children, className="" }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full tracking-wide ${V[variant]||V.green} ${className}`}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulseGlow"/>}
      {children}
    </span>
  );
}

// ── BUTTON ─────────────────────────────────────────────────
const BV = {
  black:   "bg-black text-white hover:bg-gray-900 hover:shadow-lg",
  white:   "bg-white text-black hover:bg-gray-50 hover:shadow-lg",
  outline: "border-[1.5px] border-gray-200 text-black hover:border-gray-400 bg-transparent",
  "outline-dark":"border-[1.5px] border-white/20 text-white hover:border-white/50 bg-transparent",
  green:   "bg-green-500 text-white hover:bg-green-600 hover:shadow-lg",
};
const BS = { sm:"text-xs px-3.5 py-1.5", md:"text-[13.5px] px-[18px] py-2", lg:"text-[15px] px-7 py-3.5" };
export function Btn({ href, to, children, variant="black", size="md", className="", onClick, type="button" }) {
  const cls = `inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 hover:-translate-y-px cursor-pointer ${BS[size]} ${BV[variant]||BV.black} ${className}`;
  if (onClick || !href && !to) return <button type={type} onClick={onClick} className={cls}>{children}</button>;
  if (to) {
    // Use anchor for SPA links via hash
    return <a href={to} className={cls}>{children}</a>;
  }
  return <a href={href} className={cls}>{children}</a>;
}

// ── ICONS ──────────────────────────────────────────────────
export const ArrowRight = ({ size=16, color="currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M3 8h10M9 4l4 4-4 4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
export const Check = () => (
  <svg className="flex-shrink-0 mt-0.5 text-green-500" width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M3 7l3 3 5-5" stroke="#22C55E" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
export const CheckCircle = () => (
  <svg className="flex-shrink-0" width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="7" fill="#DCFCE7"/>
    <path d="M5 8l2 2 4-4" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
export const ChevronDown = ({ className="" }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
export const PlayIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M5.5 5.5l3 1.5-3 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
export const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M7 4v3.5l2.5 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ── SECTION HEADER UTILS ───────────────────────────────────
export function SL({ children, light=false }) {
  return <p className={`text-[11px] font-bold tracking-[0.1em] uppercase mb-3.5 ${light?"text-white/40":"text-gray-400"}`}>{children}</p>;
}
export function ST({ children, light=false, className="" }) {
  return <h2 className={`text-[clamp(26px,3.4vw,46px)] font-extrabold leading-[1.08] tracking-[-1.4px] ${light?"text-white":"text-black"} ${className}`}>{children}</h2>;
}

// ── GLASS CARD ─────────────────────────────────────────────
export function GlassCard({ children, className="" }) {
  return <div className={`glass-card rounded-2xl ${className}`}>{children}</div>;
}

// ── REVEAL HOOK ────────────────────────────────────────────
export function useReveal(threshold=0.12) {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current; if(!el) return;
    const obs = new IntersectionObserver(([e]) => { if(e.isIntersecting){ setV(true); obs.unobserve(el); }}, { threshold, rootMargin:"0px 0px -48px 0px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, v };
}

// ── REVEAL WRAPPER ─────────────────────────────────────────
const FROM = { up:"opacity-0 translate-y-7", left:"opacity-0 -translate-x-7", right:"opacity-0 translate-x-7", fade:"opacity-0 scale-[0.97]" };
export function Reveal({ children, delay=0, dir="up", className="" }) {
  const { ref, v } = useReveal();
  return (
    <div ref={ref} className={`transition-all duration-[680ms] ease-spring ${v?"opacity-100 translate-x-0 translate-y-0 scale-100":FROM[dir]} ${className}`} style={{ transitionDelay:`${delay}ms` }}>
      {children}
    </div>
  );
}

// ── FEATURE IMG PLACEHOLDER ────────────────────────────────
export function ImgPh({ h=240, label }) {
  return (
    <div className="w-full bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl border-[1.5px] border-dashed border-gray-200 flex flex-col items-center justify-center gap-3 text-gray-300 text-[11px] font-semibold uppercase tracking-[0.07em] text-center p-8" style={{height:h}}>
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" opacity=".4">
        <rect x="4" y="4" width="32" height="32" rx="6" stroke="currentColor" strokeWidth="2"/>
        <circle cx="15" cy="16" r="4" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M4 30l9-9 6 6 6-8 11 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {label}
    </div>
  );
}

// ── SCROLL PROGRESS ────────────────────────────────────────
export function ScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const fn = () => setP(window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100);
    window.addEventListener("scroll", fn, { passive:true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return <div className="fixed top-0 left-0 h-[2px] bg-green-500 z-[9999] pointer-events-none transition-[width] duration-100" style={{width:`${p}%`}}/>;
}

// ── SMOOTH SCROLL LINK ─────────────────────────────────────
export function SmoothLink({ href, children, className="", onClick }) {
  const handle = (e) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior:"smooth" });
    }
    onClick?.();
  };
  return <a href={href} onClick={handle} className={className}>{children}</a>;
}
