import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ShoppingCart, Plus, Minus, X } from 'lucide-react';
import { useApi } from '../../hooks/useApi';

interface OrderPanelProps {
  conversationId: string;
  contactId?: string;
}

export function OrderPanel({ conversationId, contactId }: OrderPanelProps) {
  const { api } = useApi();
  const [open, setOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [status, setStatus] = useState<'draft' | 'pending'>('pending');
  const [notes, setNotes] = useState('');

  const total = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.unit_price || 0) * Number(item.quantity || 0), 0),
    [items],
  );

  const searchProducts = async (q: string) => {
    setProductSearch(q);
    if (!q.trim()) {
      setProducts([]);
      return;
    }
    const res = await api.get('/api/v1/ecommerce/products', { params: { q } });
    setProducts(res.data || []);
  };

  const addProduct = (product: any) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product_id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product_id === product.id ? { ...i, quantity: Number(i.quantity) + 1 } : i,
        );
      }
      return [
        ...prev,
        {
          product_id: product.id,
          product_name: product.name,
          quantity: 1,
          unit_price: Number(product.price || 0),
        },
      ];
    });
  };

  const updateQty = (productId: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) => (i.product_id === productId ? { ...i, quantity: Math.max(0, Number(i.quantity) + delta) } : i))
        .filter((i) => i.quantity > 0),
    );
  };

  const createOrder = async () => {
    if (!contactId || items.length === 0) return;
    await api.post('/api/v1/orders/from-conversation', {
      conversation_id: conversationId,
      contact_id: contactId,
      source: 'chat',
      status,
      items,
      notes: notes || null,
    });
    setOpen(false);
    setItems([]);
    setNotes('');
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#D1D7DB] text-[#111B21] text-xs font-bold hover:bg-[#F0F2F5]"
      >
        <ShoppingCart size={14} /> Creer commande
      </button>

      {open && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/30 flex justify-end">
          <div className="w-full max-w-md h-full bg-white border-l border-[#D1D7DB] shadow-xl p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#111B21]">Nouvelle commande</h3>
              <button onClick={() => setOpen(false)} className="p-2 rounded-lg hover:bg-[#F0F2F5]">
                <X size={18} />
              </button>
            </div>

            <input
              value={productSearch}
              onChange={(e) => searchProducts(e.target.value)}
              placeholder="Rechercher produit..."
              className="w-full border border-[#D1D7DB] rounded-xl px-3 py-2 text-sm mb-3"
            />

            <div className="space-y-2 max-h-48 overflow-auto mb-4">
              {products.map((p) => (
                <button
                  key={p.id}
                  onClick={() => addProduct(p)}
                  className="w-full text-left px-3 py-2 rounded-lg border border-[#E9EDEF] hover:bg-[#F8F9FA]"
                >
                  <div className="font-semibold text-sm text-[#111B21]">{p.name}</div>
                  <div className="text-xs text-[#667781]">{Number(p.price || 0)} DH</div>
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-auto space-y-2">
              {items.map((item) => (
                <div key={item.product_id} className="border border-[#E9EDEF] rounded-xl p-3">
                  <div className="font-semibold text-sm">{item.product_name}</div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs text-[#667781]">{Number(item.unit_price)} DH</div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(item.product_id, -1)} className="p-1 rounded border border-[#D1D7DB]"><Minus size={12} /></button>
                      <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQty(item.product_id, 1)} className="p-1 rounded border border-[#D1D7DB]"><Plus size={12} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#E9EDEF] mt-3 space-y-3">
              <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-full border border-[#D1D7DB] rounded-xl px-3 py-2 text-sm">
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
              </select>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optionnel)" className="w-full border border-[#D1D7DB] rounded-xl px-3 py-2 text-sm" rows={3} />
              <div className="flex items-center justify-between">
                <div className="font-bold">Total: {total.toFixed(2)} DH</div>
                <button
                  onClick={createOrder}
                  disabled={!contactId || items.length === 0}
                  className="px-4 py-2 rounded-xl bg-[#00A884] text-white font-bold text-sm disabled:opacity-50"
                >
                  Creer la commande
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
