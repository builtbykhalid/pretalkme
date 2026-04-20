import React from 'react';

interface ProfileWrapperProps {
  initialProfile?: any;
  initialForms?: any[];
  initialServices?: any[];
  username?: string;
}

export default function ProfileWrapper({ initialProfile, initialForms = [], initialServices = [], username }: ProfileWrapperProps) {
  const displayName = [initialProfile?.first_name, initialProfile?.last_name].filter(Boolean).join(' ') || username || 'Consultant';

  return (
    <div className="min-h-screen bg-[#221A40] text-white px-6 py-12 flex items-center justify-center">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8">
        <section className="rounded-[32px] bg-white/5 border border-white/10 backdrop-blur p-8 md:p-10 shadow-2xl">
          <div className="text-xs uppercase tracking-[0.3em] text-white/45 font-bold mb-4">Profil public</div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-4">
            {displayName}
          </h1>
          <p className="text-white/70 leading-relaxed mb-8 max-w-2xl">
            {initialProfile?.bio || initialProfile?.job_title || 'Un profil prêt à convertir les visiteurs en prospects qualifiés.'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Stat title="Formulaires" value={initialForms.length} />
            <Stat title="Services" value={initialServices.length} />
            <Stat title="Statut" value={initialProfile?.public_visibility ? 'Actif' : 'Privé'} />
          </div>
        </section>

        <aside className="rounded-[32px] bg-white text-[#111B21] p-8 md:p-10 shadow-2xl">
          <h2 className="text-2xl font-black mb-4">Vos prochaines étapes</h2>
          <ul className="space-y-3 text-sm text-[#667781]">
            <li>• Personnaliser le contenu du profil</li>
            <li>• Ajouter vos formulaires publics</li>
            <li>• Connecter la prise de rendez-vous</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="text-[11px] uppercase tracking-[0.25em] text-white/45 font-bold mb-2">{title}</div>
      <div className="text-2xl font-black text-white">{value}</div>
    </div>
  );
}
