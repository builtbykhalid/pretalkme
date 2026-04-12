import { useEffect, useRef, useState } from "react";

// ── BADGE ──────────────────────────────────────────────────
const V = { 
  green: "bg-primary-50 text-primary-600 border border-primary-100", 
  violet: "bg-accent-50 text-accent-600 border border-accent-100", 
  gray: "bg-neutral-50 text-neutral-500 border border-neutral-100", 
  amber: "bg-amber-50 text-amber-600 border border-amber-100", 
  black: "bg-dark text-white", 
  white: "bg-white text-dark border border-neutral-200" 
};
export function Badge({ variant="green", dot=false, children, className="" }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] uppercase font-bold px-3 py-1 rounded-full tracking-wider shadow-sm ${V[variant]||V.green} ${className}`}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"/>}
      {children}
    </span>
  );
}

// ── BUTTON ─────────────────────────────────────────────────
const BV = {
  black:   "bg-dark text-white hover:bg-black hover:shadow-xl hover:shadow-black/10",
  white:   "bg-white text-dark hover:bg-neutral-50 hover:shadow-xl border border-neutral-200",
  outline: "border-[1.5px] border-neutral-200 text-dark hover:border-dark bg-transparent",
  "outline-dark":"border-[1.5px] border-white/20 text-white hover:border-white/50 bg-transparent",
  green:   "bg-[#48D951] text-white hover:bg-[#3ec947] hover:shadow-xl hover:shadow-[#48D951]/30",
  violet:  "bg-[#221A40] text-white hover:bg-[#1a1433] hover:shadow-xl shadow-[#221A40]/30",
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
  <svg className="flex-shrink-0 mt-0.5" style={{ color: '#48D951' }} width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M3 7l3 3 5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
export const CheckCircle = () => (
  <svg className="flex-shrink-0" width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="7" fill="#D9F9DC"/>
    <path d="M5 8l2 2 4-4" stroke="#48D951" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
export const Tag = ({ size=16, color="currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
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
  return <div className="fixed top-0 left-0 h-[2px] bg-primary-500 z-[9999] pointer-events-none transition-[width] duration-100" style={{width:`${p}%`}}/>;
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

// ── ALIASES & COMPATIBILITY ────────────────────────────────
export const SectionLabel = SL;
export const SectionTitle = ST;
export const FeaturePlaceholder = ImgPh;
export const ArrowIcon = ArrowRight;
export const CheckIcon = CheckCircle;

export function BtnPrimary({ children, className = "", ...props }) {
    return <Btn variant="black" className={className} {...props}>{children}</Btn>;
}

export function BtnOutline({ children, className = "", dark = false, ...props }) {
    return <Btn variant={dark ? "outline-dark" : "outline"} className={className} {...props}>{children}</Btn>;
}

export function BtnHero({ children, className = "", white = false, ...props }) {
    // If white prop is true, use white variant, otherwise green as default for Hero
    return <Btn variant={white ? "white" : "green"} size="lg" className={className} {...props}>{children}</Btn>;
}

export function PersonaPhoto({ label, bg = "bg-gray-50", border = "border-gray-200" }) {
    return (
        <div className={`w-14 h-14 rounded-2xl ${bg} border-[1.5px] border-dashed ${border} flex items-center justify-center text-center p-2 mb-6 text-gray-400`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" opacity=".5">
                <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M3 18l5-5 3 3 5-7 5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </div>
    );
}
