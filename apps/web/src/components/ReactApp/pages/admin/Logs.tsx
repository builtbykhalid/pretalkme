import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { FaEye } from 'react-icons/fa';

type AuditLog = {
  id: string;
  admin_user_id: string | null;
  action: string;
  target_resource: string | null;
  details: any;
  created_at: string;
  admin_email?: string;
};

const AdminLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [filterAction, setFilterAction] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [filterAction]);

  const fetchLogs = async () => {
    setLoading(true);
    let query = supabase
      .from('admin_audit_logs')
      .select(`
        id,
        admin_user_id,
        action,
        target_resource,
        details,
        created_at,
        profiles:admin_user_id (email)
      `)
      .order('created_at', { ascending: false })
      .limit(200);

    if (filterAction) {
      query = query.eq('action', filterAction);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching audit logs:', error);
    } else {
      const enriched = data?.map((log: any) => ({
        ...log,
        admin_email: log.profiles?.email || 'Unknown',
      })) || [];
      setLogs(enriched as AuditLog[]);
    }
    setLoading(false);
  };

  const uniqueActions = Array.from(new Set(logs.map(log => log.action)));

  return (
    <div className="w-full space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-dark tracking-tight">Journaux d'Audit Admin</h1>
        <p className="text-sm text-neutral-500 mt-1">Consultez l'historique des actions d'administration</p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm mb-6">
        <label className="block text-xs font-bold text-neutral-500 mb-3">Filtrer par Action</label>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterAction(null)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${filterAction === null
                ? 'bg-dark text-white'
                : 'bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100 hover:text-dark'
              }`}
          >
            Toutes
          </button>
          {uniqueActions.map(action => (
            <button
              key={action}
              onClick={() => setFilterAction(action)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${filterAction === action
                  ? 'bg-dark text-white'
                  : 'bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100 hover:text-dark'
                }`}
            >
              {action}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="p-4 text-left text-xs font-bold text-neutral-500">Admin</th>
                <th className="p-4 text-left text-xs font-bold text-neutral-500">Action</th>
                <th className="p-4 text-left text-xs font-bold text-neutral-500">Ressource Cible</th>
                <th className="p-4 text-left text-xs font-bold text-neutral-500">Horodatage</th>
                <th className="p-4 text-center text-xs font-bold text-neutral-500">Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-neutral-500 font-medium text-sm">Chargement des journaux...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-neutral-500 font-medium text-sm">Aucun journal d'audit trouvé</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="p-4 text-dark font-bold text-sm">{log.admin_email}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-neutral-100 text-neutral-600 text-xs font-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-neutral-500 text-xs font-mono truncate max-w-[200px]">
                      {log.target_resource || 'N/A'}
                    </td>
                    <td className="p-4 text-neutral-500 text-sm font-medium">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="inline-flex p-2 bg-primary-50 hover:bg-primary-100 text-primary-600 border border-primary-200 rounded-lg transition-colors"
                        title="Voir les détails"
                      >
                        <FaEye size={14} />
                      </button>
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
              <h2 className="text-xl font-semibold text-dark">Détails du Journal d'Audit</h2>
              <button onClick={() => setSelectedLog(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-500 transition-colors">
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6 bg-neutral-50 p-5 rounded-xl border border-neutral-100">
                <div>
                  <p className="text-xs font-bold text-neutral-400 mb-1">Admin</p>
                  <p className="text-sm font-bold text-dark">{selectedLog.admin_email}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-400 mb-1">Action</p>
                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-white border border-neutral-200 text-dark text-xs font-bold shadow-sm">
                    {selectedLog.action}
                  </span>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-bold text-neutral-400 mb-1">Ressource Cible</p>
                  <p className="text-sm font-mono text-neutral-600 bg-neutral-50 px-3 py-2 rounded-lg border border-neutral-200 break-all">
                    {selectedLog.target_resource || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-400 mb-1">Horodatage</p>
                  <p className="text-sm font-bold text-dark">{new Date(selectedLog.created_at).toLocaleString()}</p>
                </div>
              </div>

              {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                <div>
                  <p className="text-xs font-bold text-neutral-400 mb-2">Détails (JSON)</p>
                  <pre className="bg-[#0d1117] border border-neutral-200 p-4 rounded-xl text-[#e6edf3] text-xs font-mono overflow-x-auto max-h-64 custom-scrollbar shadow-sm">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="mt-8 pt-5 border-t border-neutral-100">
              <button
                onClick={() => setSelectedLog(null)}
                className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-3 px-4 rounded-xl font-bold transition-colors text-sm"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLogs;





