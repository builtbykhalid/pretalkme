import { useState, useEffect, useRef } from "react";
import { Badge, ChevronDown, ArrowRight } from "./ui";
import { NAV_FEATURES, CASE_STUDIES } from "../../data/landing/index";
import LogoComponent from "../ReactApp/components/ui/Logo";

function Logo() {
  return (
    <a href="/" className="flex items-center gap-2.5 no-underline flex-shrink-0 group">
      <LogoComponent size="md" textColor="text-[#221A40]" showText={true} />
    </a>
  );
}

// ── MEGA MENU — Fonctionnalités ────────────────────────────
function MegaFeatures({ onClose }) {
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[760px] glass rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] animate-slideDown overflow-hidden">
      <div className="p-6">
        <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-gray-400 mb-4">Fonctionnalités</p>
        <div className="grid grid-cols-3 gap-2.5">
          {NAV_FEATURES.map((f, i) => (
            <a key={i} href={`/fonctionnalites#${f.label.toLowerCase().replace(/\s+/g,"-")}`} onClick={onClose}
              className="group flex items-start gap-3 p-3 rounded-xl hover:bg-white/70 transition-all duration-150">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${f.color}`}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                  <path d={f.iconPath} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <p className="text-[13px] font-semibold text-black group-hover:text-green-700 transition-colors">{f.label}</p>
                <p className="text-[11.5px] text-gray-500 mt-0.5 leading-snug">{f.desc}</p>
              </div>
            </a>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-[12px] text-gray-500">Découvrez toutes les fonctionnalités →</p>
          <a href="/fonctionnalites" onClick={onClose}
            className="text-[12px] font-semibold text-black hover:text-green-700 transition-colors flex items-center gap-1">
            Voir tout <ArrowRight size={12}/>
          </a>
        </div>
      </div>
    </div>
  );
}

// ── MEGA MENU — Case Studies ───────────────────────────────
function MegaCaseStudies({ onClose }) {
  const featured = CASE_STUDIES.find(c => c.featured);
  const rest = CASE_STUDIES.filter(c => !c.featured).slice(0, 3);
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[820px] glass rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] animate-slideDown overflow-hidden">
      <div className="p-6">
        <div className="grid grid-cols-[1.6fr_1fr] gap-5">
          {/* Featured */}
          {featured && (
            <a href={`/blog/${featured.slug}`} onClick={onClose}
              className="group relative overflow-hidden rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-200 hover:shadow-md">
              <img src={featured.cover} alt={featured.title} className="w-full h-[160px] object-cover group-hover:scale-105 transition-transform duration-500"/>
              <div className="p-4">
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 ${featured.badgeClass}`}>{featured.category}</span>
                <p className="text-[13.5px] font-semibold text-black leading-snug group-hover:text-green-700 transition-colors">{featured.title}</p>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-400">
                  <span>{featured.readTime} de lecture</span>
                  <span>·</span>
                  <span>{featured.date}</span>
                </div>
                <div className="flex gap-2 mt-3">
                  {featured.metrics.map((m, i) => (
                    <div key={i} className="glass-card px-2.5 py-1 rounded-lg">
                      <span className={`text-[13px] font-bold ${m.color}`}>{m.value}</span>
                      <span className="text-[10px] text-gray-500 ml-1">{m.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </a>
          )}
          {/* List */}
          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-gray-400 mb-2">Derniers cas clients</p>
            {rest.map((cs, i) => (
              <a key={i} href={`/blog/${cs.slug}`} onClick={onClose}
                className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/70 transition-all">
                <img src={cs.cover} alt="" className="w-10 h-10 object-cover rounded-lg flex-shrink-0"/>
                <div className="min-w-0">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${cs.badgeClass}`}>{cs.category}</span>
                  <p className="text-[12px] font-semibold text-black leading-snug mt-0.5 group-hover:text-green-700 transition-colors line-clamp-2">{cs.title}</p>
                </div>
              </a>
            ))}
            <a href="/blog" onClick={onClose} className="mt-3 text-[12px] font-semibold text-black hover:text-green-700 flex items-center gap-1 transition-colors px-2.5">
              Tous les cas clients <ArrowRight size={12}/>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MAIN HEADER ────────────────────────────────────────────
export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(null); // "features" | "blog" | null
  const ref = useRef(null);
  // Removed useLocation for Astro compatibility

  useEffect(() => {
    window.addEventListener("scroll", () => setScrolled(window.scrollY > 20), { passive:true });
  }, []);

  // Close on route change - disabled for Astro (full page reloads)
  // useEffect(() => { setOpen(null); }, [loc]);

  // Close on outside click
  useEffect(() => {
    const fn = (e) => { if(ref.current && !ref.current.contains(e.target)) setOpen(null); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const nav = [
    { label:"Fonctionnalités", key:"features", href:"/fonctionnalites" },
    { label:"Comment ça marche", href:"/comment-ca-marche" },
    { label:"Blog & Cas clients", key:"blog", href:"/blog" },
    { label:"Tarifs", href:"/tarifs" },
  ];

  return (
    <header ref={ref} className={`fixed top-0 left-0 right-0 z-50 h-[60px] flex items-center border-b border-black/[0.06] transition-all duration-300 ${scrolled?"glass shadow-[0_2px_20px_rgba(0,0,0,0.07)]":"bg-white/90 backdrop-blur-xl"}`}>
      <div className="max-w-[1160px] mx-auto px-8 w-full flex items-center justify-between">
        <Logo/>
        <nav className="flex items-center gap-0.5">
          {nav.map((item) => (
            <div key={item.label} className="relative">
              {item.key ? (
                <button
                  onClick={() => setOpen(open===item.key ? null : item.key)}
                  className={`flex items-center gap-1 text-[13.5px] font-medium px-3 py-1.5 rounded-lg transition-all duration-150 ${open===item.key?"bg-gray-100 text-black":"text-gray-600 hover:text-black hover:bg-gray-100"}`}
                >
                  {item.label}
                  <ChevronDown className={`transition-transform duration-200 ${open===item.key?"rotate-180":""}`}/>
                </button>
              ) : (
                <a href={item.href} className="text-[13.5px] font-medium text-gray-600 hover:text-black hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-all duration-150 block">
                  {item.label}
                </a>
              )}
              {item.key==="features" && open==="features" && <MegaFeatures onClose={()=>setOpen(null)}/>}
              {item.key==="blog" && open==="blog" && <MegaCaseStudies onClose={()=>setOpen(null)}/>}
            </div>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a href="/app/login" className="text-[13.5px] font-medium text-gray-700 px-4 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            Se connecter
          </a>
          <a href="/app/login" className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-white bg-black px-4 py-2 rounded-xl hover:bg-gray-800 hover:-translate-y-px hover:shadow-md transition-all duration-200">
            Essai gratuit
            <ArrowRight size={13}/>
          </a>
        </div>
      </div>
      {/* Overlay */}
      {open && <div className="fixed inset-0 top-[60px] bg-black/10 -z-10" onClick={()=>setOpen(null)}/>}
    </header>
  );
}
