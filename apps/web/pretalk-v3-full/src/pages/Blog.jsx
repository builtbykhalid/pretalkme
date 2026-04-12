import { useState } from "react";
import { Link } from "react-router-dom";
import { Btn, Reveal, SL, ST, Badge, ArrowRight, ClockIcon } from "../components/ui";
import { CASE_STUDIES } from "../data/index";

const ALL_TAGS = ["Tous", ...new Set(CASE_STUDIES.flatMap(c => c.tags))];

function CaseCard({ cs, featured=false }) {
  return (
    <Link to={`/blog/${cs.slug}`} className={`group block no-underline bg-white border border-gray-200 rounded-3xl overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-[280ms] ease-spring ${featured?"col-span-2":""}`}>
      <div className={`relative overflow-hidden ${featured?"h-[280px]":"h-[200px]"}`}>
        <img src={cs.cover} alt={cs.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"/>
        <span className={`absolute top-4 left-4 text-[10px] font-bold px-2.5 py-1 rounded-full ${cs.badgeClass}`}>{cs.category}</span>
      </div>
      <div className="p-6">
        <div className="flex items-center gap-3 text-[11.5px] text-gray-400 mb-3">
          <ClockIcon/><span>{cs.readTime} de lecture</span>
          <span>·</span>
          <span>{cs.date}</span>
        </div>
        <h3 className={`font-bold text-black leading-snug mb-3 group-hover:text-green-700 transition-colors ${featured?"text-[20px]":"text-[16px]"}`}>{cs.title}</h3>
        {featured && <p className="text-[13.5px] text-gray-500 leading-[1.65] mb-4">{cs.excerpt}</p>}
        {/* Metrics */}
        <div className="flex flex-wrap gap-2 mb-4">
          {cs.metrics.slice(0,3).map((m,i)=>(
            <div key={i} className="bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl">
              <span className={`text-[13px] font-extrabold ${m.color}`}>{m.value}</span>
              <span className="text-[10px] text-gray-400 ml-1">{m.label}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <img src={cs.author.avatar} alt="" className="w-6 h-6 rounded-full object-cover"/>
          <span className="text-[12px] text-gray-500">{cs.author.name}</span>
          <ArrowRight size={14} color="#9CA3AF" className="ml-auto group-hover:translate-x-1 transition-transform"/>
        </div>
      </div>
    </Link>
  );
}

export default function Blog() {
  const [activeTag, setActiveTag] = useState("Tous");
  const filtered = activeTag==="Tous" ? CASE_STUDIES : CASE_STUDIES.filter(c=>c.tags.includes(activeTag));
  const featured = filtered.find(c=>c.featured) || filtered[0];
  const rest = filtered.filter(c=>c.slug!==featured?.slug);

  return (
    <>
      {/* Hero */}
      <section className="relative pt-28 pb-16 px-8 bg-black overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_60%,rgba(34,197,94,0.08),transparent_60%)] pointer-events-none"/>
        <div className="max-w-[1160px] mx-auto relative z-10">
          <Reveal><SL light>Blog & Cas Clients</SL></Reveal>
          <Reveal delay={80}><h1 className="text-[clamp(36px,4.5vw,58px)] font-extrabold leading-[1.06] tracking-[-2px] text-white mb-4">Résultats réels.<br/><span className="text-shimmer">Consultants réels.</span></h1></Reveal>
          <Reveal delay={160}><p className="text-[16px] text-white/55 max-w-[520px] leading-[1.7]">Découvrez comment des consultants, coaches et solopreneurs transforment leur activité grâce à Pretalk. Des histoires vraies, des chiffres vérifiables.</p></Reveal>
        </div>
      </section>

      {/* Stats bar */}
      <div className="bg-gray-50 border-b border-gray-200 py-4 px-8">
        <div className="max-w-[1160px] mx-auto flex items-center gap-8 flex-wrap">
          {[{ v:CASE_STUDIES.length, l:"Cas clients publiés" },{ v:"340+", l:"Consultants actifs" },{ v:"€2.1M", l:"Générés via Pretalk" }].map((s,i)=>(
            <div key={i} className="flex items-center gap-2.5">
              <span className="text-[20px] font-extrabold text-black tracking-[-0.5px]">{s.v}</span>
              <span className="text-[12px] text-gray-500">{s.l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <section className="pt-12 pb-4 px-8 bg-white">
        <div className="max-w-[1160px] mx-auto">
          <Reveal>
            <div className="flex items-center gap-2 flex-wrap">
              {ALL_TAGS.map(tag => (
                <button key={tag} onClick={()=>setActiveTag(tag)}
                  className={`text-[12.5px] font-semibold px-4 py-2 rounded-xl border transition-all ${activeTag===tag?"bg-black text-white border-black":"bg-white border-gray-200 text-gray-600 hover:border-gray-400"}`}>
                  {tag}
                </button>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12 px-8 bg-white">
        <div className="max-w-[1160px] mx-auto">
          {featured && (
            <div className="grid grid-cols-2 gap-5 mb-5">
              <Reveal className="col-span-2"><CaseCard cs={featured} featured/></Reveal>
            </div>
          )}
          {rest.length > 0 && (
            <div className="grid grid-cols-3 gap-5">
              {rest.map((cs, i) => (
                <Reveal key={cs.slug} delay={i*70}><CaseCard cs={cs}/></Reveal>
              ))}
            </div>
          )}
          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400 text-[15px]">Aucun cas client pour ce filtre.</p>
              <button onClick={()=>setActiveTag("Tous")} className="mt-4 text-[13px] font-semibold text-black underline">Voir tous les cas clients</button>
            </div>
          )}
        </div>
      </section>

      {/* CTA banner */}
      <section className="py-20 px-8 bg-gray-50">
        <div className="max-w-[900px] mx-auto">
          <Reveal>
            <div className="glass-card rounded-3xl p-10 flex items-center justify-between gap-8">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Votre cas client</p>
                <h3 className="text-[22px] font-bold text-black mb-2">Vous utilisez Pretalk ?<br/>Partagez vos résultats.</h3>
                <p className="text-[13.5px] text-gray-500 leading-[1.65]">Nous publions les histoires des consultants qui obtiennent des résultats exceptionnels. Candidatez pour être mis en avant.</p>
              </div>
              <div className="flex-shrink-0">
                <Btn to="/contact" variant="black" size="lg">Candidater <ArrowRight/></Btn>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
