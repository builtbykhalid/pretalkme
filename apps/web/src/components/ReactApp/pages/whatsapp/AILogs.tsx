import { useState } from 'react';
import { 
  Terminal, 
  Search, 
  Filter, 
  ChevronRight, 
  ArrowLeft, 
  ShieldCheck, 
  Database, 
  Trash2 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AILogs() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-[#F8F8F8] p-4 md:p-8 overflow-y-auto">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/whatsapp/ai-agent')}
          className="p-3 bg-white border border-[#EEEEEE] rounded-2xl text-[#221A40] hover:shadow-md transition-all shadow-sm"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
           <div className="flex items-center gap-2 text-[10px] font-black text-[#AAAAAA] uppercase tracking-widest mb-1">
              <span>IA AGENT</span>
              <ChevronRight size={10} />
              <span>LOGS D'EXÉCUTION</span>
           </div>
           <h1 className="text-2xl font-black text-[#221A40]">Journal de l'Intelligence</h1>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-[#EEEEEE] shadow-sm flex flex-col flex-1 overflow-hidden">
         <div className="p-6 border-b border-[#F9F9F9] bg-[#FAFAFA]/50 flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AAAAAA]" size={18} />
               <input 
                 type="text" 
                 placeholder="Filtrer par contact ou prompt..." 
                 className="w-full bg-white border border-[#EEEEEE] rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-[#221A40]/5 transition-all shadow-sm"
               />
            </div>
            <div className="flex gap-2">
               <button className="px-4 py-2 bg-white border border-[#EEEEEE] rounded-xl text-[10px] font-black uppercase tracking-widest text-[#6B6B6B] hover:text-[#221A40] transition-colors">7 derniers jours</button>
               <button className="p-2 bg-white border border-[#EEEEEE] rounded-xl text-[#AAAAAA] hover:text-[#221A40] transition-all"><Filter size={18} /></button>
            </div>
         </div>

         <div className="flex-1 overflow-auto">
            <table className="w-full border-collapse text-left">
               <thead className="bg-[#FAFAFA] border-b border-[#EEEEEE] sticky top-0 z-10">
                  <tr>
                     <th className="px-8 py-5 text-[9px] font-black text-[#AAAAAA] uppercase tracking-[0.2em]">Horodatage</th>
                     <th className="px-8 py-5 text-[9px] font-black text-[#AAAAAA] uppercase tracking-[0.2em]">Contact</th>
                     <th className="px-8 py-5 text-[9px] font-black text-[#AAAAAA] uppercase tracking-[0.2em]">Prompt Client</th>
                     <th className="px-8 py-5 text-[9px] font-black text-[#AAAAAA] uppercase tracking-[0.2em]">Score IA</th>
                     <th className="px-8 py-5 text-[9px] font-black text-[#AAAAAA] uppercase tracking-[0.2em]">RAG Source</th>
                     <th className="px-8 py-5 text-[9px] font-black text-[#AAAAAA] uppercase tracking-[0.2em] text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-[#F9F9F9]">
                  {[1,2,3,4,5,6,7,8,9,10].map(i => (
                    <tr key={i} className="hover:bg-[#FDFDFD] transition-colors group">
                      <td className="px-8 py-5 text-[11px] font-bold text-[#6B6B6B] font-mono">14/04 • 15:22:04</td>
                      <td className="px-8 py-5">
                        <div className="text-sm font-black text-[#221A40]">Hamza Ouazzani</div>
                      </td>
                      <td className="px-8 py-5">
                         <div className="text-[12px] font-medium text-[#6B6B6B] truncate max-w-[200px]">"Salam, bghit ntlub had l-produit..."</div>
                      </td>
                      <td className="px-8 py-5">
                         <div className="flex items-center gap-2">
                            <ShieldCheck size={14} className="text-[#48D951]" />
                            <span className="text-[11px] font-black text-[#221A40]">98.4%</span>
                         </div>
                      </td>
                      <td className="px-8 py-5">
                         <span className="px-2 py-0.5 bg-[#F5F5F5] border border-[#EEEEEE] text-[#AAAAAA] rounded-md text-[9px] font-black uppercase tracking-widest flex items-center gap-1 w-fit">
                            <Database size={10} /> Products_DB
                         </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                         <button className="p-2 text-[#AAAAAA] group-hover:text-[#221A40] transition-colors">
                            <ChevronRight size={18} />
                         </button>
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
