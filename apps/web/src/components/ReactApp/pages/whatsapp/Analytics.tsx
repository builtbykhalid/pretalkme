import { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  MessageSquare, 
  Bot, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  Download,
  Share2,
  Activity,
  CheckCircle2,
  LayoutGrid
} from 'lucide-react';

const activityData = [
  { name: 'Lun', messages: 420, ai: 310 },
  { name: 'Mar', messages: 580, ai: 420 },
  { name: 'Mer', messages: 890, ai: 680 },
  { name: 'Jeu', messages: 720, ai: 510 },
  { name: 'Ven', messages: 950, ai: 790 },
  { name: 'Sam', messages: 1100, ai: 850 },
  { name: 'Dim', messages: 820, ai: 640 },
];

const sourceData = [
  { name: 'IA Autonome', value: 65, color: '#00A884' },
  { name: 'Support Humain', value: 25, color: '#111B21' },
  { name: 'Non Résolu', value: 10, color: '#EA0038' },
];

export default function Analytics() {
  const [range, setRange] = useState('7d');

  return (
    <div className="flex flex-col h-full bg-[#F0F2F5] p-6 md:p-8 overflow-y-auto scrollbar-hide">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <div className="w-10 h-10 bg-[#00A884] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#00A884]/20">
                <Activity size={20} />
             </div>
             <h1 className="text-3xl font-bold text-[#111B21]">Analytics</h1>
          </div>
          <p className="text-[#667781] text-[15px]">Suivez l'impact de l'IA sur vos ventes et votre SAV.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-[#E9EDEF] p-1 rounded-xl flex items-center gap-1 border border-[#D1D7DB]">
             <RangeBtn active={range === '24h'} onClick={() => setRange('24h')} label="24H" />
             <RangeBtn active={range === '7d'} onClick={() => setRange('7d')} label="7J" />
             <RangeBtn active={range === '30d'} onClick={() => setRange('30d')} label="30J" />
          </div>
          <button className="bg-white border border-[#D1D7DB] p-2.5 rounded-xl text-[#111B21] hover:bg-[#F0F2F5] transition-all shadow-sm">
             <Download size={20} />
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <KPICard label="Messages" value="12,482" trend="+12%" up={true} icon={MessageSquare} color="blue" />
        <KPICard label="Taux IA" value="84.2%" trend="+4%" up={true} icon={Bot} color="green" />
        <KPICard label="Tps Réponse" value="48s" trend="-15s" up={true} icon={Clock} color="amber" />
        <KPICard label="Ventes IA" value="245" trend="+8%" up={true} icon={TrendingUp} color="emerald" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
         {/* Main Activity Chart */}
         <div className="lg:col-span-8 bg-white rounded-[24px] border border-[#D1D7DB] shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
               <h3 className="font-bold text-[14px] text-[#111B21] uppercase tracking-wider">Volume d'activité hebdomadaire</h3>
               <div className="flex items-center gap-4 text-[11px] font-bold">
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#111B21]" /> Total</div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#00A884]" /> IA</div>
               </div>
            </div>
            <div className="h-80 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F2F5" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#8696A0', fontSize: 12, fontWeight: 600 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#8696A0', fontSize: 12, fontWeight: 600 }} 
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid #D1D7DB', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '13px' }}
                    />
                    <Line type="monotone" dataKey="messages" stroke="#111B21" strokeWidth={3} dot={{ r: 0 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="ai" stroke="#00A884" strokeWidth={3} dot={{ r: 0 }} activeDot={{ r: 6 }} />
                  </LineChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Pie Chart Distribution */}
         <div className="lg:col-span-4 bg-white rounded-[24px] border border-[#D1D7DB] shadow-sm p-8 flex flex-col">
            <h3 className="font-bold text-[14px] text-[#111B21] uppercase tracking-wider mb-8 text-center">Répartition du SAV</h3>
            <div className="h-64 w-full relative">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={sourceData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value">
                      {sourceData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-bold text-[#111B21]">84%</span>
                  <span className="text-[10px] font-bold text-[#8696A0] uppercase">Géré par IA</span>
               </div>
            </div>
            <div className="space-y-3 mt-8">
               {sourceData.map(item => (
                 <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                       <span className="text-[13px] font-semibold text-[#54656F]">{item.name}</span>
                    </div>
                    <span className="text-[13px] font-bold text-[#111B21]">{item.value}%</span>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}

function RangeBtn({ active, onClick, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${active ? 'bg-white text-[#111B21] shadow-sm' : 'text-[#54656F] hover:bg-white/50'}`}
    >
      {label}
    </button>
  );
}

function KPICard({ label, value, trend, up, icon: Icon, color }: any) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-[#E7F3EF] text-[#00A884] border-[#00A884]/10',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  };

  return (
    <div className="bg-white p-6 rounded-[24px] border border-[#D1D7DB] shadow-sm flex flex-col gap-4 group hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]} border shadow-sm`}>
          <Icon size={24} />
        </div>
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${up ? 'bg-green-50 text-green-700' : 'bg-rose-50 text-rose-700'}`}>
           {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
           {trend}
        </div>
      </div>
      <div>
        <div className="text-[12px] font-bold text-[#8696A0] uppercase tracking-wide mb-0.5">{label}</div>
        <div className="text-2xl font-bold text-[#111B21]">{value}</div>
      </div>
    </div>
  );
}
