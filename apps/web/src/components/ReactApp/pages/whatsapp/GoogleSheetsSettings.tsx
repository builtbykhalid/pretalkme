import { useEffect, useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { ArrowRight, CheckCircle2, PlugZap, RefreshCcw, Sheet } from 'lucide-react';

type ConfigState = {
  spreadsheet_id: string;
  spreadsheet_name: string;
  sheet_tab_name: string;
  active: boolean;
  column_mapping?: Record<string, string>;
  last_sync_at?: string | null;
};

export default function GoogleSheetsSettings() {
  const { api } = useApi();
  const [config, setConfig] = useState<ConfigState>({
    spreadsheet_id: '',
    spreadsheet_name: '',
    sheet_tab_name: 'Commandes',
    active: true,
  });
  const [logs, setLogs] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  const load = async () => {
    const [configRes, logsRes] = await Promise.all([
      api.get('/api/v1/google-sheets/config'),
      api.get('/api/v1/google-sheets/sync-logs'),
    ]);
    if (configRes.data) setConfig((prev) => ({ ...prev, ...configRes.data }));
    setLogs(logsRes.data || []);
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  const save = async () => {
    setSaving(true);
    setFeedback('');
    try {
      await api.post('/api/v1/google-sheets/config', config);
      setFeedback('Configuration Google Sheets enregistrée.');
      await load();
    } finally {
      setSaving(false);
    }
  };

  const connect = async () => {
    const { data } = await api.get('/api/v1/google-sheets/auth-url');
    if (data?.url) window.location.href = data.url;
  };

  const test = async () => {
    setSaving(true);
    setFeedback('');
    try {
      await api.post('/api/v1/google-sheets/test');
      setFeedback('Test d’écriture déclenché.');
      await load();
    } finally {
      setSaving(false);
    }
  };

  const retry = async (logId: string) => {
    await api.post(`/api/v1/google-sheets/retry/${logId}`);
    await load();
  };

  return (
    <div className="p-6 md:p-8 bg-[#F0F2F5] min-h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white border border-[#D1D7DB] rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-[#00A884] text-white flex items-center justify-center"><Sheet size={20} /></div>
                <h1 className="text-2xl font-bold text-[#111B21]">Google Sheets</h1>
              </div>
              <p className="text-[#667781]">Synchronisez vos commandes vers une feuille de calcul. Les erreurs restent rejouables.</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button onClick={connect} className="px-4 py-2.5 rounded-xl bg-[#00A884] text-white font-bold text-sm flex items-center gap-2">
                <PlugZap size={16} /> Connecter Google
              </button>
              <button onClick={test} disabled={saving} className="px-4 py-2.5 rounded-xl border border-[#D1D7DB] text-[#111B21] font-bold text-sm flex items-center gap-2">
                <RefreshCcw size={16} /> Tester
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Spreadsheet ID" value={config.spreadsheet_id} onChange={(value) => setConfig((prev) => ({ ...prev, spreadsheet_id: value }))} placeholder="1AbC..." />
            <Field label="Nom du fichier" value={config.spreadsheet_name} onChange={(value) => setConfig((prev) => ({ ...prev, spreadsheet_name: value }))} placeholder="Commandes Pretalk" />
            <Field label="Nom de l'onglet" value={config.sheet_tab_name} onChange={(value) => setConfig((prev) => ({ ...prev, sheet_tab_name: value }))} placeholder="Commandes" />
            <div className="rounded-2xl border border-[#E9EDEF] p-4 bg-[#FAFAFA]">
              <label className="text-[11px] uppercase tracking-widest font-bold text-[#8696A0]">Actif</label>
              <button onClick={() => setConfig((prev) => ({ ...prev, active: !prev.active }))} className={`mt-3 w-full px-4 py-3 rounded-xl font-bold text-sm ${config.active ? 'bg-[#E7F3EF] text-[#00A884]' : 'bg-[#F0F2F5] text-[#667781]'}`}>
                {config.active ? 'Synchronisation activée' : 'Synchronisation désactivée'}
              </button>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button onClick={save} disabled={saving} className="px-5 py-3 rounded-xl bg-[#111B21] text-white font-bold text-sm">Enregistrer</button>
            {feedback && <span className="text-sm text-[#00A884] font-semibold flex items-center gap-2"><CheckCircle2 size={16} /> {feedback}</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
          <div className="bg-white border border-[#D1D7DB] rounded-3xl p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[#111B21] mb-4">Journal des syncs</h2>
            <div className="space-y-3 max-h-105 overflow-auto pr-1">
              {logs.map((log) => (
                <div key={log.id} className="border border-[#E9EDEF] rounded-2xl p-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-bold text-[#111B21]">{log.event_type}</div>
                    <div className="text-xs text-[#667781]">{log.error_message || 'OK'} • {new Date(log.created_at).toLocaleString('fr-FR')}</div>
                  </div>
                  {log.status === 'failed' ? (
                    <button onClick={() => retry(log.id)} className="text-xs font-bold text-[#00A884] flex items-center gap-1">
                      Relancer <ArrowRight size={14} />
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-[#00A884]">{log.status}</span>
                  )}
                </div>
              ))}
              {!logs.length && <div className="text-sm text-[#667781]">Aucun log de synchronisation pour le moment.</div>}
            </div>
          </div>

          <div className="bg-white border border-[#D1D7DB] rounded-3xl p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[#111B21] mb-4">Mapping de base</h2>
            <div className="space-y-3 text-sm text-[#667781]">
              <Row a="Order ID" b="A" />
              <Row a="Client" b="B" />
              <Row a="Téléphone" b="C" />
              <Row a="Statut" b="D" />
              <Row a="Total" b="E" />
              <Row a="Items JSON" b="F" />
              <Row a="Créé le" b="G" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, placeholder, onChange }: { label: string; value: string; placeholder: string; onChange: (value: string) => void }) {
  return (
    <label className="rounded-2xl border border-[#E9EDEF] p-4 bg-[#FAFAFA] block">
      <span className="text-[11px] uppercase tracking-widest font-bold text-[#8696A0]">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="mt-2 w-full bg-white border border-[#D1D7DB] rounded-xl px-4 py-3 text-sm text-[#111B21] outline-none focus:ring-2 focus:ring-[#00A884]/20" />
    </label>
  );
}

function Row({ a, b }: { a: string; b: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[#F0F2F5] pb-2 last:border-0 last:pb-0">
      <span>{a}</span>
      <span className="font-bold text-[#111B21]">{b}</span>
    </div>
  );
}