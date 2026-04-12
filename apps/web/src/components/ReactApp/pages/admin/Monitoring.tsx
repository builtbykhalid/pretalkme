import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { FaSync, FaEye } from 'react-icons/fa';
import { useFeedback } from '../../context/FeedbackContext';

type AutomationLog = {
  id: string;
  workflow_id: string;
  lead_id: string | null;
  status: 'success' | 'failed' | 'pending';
  external_execution_id: string | null;
  response_payload: any;
  created_at: string;
};

const AdminMonitoring = () => {
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<AutomationLog | null>(null);
  const { showFeedback } = useFeedback();

  useEffect(() => {
    fetchLogs();
  }, [filterStatus]);

  const fetchLogs = async () => {
    setLoading(true);
    let query = supabase
      .from('automation_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (filterStatus) {
      query = query.eq('status', filterStatus);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching logs:', error);
    } else {
      setLogs(data as AutomationLog[]);
    }
    setLoading(false);
  };

  const retryExecution = async (_logId: string) => {
    showFeedback('info', { 
        title: 'Bientôt disponible',
        message: 'La fonctionnalité de relance sera implémentée avec l\'intégration de l\'API n8n.' 
    });
    // TODO: Implement retry logic with n8n
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
      case 'failed':
        return 'bg-rose-50 text-rose-600 border border-rose-100';
      case 'pending':
        return 'bg-amber-50 text-amber-600 border border-amber-100';
      default:
        return 'bg-neutral-50 text-neutral-600 border border-neutral-200';
    }
  };

  return (
    <div className="w-full space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-dark tracking-tight">Surveillance Technique</h1>
        <p className="text-sm text-neutral-500 mt-1">Supervisez l'exécution de vos workflows d'automatisation</p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm mb-6 flex flex-wrap gap-2 items-center">
        <label className="text-xs font-bold text-neutral-500 mr-2">Filtrer par statut:</label>
        <button
          onClick={() => setFilterStatus(null)}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${filterStatus === null
              ? 'bg-dark text-white'
              : 'bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100 hover:text-dark'
            }`}
        >
          Tous
        </button>
        <button
          onClick={() => setFilterStatus('success')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${filterStatus === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
            }`}
        >
          Succès
        </button>
        <button
          onClick={() => setFilterStatus('failed')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${filterStatus === 'failed'
              ? 'bg-rose-600 text-white'
              : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
            }`}
        >
          Échecs
        </button>
        <button
          onClick={() => setFilterStatus('pending')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${filterStatus === 'pending'
              ? 'bg-amber-500 text-white'
              : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
            }`}
        >
          En attente
        </button>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="p-4 text-left text-xs font-bold text-neutral-500">Statut</th>
                <th className="p-4 text-left text-xs font-bold text-neutral-500">ID Workflow</th>
                <th className="p-4 text-left text-xs font-bold text-neutral-500">ID Lead</th>
                <th className="p-4 text-left text-xs font-bold text-neutral-500">ID Exécution</th>
                <th className="p-4 text-left text-xs font-bold text-neutral-500">Horodatage</th>
                <th className="p-4 text-right text-xs font-bold text-neutral-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-neutral-500 font-medium text-sm">Chargement des journaux...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-neutral-500 font-medium text-sm">Aucun journal trouvé</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(log.status)}`}>
                        {log.status === 'success' ? 'Succès' : log.status === 'failed' ? 'Échec' : 'En attente'}
                      </span>
                    </td>
                    <td className="p-4 text-dark font-medium text-sm font-mono truncate max-w-[150px]">{log.workflow_id}</td>
                    <td className="p-4 text-neutral-500 text-xs font-mono truncate max-w-[120px]">{log.lead_id || 'N/A'}</td>
                    <td className="p-4 text-neutral-500 text-xs font-mono truncate max-w-[150px]">{log.external_execution_id || 'N/A'}</td>
                    <td className="p-4 text-neutral-500 text-sm font-medium">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="p-4 flex items-center justify-end space-x-2">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-2 bg-primary-50 hover:bg-primary-100 text-primary-600 border border-primary-200 rounded-lg transition-colors"
                        title="Voir les détails"
                      >
                        <FaEye size={14} />
                      </button>
                      {log.status === 'failed' && (
                        <button
                          onClick={() => retryExecution(log.id)}
                          className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 rounded-lg transition-colors"
                          title="Réessayer"
                        >
                          <FaSync size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 md:p-8 max-w-2xl w-full mx-auto max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-dark">Détails de l'Exécution</h2>
              <button onClick={() => setSelectedLog(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-500 transition-colors">
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6 bg-neutral-50 p-5 rounded-xl border border-neutral-100">
                <div>
                  <p className="text-xs font-bold text-neutral-400 mb-1">Statut</p>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${getStatusColor(selectedLog.status)}`}>
                    {selectedLog.status === 'success' ? 'Succès' : selectedLog.status === 'failed' ? 'Échec' : 'En attente'}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-400 mb-1">Horodatage</p>
                  <p className="text-sm font-bold text-dark">{new Date(selectedLog.created_at).toLocaleString()}</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-bold text-neutral-400 mb-1">ID Workflow</p>
                  <p className="text-sm font-mono text-neutral-600 bg-neutral-50 px-3 py-2 rounded-lg border border-neutral-200 break-all">{selectedLog.workflow_id}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-400 mb-1">ID Exécution Externe</p>
                  <p className="text-sm font-mono text-neutral-600 bg-neutral-50 px-3 py-2 rounded-lg border border-neutral-200 break-all">{selectedLog.external_execution_id || 'N/A'}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-neutral-400 mb-1">ID Lead</p>
                <p className="text-sm font-mono text-neutral-600 bg-neutral-50 px-3 py-2 rounded-lg border border-neutral-200">{selectedLog.lead_id || 'N/A'}</p>
              </div>

              {selectedLog.response_payload && (
                <div>
                  <p className="text-xs font-bold text-neutral-400 mb-2">Charge Utile de la Réponse (Payload)</p>
                  <pre className="bg-[#0d1117] border border-neutral-200 p-4 rounded-xl text-[#e6edf3] text-xs font-mono overflow-x-auto max-h-64 custom-scrollbar shadow-sm">
                    {JSON.stringify(selectedLog.response_payload, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-8 pt-5 border-t border-neutral-100">
              <button
                onClick={() => setSelectedLog(null)}
                className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-3 px-4 rounded-xl transition-colors font-bold text-sm"
              >
                Fermer
              </button>
              {selectedLog.status === 'failed' && (
                <button
                  onClick={() => retryExecution(selectedLog.id)}
                  className="flex-1 bg-dark hover:bg-black text-white py-3 px-4 rounded-xl transition-colors font-bold text-sm shadow-sm flex items-center justify-center gap-2"
                >
                  <FaSync size={14} /> Réessayer l'Exécution
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMonitoring;





