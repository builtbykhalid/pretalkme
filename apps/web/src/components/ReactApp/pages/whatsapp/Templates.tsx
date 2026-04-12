import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  XCircle,
  MoreVertical,
  ChevronRight,
  MessageSquare,
  Copy,
  Trash2
} from 'lucide-react';

export default function Templates() {
  const { api } = useApi();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await api.get('/api/v1/templates');
        setTemplates(response.data);
      } catch (err) {
        console.error('Failed to fetch templates:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, [api]);

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.body.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#F0F2F5] p-6 md:p-8 overflow-hidden font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-[#111B21]">Templates WhatsApp</h1>
          <p className="text-[#667781] text-[15px] font-medium mt-1">Gérez vos modèles de messages approuvés par Meta.</p>
        </div>
        
        <button className="bg-[#00A884] hover:bg-[#008F6F] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-[#00A884]/20 transition-all active:scale-95">
          <Plus size={20} />
          Créer un Template
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-[#D1D7DB] shadow-sm mb-8 flex flex-col sm:flex-row items-center gap-4 shrink-0">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8696A0]" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher par nom ou contenu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-[#F0F2F5] rounded-xl text-[14px] text-[#111B21] placeholder:text-[#8696A0] focus:outline-none focus:ring-2 focus:ring-[#00A884]/20 transition-all border border-transparent focus:border-[#00A884]"
            />
         </div>
         <div className="flex items-center gap-3 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-[#D1D7DB] rounded-xl text-[14px] font-bold text-[#54656F] hover:bg-[#F0F2F5] transition-all">
               <Filter size={18} />
               Filtrer
            </button>
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-[#D1D7DB] rounded-xl text-[14px] font-bold text-[#54656F] hover:bg-[#F0F2F5] transition-all">
               Catégorie
            </button>
         </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
         {loading ? (
           <div className="flex flex-col items-center justify-center h-64 opacity-50">
              <div className="w-10 h-10 border-4 border-[#00A884] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="font-bold text-[#54656F]">Chargement des modèles...</p>
           </div>
         ) : filteredTemplates.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-80 bg-white rounded-[32px] border border-dashed border-[#D1D7DB]">
              <div className="w-20 h-20 bg-[#F0F2F5] rounded-3xl flex items-center justify-center text-[#8696A0] mb-6">
                 <FileText size={40} />
              </div>
              <h3 className="text-xl font-bold text-[#111B21] mb-2">Aucun template trouvé</h3>
              <p className="text-[#8696A0] max-w-sm text-center font-medium">Commencez par créer votre premier modèle de message pour vos campagnes WhatsApp.</p>
           </div>
         ) : (
           <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-8">
              {filteredTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
           </div>
         )}
      </div>
    </div>
  );
}

function TemplateCard({ template }: { template: any }) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="bg-[#E7F3EF] text-[#00A884] px-2.5 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1.5 uppercase tracking-wider"><CheckCircle2 size={12} /> Approuvé</span>;
      case 'REJECTED':
        return <span className="bg-[#FEEDF1] text-[#EA0038] px-2.5 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1.5 uppercase tracking-wider"><XCircle size={12} /> Refusé</span>;
      default:
        return <span className="bg-[#FFF8E6] text-[#FFB000] px-2.5 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1.5 uppercase tracking-wider"><Clock size={12} /> En attente</span>;
    }
  };

  return (
    <div className="bg-white rounded-[32px] border border-[#D1D7DB] overflow-hidden group hover:shadow-xl hover:border-[#00A884]/30 transition-all duration-300 flex flex-col h-full">
       <div className="p-6 border-b border-[#F0F2F5] flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-[#F0F2F5] rounded-2xl flex items-center justify-center text-[#00A884] group-hover:bg-[#00A884] group-hover:text-white transition-all">
                <MessageSquare size={24} />
             </div>
             <div>
                <h3 className="font-bold text-[#111B21] group-hover:text-[#00A884] transition-colors">{template.name}</h3>
                <p className="text-[11px] font-bold text-[#8696A0] uppercase tracking-widest">{template.category}</p>
             </div>
          </div>
          <div className="flex items-center gap-3">
             {getStatusBadge(template.status)}
             <button className="p-2 hover:bg-[#F0F2F5] rounded-xl text-[#8696A0] transition-colors">
                <MoreVertical size={20} />
             </button>
          </div>
       </div>
       
       <div className="p-6 flex-1 flex flex-col bg-[#F8F9FA]/50">
          <div className="bg-white border border-[#E9EDEF] rounded-2xl p-5 mb-6 flex-1 relative group/body">
             <p className="text-[14px] text-[#54656F] leading-relaxed whitespace-pre-wrap">{template.body}</p>
             <div className="absolute top-2 right-2 opacity-0 group-hover/body:opacity-100 transition-opacity">
                <button className="p-2 bg-white border border-[#E9EDEF] rounded-lg shadow-sm text-[#8696A0] hover:text-[#00A884] transition-all">
                   <Copy size={16} />
                </button>
             </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
             <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-[#00A884]/10 flex items-center justify-center">
                     <span className="text-[10px] font-bold text-[#00A884]">{i}</span>
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-white bg-[#F0F2F5] flex items-center justify-center">
                   <span className="text-[10px] font-bold text-[#8696A0]">+2</span>
                </div>
             </div>
             <div className="flex items-center gap-2">
                <button className="p-2.5 text-[#8696A0] hover:text-[#EA0038] hover:bg-rose-50 rounded-xl transition-all">
                   <Trash2 size={20} />
                </button>
                <button className="px-5 py-2.5 bg-white border border-[#D1D7DB] text-[#54656F] font-bold text-[13px] rounded-xl hover:bg-[#F0F2F5] transition-all flex items-center gap-2">
                   Détails
                   <ChevronRight size={16} />
                </button>
             </div>
          </div>
       </div>
    </div>
  );
}
