import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { 
  Package, 
  Search, 
  RotateCw, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Filter,
  Plus,
  ArrowRight,
  LayoutGrid
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Products() {
  const { api } = useApi();
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [api]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/v1/ecommerce/products');
      setProducts(res.data || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      toast.loading('Sync avec YouCan...', { id: 'sync' });
      await api.post('/api/v1/ecommerce/sync');
      toast.success('Catalogue à jour !', { id: 'sync' });
      fetchProducts();
    } catch (err) {
      toast.error('Erreur sync', { id: 'sync' });
    } finally {
      setSyncing(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(search.toLowerCase()) || 
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: products.length,
    lowStock: products.filter(p => p.stock > 0 && p.stock <= 10).length,
    outOfStock: products.filter(p => p.stock === 0).length,
    active: products.filter(p => !p.status || p.status === 'active').length
  };

  return (
    <div className="flex flex-col h-full bg-[#F0F2F5] p-6 md:p-8 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <div className="w-10 h-10 bg-[#00A884] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#00A884]/20">
                <Package size={20} />
             </div>
             <h1 className="text-3xl font-bold text-[#111B21]">Catalogue Produits</h1>
          </div>
          <p className="text-[#667781] text-[15px]">Synchronisez et gérez votre inventaire e-commerce.</p>
        </div>
        
        <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/whatsapp/orders')}
              className="px-6 py-2.5 bg-white border border-[#D1D7DB] text-[#111B21] rounded-xl font-bold text-sm hover:bg-[#F0F2F5] transition-all"
            >
              Commandes
            </button>
            <button 
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-2 bg-[#00A884] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:brightness-105 transition-all shadow-lg shadow-[#00A884]/20"
            >
              <RotateCw size={18} className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'Sync...' : 'Synchroniser'}
            </button>
        </div>
      </div>

      {/* Stats Area */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 shrink-0">
        <StatMiniCard label="Total Produits" value={stats.total} icon={LayoutGrid} color="neutral" />
        <StatMiniCard label="En Stock" value={stats.active} icon={CheckCircle2} color="green" />
        <StatMiniCard label="Rupture" value={stats.outOfStock} icon={XCircle} color="red" />
        <StatMiniCard label="Stock Faible" value={stats.lowStock} icon={AlertTriangle} color="amber" />
      </div>

      <div className="flex-1 min-h-0 bg-white rounded-[24px] border border-[#D1D7DB] shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-[#E9EDEF] flex flex-wrap items-center justify-between gap-4 bg-[#F0F2F5]/30">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8696A0]" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher un produit..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-[#D1D7DB] rounded-xl pl-12 pr-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#00A884]/20 transition-all shadow-sm"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <button className="p-2.5 bg-white border border-[#D1D7DB] rounded-xl text-[#54656F] hover:bg-[#F0F2F5] transition-all">
              <Filter size={18} />
            </button>
            <button className="flex items-center gap-2 bg-[#F0F2F5] text-[#111B21] px-5 py-3 rounded-xl font-bold text-sm border border-[#D1D7DB] hover:bg-[#E9EDEF] transition-all">
              <Plus size={18} />
              Nouveau manuel
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto scrollbar-hide">
          <table className="w-full border-collapse text-left">
            <thead className="bg-[#F0F2F5] sticky top-0 z-10 border-b border-[#D1D7DB]">
              <tr>
                <th className="px-8 py-4 text-[13px] font-bold text-[#54656F] uppercase tracking-wide">Produit</th>
                <th className="px-8 py-4 text-[13px] font-bold text-[#54656F] uppercase tracking-wide">SKU</th>
                <th className="px-8 py-4 text-[13px] font-bold text-[#54656F] uppercase tracking-wide">Prix</th>
                <th className="px-8 py-4 text-[13px] font-bold text-[#54656F] uppercase tracking-wide">Stock</th>
                <th className="px-8 py-4 text-[13px] font-bold text-[#54656F] uppercase tracking-wide text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9EDEF]">
              {loading ? (
                Array(5).fill(0).map((_, i) => <tr key={i}><td colSpan={5} className="px-8 py-10"><div className="h-4 bg-[#F0F2F5] rounded-full animate-pulse w-full"></div></td></tr>)
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((p: any) => (
                  <tr key={p.id} className="hover:bg-[#F8F9FA] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#F0F2F5] rounded-xl overflow-hidden shadow-inner flex items-center justify-center border border-[#D1D7DB] shrink-0">
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package size={22} className="text-[#8696A0]" />
                          )}
                        </div>
                        <div className="max-w-[300px]">
                          <div className="text-[15px] font-bold text-[#111B21] truncate">{p.name || 'Produit sans nom'}</div>
                          <div className="text-[12px] font-semibold text-[#00A884] uppercase tracking-wide">{p.category || 'YouCan.shop'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[13px] font-mono text-[#667781]">{p.sku || '---'}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-[15px] font-bold text-[#111B21]">{p.price || 0} DH</div>
                    </td>
                    <td className="px-8 py-6">
                      <StockBadge stock={p.stock} />
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button className="p-2.5 text-[#54656F] hover:bg-[#F0F2F5] rounded-lg transition-all" title="Ouvrir dans boutique">
                           <ExternalLink size={18} />
                         </button>
                         <button className="p-2.5 text-[#54656F] hover:bg-[#F0F2F5] rounded-lg transition-all">
                           <ArrowRight size={18} />
                         </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="px-8 py-32 text-center text-[#8696A0] font-bold italic">Aucun produit trouvé</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatMiniCard({ label, value, icon: Icon, color }: any) {
  const colors: any = {
    neutral: 'bg-[#F0F2F5] text-[#54656F]',
    green: 'bg-[#E7F3EF] text-[#00A884]',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-rose-50 text-rose-600'
  };

  return (
    <div className="bg-white p-6 rounded-[24px] border border-[#D1D7DB] shadow-sm flex items-center gap-5">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
        <Icon size={24} />
      </div>
      <div>
        <div className="text-[12px] font-bold text-[#8696A0] uppercase tracking-wide mb-0.5">{label}</div>
        <div className="text-2xl font-bold text-[#111B21]">{value}</div>
      </div>
    </div>
  );
}

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) return (
    <span className="px-3 py-1 bg-red-50 text-red-700 border border-red-100 rounded-md text-[11px] font-bold uppercase">Rupture</span>
  );
  if (stock <= 10) return (
    <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-md text-[11px] font-bold uppercase">{stock} RESTANTS</span>
  );
  return (
    <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-100 rounded-md text-[11px] font-bold uppercase">{stock} EN STOCK</span>
  );
}
