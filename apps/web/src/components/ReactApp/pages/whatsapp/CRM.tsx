import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContacts } from '../../hooks/useContacts';
import { 
  Users, 
  LayoutGrid, 
  Search, 
  Plus, 
  MessageSquare, 
  Edit, 
  Trash2,
  User,
  Phone,
  Clock,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const PIPELINE_STAGES = [
  { id: 'new', label: 'Nouveau', color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
  { id: 'qualified', label: 'Qualifié', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  { id: 'proposed', label: 'Proposé', color: 'bg-amber-50 text-amber-700 border-amber-100' },
  { id: 'negotiating', label: 'Négociation', color: 'bg-orange-50 text-orange-700 border-orange-100' },
  { id: 'won', label: 'Gagné', color: 'bg-green-100 text-green-800 border-green-200' },
  { id: 'lost', label: 'Perdu', color: 'bg-rose-50 text-rose-700 border-rose-100' },
];

export default function CRM() {
  const [activeTab, setActiveTab] = useState<'list' | 'pipeline'>('list');
  const { contacts, loading, updateContact } = useContacts();
  const [search, setSearch] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('all');

  const filteredContacts = useMemo(() => {
    return contacts.filter(c => {
      const matchesSearch = 
        (c.name || '').toLowerCase().includes(search.toLowerCase()) || 
        (c.phone || '').includes(search);
      const matchesStage = selectedStage === 'all' || c.pipeline_stage === selectedStage;
      return matchesSearch && matchesStage;
    });
  }, [contacts, search, selectedStage]);

  return (
    <div className="flex flex-col h-full bg-[#F0F2F5] p-6 md:p-8 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <div className="w-10 h-10 bg-[#00A884] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#00A884]/20">
                <Users size={20} />
             </div>
             <h1 className="text-3xl font-bold text-[#111B21]">CRM & Contacts</h1>
          </div>
          <p className="text-[#667781] text-[15px] pl-1">Gérez votre pipeline de vente et automatisez vos relations clients.</p>
        </div>
        
        <div className="flex items-center gap-1 bg-[#E9EDEF] p-1 rounded-xl w-fit border border-[#D1D7DB]">
          <button 
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-[13px] font-bold transition-all ${activeTab === 'list' ? 'bg-white text-[#111B21] shadow-sm' : 'text-[#54656F] hover:bg-white/40'}`}
          >
            <Users size={16} />
            Liste
          </button>
          <button 
            onClick={() => setActiveTab('pipeline')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-[13px] font-bold transition-all ${activeTab === 'pipeline' ? 'bg-white text-[#111B21] shadow-sm' : 'text-[#54656F] hover:bg-white/40'}`}
          >
            <LayoutGrid size={16} />
            Pipeline
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-white rounded-[24px] border border-[#D1D7DB] shadow-sm overflow-hidden flex flex-col">
        {activeTab === 'list' ? (
          <ContactListView 
            contacts={filteredContacts} 
            loading={loading}
            search={search}
            setSearch={setSearch}
            selectedStage={selectedStage}
            setSelectedStage={setSelectedStage}
          />
        ) : (
          <PipelineView 
            contacts={contacts} 
            updateContact={updateContact}
            loading={loading} 
          />
        )}
      </div>
    </div>
  );
}

function ContactListView({ contacts, loading, search, setSearch, selectedStage, setSelectedStage }: any) {
  const navigate = useNavigate();

  return (
    <>
      <div className="p-6 border-b border-[#E9EDEF] flex flex-wrap items-center justify-between gap-4 bg-[#F0F2F5]/30 shrink-0">
        <div className="flex items-center gap-4 flex-1 min-w-[300px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8696A0]" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-[#D1D7DB] rounded-xl pl-12 pr-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#00A884]/20 transition-all shadow-sm"
            />
          </div>
          <select 
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="bg-white border border-[#D1D7DB] rounded-xl px-4 py-2.5 text-[13px] focus:outline-none font-bold text-[#111B21] shadow-sm cursor-pointer"
          >
            <option value="all">Toutes les étapes</option>
            {PIPELINE_STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
        
        <button className="flex items-center gap-2 bg-[#00A884] text-white px-7 py-2.5 rounded-xl font-bold text-sm hover:brightness-105 transition-all shadow-lg shadow-[#00A884]/20">
          <Plus size={18} /> Nouveau Contact
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <table className="w-full border-collapse text-left">
          <thead className="bg-[#F0F2F5] sticky top-0 z-10 border-b border-[#D1D7DB]">
            <tr>
              <th className="px-8 py-4 text-[12px] font-bold text-[#54656F] uppercase tracking-wider">Contact</th>
              <th className="px-8 py-4 text-[12px] font-bold text-[#54656F] uppercase tracking-wider">Étape</th>
              <th className="px-8 py-4 text-[12px] font-bold text-[#54656F] uppercase tracking-wider">Tags</th>
              <th className="px-8 py-4 text-[12px] font-bold text-[#54656F] uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E9EDEF]">
            {loading ? (
              Array(5).fill(0).map((_, i) => <tr key={i}><td colSpan={4} className="px-8 py-10"><div className="h-4 bg-[#F0F2F5] rounded-full animate-pulse w-full"></div></td></tr>)
            ) : contacts.length > 0 ? (
              contacts.map((c: any) => (
                <tr key={c.id} className="hover:bg-[#F8F9FA] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#DFE5E7] rounded-full flex items-center justify-center text-[#54656F] font-bold text-[16px] shadow-sm shrink-0 overflow-hidden">
                        {(c.name?.[0] || 'U').toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[14px] font-bold text-[#111B21] truncate">{c.name || 'Sans nom'}</div>
                        <div className="text-[12px] text-[#667781] font-medium">{c.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${
                      PIPELINE_STAGES.find(s => s.id === c.pipeline_stage)?.color || 'bg-gray-50'
                    }`}>
                      {PIPELINE_STAGES.find(s => s.id === c.pipeline_stage)?.label || 'Nouveau'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-wrap gap-1.5">
                      {c.tags?.map((t: string) => (
                        <span key={t} className="px-2 py-0.5 bg-[#F0F2F5] text-[#111B21] rounded-md text-[11px] font-bold border border-[#D1D7DB]">
                          {t}
                        </span>
                      )) || <span className="text-[#D1D7DB]">—</span>}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-[#54656F] hover:bg-[#F0F2F5] rounded-lg transition-all"><MessageSquare size={18} /></button>
                      <button className="p-2 text-[#54656F] hover:bg-[#F0F2F5] rounded-lg transition-all"><Edit size={18} /></button>
                      <button className="p-2 text-[#EA0038] hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={4} className="px-8 py-32 text-center text-[#8696A0]">Aucun contact trouvé.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function PipelineView({ contacts, updateContact, loading }: any) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const onDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over) return;
    
    const contactId = active.id;
    const overId = over.id; // Either stage name or contact id

    let newStage = overId;
    if (!PIPELINE_STAGES.some(s => s.id === overId)) {
        const targetContact = contacts.find((c: any) => c.id === overId);
        newStage = targetContact?.pipeline_stage;
    }

    if (newStage) {
        updateContact(contactId, { pipeline_stage: newStage });
    }
  };

  return (
    <div className="flex-1 overflow-x-auto p-8 bg-[#F8F9FA] scrollbar-hide">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <div className="flex gap-8 min-h-full h-fit">
          {PIPELINE_STAGES.map(stage => (
            <PipelineColumn 
              key={stage.id} 
              id={stage.id} 
              title={stage.label} 
              contacts={contacts.filter((c: any) => (c.pipeline_stage || 'new') === stage.id)} 
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}

function PipelineColumn({ id, title, contacts }: any) {
  return (
    <div className="w-72 flex flex-col shrink-0">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="font-bold text-[#111B21] text-[12px] uppercase tracking-[0.1em]">{title}</h3>
        <span className="bg-white text-[#54656F] px-2 py-0.5 rounded-full text-[11px] font-bold border border-[#D1D7DB] shadow-sm">
          {contacts.length}
        </span>
      </div>
      
      <SortableContext id={id} items={contacts.map((c: any) => c.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 bg-[#F0F2F5]/40 border-2 border-dashed border-[#D1D7DB] rounded-[24px] p-3 space-y-3 min-h-[500px]">
          {contacts.map((c: any) => (
            <SortableContactCard key={c.id} contact={c} />
          ))}
          <button className="w-full py-3 border border-dashed border-[#D1D7DB] rounded-xl text-[#8696A0] hover:bg-white hover:text-[#00A884] hover:border-[#00A884]/30 transition-all flex items-center justify-center gap-2 text-[11px] font-bold">
            <Plus size={16} /> Ajouter
          </button>
        </div>
      </SortableContext>
    </div>
  );
}

function SortableContactCard({ contact }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: contact.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.3 : 1
  };

  return (
    <div 
      ref={setNodeRef} style={style} {...attributes} {...listeners}
      className="bg-white p-4 rounded-xl border border-[#D1D7DB] shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group select-none"
    >
      <div className="text-[14px] font-bold text-[#111B21] mb-1 truncate">{contact.name || contact.phone}</div>
      <div className="flex items-center gap-1.5 text-[#8696A0] text-[11px] mb-3 font-medium">
        <Phone size={10} /> {contact.phone}
      </div>
      
      <div className="flex flex-wrap gap-1 mb-2">
        {contact.tags?.slice(0, 2).map((t: string) => (
          <span key={t} className="px-1.5 py-0.5 bg-[#F0F2F5] text-[#111B21] rounded-md text-[10px] font-bold border border-[#D1D7DB]">
            {t}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-[#F0F2F5] pt-3 mt-3">
        <div className="flex items-center gap-1 text-[10px] text-[#8696A0] font-bold uppercase tracking-tighter">
           <Clock size={10} /> 
           {contact.created_at ? format(new Date(contact.created_at), 'dd MMM', { locale: fr }) : 'Maintenant'}
        </div>
        <div className="text-[#00A884] opacity-40 group-hover:opacity-100 transition-opacity">
           <MessageSquare size={14} />
        </div>
      </div>
    </div>
  );
}
