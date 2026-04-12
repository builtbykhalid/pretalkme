import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  category_id: string | null;
  author_id: string | null;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  seo_title: string | null;
  seo_description: string | null;
  read_time_minutes: number | null;
  views_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  blog_categories?: BlogCategory;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  created_at: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
}

export const useBlog = () => {
  const [loading, setLoading] = useState(false);

  const getPosts = useCallback(async (filters?: { status?: string; category_id?: string; search?: string }) => {
    setLoading(true);
    try {
      let query = supabase
        .from('blog_posts')
        .select('*, blog_categories(*)');

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.category_id) {
        query = query.eq('category_id', filters.category_id);
      }
      if (filters?.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data as BlogPost[];
    } catch (error: any) {
      toast.error(error.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getPost = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*, blog_categories(*), blog_post_tags(blog_tags(*))')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      toast.error(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createPost = useCallback(async (data: Partial<BlogPost> & { tags?: string[] }) => {
    setLoading(true);
    try {
      const { tags, blog_categories, blog_post_tags, created_at, updated_at, ...postData } = data as any;
      const { data: post, error } = await supabase
        .from('blog_posts')
        .insert([postData])
        .select()
        .single();

      if (error) throw error;

      if (tags && tags.length > 0) {
        // Handle tags (many-to-many)
        // This is a simplified version, real implementation might need to create tags first
      }

      toast.success('Article créé avec succès');
      return post;
    } catch (error: any) {
      toast.error(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePost = useCallback(async (id: string, data: Partial<BlogPost>) => {
    setLoading(true);
    try {
      const { blog_categories, blog_post_tags, created_at, updated_at, id: _id, ...postData } = data as any;
      const { error } = await supabase
        .from('blog_posts')
        .update(postData)
        .eq('id', id);

      if (error) throw error;
      toast.success('Article mis à jour');
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePost = useCallback(async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return false;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Article supprimé');
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCategories = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as BlogCategory[];
    } catch (error: any) {
      toast.error(error.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = useCallback(async (data: Partial<BlogCategory>) => {
    setLoading(true);
    try {
      const { data: category, error } = await supabase
        .from('blog_categories')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      toast.success('Catégorie créée');
      return category;
    } catch (error: any) {
      toast.error(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCategory = useCallback(async (id: string, data: Partial<BlogCategory>) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('blog_categories')
        .update(data)
        .eq('id', id);

      if (error) throw error;
      toast.success('Catégorie mise à jour');
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    if (!confirm('Toutes les liaisons avec les articles seront perdues. Continuer ?')) return false;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('blog_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Catégorie supprimée');
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    getPosts,
    getPost,
    createPost,
    updatePost,
    deletePost,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
  };
};
