import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Tag, 
  Plus, 
  X, 
  Save, 
  Trash2, 
  Edit2, 
  Loader2,
  Palette
} from 'lucide-react';
import { useBlog } from '../../hooks/useBlog';
import type { BlogCategory } from '../../hooks/useBlog';

import { toast } from 'react-hot-toast';

export default function BlogCategoryManager() {
  const navigate = useNavigate();
  const { getCategories, createCategory, updateCategory, deleteCategory } = useBlog();
  
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<BlogCategory>>({
    name: '',
    slug: '',
    color: '#6366f1',
    description: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const data = await getCategories();
    setCategories(data);
    setLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'name' && !editingId) {
        next.slug = value.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!formData.name) return toast.error('Le nom est requis');
    
    setLoading(true);
    if (editingId) {
      const success = await updateCategory(editingId, formData);
      if (success) {
        setCategories(categories.map(c => c.id === editingId ? { ...c, ...formData } as BlogCategory : c));
        setEditingId(null);
        setFormData({ name: '', slug: '', color: '#6366f1', description: '' });
      }
    } else {
      const newCat = await createCategory(formData);
      if (newCat) {
        setCategories([...categories, newCat]);
        setFormData({ name: '', slug: '', color: '#6366f1', description: '' });
      }
    }
    setLoading(false);
  };

  const startEdit = (cat: BlogCategory) => {
    setEditingId(cat.id);
    setFormData(cat);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', slug: '', color: '#6366f1', description: '' });
  };

  const handleDelete = async (id: string) => {
    const success = await deleteCategory(id);
    if (success) {
      setCategories(categories.filter(c => c.id !== id));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/admin/blog')}
          className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-neutral-200 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-dark tracking-tight flex items-center gap-3">
            <Tag size={28} className="text-primary-600" />
            Catégories du Blog
          </h1>
          <p className="text-sm text-neutral-500 mt-1">Organisez vos articles par thématiques</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form to add/edit */}
        <div className="md:col-span-1">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm sticky top-24">
            <h3 className="font-bold text-dark flex items-center gap-2 mb-6">
              {editingId ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Nom</label>
                <input
                  type="text"
                  name="name"
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium focus:bg-white focus:border-primary-500 transition-all outline-none"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="ex: Marketing, Tutoriels..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Slug</label>
                <input
                  type="text"
                  name="slug"
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium focus:bg-white focus:border-primary-500 transition-all outline-none"
                  value={formData.slug}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Couleur</label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    name="color"
                    className="w-10 h-10 rounded-lg border-2 border-neutral-100 p-0 overflow-hidden cursor-pointer"
                    value={formData.color}
                    onChange={handleInputChange}
                  />
                  <input
                    type="text"
                    name="color"
                    className="flex-1 px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono focus:bg-white animate-transition"
                    value={formData.color}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Description</label>
                <textarea
                  name="description"
                  rows={2}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:border-primary-500 transition-all outline-none resize-none"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                />
              </div>

              <div className="flex gap-2 pt-4">
                {editingId && (
                  <button
                    onClick={cancelEdit}
                    className="flex-1 px-4 py-2 bg-neutral-50 text-neutral-600 rounded-xl text-sm font-bold hover:bg-neutral-100 transition-colors"
                  >
                    Annuler
                  </button>
                )}
                <button
                  disabled={loading}
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary-700 transition-colors shadow-sm shadow-primary-500/20 disabled:opacity-50"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* List of categories */}
        <div className="md:col-span-2 space-y-4">
          {loading && categories.length === 0 ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          ) : categories.length === 0 ? (
            <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center opacity-60">
              <Tag size={32} className="mx-auto text-neutral-300 mb-3" />
              <p className="text-neutral-500 font-medium italic">Aucune catégorie pour le moment</p>
            </div>
          ) : (
            categories.map(cat => (
              <div 
                key={cat.id} 
                className={`bg-white border p-4 rounded-2xl shadow-sm transition-all flex items-center justify-between group ${
                  editingId === cat.id ? 'border-primary-500 ring-2 ring-primary-500/10' : 'border-neutral-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                    style={{ backgroundColor: cat.color }}
                  >
                    <Tag size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-dark">{cat.name}</h4>
                    <p className="text-xs text-neutral-500 font-mono">{cat.slug}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEdit(cat)}
                    className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
