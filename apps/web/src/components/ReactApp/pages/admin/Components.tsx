import { useState, useEffect } from 'react';
import { Code, Plus, Edit3, Trash2, Copy, Check, AlertCircle, Eye } from 'lucide-react';

type UIComponent = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  code: string;
  created_at: string;
};

type ComponentFormState = {
  isOpen: boolean;
  editingId: string | null;
  name: string;
  category: string;
  description: string;
  code: string;
};

const ComponentLibrary = () => {
  const [components, setComponents] = useState<UIComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [form, setForm] = useState<ComponentFormState>({
    isOpen: false,
    editingId: null,
    name: '',
    category: 'Input',
    description: '',
    code: '',
  });

  const categories = ['Input', 'Button', 'Card', 'Modal', 'Table', 'Form', 'Layout', 'Badge', 'Alert', 'Other'];

  useEffect(() => {
    fetchComponents();
  }, []);

  const fetchComponents = async () => {
    setLoading(true);
    try {
      // For now, we'll use localStorage to store components since we don't have a dedicated table yet
      const stored = localStorage.getItem('admin_components');
      if (stored) {
        setComponents(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Error loading components:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveComponent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.code.trim()) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    try {
      let updatedComponents = [...components];

      if (form.editingId) {
        // Update existing
        updatedComponents = updatedComponents.map(c =>
          c.id === form.editingId
            ? {
              ...c,
              name: form.name,
              category: form.category,
              description: form.description,
              code: form.code,
            }
            : c
        );
        setMessage({ type: 'success', text: 'Component updated successfully' });
      } else {
        // Create new
        const newComponent: UIComponent = {
          id: `comp_${Date.now()}`,
          name: form.name,
          category: form.category,
          description: form.description || null,
          code: form.code,
          created_at: new Date().toISOString(),
        };
        updatedComponents.push(newComponent);
        setMessage({ type: 'success', text: 'Component created successfully' });
      }

      localStorage.setItem('admin_components', JSON.stringify(updatedComponents));
      setComponents(updatedComponents);
      setForm({ isOpen: false, editingId: null, name: '', category: 'Input', description: '', code: '' });
    } catch (err) {
      console.error('Error saving component:', err);
      setMessage({ type: 'error', text: 'Failed to save component' });
    }
  };

  const handleEditComponent = (component: UIComponent) => {
    setForm({
      isOpen: true,
      editingId: component.id,
      name: component.name,
      category: component.category,
      description: component.description || '',
      code: component.code,
    });
  };

  const handleDeleteComponent = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this component?')) {
      return;
    }

    try {
      const updated = components.filter(c => c.id !== id);
      localStorage.setItem('admin_components', JSON.stringify(updated));
      setComponents(updated);
      setMessage({ type: 'success', text: 'Component deleted successfully' });
    } catch (err) {
      console.error('Error deleting component:', err);
      setMessage({ type: 'error', text: 'Failed to delete component' });
    }
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const groupedComponents = components.reduce((acc, comp) => {
    if (!acc[comp.category]) {
      acc[comp.category] = [];
    }
    acc[comp.category].push(comp);
    return acc;
  }, {} as Record<string, UIComponent[]>);

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-dark tracking-tight">Bibliothèque de Composants</h1>
          <p className="text-sm text-neutral-500 mt-1">Créez et gérez des composants UI réutilisables</p>
        </div>
        <button
          onClick={() => setForm({ isOpen: true, editingId: null, name: '', category: 'Input', description: '', code: '' })}
          className="flex items-center gap-2 px-5 py-2.5 bg-dark hover:bg-black text-white rounded-xl font-bold transition-colors text-sm self-start sm:self-auto shadow-sm"
        >
          <Plus size={16} />
          Nouveau Composant
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 border ${message.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-medium'
            : 'bg-rose-50 border-rose-200 text-rose-700 font-medium'
          }`}>
          <AlertCircle size={20} />
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      {/* Modal Form */}
      {form.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-neutral-200 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-neutral-100 p-6 flex items-center justify-between z-10">
              <h2 className="text-xl font-semibold text-dark">
                {form.editingId ? 'Modifier Composant' : 'Créer un Composant'}
              </h2>
              <button
                onClick={() => setForm({ ...form, isOpen: false })}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-500 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveComponent} className="p-6 space-y-6">
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500">Nom du Composant *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="ex: Bouton Principal"
                    className="w-full p-3 bg-neutral-50 border border-neutral-200 text-dark rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500">Catégorie</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full p-3 bg-neutral-50 border border-neutral-200 text-dark rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-500">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brève description de ce que fait ce composant"
                  className="w-full p-3 bg-neutral-50 border border-neutral-200 text-dark rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-500">Code JSX *</label>
                <textarea
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="Collez votre code React/JSX ici..."
                  rows={12}
                  className="w-full p-4 bg-[#0d1117] text-[#e6edf3] rounded-xl border border-neutral-200 focus:border-primary-500 focus:outline-none text-sm font-mono custom-scrollbar"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isOpen: false })}
                  className="flex-1 px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl transition-colors text-sm font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-5 py-2.5 bg-dark hover:bg-black text-white rounded-xl transition-colors text-sm font-bold shadow-sm"
                >
                  {form.editingId ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-xl overflow-hidden border border-neutral-200">
            <div className="bg-neutral-50 border-b border-neutral-100 p-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-dark flex items-center gap-2">
                <Code size={20} className="text-primary-500" />
                Aperçu du Code
              </h2>
              <button
                onClick={() => setPreviewId(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-200 text-neutral-500 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto bg-[#0d1117] custom-scrollbar">
              <pre className="text-[#e6edf3] text-xs whitespace-pre-wrap font-mono">
                {components.find(c => c.id === previewId)?.code}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Components Grid */}
      {loading ? (
        <p className="text-neutral-500 font-medium">Chargement des composants...</p>
      ) : components.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-neutral-400">
            <Code size={32} />
          </div>
          <p className="text-neutral-500 font-medium">Aucun composant pour le moment. Créez-en un pour commencer !</p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(groupedComponents).map(([category, comps]) => (
            <div key={category}>
              <h2 className="text-lg font-semibold text-dark mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                  <Code size={16} />
                </div>
                {category} <span className="text-neutral-400 text-sm font-medium ml-1">({comps.length})</span>
              </h2>

              {/* Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {comps.map(comp => (
                  <div key={comp.id} className="bg-white rounded-2xl p-5 border border-neutral-200 hover:border-primary-300 hover:shadow-md transition-all group flex flex-col">
                    <h3 className="font-bold text-dark text-base mb-1">{comp.name}</h3>
                    {comp.description && (
                      <p className="text-neutral-500 text-xs mb-4 line-clamp-2 min-h-[32px]">{comp.description}</p>
                    )}
                    <div className="flex-1 bg-[#0d1117] rounded-xl p-3 mb-4 max-h-32 overflow-hidden border border-neutral-100">
                      <pre className="text-[#e6edf3] text-xs font-mono line-clamp-6">{comp.code}</pre>
                    </div>
                    <div className="grid grid-cols-4 gap-2 mt-auto">
                      <button
                        onClick={() => handleCopyCode(comp.code, comp.id)}
                        className="col-span-2 flex items-center justify-center gap-2 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-xs font-bold transition-colors"
                      >
                        {copiedId === comp.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        {copiedId === comp.id ? 'Copié' : 'Copier'}
                      </button>
                      <button
                        onClick={() => setPreviewId(comp.id)}
                        className="flex items-center justify-center px-2 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors"
                        title="Voir le code complet"
                      >
                        <Eye size={16} />
                      </button>
                      <div className="flex gap-1 items-center justify-end">
                        <button
                          onClick={() => handleEditComponent(comp)}
                          className="p-2 text-neutral-400 hover:text-dark hover:bg-neutral-100 rounded-lg transition-colors"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteComponent(comp.id)}
                          className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-primary-50 border border-primary-200 rounded-2xl p-5 flex gap-4 items-start">
        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-primary-500 flex-shrink-0">
          <Code size={20} />
        </div>
        <div>
          <h3 className="font-bold text-primary-900 mb-1">À propos de la bibliothèque</h3>
          <p className="text-sm text-primary-700/80 leading-relaxed font-medium">
            Stockez des composants réutilisables React/JSX ici. Vous pouvez les copier pour les utiliser rapidement dans la Factory ou les partager.
            Actuellement stockés localement.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComponentLibrary;





