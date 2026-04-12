import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Eye, 
  ArrowRight,
  User,
  Calendar,
  CreditCard,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

const ORDER_STATUS: any = {
  new:       { label: 'Nouveau',   color: 'bg-blue-50 text-blue-700 border-blue-100', icon: Clock },
  confirmed: { label: 'Confirmé', color: 'bg-indigo-50 text-indigo-700 border-indigo-100', icon: CheckCircle2 },
  shipped:   { label: 'Expédié',  color: 'bg-amber-50 text-amber-700 border-amber-100', icon: Truck },
  delivered: { label: 'Livré',    color: 'bg-green-50 text-green-700 border-green-100', icon: CheckCircle2 },
  cancelled: { label: 'Annulé',   color: 'bg-rose-50 text-rose-700 border-rose-100', icon: XCircle },
};

export default function Orders() {
  const { api } = useApi();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [api]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/v1/ecommerce/orders');
      setOrders(res.data || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(o => 
    o.order_number?.toLowerCase().includes(search.toLowerCase()) || 
    o.customer_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#F0F2F5] p-6 md:p-8 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <div className="w-10 h-10 bg-[#00A884] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#00A884]/20">
                <ShoppingBag size={20} />
             </div>
             <h1 className="text-3xl font-bold text-[#111B21]">Commandes</h1>
          </div>
          <p className="text-[#667781] text-[15px]">Suivez les ventes et l'état des livraisons en temps réel.</p>
        </div>
        
        <div className="px-6 py-2.5 bg-white border border-[#D1D7DB] text-[#111B21] rounded-xl font-bold text-sm shadow-sm flex items-center gap-2">
           <span className="text-[#00A884]">{orders.length}</span> Commandes
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-white rounded-[24px] border border-[#D1D7DB] shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-[#E9EDEF] flex flex-wrap items-center justify-between gap-4 bg-[#F0F2F5]/30 shrink-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8696A0]" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher par # ou client..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-[#D1D7DB] rounded-xl pl-12 pr-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#00A884]/20 transition-all shadow-sm"
            />
          </div>
          
          <button className="p-2.5 bg-white border border-[#D1D7DB] rounded-xl text-[#54656F] hover:bg-[#F0F2F5] transition-all">
            <Filter size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-auto scrollbar-hide">
          <table className="w-full border-collapse text-left">
            <thead className="bg-[#F0F2F5] sticky top-0 z-10 border-b border-[#D1D7DB]">
              <tr>
                <th className="px-8 py-4 text-[13px] font-bold text-[#54656F] uppercase tracking-wide">ID Commande</th>
                <th className="px-8 py-4 text-[13px] font-bold text-[#54656F] uppercase tracking-wide">Client</th>
                <th className="px-8 py-4 text-[13px] font-bold text-[#54656F] uppercase tracking-wide">Date</th>
                <th className="px-8 py-4 text-[13px] font-bold text-[#54656F] uppercase tracking-wide">Montant</th>
                <th className="px-8 py-4 text-[13px] font-bold text-[#54656F] uppercase tracking-wide">Statut</th>
                <th className="px-8 py-4 text-[13px] font-bold text-[#54656F] uppercase tracking-wide text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9EDEF]">
              {loading ? (
                Array(5).fill(0).map((_, i) => <tr key={i}><td colSpan={6} className="px-8 py-10"><div className="h-4 bg-[#F0F2F5] rounded-full animate-pulse w-full"></div></td></tr>)
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((o: any) => (
                  <tr key={o.id} className="hover:bg-[#F8F9FA] transition-colors group text-[15px]">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#111B21]">#{o.order_number || '10234'}</span>
                        <span className="text-[12px] font-semibold text-[#8696A0] uppercase tracking-wide">{o.platform || 'YouCan'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#DFE5E7] rounded-full flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
                          {o.customer_name?.[0]?.toUpperCase() || 'C'}
                        </div>
                        <div>
                          <div className="font-bold text-[#111B21]">{o.customer_name || 'Client Anonyme'}</div>
                          <div className="text-[12px] text-[#667781]">{o.items_count || 1} article(s)</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-[#667781]">
                        <Calendar size={14} className="text-[#8696A0]" />
                        {o.created_at ? format(new Date(o.created_at), 'dd MMM yyyy', { locale: fr }) : 'Aujourd\'hui'}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 font-bold text-[#111B21]">
                        <CreditCard size={14} className="text-[#8696A0]" />
                        {o.total_price || 0} DH
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <StatusBadge status={o.status || 'new'} />
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => navigate(`/whatsapp/inbox?contactId=${o.contact_id}`)}
                          className="p-2.5 text-[#54656F] hover:bg-[#F0F2F5] hover:text-[#00A884] rounded-lg transition-all"
                          title="WhatsApp Chat"
                        >
                          <MessageSquare size={18} />
                        </button>
                        <button className="p-2.5 text-[#54656F] hover:bg-[#F0F2F5] rounded-lg transition-all">
                          <Eye size={18} />
                        </button>
                        <button className="p-2.5 text-[#54656F] hover:bg-[#F0F2F5] rounded-lg transition-all">
                          <ArrowRight size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} className="px-8 py-32 text-center text-[#8696A0] font-bold italic">Aucune commande trouvée</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = ORDER_STATUS[status] || ORDER_STATUS.new;
  const Icon = config.icon;

  return (
    <span className={`px-4 py-1.5 rounded-md text-[11px] font-bold uppercase border flex items-center gap-2 w-fit ${config.color}`}>
      <Icon size={12} />
      {config.label}
    </span>
  );
}
