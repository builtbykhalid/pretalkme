import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Search, 
  Plus, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Eye, 
  Copy, 
  Archive, 
  CheckCircle,
  Loader2,
  Filter
} from 'lucide-react';
import { useBlog } from '../../hooks/useBlog';
import type { BlogPost, BlogCategory } from '../../hooks/useBlog';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function BlogManager() {
  const navigate = useNavigate();
  const { getPosts, getCategories, deletePost, updatePost, loading: blogLoading } = useBlog();
  
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    const [fetchedPosts, fetchedCategories] = await Promise.all([
      getPosts(),
      getCategories()
    ]);
    setPosts(fetchedPosts);
    setCategories(fetchedCategories);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const success = await deletePost(id);
    if (success) {
      setPosts(posts.filter(p => p.id !== id));
    }
  };

  const handleStatusChange = async (post: BlogPost, newStatus: 'draft' | 'published' | 'archived') => {
    const success = await updatePost(post.id, { 
      status: newStatus,
      published_at: newStatus === 'published' ? new Date().toISOString() : post.published_at
    });
    if (success) {
      setPosts(posts.map(p => p.id === post.id ? { ...p, status: newStatus } : p));
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter ? post.status === statusFilter : true;
    const matchCategory = categoryFilter ? post.category_id === categoryFilter : true;
    return matchSearch && matchStatus && matchCategory;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border bg-emerald-100 text-emerald-700 border-emerald-200">Publié</span>;
      case 'draft':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border bg-amber-100 text-amber-700 border-amber-200">Brouillon</span>;
      case 'archived':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border bg-neutral-100 text-neutral-700 border-neutral-200">Archivé</span>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark tracking-tight flex items-center gap-3">
            <FileText size={28} className="text-primary-600" />
            Gestion du Blog
          </h1>
          <p className="text-sm text-neutral-500 mt-1">Créez et gérez les articles de votre blog</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => navigate('/admin/blog/categories')}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-neutral-200 text-neutral-600 rounded-xl text-sm font-bold hover:bg-neutral-50 transition-colors shadow-sm"
          >
            Catégories
          </button>
          <button
            onClick={() => navigate('/admin/blog/new')}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary-700 transition-colors shadow-sm shadow-primary-500/20"
          >
            <Plus size={18} />
            Nouvel article
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-primary-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Rechercher un article..."
            className="w-full pl-11 pr-4 py-2 bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 rounded-xl text-sm font-medium transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <select
            className="flex-1 md:flex-none px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium focus:bg-white focus:border-primary-500 transition-all outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tous les statuts</option>
            <option value="draft">Brouillon</option>
            <option value="published">Publié</option>
            <option value="archived">Archivé</option>
          </select>

          <select
            className="flex-1 md:flex-none px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium focus:bg-white focus:border-primary-500 transition-all outline-none"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">Toutes les catégories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500 mb-4" />
            <p className="text-neutral-500 font-medium">Chargement des articles...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 text-center">
            <div className="w-16 h-16 bg-neutral-50 rounded-2xl flex items-center justify-center mb-4 border border-neutral-100">
              <FileText size={24} className="text-neutral-400" />
            </div>
            <h3 className="text-lg font-bold text-dark">Aucun article</h3>
            <p className="text-neutral-500 mt-1 max-w-sm">Commencez par rédiger votre premier article pour le blog.</p>
            <button
              onClick={() => navigate('/admin/blog/new')}
              className="mt-6 px-6 py-2 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition-colors shadow-sm"
            >
              Créer un article
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50/50 border-b border-neutral-200">
                  <th className="py-4 px-6 text-xs font-bold text-neutral-500 uppercase tracking-wider">Article</th>
                  <th className="py-4 px-6 text-xs font-bold text-neutral-500 uppercase tracking-wider">Catégorie</th>
                  <th className="py-4 px-6 text-xs font-bold text-neutral-500 uppercase tracking-wider text-center">Statut</th>
                  <th className="py-4 px-6 text-xs font-bold text-neutral-500 uppercase tracking-wider text-center">Vues</th>
                  <th className="py-4 px-6 text-xs font-bold text-neutral-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-neutral-50/50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-neutral-100 border border-neutral-200 overflow-hidden flex-shrink-0">
                          {post.cover_image_url ? (
                            <img src={post.cover_image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-400">
                              <FileText size={20} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-dark truncate max-w-md group-hover:text-primary-600 transition-colors">
                            {post.title}
                          </h4>
                          <p className="text-xs text-neutral-500 mt-1">
                            {post.published_at 
                              ? `Publié le ${format(new Date(post.published_at), 'd MMM yyyy', { locale: fr })}`
                              : `Créé le ${format(new Date(post.created_at), 'd MMM yyyy', { locale: fr })}`
                            }
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {post.blog_categories ? (
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: post.blog_categories.color }} 
                          />
                          <span className="text-sm font-medium text-neutral-600">{post.blog_categories.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-400 italic">Non classé</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {getStatusBadge(post.status)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-neutral-600 font-medium">
                        <Eye size={14} className="text-neutral-400" />
                        {post.views_count || 0}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                          className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Voir l'article"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/blog/${post.id}/edit`)}
                          className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleStatusChange(post, post.status === 'published' ? 'archived' : 'published')}
                          className="p-2 text-neutral-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title={post.status === 'published' ? 'Archiver' : 'Publier'}
                        >
                          {post.status === 'published' ? <Archive size={18} /> : <CheckCircle size={18} />}
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
