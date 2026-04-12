import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';
import { 
  Bot, 
  Settings2, 
  Terminal, 
  MessageSquare, 
  Mic, 
  Play, 
  Save, 
  RotateCw, 
  ShieldCheck, 
  AlertCircle, 
  User, 
  ChevronRight,
  Database,
  Type,
  Volume2,
  Trash2,
  Clock,
  Sparkles,
  ArrowRight,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AIAgent() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'config' | 'logs'>('simulator');
  const { config, updateTenantConfig } = useApp();
  
  // Local state for the form to avoid too many DB writes
  const [localConfig, setLocalConfig] = useState<any>(null);

  useEffect(() => {
    if (config) {
      setLocalConfig({
        ai_voice_id: config.ai_voice_id || 'eleven_multilingual_v2',
        ai_hitl_threshold: (config.ai_hitl_threshold || 0.70) * 100,
        ai_safety_mode: config.ai_safety_mode ?? true,
        ai_system_prompt: config.ai_system_prompt || '',
        ai_enabled: config.ai_enabled ?? false
      });
    }
  }, [config]);

  if (!localConfig) return <div className="p-20 text-center animate-pulse text-[#8696A0]">Chargement de la configuration...</div>;

  return (
    <div className="flex flex-col h-full bg-[#F0F2F5] p-6 md:p-8 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#00A884] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-[#00A884]/20">
             <Bot size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#111B21]">Agent Intelligent</h1>
            <p className="text-[#667781] text-[15px]">Configurez le cerveau de votre automatisation WhatsApp.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 bg-[#E9EDEF] p-1 rounded-xl w-fit border border-[#D1D7DB]">
          <TabButton active={activeTab === 'simulator'} onClick={() => setActiveTab('simulator')} icon={MessageSquare} label="Simulateur" />
          <TabButton active={activeTab === 'config'} onClick={() => setActiveTab('config')} icon={Settings2} label="Paramètres" />
          <TabButton active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} icon={Terminal} label="Logs" />
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {activeTab === 'simulator' && <AISimulator />}
        {activeTab === 'config' && (
           <AIConfig 
             config={localConfig} 
             setConfig={setLocalConfig} 
             onSave={() => updateTenantConfig({
                ...localConfig,
                ai_hitl_threshold: localConfig.ai_hitl_threshold / 100
             })} 
           />
        )}
        {activeTab === 'logs' && <AILogs />}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${active ? 'bg-white text-[#111B21] shadow-sm' : 'text-[#54656F] hover:bg-white/50'}`}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}

/* ─── SIMULATEUR (Direct Supabase) ─── */
function AISimulator() {
  const [input, setInput] = useState('');
  const [simulating, setSimulating] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const handleSimulate = async () => {
    if (!input.trim()) return;
    setSimulating(true);
    // Note: Simulation logic would normally hit Agent 07 (FastAPI)
    // For now we keep a realistic mock response until Agent 07 is ready
    setTimeout(() => {
        setHistory(prev => [{
            id: Date.now(),
            query: input,
            response: "C'est noté ! Je suis l'IA de Pretalk. Votre demande est en cours de traitement. Un agent humain prendra le relais si nécessaire.",
            confidence: 94,
            latency: 720,
            rag_sources: ["Base de connaissances"]
        }, ...prev]);
        setInput('');
        setSimulating(false);
    }, 1200);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="bg-white rounded-[24px] p-6 border border-[#D1D7DB] shadow-sm">
           <div className="flex items-center gap-2 mb-6 text-[#00A884]">
             <Sparkles size={20} />
             <h3 className="font-bold text-sm uppercase tracking-wider">Simulateur LIVE</h3>
           </div>
           
           <div className="space-y-4">
             <textarea 
               value={input}
               onChange={(e) => setInput(e.target.value)}
               placeholder="Tapez un message client pour tester l'IA..."
               className="w-full h-40 bg-[#F0F2F5] border border-[#D1D7DB] rounded-xl p-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#00A884]/20 transition-all resize-none font-medium"
             />
             
             <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 bg-[#F0F2F5] text-[#54656F] py-3.5 rounded-xl font-bold text-sm hover:bg-[#E9EDEF] transition-all border border-[#D1D7DB]">
                   <Mic size={18} />
                </button>
                <button 
                  onClick={handleSimulate}
                  disabled={simulating}
                  className="flex-[3] flex items-center justify-center gap-2 bg-[#00A884] text-white py-3.5 rounded-xl font-bold text-sm hover:brightness-105 transition-all shadow-lg shadow-[#00A884]/20 disabled:opacity-50"
                >
                  {simulating ? <RotateCw size={18} className="animate-spin" /> : <Play size={18} fill="white" />}
                  Lancer Simulation
                </button>
             </div>
           </div>
        </div>

        <div className="bg-[#111B21] rounded-[24px] p-8 text-white relative overflow-hidden shadow-xl">
           <div className="relative z-10">
              <h4 className="font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2 text-[#00A884]">
                 <Terminal size={16} /> Mode Debug
              </h4>
              <p className="text-[14px] text-[#A1A1A1] leading-relaxed mb-6 font-medium">
                 Vérifiez la confiance de l'IA et les sources RAG utilisées pour chaque réponse.
              </p>
              <button className="text-[13px] font-bold text-[#00A884] flex items-center gap-2 group">
                 Documentation des Logs <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
           </div>
           <Bot size={120} className="absolute -bottom-8 -right-8 text-white/5 rotate-12" />
        </div>
      </div>

      <div className="lg:col-span-8 bg-white rounded-[24px] border border-[#D1D7DB] shadow-sm flex flex-col overflow-hidden">
         <div className="p-6 border-b border-[#E9EDEF] bg-[#F0F2F5]/30 flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#111B21]">Historique Récent</h3>
            <button onClick={() => setHistory([])} className="p-2 text-[#8696A0] hover:text-[#EA0038] hover:bg-rose-50 rounded-lg transition-all">
               <Trash2 size={18} />
            </button>
         </div>

         <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide bg-[#F0F2F5]/10">
            {history.length > 0 ? history.map(h => (
                <div key={h.id} className="animate-slideIn">
                   <div className="flex items-start gap-4 mb-6">
                      <div className="w-10 h-10 rounded-full bg-[#DFE5E7] flex items-center justify-center text-[#54656F] shrink-0 border border-[#D1D7DB] font-bold">U</div>
                      <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-[#D1D7DB] text-[15px] text-[#111B21] max-w-[80%] shadow-sm font-medium">
                         {h.query}
                      </div>
                   </div>
                   
                   <div className="flex items-start gap-4 justify-end">
                      <div className="flex flex-col items-end gap-2 max-w-[80%]">
                         <div className="bg-[#E7F3EF] text-[#111B21] p-5 rounded-2xl rounded-tr-none text-[15px] border border-[#D1D7DB]/50 shadow-sm leading-relaxed font-medium">
                            {h.response}
                            <div className="mt-4 flex flex-wrap gap-2">
                               {h.rag_sources.map((s: string) => (
                                  <span key={s} className="bg-white/50 text-[#00A884] px-2 py-1 rounded-md text-[10px] font-bold border border-[#00A884]/20 flex items-center gap-1.5">
                                     <Database size={10} /> {s}
                                  </span>
                               ))}
                            </div>
                         </div>
                         <div className="flex items-center gap-4 text-[11px] font-bold text-[#8696A0] uppercase tracking-wider">
                            <span className={`flex items-center gap-1 ${h.confidence > 80 ? 'text-[#00A884]' : 'text-amber-600'}`}>
                               {h.confidence > 80 ? <ShieldCheck size={14} /> : <AlertCircle size={14} />}
                               {h.confidence}% Confiance
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Clock size={12} /> {h.latency}ms</span>
                         </div>
                      </div>
                      <div className="w-10 h-10 rounded-2xl bg-[#00A884] flex items-center justify-center text-white shrink-0 shadow-lg shadow-[#00A884]/20">
                         <Bot size={22} />
                      </div>
                   </div>
                </div>
            )) : (
              <div className="flex flex-col items-center justify-center h-full text-center opacity-40 py-20">
                 <Bot size={64} className="mb-6" />
                 <p className="text-[#111B21] text-lg font-bold">Prêt pour le test</p>
                 <p className="text-[#667781] text-[15px]">Simulez un message pour observer la réaction de l'IA.</p>
              </div>
            )}
         </div>
      </div>
    </div>
  );
}

/* ─── CONFIGURATION (App Context Integration) ─── */
function AIConfig({ config, setConfig, onSave }: any) {
  return (
    <div className="bg-white rounded-[24px] border border-[#D1D7DB] shadow-sm p-10 overflow-y-auto h-full scrollbar-hide">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-[#111B21] mb-10">Personnalisation de l'Agent IA</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
           <div className="space-y-10">
              <ConfigSection icon={Type} title="Activer l'Agent">
                  <div 
                    onClick={() => setConfig({...config, ai_enabled: !config.ai_enabled})}
                    className="bg-[#F0F2F5] p-5 rounded-2xl border border-[#D1D7DB] flex items-center justify-between cursor-pointer"
                  >
                     <span className="font-bold text-[#111B21]">Réponses Automatiques</span>
                     <div className={`w-12 h-6 rounded-full relative transition-colors ${config.ai_enabled ? 'bg-[#00A884]' : 'bg-[#D1D7DB]'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.ai_enabled ? 'right-1' : 'left-1'}`} />
                     </div>
                  </div>
              </ConfigSection>

              <ConfigSection icon={Volume2} title="Voix Multilingue">
                 <div className="space-y-3">
                    <VoiceBtn 
                      label="ElevenLabs Multilingual" 
                      sub="Soutient Français + Darija" 
                      active={config.ai_voice_id === 'eleven_multilingual_v2'} 
                      onClick={() => setConfig({...config, ai_voice_id: 'eleven_multilingual_v2'})} 
                    />
                    <VoiceBtn 
                      label="Azure Standard" 
                      sub="Voix plus rapide (Basic)" 
                      active={config.ai_voice_id === 'azure_fr'} 
                      onClick={() => setConfig({...config, ai_voice_id: 'azure_fr'})}
                    />
                 </div>
              </ConfigSection>

              <div className="bg-[#E7F3EF] p-6 rounded-2xl border border-[#00A884]/20 flex items-center justify-between">
                 <div>
                    <span className="block font-bold text-[#111B21] text-sm">Mode de Sécurité (HITL)</span>
                    <span className="text-[12px] text-[#667781]">Faire intervenir un humain si l'IA doute.</span>
                 </div>
                 <div 
                   onClick={() => setConfig({...config, ai_safety_mode: !config.ai_safety_mode})}
                   className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${config.ai_safety_mode ? 'bg-[#00A884]' : 'bg-[#D1D7DB]'}`}
                 >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.ai_safety_mode ? 'right-1' : 'left-1'}`} />
                 </div>
              </div>
           </div>

           <div className="space-y-10">
              <ConfigSection icon={Database} title="Prompt Système (Instructions)">
                 <textarea 
                   value={config.ai_system_prompt}
                   onChange={(e) => setConfig({...config, ai_system_prompt: e.target.value})}
                   className="w-full h-64 bg-[#F0F2F5] border border-[#D1D7DB] rounded-xl p-5 text-[14px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#00A884]/20 font-medium resize-none shadow-sm"
                   placeholder="Définissez comment l'IA doit parler à vos clients..."
                 />
              </ConfigSection>

              <ConfigSection icon={Sparkles} title="Seuil de Confiance">
                 <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold text-[#667781]">Minimum de certitude</span>
                    <span className="text-lg font-bold text-[#00A884]">{config.ai_hitl_threshold}%</span>
                 </div>
                 <input 
                   type="range" min="0" max="100" value={config.ai_hitl_threshold}
                   onChange={(e) => setConfig({...config, ai_hitl_threshold: parseInt(e.target.value)})}
                   className="w-full accent-[#00A884] h-2 bg-[#F0F2F5] rounded-full outline-none cursor-pointer"
                 />
              </ConfigSection>

              <button 
                onClick={onSave}
                className="w-full bg-[#111B21] text-white py-4 rounded-xl font-bold text-sm shadow-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                 <Save size={20} /> Sauvegarder les Changements
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}

function ConfigSection({ icon: Icon, title, children }: any) {
  return (
    <div className="space-y-4">
       <div className="flex items-center gap-2 text-[#54656F] border-b border-[#F0F2F5] pb-2">
          <Icon size={18} />
          <h4 className="text-[12px] font-bold uppercase tracking-widest">{title}</h4>
       </div>
       {children}
    </div>
  );
}

function VoiceBtn({ label, sub, active, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className={`p-4 border rounded-xl flex items-center gap-4 cursor-pointer transition-all ${active ? 'bg-white border-[#00A884] shadow-md ring-1 ring-[#00A884]' : 'bg-[#F0F2F5] border-transparent hover:border-[#D1D7DB]'}`}
    >
       <div className={`w-10 h-10 rounded-full flex items-center justify-center ${active ? 'bg-[#00A884] text-white' : 'bg-[#E9EDEF] text-[#8696A0]'}`}>
          <Play size={16} fill={active ? 'white' : 'none'} />
       </div>
       <div className="flex-1 min-w-0">
          <span className={`block font-bold text-sm truncate ${active ? 'text-[#111B21]' : 'text-[#54656F]'}`}>{label}</span>
          <span className="text-[11px] text-[#8696A0]">{sub}</span>
       </div>
       {active && <ShieldCheck size={18} className="text-[#00A884] shrink-0" />}
    </div>
  );
}

/* ─── LOGS (Direct Supabase) ─── */
function AILogs() {
  const { tenantId } = useApp();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) return;
    const fetchLogs = async () => {
      const { data } = await supabase
        .from('ai_runs')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(20);
      
      setLogs(data || []);
      setLoading(false);
    };
    fetchLogs();
  }, [tenantId]);

  return (
    <div className="bg-white rounded-[24px] border border-[#D1D7DB] shadow-sm flex flex-col h-full overflow-hidden">
       <div className="p-6 border-b border-[#E9EDEF] bg-[#F0F2F5]/30 flex items-center justify-between">
          <h3 className="font-bold text-sm text-[#111B21]">Logs d'IA (ai_runs)</h3>
          <button className="p-2.5 bg-white border border-[#D1D7DB] rounded-lg text-[#54656F] hover:bg-[#F0F2F5]"><Filter size={18} /></button>
       </div>
       
       <div className="flex-1 overflow-auto scrollbar-hide">
          <table className="w-full text-left">
             <thead className="bg-[#F0F2F5] sticky top-0 border-b border-[#D1D7DB]">
                <tr>
                   <th className="px-8 py-4 text-[12px] font-bold text-[#54656F] uppercase">Heure</th>
                   <th className="px-8 py-4 text-[12px] font-bold text-[#54656F] uppercase">Confiance</th>
                   <th className="px-8 py-4 text-[12px] font-bold text-[#54656F] uppercase">Modèle</th>
                   <th className="px-8 py-4 text-[12px] font-bold text-[#54656F] uppercase text-right">Latence</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-[#E9EDEF]">
                {loading ? (
                   Array(5).fill(0).map((_, i) => <tr key={i}><td colSpan={4} className="px-8 py-4 animate-pulse bg-gray-50/50">...</td></tr>)
                ) : logs.length > 0 ? logs.map(log => (
                  <tr key={log.id} className="hover:bg-[#F8F9FA] transition-colors group">
                    <td className="px-8 py-5 text-[14px] text-[#667781] font-bold">{format(new Date(log.created_at), 'HH:mm:ss')}</td>
                    <td className="px-8 py-5">
                       <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${
                         (log.confidence_score || 0) > 0.8 ? 'bg-[#E7F3EF] text-[#00A884] border-[#00A884]/10' : 'bg-amber-50 text-amber-600 border-amber-100'
                       }`}>
                          {Math.round((log.confidence_score || 0) * 100)}%
                       </span>
                    </td>
                    <td className="px-8 py-5 text-[13px] font-bold text-[#111B21]">{log.model_used || 'gpt-4o'}</td>
                    <td className="px-8 py-5 text-right text-[13px] font-bold text-[#667781]">{log.latency_ms || 0}ms</td>
                  </tr>
                )) : (
                   <tr><td colSpan={4} className="px-8 py-20 text-center text-[#8696A0] font-medium italic">Aucun log disponible.</td></tr>
                )}
             </tbody>
          </table>
       </div>
    </div>
  );
}
