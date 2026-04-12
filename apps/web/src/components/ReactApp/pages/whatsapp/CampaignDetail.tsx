import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Users, 
  Send, 
  CheckCircle2, 
  XSquare, 
  Clock, 
  MoreHorizontal,
  Download,
  Eye,
  MessageSquare,
  Search,
  Filter
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

export default function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const stats = [
    { name: 'Envoyés', value: 1240, color: '#3B82F6' },
    { name: 'Délivrés', value: 1180, color: '#10B981' },
    { name: 'Lus', value: 890, color: '#00A884' },
    { name: 'Échecs', value: 12, color: '#EF4444' },
  ];

  const recipients = [
    { name: 'Khalid Amin', phone: '+212 661-893122', status: 'Read', time: '10:42' },
    { name: 'Sarah Benani', phone: '+212 600-442190', status: 'Delivered', time: '10:45' },
    { name: 'Youssef El-Ouadi', phone: '+212 612-556781', status: 'Failed', time: '---' },
    { name: 'Fatima Zahra', phone: '+212 677-210043', status: 'Read', time: '11:02' },
    { name: 'Omar Mansour', phone: '+212 655-334455', status: 'Delivered', time: '11:05' },
  ];

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#F0F2F5] p-6 md:p-8 overflow-y-auto scrollbar-hide font-sans">
      {/* Header */}
      <div className="flex items-center gap-6 mb-10 shrink-0">
         <button 
           onClick={() => navigate('/campaigns')}
           className="p-3 bg-white border border-[#D1D7DB] rounded-2xl text-[#111B21] hover:bg-[#F0F2F5] transition-all shadow-sm"
         >
           <ArrowLeft size={24} />
         </button>
         <div>
            <div className="flex items-center gap-3">
               <h1 className="text-3xl font-bold text-[#111B21]">Promotion Ramadan 2024</h1>
               <span className="px-3 py-1 bg-[#E7F3EF] text-[#00A884] rounded-lg text-[11px] font-bold uppercase tracking-wider border border-[#00A884]/10">COMPLETED</span>
            </div>
            <p className="text-[#667781] text-[15px] font-medium mt-1">ID de campagne : #{id} • Créée le 10 Mars 2024</p>
         </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
         <DetailedStatCard label="Total Envoyés" value="1,240" sub="100%" icon={Send} color="blue" />
         <DetailedStatCard label="Taux de Lecture" value="71.8%" sub="890 Lus" icon={Eye} color="emerald" />
         <DetailedStatCard label="Taux de Délivrance" value="95.1%" sub="1,180 Reçus" icon={CheckCircle2} color="green" />
         <DetailedStatCard label="Échecs" value="1.0%" sub="12 Erreurs" icon={XSquare} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
         {/* Left: Analytics Chart */}
         <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-[32px] border border-[#D1D7DB] shadow-sm p-8 h-full">
               <div className="flex items-center justify-between mb-10">
                  <div>
                    <h3 className="text-[17px] font-bold text-[#111B21]">Entonnoir de Conversion</h3>
                    <p className="text-[13px] text-[#8696A0] font-medium">Répartition globale des états de messages</p>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-[#F0F2F5] rounded-xl text-[13px] font-bold text-[#54656F] hover:bg-[#E9EDEF] transition-all">
                     <Download size={16} /> Exporter PDF
                  </button>
               </div>
               <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats} layout="vertical" margin={{ left: 20, right: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={false} stroke="#E9EDEF" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#111B21', fontSize: 13, fontWeight: 700}} width={100} />
                      <Tooltip 
                        cursor={{fill: '#F0F2F5', radius: 12}}
                        contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '13px', fontWeight: 'bold'}}
                      />
                      <Bar dataKey="value" radius={[0, 12, 12, 0]} barSize={40}>
                         {stats.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                         ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>
         </div>

         {/* Right: Message Preview */}
         <div className="lg:col-span-4">
            <div className="bg-white rounded-[32px] border border-[#D1D7DB] shadow-sm p-8 flex flex-col h-full">
               <h3 className="text-[17px] font-bold text-[#111B21] mb-6">Aperçu du Message</h3>
               <div className="bg-[#E5DDD5] rounded-[24px] p-4 flex-1 relative overflow-hidden flex flex-col">
                  {/* WhatsApp chat bg effect */}
                  <div className="absolute inset-0 opacity-10 bg-[url('https://i.pinimg.com/originals/97/2b/41/972b41ee507d8c534493109ceca0be97.png')] bg-repeat" />
                  
                  <div className="relative z-10 bg-white rounded-[12px] p-4 max-w-[90%] shadow-sm self-start">
                     <p className="text-[14px] text-[#111B21] leading-relaxed">
                        🌙 *Ramadan Moubarak !*<br/><br/>
                        Profitez de *-20%* sur tout notre catalogue de dattes et coffrets cadeaux jusqu'au 15 Mars.<br/><br/>
                        Cliquez ici pour voir la collection : https://pretalk.me/s/ramadan
                     </p>
                     <p className="text-[10px] text-[#8696A0] text-right mt-1 font-bold">10:42</p>
                  </div>
               </div>
               <div className="mt-6 pt-6 border-t border-[#F0F2F5]">
                  <div className="flex items-center justify-between text-[13px]">
                     <span className="font-bold text-[#8696A0]">Template utilisé :</span>
                     <span className="font-bold text-[#00A884]">promo_ramadan_24</span>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Recipients Table */}
      <div className="bg-white rounded-[32px] border border-[#D1D7DB] shadow-sm overflow-hidden flex flex-col">
         <div className="p-8 border-b border-[#F0F2F5] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
               <h3 className="text-[17px] font-bold text-[#111B21]">Liste des Destinataires</h3>
               <p className="text-[13px] text-[#8696A0] font-medium">Suivi individuel des envois</p>
            </div>
            <div className="flex items-center gap-3">
               <div className="relative max-w-xs">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8696A0]" />
                  <input type="text" placeholder="Rechercher..." className="bg-[#F0F2F5] border-transparent focus:bg-white focus:border-[#00A884] rounded-xl pl-10 pr-4 py-2 text-[13px] w-full transition-all outline-none border" />
               </div>
               <button className="p-2.5 bg-white border border-[#D1D7DB] rounded-xl text-[#54656F] hover:bg-[#F0F2F5] transition-all"><Filter size={18} /></button>
            </div>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-[#F8F9FA] border-b border-[#E9EDEF]">
                  <tr>
                     <th className="px-8 py-4 text-[12px] font-bold text-[#8696A0] uppercase tracking-wider">Contact</th>
                     <th className="px-8 py-4 text-[12px] font-bold text-[#8696A0] uppercase tracking-wider">Téléphone</th>
                     <th className="px-8 py-4 text-[12px] font-bold text-[#8696A0] uppercase tracking-wider">Statut</th>
                     <th className="px-8 py-4 text-[12px] font-bold text-[#8696A0] uppercase tracking-wider">Dernière Action</th>
                     <th className="px-8 py-4 text-[12px] font-bold text-[#8696A0] uppercase tracking-wider text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-[#F0F2F5]">
                  {recipients.map((r, i) => (
                    <tr key={i} className="hover:bg-[#F8F9FA]/50 transition-colors group">
                       <td className="px-8 py-5 font-bold text-[#111B21]">{r.name}</td>
                       <td className="px-8 py-5 text-[14px] text-[#54656F] font-medium">{r.phone}</td>
                       <td className="px-8 py-5">
                          <RecipientStatusBadge status={r.status} />
                       </td>
                       <td className="px-8 py-5 text-[13px] text-[#8696A0] font-bold">{r.time}</td>
                       <td className="px-8 py-5 text-right">
                          <button className="p-2 text-[#8696A0] hover:text-[#111B21] hover:bg-white rounded-lg transition-all shadow-sm">
                             <MoreHorizontal size={18} />
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

function DetailedStatCard({ label, value, sub, icon: Icon, color }: any) {
  const colorMap: any = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    green: 'bg-[#E7F3EF] text-[#00A884] border-[#00A884]/10',
    red: 'bg-rose-50 text-rose-600 border-rose-100',
  };

  return (
    <div className="bg-white p-7 rounded-[32px] border border-[#D1D7DB] shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
       <div className="flex items-center gap-5">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm ${colorMap[color]} group-hover:scale-110 transition-transform`}>
             <Icon size={28} />
          </div>
          <div>
             <div className="text-[12px] font-bold text-[#8696A0] uppercase tracking-widest mb-0.5">{label}</div>
             <div className="text-2xl font-black text-[#111B21] tracking-tight">{value}</div>
          </div>
       </div>
       <div className="text-right">
          <div className="text-[13px] font-bold text-[#54656F]">{sub}</div>
       </div>
    </div>
  );
}

function RecipientStatusBadge({ status }: { status: string }) {
  const config: any = {
    Read: { bg: 'bg-[#E7F3EF]', text: 'text-[#00A884]', label: 'Lu' },
    Delivered: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'Reçu' },
    Failed: { bg: 'bg-rose-50', text: 'text-rose-600', label: 'Échec' },
  };

  const { bg, text, label } = config[status] || config.Read;
  return (
    <span className={`${bg} ${text} px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider`}>
      {label}
    </span>
  );
}
