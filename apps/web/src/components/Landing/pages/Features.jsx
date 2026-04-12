
import { Badge, Btn, Reveal, SL, ST, GlassCard, Check, CheckCircle, ArrowRight, ImgPh } from "../ui";
import { FEATURES } from "../../../data/landing/index";

const BADGE_V = { violet:"violet", green:"green", gray:"gray", amber:"amber" };

const ICONS = {
  audit: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="9.5" cy="9.5" r="6.5" stroke="white" strokeWidth="1.8"/><path d="M14.5 14.5L19 19" stroke="white" strokeWidth="1.8" strokeLinecap="round"/><path d="M7.5 9.5h4M9.5 7.5v4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  scoring: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M3 15l4.5-5.5 3.5 3 5-7.5 4 4" stroke="#16A34A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  forms: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3" y="5" width="16" height="12" rx="2" stroke="#7C3AED" strokeWidth="1.7"/><path d="M7 9h8M7 12h5" stroke="#7C3AED" strokeWidth="1.4" strokeLinecap="round"/><circle cx="18" cy="4" r="2.5" fill="#22C55E"/></svg>,
  proposals: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-6-5z" stroke="#F59E0B" strokeWidth="1.7"/><path d="M14 3v5h5M8 12h6M8 15h4" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  analytics: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M3 15l4-6 4 3.5 4-7 4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  crm: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3" y="5" width="5" height="14" rx="1.5" stroke="white" strokeWidth="1.7"/><rect x="9" y="5" width="5" height="14" rx="1.5" stroke="white" strokeWidth="1.7"/><rect x="15" y="5" width="5" height="14" rx="1.5" stroke="white" strokeWidth="1.7"/></svg>,
};
const ICON_BG = { audit:"bg-black", scoring:"bg-green-100", forms:"bg-violet-100", proposals:"bg-amber-100", analytics:"bg-black", crm:"bg-black" };

export default function Features() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 px-6 md:px-8 max-w-7xl mx-auto scroll-mt-24 bg-white">
        <div className="text-center space-y-6">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary-500/20 text-primary-600 text-[10px] font-black uppercase tracking-[0.2em] bg-white shadow-sm mx-auto mb-4">
              Fonctionnalités
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="text-4xl md:text-6xl font-black text-dark tracking-tighter leading-tight">
              L'OS complet du <span className="text-primary-500">consultant.</span>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="text-neutral-500 font-medium max-w-2xl mx-auto text-lg leading-relaxed">
              Audit IA, scoring, formulaires, devis, CRM, analytics. Pretalk remplace toute votre stack de vente et la fait travailler en harmonie.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="flex items-center justify-center gap-3 pt-4">
              <Btn href="/tarifs" variant="black" size="lg">Essayer gratuitement <ArrowRight/></Btn>
              <Btn href="/comment-ca-marche" variant="outline" size="lg">Voir la démo</Btn>
            </div>
          </Reveal>
        </div>
      </section>


      {/* Feature sections */}
      {FEATURES.map((f, i) => (
        <section key={f.id} id={f.id} className={`py-24 px-8 ${i%2===0?"bg-white":"bg-gray-50"}`}>
          <div className="max-w-[1160px] mx-auto">
            <div className={`grid grid-cols-2 gap-16 items-center ${i%2===1?"":"grid-flow-row"}`}>
              <div className={i%2===1?"order-2":""}>
                <Reveal dir={i%2===0?"left":"right"}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${ICON_BG[f.id]||"bg-gray-100"}`}>
                    {ICONS[f.id]}
                  </div>
                  <Badge variant={BADGE_V[f.badgeColor]||"gray"} className="mb-4">{f.badge}</Badge>
                  <h2 className="text-[clamp(24px,2.8vw,36px)] font-extrabold tracking-[-1.2px] leading-[1.1] text-black mb-5">{f.title}</h2>
                  <p className="text-[15.5px] text-gray-500 leading-[1.72] mb-6">{f.desc}</p>
                  <ul className="flex flex-col gap-3 mb-8">
                    {f.points.map((pt, j) => (
                      <li key={j} className="flex items-start gap-3 text-[14px] text-gray-800">
                        <CheckCircle/>{pt}
                      </li>
                    ))}
                  </ul>
                  <Btn href="/tarifs" variant={i===0?"black":"outline"} size="md">
                    {i===0?"Essayer maintenant":"En savoir plus"} <ArrowRight/>
                  </Btn>
                </Reveal>
              </div>
              <div className={i%2===1?"order-1":""}>
                <Reveal delay={120} dir={i%2===0?"right":"left"}>
                  <ImgPh h={340} label={`Interface ${f.badge} · 600×340px`}/>
                </Reveal>
              </div>
            </div>
          </div>
        </section>
      ))}

    </>
  );
}
