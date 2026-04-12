import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { FaEye, FaEyeSlash, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

type Agent = {
  id: number;
  name: string;
  category: string;
  description: string;
  base_prompt: string;
  is_public: boolean;
  icon_key: string;
  n8n_template_id: string | null;
};

type FormState = {
  id: number | null;
  name: string;
  category: string;
  description: string;
  base_prompt: string;
  icon_key: string;
  n8n_template_id: string;
  is_public: boolean;
};

const AdminAgents = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formState, setFormState] = useState<FormState>({
    id: null,
    name: '',
    category: '',
    description: '',
    base_prompt: '',
    icon_key: '',
    n8n_template_id: '',
    is_public: true,
  });

  const categories = ['Marketing', 'Vente', 'RH', 'Légal', 'Développement', 'Support', 'Autre'];
  const iconOptions = ['Search', 'Code', 'Briefcase', 'Scale', 'Zap', 'Users', 'BarChart', 'Mail'];

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('agents_library')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching agents:', error);
    } else {
      setAgents(data as Agent[]);
    }
    setLoading(false);
  };

  const handleOpenForm = (agent?: Agent) => {
    if (agent) {
      setFormState({
        id: agent.id,
        name: agent.name,
        category: agent.category,
        description: agent.description || '',
        base_prompt: agent.base_prompt || '',
        icon_key: agent.icon_key || '',
        n8n_template_id: agent.n8n_template_id || '',
        is_public: agent.is_public,
      });
    } else {
      setFormState({
        id: null,
        name: '',
        category: '',
        description: '',
        base_prompt: '',
        icon_key: '',
        n8n_template_id: '',
        is_public: true,
      });
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setFormState({
      id: null,
      name: '',
      category: '',
      description: '',
      base_prompt: '',
      icon_key: '',
      n8n_template_id: '',
      is_public: true,
    });
  };

  const handleSaveAgent = async () => {
    if (!formState.name || !formState.category) {
      alert('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.rpc('create_or_update_agent', {
      agent_id: formState.id,
      agent_name: formState.name,
      category: formState.category,
      description: formState.description,
      base_prompt: formState.base_prompt,
      icon_key: formState.icon_key,
      n8n_template_id: formState.n8n_template_id || null,
      is_public: formState.is_public,
    });

    if (error) {
      console.error('Error saving agent:', error);
      alert(`Error: ${error.message}`);
    } else {
      alert(data.message);
      handleCloseForm();
      fetchAgents();
    }
    setLoading(false);
  };

  const togglePublic = async (agentId: number, currentState: boolean) => {
    setLoading(true);
    const { error } = await supabase
      .from('agents_library')
      .update({ is_public: !currentState })
      .eq('id', agentId);

    if (error) {
      alert('Error updating agent: ' + error.message);
    } else {
      fetchAgents();
    }
    setLoading(false);
  };

  const deleteAgent = async (agentId: number) => {
    if (window.confirm('Are you sure you want to delete this agent?')) {
      setLoading(true);
      const { error } = await supabase
        .from('agents_library')
        .delete()
        .eq('id', agentId);

      if (error) {
        alert('Error deleting agent: ' + error.message);
      } else {
        fetchAgents();
      }
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-dark tracking-tight">Marketplace des Agents</h1>
          <p className="text-sm text-neutral-500 mt-1">Gérez la bibliothèque d'agents IA disponibles</p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="px-5 py-2.5 bg-dark hover:bg-black text-white rounded-xl flex items-center gap-2 font-bold transition-colors shadow-sm text-sm"
          disabled={loading}
        >
          <FaPlus /> Nouvel Agent
        </button>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="p-4 text-left text-xs font-bold text-neutral-500">Nom</th>
                <th className="p-4 text-left text-xs font-bold text-neutral-500">Catégorie</th>
                <th className="p-4 text-left text-xs font-bold text-neutral-500">Description</th>
                <th className="p-4 text-left text-xs font-bold text-neutral-500">Statut</th>
                <th className="p-4 text-right text-xs font-bold text-neutral-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-neutral-500 font-medium text-sm">Chargement des agents...</td>
                </tr>
              ) : (
                agents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="p-4 text-dark font-bold text-sm whitespace-nowrap">{agent.name}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-neutral-100 text-neutral-600 text-xs font-bold">
                        {agent.category}
                      </span>
                    </td>
                    <td className="p-4 text-neutral-600 text-sm max-w-[200px] truncate">{agent.description}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${agent.is_public ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                        }`}>
                        {agent.is_public ? 'Public' : 'Privé'}
                      </span>
                    </td>
                    <td className="p-4 flex items-center justify-end gap-2">
                      <button
                        onClick={() => togglePublic(agent.id, agent.is_public)}
                        className={`p-2 rounded-lg transition-colors text-sm ${agent.is_public
                            ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200'
                          }`}
                        title={agent.is_public ? 'Rendre privé' : 'Rendre public'}
                        disabled={loading}
                      >
                        {agent.is_public ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                      </button>
                      <button
                        onClick={() => handleOpenForm(agent)}
                        className="p-2 bg-primary-50 hover:bg-primary-100 text-primary-600 border border-primary-200 rounded-lg transition-colors"
                        title="Modifier"
                        disabled={loading}
                      >
                        <FaEdit size={14} />
                      </button>
                      <button
                        onClick={() => deleteAgent(agent.id)}
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg transition-colors"
                        title="Supprimer"
                        disabled={loading}
                      >
                        <FaTrash size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Agent Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 md:p-8 max-w-2xl w-full mx-auto max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-dark">
                {formState.id ? 'Modifier l\'Agent' : 'Créer un Nouvel Agent'}
              </h2>
              <button
                onClick={handleCloseForm}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-500 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500">Nom de l'Agent *</label>
                  <input
                    type="text"
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    className="w-full p-3 bg-neutral-50 border border-neutral-200 text-dark rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium"
                    placeholder="ex: Agent Audit SEO"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500">Catégorie *</label>
                  <select
                    value={formState.category}
                    onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                    className="w-full p-3 bg-neutral-50 border border-neutral-200 text-dark rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium"
                  >
                    <option value="">Sélectionnez une catégorie</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-500">Description</label>
                <textarea
                  value={formState.description || ''}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  className="w-full p-3 bg-neutral-50 border border-neutral-200 text-dark rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium h-20 resize-y"
                  placeholder="Brève description de la mission de cet agent..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-500">Prompt de Base</label>
                <textarea
                  value={formState.base_prompt || ''}
                  onChange={(e) => setFormState({ ...formState, base_prompt: e.target.value })}
                  className="w-full p-4 bg-[#0d1117] text-[#e6edf3] border border-neutral-200 rounded-xl focus:border-primary-500 focus:outline-none text-xs font-mono h-32 resize-y custom-scrollbar"
                  placeholder="Le prompt système qui définit le comportement de l'agent..."
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500">Clé de l'Icône</label>
                  <select
                    value={formState.icon_key}
                    onChange={(e) => setFormState({ ...formState, icon_key: e.target.value })}
                    className="w-full p-3 bg-neutral-50 border border-neutral-200 text-dark rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium"
                  >
                    <option value="">Sélectionnez une icône</option>
                    {iconOptions.map(icon => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500">ID Template n8n</label>
                  <input
                    type="text"
                    value={formState.n8n_template_id}
                    onChange={(e) => setFormState({ ...formState, n8n_template_id: e.target.value })}
                    className="w-full p-3 bg-neutral-50 border border-neutral-200 text-dark rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium font-mono"
                    placeholder="ex: workflow_123"
                  />
                </div>
              </div>

              <div className="border border-primary-200 bg-primary-50 rounded-xl p-4 flex items-center gap-4">
                <div className="flex-1">
                  <label htmlFor="agent-public" className="text-sm font-bold text-primary-900 cursor-pointer block mb-1">Rendre cet agent public</label>
                  <p className="text-xs text-primary-700/80 font-medium tracking-tight">Il sera visible par tous les utilisateurs de la plateforme.</p>
                </div>
                <div className="flex items-center">
                  <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                    <input
                      type="checkbox"
                      id="agent-public"
                      checked={formState.is_public}
                      onChange={(e) => setFormState({ ...formState, is_public: e.target.checked })}
                      className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer"
                      style={{
                        right: formState.is_public ? '0' : 'auto',
                        border: formState.is_public ? 'none' : '2px solid #e5e7eb',
                        transform: formState.is_public ? 'translateX(0)' : 'translateX(0)',
                      }}
                    />
                    <label
                      htmlFor="agent-public"
                      className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer transition-colors ${formState.is_public ? 'bg-primary-500' : 'bg-neutral-300'}`}
                    ></label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8 pt-5 border-t border-neutral-100">
              <button
                onClick={handleCloseForm}
                className="flex-1 px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl transition-colors text-sm font-bold"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                onClick={handleSaveAgent}
                className="flex-1 px-5 py-2.5 bg-dark hover:bg-black text-white rounded-xl transition-colors text-sm font-bold shadow-sm"
                disabled={loading}
              >
                {loading ? 'Enregistrement...' : 'Enregistrer l\'Agent'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAgents;





