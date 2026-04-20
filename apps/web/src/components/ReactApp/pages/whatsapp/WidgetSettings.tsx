import { useEffect, useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { CheckCircle2, Code2, Copy, Globe, Palette } from 'lucide-react';

export default function WidgetSettings() {
  const { api } = useApi();
  const [settings, setSettings] = useState({ enabled: false, brand_color: '#16a34a', greeting: 'Bonjour ! Comment puis-je vous aider ?', widget_public_key: '' });
  const [feedback, setFeedback] = useState('');

  const load = async () => {
    const { data } = await api.get('/api/v1/widget/settings');
    if (data) setSettings((prev) => ({ ...prev, ...data }));
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  const save = async () => {
    await api.post('/api/v1/widget/settings', {
      enabled: settings.enabled,
      brand_color: settings.brand_color,
      greeting: settings.greeting,
    });
    setFeedback('Paramètres widget enregistrés.');
    await load();
  };

  const snippet = `<script src="https://app.pretalk.me/widget.js" data-key="${settings.widget_public_key}" async></script>`;

  const copy = async () => {
    await navigator.clipboard.writeText(snippet);
    setFeedback('Snippet copié.');
  };

  return (
    <div className="p-6 md:p-8 bg-[#F0F2F5] min-h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white border border-[#D1D7DB] rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#00A884] text-white flex items-center justify-center"><Globe size={20} /></div>
            <h1 className="text-2xl font-bold text-[#111B21]">Widget web</h1>
          </div>
          <p className="text-[#667781] mb-6">Activer le widget et copiez le snippet d’intégration pour votre site.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-[#E9EDEF] p-4 bg-[#FAFAFA]">
              <label className="text-[11px] uppercase tracking-widest font-bold text-[#8696A0]">Couleur principale</label>
              <div className="mt-3 flex items-center gap-3">
                <Palette size={16} className="text-[#667781]" />
                <input type="color" value={settings.brand_color} onChange={(e) => setSettings((prev) => ({ ...prev, brand_color: e.target.value }))} />
                <input value={settings.brand_color} onChange={(e) => setSettings((prev) => ({ ...prev, brand_color: e.target.value }))} className="flex-1 border border-[#D1D7DB] rounded-xl px-4 py-3 text-sm" />
              </div>
            </div>
            <label className="rounded-2xl border border-[#E9EDEF] p-4 bg-[#FAFAFA] block">
              <span className="text-[11px] uppercase tracking-widest font-bold text-[#8696A0]">Message d'accueil</span>
              <textarea value={settings.greeting} onChange={(e) => setSettings((prev) => ({ ...prev, greeting: e.target.value }))} rows={4} className="mt-3 w-full border border-[#D1D7DB] rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#00A884]/20" />
            </label>
          </div>

          <div className="mt-4 flex items-center justify-between gap-4 flex-wrap">
            <button onClick={() => setSettings((prev) => ({ ...prev, enabled: !prev.enabled }))} className={`px-4 py-2.5 rounded-xl font-bold text-sm ${settings.enabled ? 'bg-[#E7F3EF] text-[#00A884]' : 'bg-[#F0F2F5] text-[#667781]'}`}>
              {settings.enabled ? 'Widget activé' : 'Widget désactivé'}
            </button>
            <button onClick={save} className="px-5 py-3 rounded-xl bg-[#111B21] text-white font-bold text-sm">Enregistrer</button>
          </div>

          {feedback && <div className="mt-4 text-sm text-[#00A884] font-semibold flex items-center gap-2"><CheckCircle2 size={16} /> {feedback}</div>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-start">
          <div className="bg-white border border-[#D1D7DB] rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4"><Code2 size={20} className="text-[#00A884]" /> <h2 className="text-xl font-bold text-[#111B21]">Snippet d’intégration</h2></div>
            <pre className="bg-[#111B21] text-white rounded-2xl p-4 overflow-auto text-xs leading-relaxed whitespace-pre-wrap">{snippet}</pre>
            <button onClick={copy} className="mt-4 px-4 py-2.5 rounded-xl border border-[#D1D7DB] text-[#111B21] font-bold text-sm flex items-center gap-2">
              <Copy size={16} /> Copier le snippet
            </button>
          </div>

          <div className="bg-white border border-[#D1D7DB] rounded-3xl p-6 md:p-8 shadow-sm min-w-65">
            <h2 className="text-xl font-bold text-[#111B21] mb-4">Clé publique</h2>
            <div className="text-xs text-[#667781] mb-2">Identifiant exposé côté widget</div>
            <div className="font-mono text-sm bg-[#F0F2F5] border border-[#D1D7DB] rounded-xl px-4 py-3 break-all">{settings.widget_public_key || '—'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}