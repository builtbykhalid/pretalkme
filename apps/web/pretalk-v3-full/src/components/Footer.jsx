import { Link } from "react-router-dom";
import { Badge } from "./ui";

const COLS = [
  { title:"Produit", links:[{l:"Fonctionnalités",h:"/fonctionnalites"},{l:"Comment ça marche",h:"/comment-ca-marche"},{l:"Tarifs",h:"/tarifs"},{l:"Changelog",h:"#"},{l:"Roadmap",h:"#"}] },
  { title:"Ressources", links:[{l:"Blog & Cas clients",h:"/blog"},{l:"Documentation",h:"#"},{l:"Affiliation 40%",h:"#"},{l:"Support",h:"/contact"}] },
  { title:"Légal", links:[{l:"Mentions légales",h:"#"},{l:"CGU",h:"#"},{l:"Politique RGPD",h:"#"},{l:"Cookies",h:"#"}] },
];

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/[0.07] pt-16">
      <div className="max-w-[1160px] mx-auto px-8 grid grid-cols-[2fr_1fr_1fr_1fr] gap-12 pb-14">
        <div>
          <Link to="/" className="flex items-center gap-2.5 no-underline mb-3">
            <div className="w-[30px] h-[30px] bg-black border border-white/20 rounded-[7px] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M8 3l5 5-5 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span className="text-[17px] font-bold text-white tracking-[-0.4px]">pretalk</span>
          </Link>
          <p className="text-[13px] text-white/40 leading-[1.65] max-w-[240px] mb-4">L'OS du Consultant Moderne. Qualifiez, closez, fidélisez — en automatique.</p>
          <Badge variant="green" dot className="text-[10.5px]">Statut : Opérationnel</Badge>
        </div>
        {COLS.map((col) => (
          <div key={col.title}>
            <p className="text-[10.5px] font-bold tracking-[0.09em] uppercase text-white/28 mb-4">{col.title}</p>
            <ul className="flex flex-col gap-2.5">
              {col.links.map((lk) => (
                <li key={lk.l}>
                  <Link to={lk.h} className="text-[13.5px] text-white/48 no-underline hover:text-white transition-colors duration-150">{lk.l}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="max-w-[1160px] mx-auto px-8 py-5 border-t border-white/[0.07] flex items-center justify-between text-xs text-white/25">
        <span>© 2025 Pretalk. Tous droits réservés.</span>
        <span>Made with ♥ pour les consultants exigeants.</span>
      </div>
      {/* Blur watermark */}
      <div className="group text-center overflow-hidden pointer-events-none select-none">
        <p className="text-[clamp(80px,16vw,200px)] font-black tracking-[-6px] text-white/[0.025] leading-none whitespace-nowrap blur-[3px] group-hover:blur-0 group-hover:text-white/[0.045] transition-all duration-500">
          pretalk
        </p>
      </div>
    </footer>
  );
}
