import { Reveal, ArrowRight, Tag } from "../ui";

export default function BlogCategories({ categories = [] }) {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <section className="pt-32 pb-16 px-6 md:px-8 max-w-7xl mx-auto text-center">
        <Reveal>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neutral-200 text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em] bg-white shadow-sm mx-auto mb-6">
            Parcourir le blog
          </div>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="text-4xl md:text-6xl font-black text-dark tracking-tighter leading-tight mb-6">
            Toutes les <span className="text-primary-500">thématiques.</span>
          </h1>
        </Reveal>
        <Reveal delay={160}>
          <p className="text-neutral-500 font-medium max-w-2xl mx-auto text-lg leading-relaxed">
            Explorez nos articles par catégories pour trouver les conseils les plus pertinents pour votre activité.
          </p>
        </Reveal>
      </section>

      {/* Grid */}
      <section className="py-20 px-6 md:px-8 bg-neutral-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((cat, i) => (
              <Reveal key={cat.id} delay={i * 80}>
                <a 
                  href={`/blog/category/${cat.slug}`}
                  className="group block bg-white p-8 rounded-[32px] border border-neutral-200 hover:border-primary-500 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
                >
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: cat.color }}
                  >
                    <Tag size={28} />
                  </div>
                  
                  <h3 className="text-xl font-black text-dark mb-3 group-hover:text-primary-600 transition-colors">
                    {cat.name}
                  </h3>
                  
                  <p className="text-sm text-neutral-500 leading-relaxed mb-6 line-clamp-2">
                    {cat.description || `Découvrez tous nos articles et études de cas sur le thème : ${cat.name}.`}
                  </p>
                  
                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 group-hover:text-primary-500 transition-colors uppercase tracking-widest">
                    Voir les articles
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
          
          {categories.length === 0 && (
            <div className="text-center py-20 grayscale opacity-50">
               <Tag size={48} className="mx-auto mb-4 text-neutral-300" />
               <p className="font-bold text-neutral-400">Aucune catégorie trouvée</p>
            </div>
          )}
        </div>
      </section>
      
      {/* Bottom CTA */}
      <section className="py-32 px-6 md:px-8 bg-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-black text-dark mb-6">Vous ne trouvez pas ce que vous cherchez ?</h2>
          <p className="text-neutral-500 mb-10">
            Notre blog s'enrichit chaque semaine. Revenez bientôt ou contactez-nous si vous souhaitez un sujet spécifique.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/blog" className="text-dark font-black hover:text-primary-600 transition-colors">Retour à la liste complète</a>
          </div>
        </div>
      </section>
    </div>
  );
}
