import { useState } from "react";
import { Btn, Reveal, SL, ST, Badge, ArrowRight, ClockIcon, Tag } from "../ui";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

function CaseCard({ cs, featured=false }) {
  const date = cs.published_at ? format(new Date(cs.published_at), 'd MMM yyyy', { locale: fr }) : 'Non publié';
  const categoryName = cs.blog_categories?.name || 'Général';
  const categoryColor = cs.blog_categories?.color || '#000000';

  return (
    <a href={`/blog/${cs.slug}`} className={`group block no-underline bg-white border border-gray-200 rounded-3xl overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-[280ms] ease-spring ${featured?"col-span-2":""}`}>
      <div className={`relative overflow-hidden ${featured?"h-[280px]":"h-[200px]"}`}>
        <img src={cs.cover_image_url || 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=900&h=500&fit=crop'} alt={cs.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"/>
        <span 
          className="absolute top-4 left-4 text-[10px] font-bold px-2.5 py-1 rounded-full text-white shadow-sm"
          style={{ backgroundColor: categoryColor }}
        >
          {categoryName}
        </span>
      </div>
      <div className="p-6">
        <div className="flex items-center gap-3 text-[11.5px] text-gray-400 mb-3">
          <ClockIcon/><span>{cs.read_time_minutes || 5} min de lecture</span>
          <span>·</span>
          <span>{date}</span>
        </div>
        <h3 className={`font-bold text-black leading-snug mb-3 group-hover:text-primary-600 transition-colors ${featured?"text-[20px]":"text-[16px]"}`}>{cs.title}</h3>
        {featured && <p className="text-[13.5px] text-gray-500 leading-[1.65] mb-4 line-clamp-2">{cs.excerpt}</p>}
        
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-50">
          <div className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center text-[10px] font-bold text-neutral-400">
            PH
          </div>
          <span className="text-[12px] text-gray-500">Équipe Pretalk</span>
          <ArrowRight size={14} color="#9CA3AF" className="ml-auto group-hover:translate-x-1 transition-transform"/>
        </div>
      </div>
    </a>
  );
}

export default function Blog({ initialPosts = [], showHero = true, showFilters = true, showNewsletter = true }) {
  const [activeCategory, setActiveCategory] = useState("Tous");
  
  const categories = ["Tous", ...new Set(initialPosts.map(p => p.blog_categories?.name).filter(Boolean))];
  
  const filtered = activeCategory === "Tous" 
    ? initialPosts 
    : initialPosts.filter(p => p.blog_categories?.name === activeCategory);
    
  const featured = filtered.find(p => p.featured) || filtered[0];
  const rest = filtered.filter(p => p.id !== featured?.id);

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      {showHero && (
        <section className="pt-32 pb-16 px-6 md:px-8 max-w-7xl mx-auto text-center scroll-mt-24">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary-500/20 text-primary-600 text-[10px] font-black uppercase tracking-[0.2em] bg-white shadow-sm mx-auto mb-6">
              Blog & Cas Clients
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="text-4xl md:text-6xl font-black text-dark tracking-tighter leading-[1.1] mb-6">
              Résultats réels.<br/><span className="text-primary-500">Histoires inspirantes.</span>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="text-neutral-500 font-medium max-w-2xl mx-auto text-lg leading-relaxed">
              Découvrez comment des consultants, coaches et solopreneurs transforment leur activité grâce à Pretalk. Des histoires vraies, des chiffres vérifiables.
            </p>
          </Reveal>
        </section>
      )}

      {/* Filters & Categories link */}
      {showFilters && (
        <section className="py-8 px-6 md:px-8 border-y border-neutral-100 bg-white sticky top-[72px] z-20">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
              {categories.map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-shrink-0 text-[13px] font-bold px-5 py-2.5 rounded-2xl border transition-all ${
                    activeCategory === cat 
                      ? "bg-dark text-white border-dark shadow-md" 
                      : "bg-white border-neutral-200 text-neutral-500 hover:border-neutral-400"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            
            <a 
              href="/blog/categories" 
              className="group flex items-center gap-2 text-sm font-bold text-dark hover:text-primary-600 transition-colors"
            >
              Explorer par catégories
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </section>
      )}

      {/* Grid */}
      <section className="py-20 px-6 md:px-8">
        <div className="max-w-7xl mx-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-16 h-16 bg-neutral-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-neutral-100">
                <Tag size={24} color="#D4D4D4" />
              </div>
              <h3 className="text-xl font-bold text-dark mb-2">Aucun article trouvé</h3>
              <p className="text-neutral-500 mb-6">Nous n'avons trouvé aucun article pour cette catégorie.</p>
              <button 
                onClick={() => setActiveCategory("Tous")} 
                className="text-sm font-bold text-primary-600 hover:underline"
              >
                Voir tous les articles
              </button>
            </div>
          ) : (
            <>
              {featured && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <Reveal className="md:col-span-2">
                    <CaseCard cs={featured} featured />
                  </Reveal>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {rest.map((post, i) => (
                  <Reveal key={post.id} delay={i * 100}>
                    <CaseCard cs={post} />
                  </Reveal>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Newsletter / CTA */}
      {showNewsletter && (
        <section className="py-24 px-6 md:px-8 bg-neutral-900 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-primary-600/10 blur-[120px] -rotate-12 translate-x-1/2" />
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">
              Ne manquez aucun<br/><span className="text-primary-400">conseil stratégique.</span>
            </h2>
            <p className="text-neutral-400 text-lg mb-10 max-w-xl mx-auto">
              Inscrivez-vous à notre newsletter pour recevoir chaque semaine des études de cas et des conseils pour optimiser votre tunnel de vente.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input 
                type="email" 
                placeholder="votre@email.com" 
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary-500 transition-all"
              />
              <Btn secondary className="px-8 whitespace-nowrap">S'inscrire</Btn>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
