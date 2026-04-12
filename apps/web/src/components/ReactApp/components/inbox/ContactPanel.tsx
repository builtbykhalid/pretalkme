import { useState } from 'react';
import { useChatStore } from '../../stores/useChatStore';
import { supabase } from '../../lib/supabase';
import { 
  X, 
  ChevronRight, 
  Star, 
  Bell, 
  History, 
  Clock, 
  Lock, 
  Trash2, 
  Ban, 
  Flag,
  Layers,
  Tag as TagIcon,
  Plus,
  User,
  Bot as BotIcon,
  StickyNote
} from 'lucide-react';

const PIPELINE_STAGES = [
  { value: 'new', label: '🆕 Nouveau', color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
  { value: 'qualified', label: '✅ Qualifié', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  { value: 'proposed', label: '📋 Proposé', color: 'bg-amber-50 text-amber-700 border-amber-100' },
  { value: 'negotiating', label: '🤝 Négociation', color: 'bg-orange-50 text-orange-700 border-orange-100' },
  { value: 'won', label: '🏆 Gagné', color: 'bg-green-100 text-green-800 border-green-200' },
  { value: 'lost', label: '❌ Perdu', color: 'bg-rose-50 text-rose-700 border-rose-100' },
];

export function ContactPanel({ conversationId }: { conversationId: string }) {
  const { conversations, updateConversation } = useChatStore();
  const conversation = conversations.find(c => c.id === conversationId);
  const [newTag, setNewTag] = useState('');

  if (!conversation) return null;

  const contact = conversation.contact || {};
  const tags = contact.tags || [];
  const currentStage = contact.pipeline_stage || 'new';

  const handleUpdateContact = async (updates: any) => {
    if (!contact.id) return;
    const { error } = await supabase
      .from('contacts')
      .update(updates)
      .eq('id', contact.id);
    
    if (!error) {
      // Update local state by nesting it in conversation.contact
      updateConversation(conversationId, { 
        contact: { ...contact, ...updates } 
      });
    }
  };

  const handleAddTag = () => {
    if (!newTag.trim() || tags.includes(newTag.trim())) return;
    const updatedTags = [...tags, newTag.trim()];
    handleUpdateContact({ tags: updatedTags });
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleUpdateContact({ tags: tags.filter((t: string) => t !== tagToRemove) });
  };

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA]">
      <div className="h-[60px] px-6 py-2 bg-[#F0F2F5] flex items-center justify-between shrink-0 border-b border-[#E9EDEF]">
         <h3 className="text-[16px] text-[#111B21] font-medium">Informations Contact</h3>
         <div className="text-[#54656F] cursor-pointer hover:bg-[#D1D7DB] p-1.5 rounded-full transition-colors"><X size={24} /></div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {/* Profile Card */}
        <div className="bg-white px-8 py-8 flex flex-col items-center border-b-[8px] border-[#F0F2F5]">
           <div className="w-44 h-44 bg-[#DFE5E7] rounded-full overflow-hidden mb-6 shrink-0 flex items-center justify-center text-white text-6xl font-bold shadow-sm">
             {contact.avatar_url ? (
                <img src={contact.avatar_url} alt="" className="w-full h-full object-cover" />
             ) : (
                (contact.name?.[0] || contact.phone?.[0] || '?').toUpperCase()
             )}
           </div>
           <h2 className="text-[20px] text-[#111B21] mb-1 font-bold text-center w-full">
             {contact.name || contact.phone}
           </h2>
           <p className="text-[16px] text-[#667781] font-medium tracking-tight">{contact.phone}</p>
        </div>

        {/* CRM Sections — Pipeline Stage */}
        <div className="bg-white px-8 py-6 border-b-[8px] border-[#F0F2F5]">
           <div className="flex items-center gap-2 mb-4 text-[#00A884] font-bold text-[12px] uppercase tracking-[0.1em]">
              <Layers size={16} /> Étape du Pipeline
           </div>
           <div className="relative">
             <select 
               value={currentStage}
               onChange={(e) => handleUpdateContact({ pipeline_stage: e.target.value })}
               className={`w-full p-2.5 rounded-xl border text-[14px] font-bold transition-all outline-none appearance-none cursor-pointer pr-10 shadow-sm ${
                 PIPELINE_STAGES.find(s => s.value === currentStage)?.color || 'bg-[#F0F2F5] border-[#E9EDEF]'
               }`}
             >
               {PIPELINE_STAGES.map(s => (
                 <option key={s.value} value={s.value}>{s.label}</option>
               ))}
             </select>
             <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                <ChevronRight size={16} className="rotate-90" />
             </div>
           </div>
        </div>

        {/* CRM Sections — Tags */}
        <div className="bg-white px-8 py-6 border-b-[8px] border-[#F0F2F5]">
           <div className="flex items-center gap-2 mb-4 text-[#00A884] font-bold text-[12px] uppercase tracking-[0.1em]">
              <TagIcon size={16} /> Tags CRM
           </div>
           <div className="flex flex-wrap gap-2 mb-4">
              {tags.map((tag: string) => (
                <span key={tag} className="flex items-center gap-2 px-3 py-1.5 bg-[#F0F2F5] text-[#111B21] rounded-lg text-[13px] font-bold border border-[#D1D7DB] shadow-sm">
                   {tag}
                   <button onClick={() => handleRemoveTag(tag)} className="text-[#8696A0] hover:text-[#EA0038] transition-colors">
                      <X size={14} />
                   </button>
                </span>
              ))}
              {tags.length === 0 && <p className="text-[13px] text-[#8696A0] font-medium">Aucun tag pour ce contact.</p>}
           </div>
           <div className="flex items-center gap-2">
              <input 
                type="text" 
                placeholder="Ajouter un tag..." 
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                className="flex-1 bg-[#F8F9FA] border border-[#D1D7DB] rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#00A884]/20 transition-all font-medium"
              />
              <button 
                onClick={handleAddTag}
                className="p-2.5 bg-[#00A884] text-white rounded-xl hover:bg-[#008f6f] transition-all shadow-md active:scale-95"
              >
                <Plus size={20} />
              </button>
           </div>
        </div>

        {/* Timeline (Static for now, but following design) */}
        <div className="bg-white px-8 py-6 border-b-[8px] border-[#F0F2F5]">
           <div className="flex items-center gap-2 mb-5 text-[#00A884] font-bold text-[12px] uppercase tracking-[0.1em]">
              <History size={16} /> Parcours IA & Agent
           </div>
           <div className="space-y-6">
              <TimelineEvent 
                type="ai" 
                time="14:32" 
                label="Conversation Initiale" 
                desc="L'agent IA a pris en charge le message entrant." 
              />
              {conversation.status === 'pending_human' && (
                <TimelineEvent 
                  type="human" 
                  time="16:05" 
                  label="Alerte Agent" 
                  desc="Transfert requis : Besoin d'un agent humain détecté." 
                  warning
                />
              )}
           </div>
        </div>

        {/* WhatsApp Profile Items */}
        <div className="bg-white px-0">
           <PanelItem icon={<Bell size={20} />} label="Sourdine" />
           <PanelItem icon={<Star size={20} />} label="Messages importants" />
           <PanelItem icon={<Lock size={20} />} label="Chiffrement" value="Les messages sont chiffrés de bout en bout." />
        </div>

        {/* Safety Actions */}
        <div className="bg-white border-t border-[#F0F2F5] pb-10">
           <PanelItem icon={<Ban size={20} />} label="Bloquer le contact" danger />
           <PanelItem icon={<Flag size={20} />} label="Signaler le contact" danger />
           <PanelItem icon={<Trash2 size={20} />} label="Supprimer la discussion" danger />
        </div>
      </div>
    </div>
  );
}

function TimelineEvent({ type, time, label, desc, warning }: { type: 'ai' | 'human', time: string, label: string, desc: string, warning?: boolean }) {
  return (
    <div className="flex gap-4 relative">
       <div className={`w-0.5 h-full absolute left-[15.5px] top-6 bottom-[-24px] ${warning ? 'bg-rose-100' : 'bg-indigo-50'} -z-0`} />
       <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 shadow-sm border ${
         warning ? 'bg-[#EA0038] text-white border-rose-600' : type === 'ai' ? 'bg-[#53BDEB] text-white border-blue-400' : 'bg-[#00A884] text-white border-[#008f6f]'
       }`}>
          {type === 'ai' ? <BotIcon size={16} /> : <User size={16} />}
       </div>
       <div className="flex-1 pt-1">
          <div className="flex justify-between items-center mb-1">
             <span className="text-[14px] font-bold text-[#111B21]">{label}</span>
             <span className="text-[11px] text-[#8696A0] font-bold">{time}</span>
          </div>
          <p className="text-[13px] text-[#667781] leading-relaxed font-medium">{desc}</p>
       </div>
    </div>
  );
}

function PanelItem({ icon, label, value, danger }: { icon: any; label: string; value?: string; danger?: boolean }) {
  return (
    <div className="px-8 py-5 flex items-center gap-5 hover:bg-[#F5F6F6] cursor-pointer group transition-colors">
       <div className={danger ? 'text-[#EA0038]' : 'text-[#8696A0] group-hover:text-[#54656F]'}>{icon}</div>
       <div className="flex-1 min-w-0">
          <p className={`text-[15px] font-medium ${danger ? 'text-[#EA0038]' : 'text-[#111B21]'}`}>{label}</p>
          {value && <p className="text-[13px] text-[#667781] truncate mt-0.5">{value}</p>}
       </div>
       {!danger && <ChevronRight size={18} className="text-[#D1D7DB] group-hover:text-[#8696A0]" />}
    </div>
  );
}
