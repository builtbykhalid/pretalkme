import { useState } from "react";
import { Btn, Reveal, SL, ST, Badge, GlassCard, Check, ArrowRight } from "../ui";
import { PLANS } from "../../../data/landing/index";

const COMPARE = [
  { feat:"Profil public", free:true, starter:true, pro:true, business:true },
  { feat:"Formulaires IA", free:"1", starter:"5", pro:"Illimités", business:"Illimités" },
  { feat:"Leads / mois", free:"3", starter:"30", pro:"Illimités", business:"Illimités" },
  { feat:"Scoring automatique", free:"Basique", starter:"Avancé", pro:"Complet", business:"Complet" },
  { feat:"Audit IA pré-call", free:false, starter:false, pro:true, business:true },
  { feat:"Cheat Sheet Discovery Call", free:false, starter:false, pro:true, business:true },
  { feat:"Générateur devis & contrats", free:false, starter:false, pro:true, business:true },
  { feat:"CRM Pipeline Kanban", free:false, starter:false, pro:true, business:true },
  { feat:"Analytics & ROI", free:false, starter:"Basique", pro:"Complet", business:"Complet" },
  { feat:"Agents IA bibliothèque", free:false, starter:false, pro:true, business:true },
  { feat:"White label & domaine custom", free:false, starter:false, pro:false, business:true },
  { feat:"Multi-workspace équipe", free:false, starter:false, pro:false, business:true },
  { feat:"API & Webhooks", free:false, starter:false, pro:false, business:true },
  { feat:"SLA garanti 99.9%", free:false, starter:false, pro:false, business:true },
  { feat:"Support", free:"Communauté", starter:"Email", pro:"Email & Chat", business:"Prioritaire dédié" },
];

const YES = () => <svg className="mx-auto text-green-500" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8l3 3 7-7" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const NO = () => <span className="text-gray-300 mx-auto block text-center">—</span>;
function Cell({ v }) {
  if (v===true) return <YES/>;
  if (v===false) return <NO/>;
  return <span className="text-[12px] text-gray-600 text-center block">{v}</span>;
}

export default function Pricing() {
  const [annual, setAnnual] = useState(true);

  return (
    <>
      {/* Hero */}
      <section className="relative pt-28 pb-20 px-8 bg-white overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(34,197,94,0.06),transparent_65%)] pointer-events-none"/>
        <div className="max-w-[1160px] mx-auto text-center">
          <Reveal><SL>Tarifs</SL></Reveal>
          <Reveal delay={80}><h1 className="text-[clamp(36px,4.5vw,58px)] font-extrabold leading-[1.06] tracking-[-2px] text-black mb-5">Investissez dans votre<br/><span className="text-shimmer">meilleur commercial.</span></h1></Reveal>
          <Reveal delay={160}><p className="text-[17px] text-gray-500 leading-[1.7] max-w-[500px] mx-auto mb-8">Commencez gratuitement. Scalez quand vous closez. Annulez à tout moment.</p></Reveal>
          {/* Toggle */}
          <Reveal delay={240}>
            <div className="inline-flex items-center gap-3 bg-gray-100 rounded-xl p-1 mb-12">
              <button onClick={()=>setAnnual(false)} className={`text-[13px] font-semibold px-5 py-2 rounded-lg transition-all ${!annual?"bg-white shadow-sm text-black":"text-gray-500"}`}>Mensuel</button>
              <button onClick={()=>setAnnual(true)} className={`text-[13px] font-semibold px-5 py-2 rounded-lg transition-all flex items-center gap-2 ${annual?"bg-white shadow-sm text-black":"text-gray-500"}`}>
                Annuel
                <Badge variant="green" className="text-[9px] py-0.5">–35%</Badge>
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Plans */}
      <section className="pb-24 px-8">
        <div className="max-w-[1160px] mx-auto">
          <div className="grid grid-cols-4 gap-5 mb-20">
            {PLANS.map((p, i) => (
              <Reveal key={i} delay={i*70}>
                <div 
                  className={`relative rounded-3xl p-7 border-[1.5px] transition-all hover:shadow-lg ${p.featured?"bg-white shadow-md":"border-gray-200 bg-white hover:-translate-y-1"}`}
                  style={{ borderColor: p.color || (p.featured ? 'black' : '#E5E5E5'), borderTopWidth: p.featured ? '4px' : '1.5px' }}
                >
                  {p.featured && (
                    <div className="absolute -top-[13px] left-1/2 -translate-x-1/2 bg-black text-white text-[9.5px] font-bold tracking-[0.07em] uppercase px-4 py-1.5 rounded-full whitespace-nowrap">
                      Le plus populaire
                    </div>
                  )}
                  <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-gray-400 mb-2.5">{p.name}</p>
                  <div className="flex items-end gap-1 mb-0.5">
                    <span className="text-[44px] font-extrabold tracking-[-2px] text-black leading-none">
                      <sup className="text-[16px] align-top mt-3 font-semibold">$</sup>{annual?p.price.y:p.price.m}
                    </span>
                  </div>
                  <p className="text-[12px] text-gray-400 mb-6">{p.period} {annual&&p.name!=="Free"&&<span className="text-green-600 font-semibold">· facturation annuelle</span>}</p>
                  <Btn href="/contact" variant={p.featured?"black":"outline"} size="sm" className="w-full mb-5">{p.cta}</Btn>
                  <ul className="flex flex-col gap-2">
                    {p.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2 text-[12px] text-gray-600">
                        <svg className="flex-shrink-0 mt-0.5" style={{ color: '#48D951' }} width="13" height="13" viewBox="0 0 14 14" fill="none">
                          <path d="M3 7l3 3 5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Comparison table */}
          <Reveal>
            <h2 className="text-[26px] font-bold text-black mb-8 text-center">Comparaison complète des plans</h2>
          </Reveal>
          <Reveal delay={80}>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-4 px-4 text-[12px] font-semibold text-gray-500 w-[300px]">Fonctionnalité</th>
                    {PLANS.map(p=>(
                      <th key={p.name} className={`py-4 px-4 text-center text-[13px] font-bold ${p.featured?"text-black":"text-gray-700"}`}>
                        {p.name}{p.featured&&<span className="ml-1.5 text-[9px] bg-black text-white px-1.5 py-0.5 rounded-full">Pro</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARE.map((row, i) => (
                    <tr key={i} className={`border-b border-gray-100 ${i%2===0?"bg-white":"bg-gray-50/50"}`}>
                      <td className="py-3.5 px-4 text-[13px] font-medium text-gray-700">{row.feat}</td>
                      {["free","starter","pro","business"].map(plan => (
                        <td key={plan} className="py-3.5 px-4 text-center">
                          <Cell v={row[plan]}/>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ teaser */}
      <section className="py-20 px-8 bg-gray-50 text-center">
        <Reveal><ST className="mb-4">Des questions sur les tarifs ?</ST></Reveal>
        <Reveal delay={80}><p className="text-[15px] text-gray-500 mb-8 leading-[1.7]">Consultez notre FAQ ou contactez-nous directement.</p></Reveal>
        <Reveal delay={160}>
          <div className="flex items-center justify-center gap-3">
            <Btn href="/faq" variant="outline">Voir la FAQ <ArrowRight/></Btn>
            <Btn href="/contact" variant="black">Nous contacter <ArrowRight/></Btn>
          </div>
        </Reveal>
      </section>
    </>
  );
}
