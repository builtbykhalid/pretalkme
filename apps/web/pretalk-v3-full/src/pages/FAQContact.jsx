import { useState } from "react";
import { Btn, Reveal, SL, ST, Badge, GlassCard, ArrowRight, ChevronDown } from "../components/ui";
import { FAQS } from "../data/index";

// ── FAQ ACCORDION ─────────────────────────────────────────
function FaqItem({ q, a, open, onToggle }) {
  return (
    <div className={`bg-white border rounded-2xl overflow-hidden transition-all duration-200 ${open?"border-gray-400 shadow-sm":"border-gray-200"}`}>
      <button onClick={onToggle} className="w-full px-6 py-5 text-left flex justify-between items-center gap-4 hover:bg-gray-50 transition-colors">
        <span className="text-[14.5px] font-semibold text-black">{q}</span>
        <ChevronDown className={`flex-shrink-0 transition-transform duration-300 ease-spring ${open?"rotate-180":""}`}/>
      </button>
      <div className="overflow-hidden transition-[max-height] duration-[380ms] ease-spring" style={{maxHeight:open?"240px":"0"}}>
        <p className="px-6 pb-5 text-[14px] text-gray-500 leading-[1.72]">{a}</p>
      </div>
    </div>
  );
}

function FAQSection() {
  const [openIdx, setOpenIdx] = useState(0);
  const cats = [...new Set(FAQS.map(f=>f.cat))];
  const [activeCat, setActiveCat] = useState("Général");

  const filtered = FAQS.filter(f=>f.cat===activeCat);

  return (
    <section className="py-24 px-8 bg-gray-50">
      <div className="max-w-[1160px] mx-auto">
        <Reveal>
          <div className="text-center mb-12">
            <SL>FAQ</SL>
            <ST className="mb-4">On a les réponses.<br/>On les attendait.</ST>
            <p className="text-[16px] text-gray-500 max-w-[440px] mx-auto leading-[1.7]">Toutes les réponses aux questions que vous vous posez sur Pretalk.</p>
          </div>
        </Reveal>
        {/* Category tabs */}
        <Reveal delay={80}>
          <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
            {cats.map(c => (
              <button key={c} onClick={()=>{ setActiveCat(c); setOpenIdx(-1); }}
                className={`text-[13px] font-semibold px-4 py-2 rounded-xl transition-all ${activeCat===c?"bg-black text-white":"bg-white border border-gray-200 text-gray-600 hover:border-gray-400"}`}>
                {c}
              </button>
            ))}
          </div>
        </Reveal>
        <div className="max-w-[820px] mx-auto flex flex-col gap-3">
          {filtered.map((f, i) => (
            <Reveal key={i} delay={i*50}>
              <FaqItem q={f.q} a={f.a} open={openIdx===i} onToggle={()=>setOpenIdx(openIdx===i?-1:i)}/>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CONTACT SECTION ───────────────────────────────────────
function ContactSection() {
  const [form, setForm] = useState({ name:"", email:"", company:"", subject:"", message:"" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <section id="contact" className="py-24 px-8 bg-white">
      <div className="max-w-[1160px] mx-auto">
        <div className="grid grid-cols-[1fr_1.4fr] gap-20 items-start">
          {/* Left */}
          <Reveal dir="left">
            <SL>Contact</SL>
            <h2 className="text-[clamp(28px,3vw,40px)] font-extrabold tracking-[-1.2px] text-black mb-5 leading-[1.08]">Parlons de votre activité.</h2>
            <p className="text-[15px] text-gray-500 leading-[1.7] mb-8">Une question, une démo, ou envie de comprendre comment Pretalk peut transformer votre pipeline ? Répondons en moins de 24h.</p>
            <div className="flex flex-col gap-5">
              {[
                { label:"Email", val:"hello@pretalk.io", icon:"M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
                { label:"Démo en live", val:"Réservez 30 min →", icon:"M15 10l4.553-2.069A1 1 0 0121 8.845v6.31a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" },
                { label:"Temps de réponse", val:"< 4 heures en moyenne", icon:"M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d={item.icon} stroke="#0A0A0A" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">{item.label}</p>
                    <p className="text-[13.5px] font-semibold text-black">{item.val}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Testimonial */}
            <div className="mt-10 glass-card rounded-2xl p-5">
              <p className="text-[13px] text-gray-700 italic leading-[1.65] mb-3">"L'équipe Pretalk a répondu à mes questions en 2h et m'a aidé à configurer mon premier formulaire en 20 minutes. Rare de nos jours."</p>
              <div className="flex items-center gap-2.5">
                <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face" alt="" className="w-8 h-8 rounded-full object-cover"/>
                <div>
                  <p className="text-[12px] font-semibold text-black">Marc D.</p>
                  <p className="text-[11px] text-gray-400">Fondateur Agence Digital</p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Right — Form */}
          <Reveal delay={80} dir="right">
            {sent ? (
              <div className="glass-card rounded-3xl p-12 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M6 14l5 5 11-11" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <h3 className="text-[22px] font-bold text-black mb-2">Message envoyé !</h3>
                <p className="text-[14px] text-gray-500 mb-6">Nous reviendrons vers vous dans moins de 4 heures.</p>
                <Btn onClick={()=>setSent(false)} variant="outline" size="md">Envoyer un autre message</Btn>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-8 flex flex-col gap-5">
                <h3 className="text-[20px] font-bold text-black mb-1">Envoyez-nous un message</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[12px] font-semibold text-gray-700 mb-1.5 block">Prénom & Nom *</label>
                    <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-[13.5px] focus:outline-none focus:border-black focus:shadow-[0_0_0_3px_rgba(0,0,0,0.07)] transition-all placeholder:text-gray-400"
                      placeholder="Thomas Renard"/>
                  </div>
                  <div>
                    <label className="text-[12px] font-semibold text-gray-700 mb-1.5 block">Email professionnel *</label>
                    <input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-[13.5px] focus:outline-none focus:border-black focus:shadow-[0_0_0_3px_rgba(0,0,0,0.07)] transition-all placeholder:text-gray-400"
                      placeholder="thomas@cabinet.fr"/>
                  </div>
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-gray-700 mb-1.5 block">Entreprise</label>
                  <input value={form.company} onChange={e=>setForm({...form,company:e.target.value})}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-[13.5px] focus:outline-none focus:border-black focus:shadow-[0_0_0_3px_rgba(0,0,0,0.07)] transition-all placeholder:text-gray-400"
                    placeholder="Nom de votre cabinet ou agence"/>
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-gray-700 mb-1.5 block">Sujet</label>
                  <select value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-[13.5px] focus:outline-none focus:border-black focus:shadow-[0_0_0_3px_rgba(0,0,0,0.07)] transition-all text-gray-700">
                    <option value="">Choisir un sujet</option>
                    <option>Demande de démo</option>
                    <option>Question sur les tarifs</option>
                    <option>Support technique</option>
                    <option>Partenariat</option>
                    <option>Autre</option>
                  </select>
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-gray-700 mb-1.5 block">Message *</label>
                  <textarea value={form.message} onChange={e=>setForm({...form,message:e.target.value})} required rows={5}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-[13.5px] focus:outline-none focus:border-black focus:shadow-[0_0_0_3px_rgba(0,0,0,0.07)] transition-all resize-none placeholder:text-gray-400"
                    placeholder="Décrivez votre situation, votre activité, et ce que vous cherchez à accomplir avec Pretalk..."/>
                </div>
                <button type="submit" className="w-full bg-black text-white text-[14px] font-bold py-3.5 rounded-xl hover:bg-gray-800 hover:shadow-lg hover:-translate-y-px transition-all duration-200 flex items-center justify-center gap-2">
                  Envoyer le message <ArrowRight/>
                </button>
                <p className="text-[11px] text-gray-400 text-center">En envoyant ce formulaire, vous acceptez notre politique de confidentialité.</p>
              </form>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export default function FAQContact() {
  return (
    <>
      {/* Hero */}
      <section className="pt-24 pb-12 px-8 bg-white border-b border-gray-100 text-center">
        <Reveal><Badge variant="gray" className="mb-4">Aide & Contact</Badge></Reveal>
        <Reveal delay={80}><h1 className="text-[clamp(32px,4vw,52px)] font-extrabold tracking-[-1.8px] text-black mb-4 leading-[1.06]">Toutes les réponses.<br/><span className="text-shimmer">Toute l'aide.</span></h1></Reveal>
        <Reveal delay={160}><p className="text-[16px] text-gray-500 max-w-[440px] mx-auto leading-[1.7]">Trouvez la réponse dans la FAQ ou écrivez-nous directement.</p></Reveal>
      </section>
      <FAQSection/>
      <ContactSection/>
    </>
  );
}
