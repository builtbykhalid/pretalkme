import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { 
  Users, 
  Megaphone, 
  MessageSquare, 
  TrendingUp, 
  QrCode, 
  CheckCircle2, 
  AlertCircle,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  LayoutDashboard
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area 
} from 'recharts';

const dummyChartData = [
  { name: 'Lun', inbound: 400, outbound: 240 },
  { name: 'Mar', inbound: 300, outbound: 139 },
  { name: 'Mer', inbound: 200, outbound: 980 },
  { name: 'Jeu', inbound: 278, outbound: 390 },
  { name: 'Ven', inbound: 189, outbound: 480 },
  { name: 'Sam', inbound: 239, outbound: 380 },
  { name: 'Dim', inbound: 349, outbound: 430 },
];

export default function Dashboard() {
  const { api } = useApi();
  const [stats, setStats] = useState<any>(null);
  const [account, setAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, accountRes] = await Promise.all([
          api.get('/api/v1/dashboard/stats'),
          api.get('/api/v1/dashboard/whatsapp-account')
        ]);
        setStats(statsRes.data);
        setAccount(accountRes.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [api]);

  return (
    <div className="flex flex-col h-full bg-[#F0F2F5] p-6 md:p-8 overflow-y-auto scrollbar-hide font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <div className="w-10 h-10 bg-[#00A884] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#00A884]/20 animate-pulse-slow">
                <Zap size={20} fill="currentColor" />
             </div>
             <h1 className="text-3xl font-bold text-[#111B21]">Dashboard</h1>
          </div>
          <p className="text-[#667781] text-[15px] font-medium pl-1">Bienvenue sur votre centre de commandement WhatsApp.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-white px-4 py-2.5 rounded-2xl border border-[#D1D7DB] flex items-center gap-3 shadow-sm group hover:border-[#00A884] transition-all cursor-pointer">
             <div className="w-2 h-2 rounded-full bg-[#00A884] animate-pulse" />
             <span className="text-[13px] font-bold text-[#111B21]">{account?.phoneNumber || '+212 708-234959'}</span>
             <span className="px-2 py-0.5 bg-[#E7F3EF] text-[#00A884] rounded-md text-[10px] font-bold uppercase tracking-wider">Connecté</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
         {/* Left Column: Account & Stats */}
         <div className="lg:col-span-4 space-y-8">
            <WhatsAppAccountCard account={account} />
            <div className="grid grid-cols-1 gap-6">
                <DashboardKpiCard label="Contacts" value={stats?.totalContacts} icon={Users} color="indigo" trend="+12%" />
                <DashboardKpiCard label="Campagnes" value={stats?.totalCampaigns} icon={Megaphone} color="rose" trend="+3" />
                <DashboardKpiCard label="Messages" value={stats?.totalMessages} icon={MessageSquare} color="emerald" trend="+842" />
            </div>
         </div>

         {/* Right Column: Analytics & Activity */}
         <div className="lg:col-span-8 flex flex-col gap-8">
            <div className="bg-white rounded-[32px] border border-[#D1D7DB] shadow-sm p-8 flex-1">
               <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-[16px] font-bold text-[#111B21]">Performances Messages</h3>
                    <p className="text-[13px] text-[#8696A0] font-medium">Messages entrants vs sortants (7 derniers jours)</p>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#00A884]" />
                        <span className="text-[12px] font-bold text-[#54656F]">Réponses IA</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#111B21]" />
                        <span className="text-[12px] font-bold text-[#54656F]">Total</span>
                     </div>
                  </div>
               </div>
               <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dummyChartData}>
                      <defs>
                        <linearGradient id="colorInbound" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00A884" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#00A884" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9EDEF" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#8696A0', fontSize: 12, fontWeight: 600}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#8696A0', fontSize: 12, fontWeight: 600}} dx={-10} />
                      <Tooltip 
                        contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '13px', fontWeight: 'bold'}}
                        itemStyle={{padding: '2px 0'}}
                      />
                      <Area type="monotone" dataKey="inbound" stroke="#00A884" strokeWidth={3} fillOpacity={1} fill="url(#colorInbound)" />
                      <Area type="monotone" dataKey="outbound" stroke="#111B21" strokeWidth={3} fillOpacity={0} />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>

            <div className="bg-white rounded-[32px] border border-[#D1D7DB] shadow-sm p-8">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[16px] font-bold text-[#111B21]">Campagnes Récentes</h3>
                  <button className="text-[13px] font-bold text-[#00A884] hover:underline">Voir tout</button>
               </div>
               <div className="space-y-4">
                  <RecentCampaignItem name="Promo Ramadhan 2024" sent={8402} read={6510} status="COMPLETED" color="indigo" />
                  <RecentCampaignItem name="Relance Automne" sent={1200} read={450} status="RUNNING" color="emerald" />
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function WhatsAppAccountCard({ account }: any) {
  return (
    <div className="bg-[#111B21] rounded-[32px] p-8 text-white relative overflow-hidden group shadow-xl">
       <div className="relative z-10">
          <div className="flex items-start justify-between mb-8">
             <div>
                <div className="text-[12px] font-bold text-[#8696A0] uppercase tracking-widest mb-1">WhatsApp Business</div>
                <h3 className="text-2xl font-bold truncate max-w-[180px]">{account?.displayName || 'Pretalk Space'}</h3>
             </div>
             <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <QrCode size={32} className="text-[#111B21]" />
             </div>
          </div>

          <div className="flex items-center gap-2 mb-10">
             <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${account?.numberStatus === 'CONNECTED' ? 'bg-[#00A884]/20 text-[#00A884] border border-[#00A884]/30' : 'bg-rose-500/20 text-rose-500 border border-rose-500/30'}`}>
                {account?.numberStatus || 'CONNECTED'}
             </span>
             <span className="px-3 py-1 bg-white/10 text-white rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/20">
                {account?.tier || 'TIER_10K'}
             </span>
          </div>

          <div className="flex items-center justify-between pt-8 border-t border-white/10">
             <div>
                <div className="text-[11px] font-bold text-[#8696A0] uppercase mb-1">Qualité Numéro</div>
                <div className="flex items-center gap-2">
                   <div className="flex gap-1">
                      {[1,2,3].map(i => <div key={i} className="w-3 h-1.5 rounded-full bg-[#00A884]" />)}
                      {[1,2].map(i => <div key={i} className="w-3 h-1.5 rounded-full bg-white/20" />)}
                   </div>
                   <span className="text-[12px] font-bold">{account?.qualityRating || 'HIGH'}</span>
                </div>
             </div>
             <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                <MoreHorizontal size={20} />
             </button>
          </div>
       </div>

       {/* Decorator */}
       <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-[#00A884]/10 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}

function DashboardKpiCard({ label, value, icon: Icon, color, trend }: any) {
  const colors: any = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  };

  return (
    <div className="bg-white p-6 rounded-[32px] border border-[#D1D7DB] shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
       <div className="flex items-center gap-5">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colors[color]} border shadow-sm group-hover:scale-110 transition-transform`}>
             <Icon size={28} />
          </div>
          <div>
             <div className="text-[12px] font-bold text-[#8696A0] uppercase tracking-widest mb-0.5">{label}</div>
             <div className="text-2xl font-bold text-[#111B21]">{value || 0}</div>
          </div>
       </div>
       <div className="flex items-center gap-1.5 text-[#00A884] bg-[#E7F3EF] px-3 py-1 rounded-full text-[11px] font-bold">
          <TrendingUp size={14} />
          {trend}
       </div>
    </div>
  );
}

function RecentCampaignItem({ name, sent, read, status, color }: any) {
  const readPercent = Math.round((read / sent) * 100);
  
  return (
    <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E9EDEF] flex items-center justify-between group hover:bg-white hover:shadow-sm transition-all">
       <div className="flex items-center gap-4">
          <div className={`w-3 h-3 rounded-full ${status === 'COMPLETED' ? 'bg-[#00A884]' : 'bg-amber-500 animate-pulse'}`} />
          <div>
             <div className="text-[14px] font-bold text-[#111B21]">{name}</div>
             <div className="text-[12px] text-[#8696A0]">{sent} messages envoyés</div>
          </div>
       </div>
       <div className="flex items-center gap-8">
          <div className="text-right">
             <div className="text-[14px] font-bold text-[#111B21]">{readPercent}%</div>
             <div className="text-[11px] font-bold text-[#8696A0] uppercase tracking-tighter">Lu</div>
          </div>
          <button className="p-2 text-[#8696A0] hover:text-[#111B21] transition-all">
             <MoreHorizontal size={20} />
          </button>
       </div>
    </div>
  );
}
