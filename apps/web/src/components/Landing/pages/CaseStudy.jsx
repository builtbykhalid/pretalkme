// import { useParams, Link } from 'react-router-dom'; // Disabled for Astro
import { Btn, Reveal, Badge, GlassCard, ArrowRight, ClockIcon } from "../ui";
import { CASE_STUDIES } from "../../../data/landing/index";

function ContentBlock({ block }) {
  switch (block.type) {
    case "intro": return <p className="text-[17px] text-gray-600 leading-[1.8] mb-8 font-light">{block.text}</p>;
    case "h2": return <h2 className="text-[24px] font-bold text-black tracking-[-0.5px] mt-12 mb-5">{block.text}</h2>;
    case "text": return <p className="text-[15.5px] text-gray-600 leading-[1.8] mb-6">{block.text}</p>;
    case "quote": return (
      <div className="my-10 relative">
        <div className="absolute -left-1 top-0 bottom-0 w-[3px] bg-green-500 rounded-full"/>
        <blockquote className="pl-8">
          <p className="text-[18px] text-gray-800 italic leading-[1.7] font-medium mb-3">{block.text}</p>
          {block.author && <cite className="text-[13px] text-gray-400 not-italic font-semibold">{block.author}</cite>}
        </blockquote>
      </div>
    );
    default: return null;
  }
}

export default function CaseStudy({ slug }) {
  // const { slug } = useParams(); // Passed via prop in Astro
  const cs = CASE_STUDIES.find(c => c.slug === slug);
  const related = CASE_STUDIES.filter(c => c.slug !== slug).slice(0, 2);

  if (!cs) return (
    <div className="pt-32 pb-20 px-8 text-center">
      <h2 className="text-[24px] font-bold mb-4">Cas client introuvable</h2>
      <a href="/blog" className="text-green-600 underline">Retour au blog</a>
    </div>
  );

  return (
    <>
      {/* Hero */}
      <section className="relative pt-16 pb-0 overflow-hidden bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(34,197,94,0.07),transparent_60%)] pointer-events-none"/>
        <div className="max-w-[900px] mx-auto px-8 pt-12 pb-10 relative z-10">
          <Reveal>
            <div className="flex items-center gap-3 mb-5">
              <a href="/blog" className="text-[12px] text-white/40 hover:text-white/70 transition-colors">← Blog</a>
              <span className="text-white/20">/</span>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${cs.badgeClass}`}>{cs.category}</span>
            </div>
          </Reveal>
          <Reveal delay={80}><h1 className="text-[clamp(28px,3.5vw,44px)] font-extrabold leading-[1.1] tracking-[-1.5px] text-white mb-5">{cs.title}</h1></Reveal>
          <Reveal delay={160}>
            <div className="flex items-center gap-5 text-[13px] text-white/40">
              <div className="flex items-center gap-2">
                <img src={cs.author.avatar} alt="" className="w-7 h-7 rounded-full object-cover"/>
                <span>{cs.author.name}</span>
              </div>
              <span>·</span>
              <div className="flex items-center gap-1.5"><ClockIcon/>{cs.readTime} de lecture</div>
              <span>·</span>
              <span>{cs.date}</span>
            </div>
          </Reveal>
        </div>
        {/* Cover */}
        <Reveal delay={240}>
          <div className="max-w-[900px] mx-auto px-8">
            <img src={cs.cover} alt={cs.title} className="w-full h-[380px] object-cover rounded-t-3xl"/>
          </div>
        </Reveal>
      </section>

      {/* Content */}
      <section className="py-16 px-8 bg-white">
        <div className="max-w-[900px] mx-auto">
          {/* Metrics highlight */}
          <Reveal>
            <div className="grid grid-cols-3 gap-4 mb-14">
              {cs.metrics.map((m, i) => (
                <div key={i} className="glass-card rounded-2xl p-5 text-center">
                  <div className={`text-[32px] font-extrabold tracking-[-1px] mb-1 ${m.color}`}>{m.value}</div>
                  <div className="text-[12px] text-gray-500">{m.label}</div>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Tags */}
          <div className="flex gap-2 mb-10">
            {cs.tags.map((t, i) => <Badge key={i} variant="gray" className="text-[11px]">{t}</Badge>)}
          </div>

          {/* Article content */}
          <div className="prose max-w-none">
            {cs.content.map((block, i) => (
              <Reveal key={i} delay={Math.min(i*40, 200)}>
                <ContentBlock block={block}/>
              </Reveal>
            ))}
          </div>

          {/* CTA inline */}
          <Reveal>
            <div className="my-16 bg-black rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(34,197,94,0.12),transparent_60%)] pointer-events-none"/>
              <Badge variant="green" dot className="mb-4">Pretalk</Badge>
              <h3 className="text-[22px] font-bold text-white mb-3">Obtenez les mêmes résultats.</h3>
              <p className="text-[14px] text-white/55 mb-6 leading-[1.65]">Rejoignez 340+ consultants qui automatisent leur pipeline de vente avec Pretalk.</p>
              <Btn href="/tarifs" variant="white" size="md">Essayer gratuitement <ArrowRight color="black"/></Btn>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="py-16 px-8 bg-gray-50 border-t border-gray-200">
          <div className="max-w-[900px] mx-auto">
            <h3 className="text-[18px] font-bold text-black mb-6">D'autres cas clients</h3>
            <div className="grid grid-cols-2 gap-5">
              {related.map((r, i) => (
                <Reveal key={i} delay={i*80}>
                  <a href={`/blog/${r.slug}`} className="group block no-underline bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                    <img src={r.cover} alt="" className="w-full h-[140px] object-cover group-hover:scale-105 transition-transform duration-500"/>
                    <div className="p-5">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${r.badgeClass}`}>{r.category}</span>
                      <p className="text-[13.5px] font-semibold text-black mt-2 leading-snug group-hover:text-green-700 transition-colors">{r.title}</p>
                      <div className="flex gap-2 mt-3">
                        {r.metrics.slice(0,2).map((m,j)=>(
                          <span key={j} className={`text-[12px] font-bold ${m.color}`}>{m.value}</span>
                        ))}
                      </div>
                    </div>
                  </a>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
