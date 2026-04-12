import rss from '@astrojs/rss';
import { supabase } from '../../components/ReactApp/lib/supabase';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async (context) => {
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('*, blog_categories(*)')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(20);

  return rss({
    title: 'Blog PreTalk Hub',
    description: 'Automatisation de pipeline, IA et sales pour les consultants.',
    site: context.site?.toString() || 'https://pretalk.me',
    items: (posts || []).map((post) => ({
      title: post.title,
      pubDate: new Date(post.published_at),
      description: post.excerpt,
      link: `/blog/${post.slug}`,
      categories: [post.blog_categories?.name].filter(Boolean) as string[],
    })),
    customData: `<language>fr-fr</language>`,
  });
}
