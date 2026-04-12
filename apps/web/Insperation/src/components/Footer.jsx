import { Badge } from "./ui";

import LogoComponent from "../../src/components/ReactApp/components/ui/Logo";
const COLS = [
  {
    title: "Produit",
    links: ["Fonctionnalités", "Tarifs", "Changelog", "Roadmap", "API"],
  },
  {
    title: "Ressources",
    links: ["Documentation", "Blog", "Cas clients", "Affiliation 40%", "Support"],
  },
  {
    title: "Légal",
    links: ["Mentions légales", "CGU", "Politique RGPD", "Cookies"],
  },
];

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/[0.07] pt-16">
      {/* Grid */}
      <div className="max-w-[1160px] mx-auto px-8 grid grid-cols-[2fr_1fr_1fr_1fr] gap-12 pb-14">
        {/* Brand */}
        <div>
          <a href="/" className="flex items-center gap-2.5 no-underline mb-4 group">
            <LogoComponent size="md" logoColor="white" textColor="text-white" showText={true} />
          </a>
          <p className="text-[13px] text-white/38 leading-[1.65] max-w-[240px] mb-4">
            L'OS du Consultant Moderne. Qualifiez, closez, fidélisez — en automatique.
          </p>
          <Badge variant="green" dot className="text-[10.5px]">Statut : Opérationnel</Badge>
        </div>

        {/* Cols */}
        {COLS.map((col) => (
          <div key={col.title}>
            <p className="text-[10.5px] font-bold tracking-[0.09em] uppercase text-white/28 mb-4">{col.title}</p>
            <ul className="flex flex-col gap-2.5">
              {col.links.map((link) => (
                <li key={link}>
                  <a href="#" className="text-[13.5px] text-white/48 no-underline hover:text-white transition-colors duration-150">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="max-w-[1160px] mx-auto px-8 py-[22px] border-t border-white/[0.07] flex items-center justify-between text-xs text-white/28">
        <span>© 2025 Pretalk. Tous droits réservés.</span>
        <span>Made with ♥ pour les consultants exigeants.</span>
      </div>

      {/* Blur watermark */}
      <div className="group text-center overflow-hidden pointer-events-none select-none pb-0">
        <p className="text-[clamp(80px,16vw,200px)] font-black tracking-[-6px] text-white/[0.025] leading-none whitespace-nowrap filter blur-[3px] group-hover:blur-0 group-hover:text-white/[0.05] transition-all duration-500">
          pretalk
        </p>
      </div>
    </footer>
  );
}
