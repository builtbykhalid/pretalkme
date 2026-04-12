import { Reveal, Badge, Btn, ArrowRight, ClockIcon } from "../ui";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useEffect } from "react";
import { supabase } from "../../ReactApp/lib/supabase";

export default function BlogPost({ post }) {
  if (!post) return null;

  const date = post.published_at ? format(new Date(post.published_at), 'd MMM yyyy', { locale: fr }) : 'Non publié';
  const categoryName = post.blog_categories?.name || 'Général';
  const categoryColor = post.blog_categories?.color || '#000000';

  useEffect(() => {
    const incrementViews = async () => {
      // Small debounce/session prevention could go here
      const hasViewed = sessionStorage.getItem(`viewed_post_${post.id}`);
      if (hasViewed) return;

      const { error } = await supabase.rpc('increment_blog_post_views', { post_id: post.id });
      if (!error) {
        sessionStorage.setItem(`viewed_post_${post.id}`, 'true');
      } else {
        // Fallback if RPC doesn't exist yet
        await supabase
          .from('blog_posts')
          .update({ views_count: (post.views_count || 0) + 1 })
          .eq('id', post.id);
      }
    };

    if (post.id) incrementViews();
  }, [post.id]);

  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-24 pb-0 overflow-hidden bg-white border-b border-neutral-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(99,102,241,0.08),transparent_60%)] pointer-events-none"/>
        
        <div className="max-w-[800px] mx-auto px-6 md:px-8 pt-12 pb-10 relative z-10">
          <Reveal>
            <div className="flex items-center gap-3 mb-6">
              <a href="/blog" className="group flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-primary-600 transition-all uppercase tracking-widest">
                Blog
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <span className="text-neutral-800">/</span>
              <span 
                className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full text-white"
                style={{ backgroundColor: categoryColor }}
              >
                {categoryName}
              </span>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight text-dark mb-10">
              {post.title}
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <div className="flex flex-wrap items-center gap-6 text-sm text-neutral-500 pt-8 border-t border-neutral-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-[10px] font-bold text-neutral-400 border border-neutral-200">
                  PH
                </div>
                <span className="font-bold text-dark">Équipe Pretalk</span>
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon />
                <span className="font-medium text-neutral-400">{post.read_time_minutes || 5} min de lecture</span>
              </div>
              <span className="text-neutral-300">·</span>
              <span className="font-medium text-neutral-400">{date}</span>
            </div>
          </Reveal>
        </div>

        {/* Cover Image */}
        {post.cover_image_url && (
          <Reveal delay={240}>
            <div className="max-w-[1000px] mx-auto px-6 md:px-8">
              <div className="aspect-[21/9] rounded-t-3xl overflow-hidden border-x border-t border-white/10">
                <img 
                  src={post.cover_image_url} 
                  alt={post.title} 
                  className="w-full h-full object-cover shadow-2xl"
                />
              </div>
            </div>
          </Reveal>
        )}
      </section>

      {/* Content Section */}
      <section className="py-20 px-6 md:px-8 bg-white">
        <div className="max-w-[800px] mx-auto">
          {/* Summary/Excerpt */}
          <Reveal>
            <div className="text-xl md:text-2xl font-medium text-neutral-500 leading-relaxed mb-12 italic border-l-4 border-primary-500 pl-6">
              {post.excerpt}
            </div>
          </Reveal>

          {/* Dynamic Content (HTML from TipTap) */}
          <Reveal delay={100}>
            <div 
              className="prose prose-neutral prose-lg max-w-none 
                prose-headings:text-dark prose-headings:font-black prose-headings:tracking-tight
                prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-6
                prose-h3:text-2xl prose-h3:mt-12 prose-h3:mb-4
                prose-p:text-neutral-600 prose-p:leading-relaxed prose-p:mb-6
                prose-strong:text-dark prose-strong:font-bold
                prose-blockquote:border-l-4 prose-blockquote:border-primary-500 prose-blockquote:bg-neutral-50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:italic
                prose-ul:my-8 prose-ol:my-8
                prose-img:rounded-2xl prose-img:shadow-lg prose-img:my-12
                prose-a:text-primary-600 prose-a:font-bold prose-a:no-underline hover:prose-a:underline
              "
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </Reveal>

          {/* Social Share / Bottom Controls */}
          <div className="mt-20 pt-10 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Partager</span>
              <div className="flex gap-2">
                {/* Simplified social share links */}
                <button className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center hover:bg-primary-50 hover:text-primary-600 transition-all">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </button>
                <button className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center hover:bg-neutral-800 hover:text-white transition-all">
                  <span className="sr-only">X (Twitter)</span>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </button>
              </div>
            </div>
            
            <a href="/blog" className="text-sm font-bold text-dark hover:text-primary-600 transition-colors flex items-center gap-2">
              Retour au blog
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

        </div>
      </section>
    </>
  );
}
