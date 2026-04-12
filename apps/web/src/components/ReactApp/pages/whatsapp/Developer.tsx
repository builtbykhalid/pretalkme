import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Code, 
  Key, 
  Globe, 
  Copy, 
  RefreshCcw, 
  CheckCircle2, 
  ShieldCheck,
  ExternalLink,
  BookOpen,
  Terminal,
  Zap
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Developer() {
  const { config, updateTenantConfig } = useApp();
  const [apiKey, setApiKey] = useState(config?.api_key || 'ptk_****************************');
  const [webhookUrl, setWebhookUrl] = useState(config?.webhook_url || '');
  const [isRotating, setIsRotating] = useState(false);
  const [isSavingWebhook, setIsSavingWebhook] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copié dans le presse-papier !');
  };

  const rotateApiKey = async () => {
    if (!confirm('Êtes-vous sûr de vouloir régénérer votre clé API ? Vos intégrations actuelles cesseront de fonctionner.')) return;
    
    setIsRotating(true);
    try {
      const newKey = `ptk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      await updateTenantConfig({ api_key: newKey });
      setApiKey(newKey);
      toast.success('Clé API générée avec succès');
    } catch (err) {
      toast.error('Erreur lors de la rotation');
    } finally {
      setIsRotating(false);
    }
  };

  const saveWebhook = async () => {
    setIsSavingWebhook(true);
    try {
      await updateTenantConfig({ webhook_url: webhookUrl });
      toast.success('URL Webhook mise à jour');
    } catch (err) {
      toast.error('Erreur de sauvegarde');
    } finally {
      setIsSavingWebhook(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F0F2F5] p-6 md:p-8 overflow-y-auto scrollbar-hide font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <div className="w-10 h-10 bg-[#111B21] rounded-xl flex items-center justify-center text-white shadow-lg">
                <Code size={20} />
             </div>
             <h1 className="text-3xl font-bold text-[#111B21]">Outils Développeur</h1>
          </div>
          <p className="text-[#667781] text-[15px] font-medium pl-1">Intégrez Pretalk Hub à vos applications via notre API REST et nos Webhooks.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
         {/* Left: Settings */}
         <div className="xl:col-span-8 space-y-8">
            {/* API Key Card */}
            <div className="bg-white rounded-[32px] border border-[#D1D7DB] shadow-sm p-8 group overflow-hidden relative">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100 shadow-sm">
                        <Key size={24} />
                     </div>
                     <div>
                        <h3 className="text-[17px] font-black text-[#111B21] uppercase tracking-tight">Clé API Publique</h3>
                        <p className="text-[13px] text-[#8696A0] font-medium">Utilisez cette clé pour authentifier vos requêtes API.</p>
                     </div>
                  </div>
                  <button 
                    onClick={rotateApiKey}
                    disabled={isRotating}
                    className="p-3 bg-white border border-[#D1D7DB] rounded-xl text-[#54656F] hover:bg-[#F0F2F5] hover:text-[#EA0038] transition-all disabled:opacity-50"
                  >
                    <RefreshCcw size={20} className={isRotating ? 'animate-spin' : ''} />
                  </button>
               </div>
               
               <div className="bg-[#F8F9FA] border border-[#E9EDEF] p-5 rounded-2xl flex items-center justify-between group/key transition-all mb-4">
                  <span className="font-mono text-[14px] text-[#111B21] tracking-wider select-all truncate mr-4">
                     {apiKey}
                  </span>
                  <button 
                    onClick={() => copyToClipboard(apiKey)}
                    className="p-2.5 bg-white border border-[#D1D7DB] rounded-lg text-[#8696A0] hover:text-[#00A884] shadow-sm transition-all"
                  >
                    <Copy size={16} />
                  </button>
               </div>
               
               <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-[#00A884] rounded-xl text-[12px] font-bold w-fit">
                  <ShieldCheck size={14} />
                  <span>NIVEAU DE SÉCURITÉ : STANDARD (AES-256)</span>
               </div>
               
               {/* Decorator */}
               <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Webhook Configuration */}
            <div className="bg-white rounded-[32px] border border-[#D1D7DB] shadow-sm p-8 relative overflow-hidden">
               <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-[#E7F3EF] text-[#00A884] rounded-2xl flex items-center justify-center border border-[#00A884]/20 shadow-sm">
                     <Globe size={24} />
                  </div>
                  <div>
                     <h3 className="text-[17px] font-black text-[#111B21] uppercase tracking-tight">Webhook de réception</h3>
                     <p className="text-[13px] text-[#8696A0] font-medium">Configurez l'URL où nous enverrons les événements (messages reçus, rapports de livraison).</p>
                  </div>
               </div>

               <div className="space-y-4">
                  <div>
                     <label className="text-[11px] font-black text-[#8696A0] uppercase tracking-[0.2em] block mb-2">Endpoint URL</label>
                     <div className="flex gap-3">
                        <input 
                           type="text" 
                           placeholder="https://votre-site.com/webhook"
                           value={webhookUrl}
                           onChange={(e) => setWebhookUrl(e.target.value)}
                           className="flex-1 bg-[#F0F2F5] border-2 border-transparent focus:border-[#00A884] focus:bg-white rounded-2xl px-5 py-4 text-[14px] font-bold text-[#111B21] transition-all outline-none"
                        />
                        <button 
                           onClick={saveWebhook}
                           disabled={isSavingWebhook}
                           className="bg-[#111B21] text-white px-8 rounded-2xl font-bold text-[13px] uppercase tracking-widest hover:bg-[#00A884] transition-all disabled:opacity-50 shadow-lg shadow-black/10"
                        >
                           {isSavingWebhook ? '...' : 'Enregistrer'}
                        </button>
                     </div>
                  </div>
                  <div className="p-4 bg-[#F8F9FA] rounded-xl border border-[#D1D7DB] border-dashed">
                     <p className="text-[12px] text-[#8696A0] font-medium">Note : Le webhook doit répondre avec un code HTTP 200 sous 3 secondes.</p>
                  </div>
               </div>
               
               {/* Decorator */}
               <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#00A884]/5 rounded-full blur-3xl pointer-events-none" />
            </div>
         </div>

         {/* Right: Documentation Links */}
         <div className="xl:col-span-4 space-y-8">
            <div className="bg-[#111B21] rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden group">
               <h3 className="text-xl font-bold mb-6">Documentation API</h3>
               <div className="space-y-4 relative z-10">
                  <DocLink icon={BookOpen} label="Guide d'intégration" />
                  <DocLink icon={Terminal} label="Référence API v1.0" />
                  <DocLink icon={Zap} label="Liste des Événements" />
               </div>
               <button className="w-full mt-8 py-4 bg-white/10 hover:bg-white text-white hover:text-[#111B21] rounded-2xl font-black text-[12px] uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                  Lire la Doc <ExternalLink size={16} />
               </button>
               
               {/* Decorator */}
               <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-[#00A884]/20 rounded-full blur-3xl pointer-events-none" />
            </div>

            <div className="bg-white rounded-[32px] border border-[#D1D7DB] shadow-sm p-8">
               <h4 className="text-[13px] font-black text-[#111B21] uppercase tracking-widest mb-6">Webhook Logs (Beta)</h4>
               <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center justify-between p-3 bg-[#F8F9FA] rounded-xl border border-[#E9EDEF]">
                       <div className="flex items-center gap-3">
                          <CheckCircle2 size={14} className="text-[#00A884]" />
                          <span className="text-[12px] font-bold text-[#111B21]">message.received</span>
                       </div>
                       <span className="text-[10px] font-black text-[#8696A0] uppercase">200 OK</span>
                    </div>
                  ))}
               </div>
               <button className="w-full mt-6 text-[12px] font-bold text-[#8696A0] hover:text-[#111B21] transition-colors">Voir tout l'historique</button>
            </div>
         </div>
      </div>
    </div>
  );
}

function DocLink({ icon: Icon, label }: any) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition-all">
       <Icon size={18} className="text-[#00A884]" />
       <span className="text-[14px] font-bold">{label}</span>
    </div>
  );
}
