import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  Link as LinkIcon, 
  Store, 
  Globe, 
  Bell, 
  Lock, 
  Plus, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  MoreVertical,
  Mail,
  Shield,
  ArrowRight,
  Database,
  CreditCard,
  Settings as SettingsIcon,
  Activity
} from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'general' | 'team' | 'integrations'>('general');
  const navigate = useNavigate();
   const { config, updateTenantConfig } = useApp();

  return (
    <div className="flex flex-col h-full bg-[#F0F2F5] p-6 md:p-8 overflow-y-auto scrollbar-hide">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <div className="w-10 h-10 bg-[#00A884] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#00A884]/20">
                <SettingsIcon size={20} />
             </div>
             <h1 className="text-3xl font-bold text-[#111B21]">Paramètres</h1>
          </div>
          <p className="text-[#667781] text-[15px]">Gérez votre boutique, votre équipe et vos préférences.</p>
        </div>
        
        <div className="flex items-center gap-1 bg-[#E9EDEF] p-1 rounded-xl w-fit border border-[#D1D7DB]">
          <TabButton active={activeTab === 'general'} onClick={() => setActiveTab('general')} icon={Store} label="Général" />
          <TabButton active={activeTab === 'team'} onClick={() => setActiveTab('team')} icon={Users} label="Équipe" />
          <TabButton active={activeTab === 'integrations'} onClick={() => setActiveTab('integrations')} icon={LinkIcon} label="Intégrations" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         {/* Sidebar Navigation */}
         <div className="hidden lg:flex lg:col-span-3 flex-col gap-2">
            <MenuLink active={activeTab === 'general'} icon={Store} label="Identité Boutique" onClick={() => setActiveTab('general')} />
            <MenuLink active={activeTab === 'team'} icon={Users} label="Gestion Équipe" onClick={() => setActiveTab('team')} />
            <MenuLink active={activeTab === 'integrations'} icon={LinkIcon} label="Apps & API" onClick={() => setActiveTab('integrations')} />
            <div className="my-6 border-b border-[#D1D7DB]" />
            <MenuLink active={false} icon={CreditCard} label="Facturation" />
            <MenuLink active={false} icon={Shield} label="Sécurité" />
            <MenuLink active={false} icon={Activity} label="Worklows" />
         </div>

         {/* Content Area */}
         <div className="lg:col-span-9 space-y-10 pb-20 animate-slideIn">
                  {activeTab === 'general' && (
                     <GeneralSettings
                        modeFreelance={config?.mode_freelance === true}
                        onToggleModeFreelance={async (value: boolean) => {
                           await updateTenantConfig({ mode_freelance: value });
                        }}
                     />
                  )}
            {activeTab === 'team' && <TeamSettings />}
            {activeTab === 'integrations' && <IntegrationsSettings />}
         </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold transition-all ${active ? 'bg-white text-[#111B21] shadow-sm' : 'text-[#54656F] hover:bg-white/50'}`}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}

function MenuLink({ active, icon: Icon, label, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 px-5 py-3.5 rounded-xl text-[14px] font-bold transition-all cursor-pointer ${active ? 'bg-[#00A884] text-white shadow-lg shadow-[#00A884]/10' : 'text-[#8696A0] hover:bg-white hover:text-[#111B21] hover:shadow-sm'}`}
    >
      <Icon size={18} />
      {label}
    </div>
  );
}

/* ─── GENERAL ─── */
function GeneralSettings({
   modeFreelance,
   onToggleModeFreelance,
}: {
   modeFreelance: boolean;
   onToggleModeFreelance: (value: boolean) => Promise<void>;
}) {
   const [savingMode, setSavingMode] = useState(false);

   const handleToggle = async () => {
      setSavingMode(true);
      try {
         await onToggleModeFreelance(!modeFreelance);
      } finally {
         setSavingMode(false);
      }
   };

  return (
    <div className="space-y-8 animate-slideIn">
       <section className="bg-white rounded-[24px] border border-[#D1D7DB] shadow-sm p-8">
          <h3 className="text-xl font-bold text-[#111B21] mb-8">Profil Public</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-3">
                <label className="text-[12px] font-bold text-[#8696A0] uppercase tracking-wider">Nom du commerce</label>
                <input type="text" placeholder="Pretalk Hub" className="w-full bg-[#F0F2F5] border border-[#D1D7DB] rounded-xl px-4 py-3 text-[15px] font-semibold text-[#111B21] focus:outline-none focus:ring-2 focus:ring-[#00A884]/20" />
             </div>
             <div className="space-y-3">
                <label className="text-[12px] font-bold text-[#8696A0] uppercase tracking-wider">Email Support</label>
                <input type="email" placeholder="contact@shop.com" className="w-full bg-[#F0F2F5] border border-[#D1D7DB] rounded-xl px-4 py-3 text-[15px] font-semibold text-[#111B21] focus:outline-none focus:ring-2 focus:ring-[#00A884]/20" />
             </div>
          </div>
          <div className="mt-10 flex justify-end">
             <button className="bg-[#111B21] text-white px-8 py-3 rounded-xl font-bold text-sm shadow-xl hover:brightness-125 transition-all">Enregistrer les modifications</button>
          </div>
       </section>

          <section className="bg-white rounded-[24px] border border-[#D1D7DB] shadow-sm p-8">
             <div className="flex items-center justify-between gap-4">
                <div>
                   <h3 className="text-xl font-bold text-[#111B21] mb-1">Mode Freelance</h3>
                   <p className="text-[#667781] text-sm">
                      Active le pipeline Dossiers de Service et le bouton Creer Devis dans l'inbox.
                   </p>
                </div>
                <button
                   onClick={handleToggle}
                   disabled={savingMode}
                   className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-60 ${
                      modeFreelance
                         ? 'bg-[#E7F3EF] text-[#00A884] border border-[#BBF7D0]'
                         : 'bg-[#F0F2F5] text-[#54656F] border border-[#D1D7DB]'
                   }`}
                >
                   {savingMode
                      ? 'Mise a jour...'
                      : modeFreelance
                         ? 'Desactiver'
                         : 'Activer'}
                </button>
             </div>
          </section>

       <div className="p-8 bg-rose-50 rounded-[24px] border border-rose-100 border-l-[6px] border-l-rose-500">
          <h3 className="text-[16px] font-bold text-rose-800 mb-1">Zone de Danger</h3>
          <p className="text-rose-700/70 text-sm mb-6">La suppression est irréversible. Toutes les données seront effacées.</p>
          <button className="bg-white text-rose-600 border border-rose-200 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-rose-600 hover:text-white transition-all shadow-sm">Supprimer mon compte</button>
       </div>
    </div>
  );
}

/* ─── TEAM ─── */
function TeamSettings() {
  return (
    <div className="bg-white rounded-[24px] border border-[#D1D7DB] shadow-sm overflow-hidden animate-slideIn flex flex-col">
       <div className="p-8 border-b border-[#E9EDEF] bg-[#F0F2F5]/30 flex items-center justify-between">
          <div>
             <h3 className="text-xl font-bold text-[#111B21]">Membres de l'Équipe</h3>
             <p className="text-[#667781] text-sm mt-1">Gérez les accès de vos collaborateurs.</p>
          </div>
          <button className="flex items-center gap-2 bg-[#00A884] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-[#00A884]/20 hover:brightness-105 transition-all">
             <Plus size={18} /> Inviter un membre
          </button>
       </div>

       <div className="overflow-x-auto">
          <table className="w-full text-left">
             <thead className="bg-[#F0F2F5] border-b border-[#D1D7DB]">
                <tr>
                   <th className="px-8 py-4 text-[13px] font-bold text-[#54656F] uppercase">Membre</th>
                   <th className="px-8 py-4 text-[13px] font-bold text-[#54656F] uppercase">Rôle</th>
                   <th className="px-8 py-4 text-[13px] font-bold text-[#54656F] uppercase">Statut</th>
                   <th className="px-8 py-4 text-[13px] font-bold text-[#54656F] uppercase text-right">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-[#E9EDEF]">
                {[
                  { name: 'Yassine K.', email: 'admin@pretalk.me', role: 'Propriétaire', status: 'Actif' },
                  { name: 'Sarah B.', email: 'sarah@pretalk.me', role: 'Manager SAV', status: 'Actif' },
                ].map((m, i) => (
                  <tr key={i} className="hover:bg-[#F8F9FA] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#DFE5E7] rounded-full flex items-center justify-center font-bold text-sm shrnk-0">{m.name[0]}</div>
                        <div>
                          <div className="font-bold text-[#111B21]">{m.name}</div>
                          <div className="text-[12px] text-[#8696A0]">{m.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className="px-3 py-1 bg-[#F0F2F5] text-[#111B21] rounded-md text-[11px] font-bold border border-[#D1D7DB]">{m.role}</span>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-2 text-[12px] font-bold text-[#667781]">
                          <div className={`w-2 h-2 rounded-full ${m.status === 'Actif' ? 'bg-[#00A884]' : 'bg-rose-500'}`} />
                          {m.status}
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <button className="p-2.5 text-[#8696A0] hover:text-[#111B21] rounded-lg hover:bg-white transition-all"><MoreVertical size={18} /></button>
                    </td>
                  </tr>
                ))}
             </tbody>
          </table>
       </div>
    </div>
  );
}

/* ─── INTEGRATIONS ─── */
function IntegrationsSettings() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-slideIn">
          <IntegrationCard name="WhatsApp QR" desc="Scannez un QR code pour connecter un compte WhatsApp Web" icon={LinkIcon} status="Disconnected" actionLabel="Ouvrir" actionPath="/settings/wa-connect" />
       <IntegrationCard name="WhatsApp API" desc="Connectez votre numéro Meta Cloud" icon={Mail} status="Connected" />
       <IntegrationCard name="YouCan sync" desc="Synchronisez vos produits et commandes" icon={Store} status="Connected" />
          <IntegrationCard name="Google Sheets" desc="Gérez vos stocks via un tableur" icon={Database} status="Disconnected" actionLabel="Configurer" actionPath="/settings/google-sheets" />
          <IntegrationCard name="Confirmations commandes" desc="Templates WhatsApp pour commandes e-commerce" icon={Bell} status="Disconnected" actionLabel="Gérer" actionPath="/settings/order-confirmations" />
          <IntegrationCard name="Widget web" desc="Intégrez le chatbot sur votre site" icon={Globe} status="Disconnected" actionLabel="Configurer" actionPath="/settings/widget" />
    </div>
  );
}

function IntegrationCard({ name, desc, icon: Icon, status, actionLabel, actionPath }: any) {
   const navigate = useNavigate();
  return (
    <div className="bg-white p-8 rounded-[24px] border border-[#D1D7DB] shadow-sm flex flex-col justify-between hover:shadow-md transition-all group">
       <div>
          <div className="flex items-center justify-between mb-8">
             <div className="w-14 h-14 bg-[#F0F2F5] rounded-2xl flex items-center justify-center text-[#111B21] group-hover:bg-[#111B21] group-hover:text-white transition-all shadow-inner">
                <Icon size={28} />
             </div>
             <StatusLabel status={status} />
          </div>
          <h3 className="text-xl font-bold text-[#111B21] mb-2">{name}</h3>
          <p className="text-[#667781] text-[15px] leading-relaxed">{desc}</p>
       </div>
       <div className="mt-10 pt-6 border-t border-[#F0F2F5] flex items-center justify-between">
          <button onClick={() => actionPath ? navigate(actionPath) : undefined} className="text-[13px] font-bold text-[#111B21] hover:text-[#00A884] flex items-center gap-2 group/btn">
             Gérer <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
          <button className="text-[12px] font-bold text-rose-500 hover:text-rose-700">{actionLabel || 'Déconnecter'}</button>
       </div>
    </div>
  );
}

function StatusLabel({ status }: { status: string }) {
  if (status === 'Connected') return (
     <div className="px-3 py-1 bg-[#E7F3EF] text-[#00A884] rounded-md text-[10px] font-bold border border-[#00A884]/10 uppercase tracking-widest">Connecté</div>
  );
  if (status === 'Warning') return (
     <div className="px-3 py-1 bg-amber-50 text-amber-600 rounded-md text-[10px] font-bold border border-amber-100 uppercase tracking-widest">Requis</div>
  );
  return (
     <div className="px-3 py-1 bg-[#F0F2F5] text-[#8696A0] rounded-md text-[10px] font-bold border border-[#D1D7DB] uppercase tracking-widest">Déconnecté</div>
  );
}

function Volume2({ size, className }: any) {
    return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
}
