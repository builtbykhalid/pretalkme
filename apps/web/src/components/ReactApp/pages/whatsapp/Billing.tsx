import { 
  Zap, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  ChevronRight, 
  ShieldCheck,
  Star,
   Target
} from 'lucide-react';

export default function Billing() {
  return (
    <div className="flex flex-col h-full bg-[#F8F8F8] p-4 md:p-8 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-2xl font-black text-[#221A40]">Abonnement & Facturation</h1>
          <p className="text-[#9A9A9A] text-sm font-medium">Gérez votre plan, votre consommation et vos factures</p>
        </div>
        
        <button className="flex items-center gap-2 bg-[#221A40] text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-[#221A40]/10 hover:brightness-110 transition-all">
          <ArrowUpRight size={18} />
          Portail Client Stripe
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-12">
         {/* Current Plan Card */}
         <div className="xl:col-span-4 bg-[#221A40] rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl shadow-[#221A40]/30 border-t-8 border-t-[#48D951]">
            <div className="relative z-10">
               <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[#48D951] flex items-center justify-center text-[#08300A]">
                     <Star size={18} fill="currentColor" />
                  </div>
                  <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/50">Plan Actuel</h4>
               </div>
               <h2 className="text-4xl font-black mb-1">PRO BUNDLE</h2>
               <p className="text-[#48D951] text-sm font-bold flex items-center gap-2">
                  <Clock size={16} /> Renouvellement le 14 Avril 2026
               </p>
               
               <div className="mt-12 space-y-6">
                  <div className="flex items-center justify-between">
                     <span className="text-xs font-bold text-white/60">Paiement mensuel</span>
                     <span className="text-lg font-black text-white">490 DH<span className="text-xs font-normal text-white/40">/mois</span></span>
                  </div>
                  <div className="flex items-center gap-3">
                     <span className="px-3 py-1.5 bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-wider text-[#48D951] flex items-center gap-1.5">
                        <CheckCircle2 size={12} /> CB •••• 4242
                     </span>
                     <button className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all underline">Modifier</button>
                  </div>
               </div>
            </div>
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#48D951]/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
         </div>

         {/* Usage Stats Panel */}
         <div className="xl:col-span-8 bg-white rounded-[40px] border border-[#EEEEEE] shadow-sm p-10">
            <h3 className="text-xl font-black text-[#221A40] mb-10 flex items-center gap-2">
               <Target size={22} className="text-[#48D951]" />
               Consommation du cycle
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               <UsageBar 
                 label="Conversations WhatsApp" 
                 current={234} 
                 limit={300} 
                 icon={MessageSquare} 
                 color="bg-indigo-500" 
               />
               <UsageBar 
                 label="Crédits IA (STT & TTS)" 
                 current={145} 
                 limit={200} 
                 icon={Zap} 
                 color="bg-[#48D951]" 
               />
               <UsageBar 
                 label="Broadcasts Groupes" 
                 current={1} 
                 limit={2} 
                 icon={Send} 
                 color="bg-purple-500" 
               />
               <div className="p-6 bg-[#FAFAFA] rounded-3xl border border-[#EEEEEE] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                        <ShieldCheck size={20} />
                     </div>
                     <div>
                        <div className="text-xs font-black text-[#221A40]">Statut Compte</div>
                        <div className="text-[10px] font-bold text-[#AAAAAA] uppercase tracking-wider">Vérifié & Solvable</div>
                     </div>
                  </div>
                  <button className="p-2 border border-[#EEEEEE] rounded-xl text-[#AAAAAA] hover:text-[#221A40] transition-colors">
                     <ChevronRight size={20} />
                  </button>
               </div>
            </div>
         </div>
      </div>

      {/* Upgrade Plans */}
      <div className="space-y-8">
         <h3 className="text-2xl font-black text-[#221A40] text-center">Besoin de plus de puissance ?</h3>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PricingCard 
               name="SOLO" 
               price="190" 
               features={['100 Conversations', '50 Crédits IA', 'Support Standard']} 
               active={false}
            />
            <PricingCard 
               name="PRO" 
               price="490" 
               features={['300 Conversations', '200 Crédits IA', 'HITL Illimité', 'Support 24/7']} 
               active={true}
            />
            <PricingCard 
               name="AGENCE" 
               price="990" 
               features={['Illimité', '500 Crédits IA', 'Marque Blanche', 'Account Manager Dedicated']} 
               active={false}
            />
         </div>
      </div>
    </div>
  );
}

function UsageBar({ label, current, limit, icon: Icon, color }: any) {
  const percentage = (current / limit) * 100;
  return (
    <div className="space-y-4">
       <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
             <Icon size={16} className="text-[#AAAAAA]" />
             <span className="text-xs font-black text-[#221A40] uppercase tracking-wider">{label}</span>
          </div>
          <span className="text-xs font-bold text-[#AAAAAA]">{current} / {limit}</span>
       </div>
       <div className="h-3 bg-[#F5F5F5] rounded-full overflow-hidden">
          <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${percentage}%` }} />
       </div>
       <div className="text-[10px] font-bold text-[#AAAAAA] uppercase tracking-widest pl-1">
          {Math.round(100 - percentage)}% restant
       </div>
    </div>
  );
}

function PricingCard({ name, price, features, active }: any) {
  return (
    <div className={`bg-white rounded-[40px] p-8 border-2 transition-all hover:shadow-2xl hover:-translate-y-2 ${active ? 'border-[#221A40] shadow-xl' : 'border-[#EEEEEE]'}`}>
       <div className="text-center mb-8">
          <div className={`text-[11px] font-black uppercase tracking-[0.3em] mb-2 ${active ? 'text-[#48D951]' : 'text-[#AAAAAA]'}`}>
             {active ? 'PLAN ACTUEL' : 'DISPONIBLE'}
          </div>
          <h4 className="text-3xl font-black text-[#221A40]">{name}</h4>
          <div className="flex items-center justify-center mt-2">
             <span className="text-2xl font-black text-[#221A40]">{price} DH</span>
             <span className="text-[11px] text-[#AAAAAA] font-bold">/mois</span>
          </div>
       </div>

       <div className="space-y-4 mb-10">
          {features.map((f, i) => (
             <div key={i} className="flex items-center gap-3 text-xs font-medium text-[#6B6B6B]">
                <CheckCircle2 size={16} className="text-[#48D951] shrink-0" />
                {f}
             </div>
          ))}
       </div>

       {active ? (
         <button className="w-full bg-[#FAFAFA] text-[#AAAAAA] py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] cursor-default">
            Abonné
         </button>
       ) : (
         <button className="w-full bg-[#221A40] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-[#221A40]/10 hover:brightness-110 transition-all flex items-center justify-center gap-2">
            Changer <ChevronRight size={16} />
         </button>
       )}
    </div>
  );
}
