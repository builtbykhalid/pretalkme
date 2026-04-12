import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  MessageSquare, 
  Store, 
  Bot, 
  Zap, 
  ChevronRight,
  ShieldCheck,
  Smartphone,
  Sparkles,
  MousePointer2
} from 'lucide-react';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  return (
    <div className="flex flex-col h-full bg-[#F0F2F5] items-center justify-center p-4 md:p-8 overflow-hidden font-sans">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 bg-white rounded-[40px] shadow-2xl overflow-hidden border border-[#D1D7DB]">
         
         {/* Left Panel: Status & Brand */}
         <div className="lg:col-span-4 bg-[#111B21] p-10 text-white flex flex-col justify-between relative overflow-hidden h-64 lg:h-auto">
            <div className="relative z-10">
               <div className="flex items-center gap-3 mb-16">
                  <div className="w-10 h-10 bg-[#00A884] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#00A884]/20">
                     <Zap size={20} fill="currentColor" />
                  </div>
                  <span className="text-2xl font-bold tracking-tight">pretalkme</span>
               </div>

               <div className="space-y-12">
                  <StepIndicator num={1} label="Connexion WhatsApp" active={step === 1} completed={step > 1} />
                  <StepIndicator num={2} label="E-Commerce Sync" active={step === 2} completed={step > 2} />
                  <StepIndicator num={3} label="Configuration Agent" active={step === 3} completed={step > 3} />
                  <StepIndicator num={4} label="Finalisation" active={step === 4} completed={step > 4} />
               </div>
            </div>

            <div className="relative z-10 pt-10 border-t border-white/10 mt-20 hidden lg:block">
               <p className="text-[#8696A0] text-[12px] font-bold uppercase tracking-widest leading-relaxed">
                  Augmentez vos ventes <br />avec l'IA WhatsApp n°1.
               </p>
            </div>

            {/* Premium Decorator */}
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#00A884]/10 rounded-full blur-[100px]" />
         </div>

         {/* Right Panel: Content */}
         <div className="lg:col-span-8 p-10 md:p-16 flex flex-col h-full min-h-[600px] bg-white">
            <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full animate-slideIn">
               {step === 1 && <StepWhatsApp onNext={nextStep} />}
               {step === 2 && <StepEcommerce onNext={nextStep} onPrev={prevStep} />}
               {step === 3 && <StepAI onNext={nextStep} onPrev={prevStep} />}
               {step === 4 && <StepFinal onLaunch={() => navigate('/whatsapp/inbox')} onPrev={prevStep} />}
            </div>

            {/* Bottom Nav */}
            {step < 4 && (
              <div className="mt-12 pt-8 border-t border-[#F0F2F5] flex items-center justify-between">
                <button 
                  onClick={prevStep}
                  disabled={step === 1}
                  className={`flex items-center gap-2 text-sm font-bold transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-[#8696A0] hover:text-[#111B21]'}`}
                >
                  <ArrowLeft size={18} /> Retour
                </button>
                <div className="flex gap-2">
                   {[1,2,3,4].map(i => (
                      <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${step === i ? 'w-8 bg-[#00A884]' : 'w-2 bg-[#F0F2F5]'}`} />
                   ))}
                </div>
                <button 
                  onClick={nextStep}
                  className="flex items-center gap-2 text-sm font-bold text-[#00A884] hover:bg-[#E7F3EF] px-4 py-2 rounded-lg transition-all"
                >
                  Continuer <ArrowRight size={18} />
                </button>
              </div>
            )}
         </div>
      </div>
    </div>
  );
}

function StepIndicator({ num, label, active, completed }: any) {
  return (
    <div className={`flex items-center gap-4 transition-all duration-500 ${active ? 'opacity-100' : completed ? 'opacity-60' : 'opacity-30'}`}>
       <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border-2 ${active ? 'bg-[#00A884] text-white border-[#00A884] shadow-xl shadow-[#00A884]/20 scale-110' : completed ? 'border-[#008f6f] text-[#008f6f]' : 'border-white/20 text-white'}`}>
          {completed ? <CheckCircle2 size={18} /> : num}
       </div>
       <span className={`text-[13px] font-bold uppercase tracking-widest ${active ? 'text-white' : 'text-[#8696A0]'}`}>{label}</span>
    </div>
  );
}

/* ──── SUB-STEPS ──── */
function StepWhatsApp({ onNext }: any) {
  return (
    <div className="text-center flex flex-col items-center">
       <div className="w-24 h-24 bg-[#E7F3EF] rounded-[32px] flex items-center justify-center text-[#00A884] mb-10 border border-[#00A884]/10 shadow-inner">
          <MessageSquare size={48} />
       </div>
       <h2 className="text-4xl font-bold text-[#111B21] mb-6">Liez votre WhatsApp</h2>
       <p className="text-[#667781] text-lg max-w-md mx-auto mb-12 leading-relaxed font-medium">
          Connectez votre numéro officiel Business via le Cloud API de Meta pour commencer.
       </p>
       
       <button 
         onClick={onNext}
         className="w-full max-w-sm bg-[#111B21] text-white py-4.5 rounded-2xl font-bold text-[16px] shadow-xl hover:brightness-125 transition-all flex items-center justify-center gap-3 active:scale-95"
       >
          <Smartphone size={22} />
          Se connecter avec Facebook
       </button>
       
       <div className="mt-8 flex items-center gap-3 text-[#8696A0]">
          <ShieldCheck size={20} className="text-[#00A884]" />
          <span className="text-[13px] font-medium">Certifié Meta Business Partner.</span>
       </div>
    </div>
  );
}

function StepEcommerce({ onNext }: any) {
  return (
    <div>
       <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
             <Store size={28} />
          </div>
          <h2 className="text-3xl font-bold text-[#111B21]">Sync Boutique</h2>
       </div>
       <p className="text-[#667781] text-[16px] mb-10 font-medium">L'IA connaîtra vos stocks et vos commandes en temps réel.</p>
       
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <PlatformBtn name="YouCan.shop" logo="YC" primary active={true} />
          <PlatformBtn name="Google Sheets" logo="GS" />
          <PlatformBtn name="Shopify" logo="SH" />
          <PlatformBtn name="WooCommerce" logo="WC" />
          <PlatformBtn name="Saisie Manuelle" logo="+" />
       </div>

       <div className="space-y-6">
          <div className="space-y-3">
             <label className="text-[13px] font-bold text-[#8696A0] uppercase tracking-wide">URL Boutique</label>
             <input type="text" placeholder="maboutique.youcan.shop" className="w-full bg-[#F0F2F5] border border-[#D1D7DB] rounded-xl px-4 py-3.5 text-[15px] font-semibold text-[#111B21]" />
          </div>
          <div className="space-y-3">
             <label className="text-[13px] font-bold text-[#8696A0] uppercase tracking-wide">Clé API / Token</label>
             <input type="password" placeholder="••••••••••••••••••••" className="w-full bg-[#F0F2F5] border border-[#D1D7DB] rounded-xl px-4 py-3.5 text-[15px] font-semibold text-[#111B21]" />
          </div>
       </div>
    </div>
  );
}

function PlatformBtn({ name, logo, active }: any) {
  return (
    <div className={`p-4 border-2 rounded-2xl flex items-center gap-4 cursor-pointer transition-all ${active ? 'bg-[#E7F3EF] border-[#00A884]' : 'bg-white border-[#F0F2F5] hover:border-[#D1D7DB]'}`}>
       <div className={`w-11 h-11 rounded-lg flex items-center justify-center font-bold text-xs ${active ? 'bg-[#00A884] text-white' : 'bg-[#F0F2F5] text-[#8696A0]'}`}>{logo}</div>
       <span className={`text-[14px] font-bold ${active ? 'text-[#111B21]' : 'text-[#8696A0]'}`}>{name}</span>
       {active && <CheckCircle2 size={18} className="ml-auto text-[#00A884]" />}
    </div>
  );
}

function StepAI({ onNext }: any) {
  return (
    <div>
       <div className="flex items-center gap-3 mb-3 text-[#00A884]">
          <Sparkles size={20} />
          <span className="text-[12px] font-bold uppercase tracking-[0.2em]">Intelligence Artificielle</span>
       </div>
       <h2 className="text-3xl font-bold text-[#111B21] mb-4">Nommez votre Agent</h2>
       <p className="text-[#667781] text-[16px] mb-12 font-medium">Votre assistant virtuel qui gérera vos clients.</p>

       <div className="space-y-10">
          <div className="space-y-3">
             <label className="text-[13px] font-bold text-[#8696A0] uppercase tracking-wide">Nom de l'Agent</label>
             <input type="text" placeholder="Ex: Sarah de Pretalk Hub" className="w-full bg-[#F0F2F5] border border-[#D1D7DB] rounded-xl px-4 py-3.5 text-[15px] font-bold text-[#111B21]" />
          </div>
          <div className="space-y-3">
             <label className="text-[13px] font-bold text-[#8696A0] uppercase tracking-wide">Prompt Système (Mission)</label>
             <textarea 
               placeholder="Ex: Sois poli, suggère des produits alternatifs si rupture de stock..."
               className="w-full h-40 bg-[#F0F2F5] border border-[#D1D7DB] rounded-2xl p-5 text-[14px] leading-relaxed resize-none font-medium text-[#111B21]" 
             />
          </div>
       </div>
    </div>
  );
}

function StepFinal({ onLaunch }: any) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="text-center flex flex-col items-center justify-center h-full animate-fadeIn">
       {loading ? (
          <>
            <div className="w-24 h-24 flex items-center justify-center relative mb-12">
               <div className="absolute inset-0 border-[6px] border-[#F0F2F5] rounded-full" />
               <div className="absolute inset-0 border-t-[6px] border-[#00A884] rounded-full animate-spin" />
               <Bot size={44} className="text-[#111B21] animate-bounce" />
            </div>
            <h2 className="text-3xl font-bold text-[#111B21] mb-4">Configuration Profonde</h2>
            <p className="text-[#667781] text-lg max-w-xs mx-auto font-medium">Nous apprenons à votre IA tout sur votre business...</p>
          </>
       ) : (
          <>
            <div className="w-24 h-24 bg-[#E7F3EF] rounded-full flex items-center justify-center text-[#00A884] mb-10 border-[6px] border-[#00A884]/10 shadow-lg scale-110">
               <CheckCircle2 size={48} />
            </div>
            <h2 className="text-4xl font-bold text-[#111B21] mb-4">C'est Prêt !</h2>
            <p className="text-[#667781] text-lg max-w-sm mx-auto mb-16 leading-relaxed font-medium">
               Votre boutique est maintenant augmentée. <br />Vos clients vont adorer l'instantanéité.
            </p>
            
            <button 
              onClick={onLaunch}
              className="w-full max-w-sm bg-[#00A884] text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-[#00A884]/20 hover:brightness-105 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
               Accéder au Dashboard
               <ChevronRight size={22} />
            </button>
          </>
       )}
    </div>
  );
}
