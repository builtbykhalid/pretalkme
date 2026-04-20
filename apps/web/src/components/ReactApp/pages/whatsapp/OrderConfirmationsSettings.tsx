import { useEffect, useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { Bell, CheckCircle2, Plus, Trash2 } from 'lucide-react';

export default function OrderConfirmationsSettings() {
  const { api } = useApi();
  const [templates, setTemplates] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [feedback, setFeedback] = useState('');
  const [draft, setDraft] = useState({ platform: '', trigger_status: 'new', message_template: 'Bonjour {{customer_name}}, votre commande {{order_id}} est bien reçue. Total: {{total}}.' });

  const load = async () => {
    const [templatesRes, historyRes] = await Promise.all([
      api.get('/api/v1/order-confirmations/templates'),
      api.get('/api/v1/order-confirmations/history'),
    ]);
    setTemplates(templatesRes.data || []);
    setHistory(historyRes.data || []);
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  const createTemplate = async () => {
    await api.post('/api/v1/order-confirmations/templates', draft);
    setFeedback('Template enregistré.');
    await load();
  };

  const deleteTemplate = async (id: string) => {
    await api.delete(`/api/v1/order-confirmations/templates/${id}`);
    await load();
  };

  return (
    <div className="p-6 md:p-8 bg-[#F0F2F5] min-h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white border border-[#D1D7DB] rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#00A884] text-white flex items-center justify-center"><Bell size={20} /></div>
            <h1 className="text-2xl font-bold text-[#111B21]">Confirmations commandes</h1>
          </div>
          <p className="text-[#667781] mb-6">Gérez les templates WhatsApp envoyés après une commande e-commerce ou chat.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select value={draft.platform} onChange={(e) => setDraft((prev) => ({ ...prev, platform: e.target.value }))} className="border border-[#D1D7DB] rounded-xl px-4 py-3 text-sm">
              <option value="">Toutes plateformes</option>
              <option value="youcan">YouCan</option>
              <option value="shopify">Shopify</option>
              <option value="woocommerce">WooCommerce</option>
              <option value="lightfunnel">LightFunnel</option>
            </select>
            <select value={draft.trigger_status} onChange={(e) => setDraft((prev) => ({ ...prev, trigger_status: e.target.value }))} className="border border-[#D1D7DB] rounded-xl px-4 py-3 text-sm">
              <option value="new">Nouvelle commande</option>
              <option value="confirmed">Confirmée</option>
              <option value="shipped">Expédiée</option>
              <option value="delivered">Livrée</option>
            </select>
            <button onClick={createTemplate} className="px-4 py-3 rounded-xl bg-[#111B21] text-white font-bold text-sm flex items-center justify-center gap-2">
              <Plus size={16} /> Enregistrer template
            </button>
          </div>

          <textarea value={draft.message_template} onChange={(e) => setDraft((prev) => ({ ...prev, message_template: e.target.value }))} rows={5} className="mt-4 w-full border border-[#D1D7DB] rounded-2xl px-4 py-3 text-sm text-[#111B21] outline-none focus:ring-2 focus:ring-[#00A884]/20" />
          <div className="text-xs text-[#667781] mt-3">Variables: {'{{order_id}}'}, {'{{customer_name}}'}, {'{{total}}'}, {'{{items}}'}, {'{{status}}'}, {'{{tracking_url}}'}, {'{{store_name}}'}</div>
          {feedback && <div className="mt-4 text-sm text-[#00A884] font-semibold flex items-center gap-2"><CheckCircle2 size={16} /> {feedback}</div>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-white border border-[#D1D7DB] rounded-3xl p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[#111B21] mb-4">Templates actifs</h2>
            <div className="space-y-3">
              {templates.map((template) => (
                <div key={template.id} className="border border-[#E9EDEF] rounded-2xl p-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-bold text-[#111B21]">{template.platform || 'Tous'} • {template.trigger_status}</div>
                    <div className="text-xs text-[#667781] mt-1 line-clamp-2">{template.message_template}</div>
                  </div>
                  <button onClick={() => deleteTemplate(template.id)} className="text-rose-500 hover:text-rose-700"><Trash2 size={16} /></button>
                </div>
              ))}
              {!templates.length && <div className="text-sm text-[#667781]">Aucun template configuré.</div>}
            </div>
          </section>

          <section className="bg-white border border-[#D1D7DB] rounded-3xl p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[#111B21] mb-4">Historique</h2>
            <div className="space-y-3 max-h-[420px] overflow-auto pr-1">
              {history.map((item) => (
                <div key={item.id} className="border border-[#E9EDEF] rounded-2xl p-4">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <div className="text-sm font-bold text-[#111B21]">Commande {item.order_id}</div>
                    <span className="text-xs font-bold text-[#00A884] uppercase">{item.status}</span>
                  </div>
                  <div className="text-xs text-[#667781]">{item.message_sent}</div>
                </div>
              ))}
              {!history.length && <div className="text-sm text-[#667781]">Aucun envoi enregistré.</div>}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}