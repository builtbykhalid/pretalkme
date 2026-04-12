import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { FaEye, FaArrowRight } from 'react-icons/fa';

type AgentRequest = {
  id: string;
  user_id: string;
  agent_name: string;
  objective: string;
  budget_range: string;
  timeline: string;
  admin_status: 'pending' | 'quote_sent' | 'in_progress' | 'delivered' | 'rejected';
  admin_notes: string | null;
  quote_amount: number | null;
  created_at: string;
};

type DetailedRequest = AgentRequest & {
  user_email: string;
};

type ModalState = {
  type: 'quote' | 'notes' | 'details' | null;
  request: DetailedRequest | null;
  quoteAmount: number;
  notes: string;
};

const AdminFactory = () => {
  const [requests, setRequests] = useState<DetailedRequest[]>([]);
  // const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalState>({
    type: null,
    request: null,
    quoteAmount: 0,
    notes: '',
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from('agent_requests')
      .select(`
        id,
        user_id,
        agent_name,
        objective,
        budget_range,
        timeline,
        admin_status,
        admin_notes,
        quote_amount,
        created_at,
        profiles:user_id (email)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching agent requests:', error);
    } else {
      const enriched = data?.map((req: any) => ({
        ...req,
        user_email: req.profiles?.email || 'Unknown',
      })) || [];
      setRequests(enriched as DetailedRequest[]);
    }
  };

  const statusLabels: Record<string, string> = {
    pending: 'Nouveau',
    quote_sent: 'Devis Envoyé',
    in_progress: 'En Production',
    delivered: 'Livré',
    rejected: 'Rejeté',
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-primary-50 text-primary-600 border border-primary-100',
    quote_sent: 'bg-amber-50 text-amber-600 border border-amber-100',
    in_progress: 'bg-blue-50 text-blue-600 border border-blue-100',
    delivered: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    rejected: 'bg-rose-50 text-rose-600 border border-rose-100',
  };

  const columnOrder = ['pending', 'quote_sent', 'in_progress', 'delivered', 'rejected'];

  const columns = columnOrder.map(status => ({
    status,
    label: statusLabels[status],
    requests: requests.filter(r => r.admin_status === status as any),
  }));

  const openModal = (type: 'quote' | 'notes' | 'details', request: DetailedRequest) => {
    setModal({
      type,
      request,
      quoteAmount: request.quote_amount || 0,
      notes: request.admin_notes || '',
    });
  };

  const saveQuote = async () => {
    if (!modal.request) return;

    const { error } = await supabase
      .from('agent_requests')
      .update({ quote_amount: modal.quoteAmount, admin_status: 'quote_sent' })
      .eq('id', modal.request.id);

    if (error) {
      alert('Error saving quote: ' + error.message);
    } else {
      fetchRequests();
      setModal({ type: null, request: null, quoteAmount: 0, notes: '' });
    }
  };

  const saveNotes = async () => {
    if (!modal.request) return;

    const { error } = await supabase
      .from('agent_requests')
      .update({ admin_notes: modal.notes })
      .eq('id', modal.request.id);

    if (error) {
      alert('Error saving notes: ' + error.message);
    } else {
      fetchRequests();
      setModal({ type: null, request: null, quoteAmount: 0, notes: '' });
    }
  };

  const updateStatus = async (requestId: string, newStatus: string) => {
    const { error } = await supabase
      .from('agent_requests')
      .update({ admin_status: newStatus })
      .eq('id', requestId);

    if (error) {
      alert('Error updating status: ' + error.message);
    } else {
      fetchRequests();
    }
  };

  return (
    <div className="w-full space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-dark tracking-tight">Factory Agents Sur-Mesure</h1>
        <p className="text-sm text-neutral-500 mt-1">Gérez les demandes de création d'agents personnalisés</p>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
        {columns.map(column => (
          <div key={column.status} className="bg-neutral-50/50 border border-neutral-200 rounded-2xl p-5 flex-shrink-0 w-80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
            <h2 className="text-sm font-bold text-neutral-500 mb-5 flex items-center justify-between">
              {column.label}
              <span className="bg-white border border-neutral-200 text-dark px-2 py-0.5 rounded-md text-xs font-semibold shadow-sm">
                {column.requests.length}
              </span>
            </h2>
            <div className="space-y-4">
              {column.requests.map(req => (
                <div key={req.id} className="bg-white border border-neutral-200 shadow-sm p-5 rounded-xl hover:shadow-md transition-shadow group relative">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${statusColors[req.admin_status]}`}>
                      {statusLabels[req.admin_status]}
                    </span>
                  </div>
                  <h3 className="font-semibold text-dark text-base mb-2 group-hover:text-primary-600 transition-colors">{req.agent_name}</h3>
                  <p className="text-sm text-neutral-500 mb-3 line-clamp-2 leading-relaxed">{req.objective}</p>

                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs ">
                      {req.user_email.charAt(0)}
                    </div>
                    <p className="text-xs text-neutral-600 font-medium truncate">{req.user_email}</p>
                  </div>

                  {req.quote_amount && (
                    <div className="mb-4 px-3 py-2 bg-amber-50 border border-amber-100 rounded-lg text-amber-700 text-sm font-bold flex items-center justify-between">
                      <span>Devis</span>
                      <span>€{req.quote_amount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap pt-2 border-t border-neutral-100">
                    <button
                      onClick={() => openModal('details', req)}
                      className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs py-2 px-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-1.5"
                      title="Voir les détails"
                    >
                      <FaEye size={12} /> Détails
                    </button>
                    {req.admin_status === 'pending' && (
                      <button
                        onClick={() => openModal('quote', req)}
                        className="flex-1 bg-dark hover:bg-black text-white text-xs py-2 px-3 rounded-lg font-bold transition-colors flex items-center justify-center shadow-sm"
                        title="Envoyer un devis"
                      >
                        Devis
                      </button>
                    )}
                    {req.admin_status !== 'delivered' && req.admin_status !== 'rejected' && (
                      <button
                        onClick={() => updateStatus(req.id, columnOrder[columnOrder.indexOf(req.admin_status) + 1])}
                        className="flex-none bg-primary-50 hover:bg-primary-100 text-primary-600 border border-primary-200 px-3 rounded-lg flex items-center justify-center transition-colors"
                        title="Passer à l'étape suivante"
                      >
                        <FaArrowRight size={12} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {column.requests.length === 0 && (
                <div className="bg-white border border-neutral-200 border-dashed rounded-xl p-8 text-center">
                  <p className="text-neutral-400 text-sm font-medium">Aucune demande</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Details, Quote, or Notes */}
      {modal.type && modal.request && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 md:p-8 max-w-2xl w-full mx-auto max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-dark">
                {modal.type === 'details' && 'Détails de la Demande'}
                {modal.type === 'quote' && 'Envoyer un Devis'}
                {modal.type === 'notes' && 'Notes Administrateur'}
              </h2>
              <button onClick={() => setModal({ type: null, request: null, quoteAmount: 0, notes: '' })} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-500 transition-colors">
                ✕
              </button>
            </div>

            {modal.type === 'details' && (
              <div className="space-y-6">

                <div className="grid sm:grid-cols-2 gap-6 bg-neutral-50 p-5 rounded-xl border border-neutral-100">
                  <div>
                    <p className="text-xs font-bold text-neutral-400 mb-1">Utilisateur</p>
                    <p className="text-sm font-bold text-dark">{modal.request.user_email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-400 mb-1">Nom de l'Agent</p>
                    <p className="text-sm font-bold text-dark">{modal.request.agent_name}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-neutral-400 mb-2">Objectif Principal</p>
                  <div className="bg-white border border-neutral-200 p-4 rounded-xl text-sm text-neutral-700 leading-relaxed shadow-sm">
                    {modal.request.objective}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-bold text-neutral-400 mb-1">Budget Client</p>
                    <p className="text-sm font-bold text-dark">{modal.request.budget_range}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-400 mb-1">Délai Attendu</p>
                    <p className="text-sm font-bold text-dark">{modal.request.timeline}</p>
                  </div>
                </div>

                {modal.request.admin_notes && (
                  <div>
                    <p className="text-xs font-bold text-neutral-400 mb-2">Notes Administrateur</p>
                    <div className="bg-primary-50 border border-primary-100 p-4 rounded-xl text-sm text-primary-900 leading-relaxed">
                      {modal.request.admin_notes}
                    </div>
                  </div>
                )}

                {modal.request.quote_amount && (
                  <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex items-center justify-between">
                    <p className="text-sm font-bold text-amber-900">Montant du Devis</p>
                    <p className="text-lg font-semibold text-amber-600">€{modal.request.quote_amount.toFixed(2)}</p>
                  </div>
                )}

                <div className="pt-4 border-t border-neutral-100">
                  <button
                    onClick={() => openModal('notes', modal.request!)}
                    className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-3 px-4 rounded-xl font-bold transition-colors text-sm"
                  >
                    Modifier les Notes Administrateur
                  </button>
                </div>
              </div>
            )}

            {modal.type === 'quote' && (
              <div className="space-y-6">

                <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-neutral-600">Budget annoncé par le client</p>
                  <span className="bg-white border border-neutral-200 px-3 py-1 rounded-lg text-sm font-semibold text-dark">{modal.request.budget_range}</span>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500">Montant du Devis (€)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-neutral-400">€</span>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={modal.quoteAmount}
                      onChange={(e) => setModal({ ...modal, quoteAmount: parseFloat(e.target.value) })}
                      className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 text-dark rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-base font-semibold shadow-sm"
                      placeholder="0.00"
                    />
                  </div>
                  <p className="text-xs text-neutral-400 font-medium">Le devis sera envoyé au client pour validation.</p>
                </div>
              </div>
            )}

            {modal.type === 'notes' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500">Notes Internes de l'Administrateur</label>
                  <textarea
                    value={modal.notes}
                    onChange={(e) => setModal({ ...modal, notes: e.target.value })}
                    className="w-full p-4 bg-neutral-50 border border-neutral-200 text-dark rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm h-40 resize-y shadow-sm"
                    placeholder="Ajoutez des notes internes pour votre équipe concernant ce projet..."
                  />
                  <p className="text-xs text-neutral-400 font-medium">Ces notes ne seront pas visibles par le client.</p>
                </div>
              </div>
            )}

            <div className="flex gap-4 mt-8 pt-5 border-t border-neutral-100">
              <button
                onClick={() => setModal({ type: null, request: null, quoteAmount: 0, notes: '' })}
                className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-3 px-4 rounded-xl transition-colors font-bold text-sm"
              >
                Annuler
              </button>
              {modal.type === 'quote' && (
                <button
                  onClick={saveQuote}
                  className="flex-1 bg-dark hover:bg-black text-white py-3 px-4 rounded-xl transition-colors font-bold text-sm shadow-sm"
                >
                  Sauvegarder et Envoyer
                </button>
              )}
              {modal.type === 'notes' && (
                <button
                  onClick={saveNotes}
                  className="flex-1 bg-dark hover:bg-black text-white py-3 px-4 rounded-xl transition-colors font-bold text-sm shadow-sm"
                >
                  Enregistrer les Notes
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFactory;





