import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MessageSquare, 
  Phone, 
  Mail, 
  Tag as TagIcon, 
  Calendar, 
  ShoppingBag, 
  Clock, 
  MoreHorizontal,
  Edit,
  History,
  Activity,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ContactDetail() {
  const { contactId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'conversations' | 'orders' | 'notes'>('conversations');

  const contact = {
    id: contactId,
    name: 'Hamza Ouazzani',
    phone: '+212 6 12 34 56 78',
    email: 'hamza@example.ma',
    tags: ['VIP', 'Client Fidèle', 'Réclamation'],
    pipeline_stage: 'En négociation',
    created_at: '2024-01-15T10:00:00Z',
    last_activity: '2024-04-12T14:32:00Z',
  };

  return (
    <div className="flex flex-col h-full bg-[#F8F8F8] p-4 md:p-8 overflow-y-auto">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/whatsapp/crm')}
          className="p-3 bg-white border border-[#EEEEEE] rounded-2xl text-[#221A40] hover:shadow-md transition-all shadow-sm"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
           <div className="flex items-center gap-2 text-[10px] font-black text-[#AAAAAA] uppercase tracking-widest mb-1">
              <span>CRM</span>
              <ChevronRight size={10} />
              <span>Détails du contact</span>
           </div>
           <h1 className="text-2xl font-black text-[#221A40]">{contact.name}</h1>
        </div>
        
        <div className="ml-auto flex items-center gap-2">
           <button 
             onClick={() => navigate(`/whatsapp/inbox?contactId=${contact.id}`)}
             className="flex items-center gap-2 bg-[#221A40] text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#221A40]/10 hover:brightness-110 transition-all"
           >
              <MessageSquare size={18} />
              Ouvrir Inbox
           </button>
           <button className="p-3 bg-white border border-[#EEEEEE] rounded-2xl text-[#AAAAAA] hover:text-[#221A40] transition-all">
              <MoreHorizontal size={20} />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white rounded-[40px] border border-[#EEEEEE] shadow-sm p-8">
               <div className="flex flex-col items-center text-center mb-8">
                  <div className="w-24 h-24 bg-[#221A40] rounded-[32px] flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-[#221A40]/10 mb-4">
                     {contact.name[0]}
                  </div>
                  <h2 className="text-xl font-black text-[#221A40]">{contact.name}</h2>
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-wider mt-2 border border-indigo-100">
                     {contact.pipeline_stage}
                  </span>
               </div>

               <div className="space-y-6">
                  <InfoItem icon={Phone} label="Téléphone" value={contact.phone} />
                  <InfoItem icon={Mail} label="Email" value={contact.email} />
                  <InfoItem icon={Calendar} label="Client depuis" value={format(new Date(contact.created_at), 'dd MMM yyyy', { locale: fr })} />
               </div>

               <div className="mt-8 pt-8 border-t border-[#F9F9F9]">
                  <h4 className="text-[10px] font-black text-[#AAAAAA] uppercase tracking-widest mb-4">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                     {contact.tags.map(t => (
                        <span key={t} className="px-3 py-1 bg-[#FAFAFA] border border-[#EEEEEE] text-[#6B6B6B] rounded-xl text-[10px] font-black uppercase tracking-wider">
                           {t}
                        </span>
                     ))}
                     <button className="w-8 h-8 rounded-lg border border-dashed border-[#EEEEEE] flex items-center justify-center text-[#AAAAAA] hover:text-[#221A40] transition-all">
                        <TagIcon size={14} />
                     </button>
                  </div>
               </div>
            </div>

            <div className="bg-[#48D951] rounded-[40px] p-8 text-[#08300A] relative overflow-hidden group shadow-xl shadow-[#48D951]/20">
               <h3 className="font-black text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                  <ShoppingBag size={18} />
                  LTV (Valeur à vie)
               </h3>
               <div className="text-3xl font-black mb-4">2,450 DH</div>
               <div className="text-[10px] font-black uppercase tracking-widest opacity-60">4 commandes passées</div>
               <div className="absolute -bottom-4 -right-4 text-[#08300A]/10 group-hover:scale-110 transition-transform">
                  <ShoppingBag size={120} />
               </div>
            </div>
         </div>

         <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="bg-white rounded-[40px] border border-[#EEEEEE] shadow-sm flex flex-col flex-1 overflow-hidden">
               <div className="p-8 border-b border-[#F9F9F9] bg-[#FAFAFA]/30 flex items-center justify-between">
                  <div className="flex items-center gap-1 bg-[#F5F5F5] p-1.5 rounded-2xl border border-[#EEEEEE]">
                     <DetailTab active={activeTab === 'conversations'} onClick={() => setActiveTab('conversations')} icon={History} label="Conversations" />
                     <DetailTab active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={ShoppingBag} label="Commandes" />
                     <DetailTab active={activeTab === 'notes'} onClick={() => setActiveTab('notes')} icon={Edit} label="Notes" />
                  </div>
               </div>

               <div className="flex-1 p-8 overflow-y-auto">
                  {activeTab === 'conversations' && <ConversationHistory />}
                  {activeTab === 'orders' && <div className="text-center py-20 text-[#AAAAAA] italic font-bold">Historique des commandes client...</div>}
                  {activeTab === 'notes' && <div className="text-center py-20 text-[#AAAAAA] italic font-bold">Gestion des notes internes...</div>}
               </div>
            </div>
            
            <div className="bg-white rounded-[40px] border border-[#EEEEEE] shadow-sm p-8">
               <h3 className="text-md font-black text-[#221A40] mb-6 flex items-center gap-2 uppercase tracking-widest text-xs">
                  <Activity size={18} className="text-[#221A40]" />
                  Timeline HITL (Human-in-the-loop)
               </h3>
               <div className="space-y-6">
                  <TimelineItem 
                     time="Aujourd'hui, 14:32" 
                     title="Transfert IA ➔ Humain" 
                     desc="L'IA a détecté une réclamation concernant une livraison en retard."
                     agent="Sarah B."
                  />
                  <TimelineItem 
                     time="12 Avril, 15:10" 
                     title="Résolu par Humain" 
                     desc="Le client a été remboursé. Repassage en automatique."
                     agent="Sarah B."
                  />
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-center gap-4">
       <div className="w-10 h-10 bg-[#FAFAFA] border border-[#EEEEEE] rounded-xl flex items-center justify-center text-[#AAAAAA]">
          <Icon size={18} />
       </div>
       <div>
          <div className="text-[10px] font-black text-[#AAAAAA] uppercase tracking-widest">{label}</div>
          <div className="text-sm font-bold text-[#221A40]">{value}</div>
       </div>
    </div>
  );
}

function DetailTab({ active, onClick, icon: Icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${active ? 'bg-white text-[#221A40] shadow-sm border border-[#EEEEEE]' : 'text-[#AAAAAA] hover:text-[#221A40]'}`}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}

function ConversationHistory() {
  return (
    <div className="space-y-4">
       {[1,2,3].map(i => (
         <div key={i} className="flex flex-col gap-2 p-5 bg-[#FAFAFA] border border-[#EEEEEE] rounded-3xl hover:border-[#221A40]/20 transition-all cursor-pointer group">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#48D951]" />
                  <span className="text-[10px] font-black text-[#221A40] uppercase tracking-wider">Session WhatsApp #{i*1240}</span>
               </div>
               <span className="text-[10px] font-bold text-[#AAAAAA]">12 Avril 2024</span>
            </div>
            <p className="text-sm font-medium text-[#6B6B6B] line-clamp-2">
               "Bonjour, ma commande #10234 n'est toujours pas arrivée. Que se passe-t-il ?"
            </p>
            <div className="mt-2 flex items-center justify-end">
               <span className="text-[10px] font-black text-[#221A40] uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all">
                  Voir <ArrowRight size={12} />
               </span>
            </div>
         </div>
       ))}
    </div>
  );
}

function TimelineItem({ time, title, desc, agent }: any) {
  return (
    <div className="relative pl-8 border-l-2 border-[#EEEEEE]">
       <div className="absolute left-[-9px] top-0 w-4 h-4 bg-white border-2 border-[#221A40] rounded-full" />
       <div className="text-[10px] font-black text-[#AAAAAA] uppercase tracking-widest mb-1">{time}</div>
       <div className="text-sm font-black text-[#221A40] flex items-center gap-2">
          {title}
          <span className="text-[10px] font-bold text-[#221A40] bg-[#F5F5F5] px-2 py-0.5 rounded-md border border-[#EEEEEE]">Agent: {agent}</span>
       </div>
       <p className="text-[11px] font-medium text-[#6B6B6B] mt-1">{desc}</p>
    </div>
  );
}

function ArrowRight({ size, className }: any) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
    )
}
