import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Send, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  BarChart3, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Play,
  Copy,
  Trash2,
  Megaphone,
  ArrowRight
} from 'lucide-react';

export default function Campaigns() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const campaigns = [
    { id: 1, name: 'Promotion Ramadan 2024', status: 'Completed', sent: 1240, read: 890, date: '10 Mars' },
    { id: 2, name: 'Relance Paniers Abandonnés', status: 'Sending', sent: 450, read: 120, date: 'En cours' },
    { id: 3, name: 'Nouveau Catalogue Printemps', status: 'Draft', sent: 0, read: 0, date: '---' },
    { id: 4, name: 'Feedback Post-Achat', status: 'Scheduled', sent: 0, read: 0, date: '15 Avril' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#F0F2F5] p-6 md:p-8 overflow-y-auto scrollbar-hide">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <div className="w-10 h-10 bg-[#00A884] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#00A884]/20">
                <Megaphone size={20} />
             </div>
             <h1 className="text-3xl font-bold text-[#111B21]">Campagnes</h1>
          </div>
          <p className="text-[#667781] text-[15px]">Envoyez des messages de masse et analysez leur impact.</p>
        </div>
        
        <button className="flex items-center gap-2 bg-[#00A884] text-white px-7 py-3 rounded-xl font-bold text-sm shadow-lg shadow-[#00A884]/20 hover:brightness-105 transition-all">
          <Plus size={20} /> Nouvelle Campagne
        </button>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10 shrink-0">
         <StatItem label="Envoyés" value="12,500" icon={Send} color="blue" />
         <StatItem label="Taux Ouverture" value="72%" icon={CheckCircle2} color="green" />
         <StatItem label="Signalements" value="0.2%" icon={AlertCircle} color="red" />
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-[24px] border border-[#D1D7DB] shadow-sm overflow-hidden flex flex-col flex-1">
         <div className="p-6 border-b border-[#E9EDEF] flex items-center justify-between bg-[#F0F2F5]/30">
            <div className="relative flex-1 max-w-md">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8696A0]" size={18} />
               <input 
                 type="text" 
                 placeholder="Rechercher une campagne..." 
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="w-full bg-white border border-[#D1D7DB] rounded-xl pl-12 pr-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#00A884]/20 transition-all shadow-sm"
               />
            </div>
            <button className="p-2.5 bg-white border border-[#D1D7DB] rounded-xl text-[#54656F] hover:bg-[#F0F2F5] transition-all"><Filter size={20} /></button>
         </div>

         <div className="overflow-auto scrollbar-hide">
            <table className="w-full text-left">
               <thead className="bg-[#F0F2F5] border-b border-[#D1D7DB]">
                  <tr>
                     <th className="px-8 py-4 text-[13px] font-bold text-[#54656F] uppercase">Campagne</th>
                     <th className="px-8 py-4 text-[13px] font-bold text-[#54656F] uppercase">Statut</th>
                     <th className="px-8 py-4 text-[13px] font-bold text-[#54656F] uppercase">Reach</th>
                     <th className="px-8 py-4 text-[13px] font-bold text-[#54656F] uppercase">Lecture</th>
                     <th className="px-8 py-4 text-[13px] font-bold text-[#54656F] uppercase text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-[#E9EDEF]">
                  {campaigns.map(c => (
                     <tr key={c.id} className="hover:bg-[#F8F9FA] transition-colors group">
                        <td className="px-8 py-6">
                           <Link to={`/campaigns/${c.id}`} className="text-[15px] font-bold text-[#111B21] hover:text-[#00A884] transition-all">{c.name}</Link>
                           <div className="text-[12px] font-semibold text-[#8696A0] uppercase tracking-wide">Template: promo_oct_24</div>
                        </td>
                        <td className="px-8 py-6">
                           <StatusBadge status={c.status} />
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-2">
                              <Users size={16} className="text-[#8696A0]" />
                              <span className="text-[15px] font-bold text-[#111B21]">{c.sent}</span>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-2">
                              <CheckCircle2 size={16} className="text-[#00A884]" />
                              <span className="text-[15px] font-bold text-[#00A884]">{c.read}</span>
                           </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="p-2.5 text-[#54656F] hover:bg-[#F0F2F5] hover:text-[#00A884] rounded-lg transition-all"><Play size={18} /></button>
                              <button className="p-2.5 text-[#54656F] hover:bg-[#F0F2F5] rounded-lg transition-all"><Copy size={18} /></button>
                              <button className="p-2.5 text-[#EA0038] hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={18} /></button>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}

function StatItem({ label, value, icon: Icon, color }: any) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-[#E7F3EF] text-[#00A884]',
    red: 'bg-rose-50 text-rose-600',
  };

  return (
    <div className="bg-white p-6 rounded-[24px] border border-[#D1D7DB] shadow-sm flex items-center gap-5">
       <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]} border shadow-sm`}>
          <Icon size={24} />
       </div>
       <div>
          <div className="text-[12px] font-bold text-[#8696A0] uppercase tracking-wide mb-0.5">{label}</div>
          <div className="text-2xl font-bold text-[#111B21]">{value}</div>
       </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const configs: any = {
    Completed: 'bg-[#E7F3EF] text-[#00A884] border-[#00A884]/10',
    Sending:   'bg-blue-50 text-blue-700 border-blue-100 animate-pulse',
    Draft:     'bg-[#F0F2F5] text-[#8696A0] border-[#D1D7DB]',
    Scheduled: 'bg-amber-50 text-amber-700 border-amber-100',
  };

  return (
    <span className={`px-3 py-1 rounded-md text-[11px] font-bold uppercase border ${configs[status]}`}>
       {status}
    </span>
  );
}
