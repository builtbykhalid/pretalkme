import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Send, 
  Image as ImageIcon,
  Loader2,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Quote,
  Code
} from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { useBlog } from '../../hooks/useBlog';
import type { BlogPost, BlogCategory } from '../../hooks/useBlog';

import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

export default function BlogPostEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getPost, createPost, updatePost, getCategories } = useBlog();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  
  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    status: 'draft',
    category_id: '',
    cover_image_url: '',
    featured: false,
    seo_title: '',
    seo_description: '',
    read_time_minutes: 5
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-xl max-w-full h-auto',
        },
      }),
      Placeholder.configure({
        placeholder: 'Écrivez le contenu de votre article ici...',
      }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      setFormData(prev => ({ ...prev, content: editor.getHTML() }));
    },
  });

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  const fetchInitialData = async () => {
    setLoading(true);
    const fetchedCategories = await getCategories();
    setCategories(fetchedCategories);

    if (id && id !== 'new') {
      const post = await getPost(id);
      if (post) {
        setFormData(post);
        editor?.commands.setContent(post.content || '');
      }
    }
    setLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      // Auto-generate slug from title if it's a new post or slug is empty
      if (name === 'title' && (!id || id === 'new')) {
        newData.slug = value
          .toLowerCase()
          .replace(/[^\w ]+/g, '')
          .replace(/ +/g, '-');
      }
      return newData;
    });
  };

  const handleSave = async (statusOverride?: 'draft' | 'published' | 'archived') => {
    setSaving(true);
    const data = { ...formData, content: editor?.getHTML() };
    if (statusOverride) data.status = statusOverride;
    
    // Set published_at if publishing
    if (data.status === 'published' && !data.published_at) {
      data.published_at = new Date().toISOString();
    }

    try {
      if (id && id !== 'new') {
        const success = await updatePost(id, data);
        if (success) {
          toast.success('Article sauvegardé');
        }
      } else {
        const newPost = await createPost(data);
        if (newPost) {
          navigate(`/admin/blog/${newPost.id}/edit`, { replace: true });
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'inline') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `posts/${fileName}`;

    setSaving(true);
    try {
      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      if (type === 'cover') {
        setFormData(prev => ({ ...prev, cover_image_url: publicUrl }));
      } else {
        editor?.chain().focus().setImage({ src: publicUrl }).run();
      }
      toast.success('Image téléchargée');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500 mb-4" />
        <p className="text-neutral-500">Chargement de l'éditeur...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-20">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sticky top-0 z-30 bg-neutral-50/80 backdrop-blur-md py-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/blog')}
            className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-neutral-200 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-dark truncate max-w-[300px]">
              {id === 'new' ? 'Nouvel article' : formData.title}
            </h1>
            <p className="text-xs text-neutral-500">
              {formData.status === 'published' ? 'En ligne' : 'En mode brouillon'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => {
              if (!formData.slug) return toast.error('Veuillez d\'abord saisir un titre ou un slug');
              window.open(`/blog/${formData.slug}?preview=true`, '_blank');
            }}
            className="flex-1 sm:flex-none px-4 py-2 bg-white border border-neutral-200 text-neutral-600 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-neutral-50 transition-colors"
          >
            <Eye size={18} />
            Prévisualiser
          </button>
          <button
            disabled={saving}
            onClick={() => handleSave('draft')}
            className="flex-1 sm:flex-none px-4 py-2 bg-white border border-neutral-200 text-neutral-600 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-neutral-50 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {id === 'new' ? 'Enregistrer' : 'Sauvegarder'}
          </button>
          <button
            disabled={saving}
            onClick={() => handleSave('published')}
            className="flex-1 sm:flex-none px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary-700 transition-colors shadow-sm shadow-primary-500/20 disabled:opacity-50"
          >
            <Send size={18} />
            {formData.status === 'published' ? 'Mettre à jour' : 'Publier'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title and Summary */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm space-y-4">
            <input
              type="text"
              name="title"
              placeholder="Titre de l'article"
              className="w-full text-3xl font-bold bg-transparent border-none focus:ring-0 placeholder:text-neutral-300 p-0"
              value={formData.title}
              onChange={handleInputChange}
            />
            
            <div className="flex items-center gap-2 text-sm text-neutral-400">
              <span className="font-mono">slug:</span>
              <input
                type="text"
                name="slug"
                placeholder="slug-de-larticle"
                className="flex-1 bg-neutral-50 border border-neutral-100 rounded px-2 py-1 text-neutral-600 focus:outline-none focus:border-primary-300"
                value={formData.slug}
                onChange={handleInputChange}
              />
            </div>

            <textarea
              name="excerpt"
              placeholder="Résumé de l'article (affiché sur la liste des articles)..."
              rows={3}
              className="w-full bg-neutral-50 border border-neutral-100 rounded-xl p-4 text-neutral-600 focus:bg-white focus:border-primary-500 transition-all outline-none text-sm resize-none"
              value={formData.excerpt}
              onChange={handleInputChange}
            />
          </div>

          {/* TipTap Editor */}
          <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[500px]">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 border-b border-neutral-200 bg-neutral-50/50">
              <button onClick={() => editor?.chain().focus().toggleBold().run()} className={`p-2 rounded hover:bg-white ${editor?.isActive('bold') ? 'bg-white text-primary-600 shadow-sm' : 'text-neutral-500'}`}><Bold size={18}/></button>
              <button onClick={() => editor?.chain().focus().toggleItalic().run()} className={`p-2 rounded hover:bg-white ${editor?.isActive('italic') ? 'bg-white text-primary-600 shadow-sm' : 'text-neutral-500'}`}><Italic size={18}/></button>
              <button onClick={() => editor?.chain().focus().toggleUnderline().run()} className={`p-2 rounded hover:bg-white ${editor?.isActive('underline') ? 'bg-white text-primary-600 shadow-sm' : 'text-neutral-500'}`}><UnderlineIcon size={18}/></button>
              <div className="w-px h-6 bg-neutral-200 mx-1" />
              <button onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} className={`p-2 rounded hover:bg-white ${editor?.isActive('heading', { level: 1 }) ? 'bg-white text-primary-600 shadow-sm' : 'text-neutral-500'}`}><Heading1 size={18}/></button>
              <button onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-2 rounded hover:bg-white ${editor?.isActive('heading', { level: 2 }) ? 'bg-white text-primary-600 shadow-sm' : 'text-neutral-500'}`}><Heading2 size={18}/></button>
              <button onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} className={`p-2 rounded hover:bg-white ${editor?.isActive('heading', { level: 3 }) ? 'bg-white text-primary-600 shadow-sm' : 'text-neutral-500'}`}><Heading3 size={18}/></button>
              <div className="w-px h-6 bg-neutral-200 mx-1" />
              <button onClick={() => editor?.chain().focus().toggleBulletList().run()} className={`p-2 rounded hover:bg-white ${editor?.isActive('bulletList') ? 'bg-white text-primary-600 shadow-sm' : 'text-neutral-500'}`}><List size={18}/></button>
              <button onClick={() => editor?.chain().focus().toggleOrderedList().run()} className={`p-2 rounded hover:bg-white ${editor?.isActive('orderedList') ? 'bg-white text-primary-600 shadow-sm' : 'text-neutral-500'}`}><ListOrdered size={18}/></button>
              <div className="w-px h-6 bg-neutral-200 mx-1" />
              <button onClick={() => editor?.chain().focus().toggleBlockquote().run()} className={`p-2 rounded hover:bg-white ${editor?.isActive('blockquote') ? 'bg-white text-primary-600 shadow-sm' : 'text-neutral-500'}`}><Quote size={18}/></button>
              <button onClick={() => editor?.chain().focus().toggleCodeBlock().run()} className={`p-2 rounded hover:bg-white ${editor?.isActive('codeBlock') ? 'bg-white text-primary-600 shadow-sm' : 'text-neutral-500'}`}><Code size={18}/></button>
              <button 
                onClick={() => {
                  const url = window.prompt('URL:');
                  if (url) editor?.chain().focus().setLink({ href: url }).run();
                }} 
                className={`p-2 rounded hover:bg-white ${editor?.isActive('link') ? 'bg-white text-primary-600 shadow-sm' : 'text-neutral-500'}`}
              >
                <LinkIcon size={18}/>
              </button>
              <label className="p-2 rounded hover:bg-white text-neutral-500 cursor-pointer">
                <ImageIcon size={18}/>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'inline')} />
              </label>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto min-h-[500px]">
              <EditorContent 
                editor={editor} 
                className="prose prose-neutral max-w-none focus:outline-none min-h-[400px]"
              />
            </div>
          </div>

          {/* SEO Settings */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-dark flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-500 text-xs font-bold">SEO</span>
              Configuration Référencement
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-neutral-600">Meta Title</label>
                <input
                  type="text"
                  name="seo_title"
                  placeholder="Laisser vide pour utiliser le titre de l'article"
                  className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:border-primary-500 transition-all outline-none"
                  value={formData.seo_title || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-neutral-600">Meta Description</label>
                <textarea
                  name="seo_description"
                  placeholder="Laisser vide pour utiliser le résumé de l'article"
                  rows={3}
                  className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:border-primary-500 transition-all outline-none resize-none"
                  value={formData.seo_description || ''}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar (1/3) */}
        <div className="space-y-6">
          {/* Cover Image */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm">
            <label className="text-sm font-bold text-neutral-600 block mb-3">Image de couverture</label>
            <div className="relative group aspect-video rounded-xl bg-neutral-50 border-2 border-dashed border-neutral-200 overflow-hidden flex items-center justify-center">
              {formData.cover_image_url ? (
                <>
                  <img src={formData.cover_image_url} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label className="px-4 py-2 bg-white text-dark rounded-lg text-sm font-bold cursor-pointer hover:scale-105 transition-transform">
                      Changer l'image
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'cover')} />
                    </label>
                  </div>
                </>
              ) : (
                <label className="flex flex-col items-center gap-2 cursor-pointer p-8">
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-neutral-400">
                    <ImageIcon size={20} />
                  </div>
                  <span className="text-xs font-medium text-neutral-500">Ajouter une image</span>
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'cover')} />
                </label>
              )}
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-neutral-600">Catégorie</label>
              <select
                name="category_id"
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium focus:bg-white focus:border-primary-500 transition-all outline-none"
                value={formData.category_id || ''}
                onChange={handleInputChange}
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-neutral-600">Temps de lecture (minutes)</label>
              <input
                type="number"
                name="read_time_minutes"
                className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:border-primary-500 transition-all outline-none"
                value={formData.read_time_minutes || ''}
                onChange={handleInputChange}
              />
            </div>

            <label className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-100 cursor-pointer hover:bg-neutral-100/50 transition-colors">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                className="w-5 h-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 transition-all"
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-dark">Article à la une</span>
                <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">Featured</span>
              </div>
            </label>

            <div className="pt-4 border-t border-neutral-100">
              <div className="text-[10px] text-neutral-400 uppercase font-bold tracking-widest mb-2">Statut de l'article</div>
              <div className={`text-sm font-bold px-3 py-1.5 rounded-lg inline-block border ${
                formData.status === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                formData.status === 'draft' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                'bg-neutral-50 text-neutral-700 border-neutral-200'
              }`}>
                {formData.status === 'published' ? 'Publié' : formData.status === 'draft' ? 'Brouillon' : 'Archivé'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
