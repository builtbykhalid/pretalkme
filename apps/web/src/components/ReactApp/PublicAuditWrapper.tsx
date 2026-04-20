import React from 'react';

interface PublicAuditWrapperProps {
  username: string;
  leadId: string;
}

export default function PublicAuditWrapper({ username, leadId }: PublicAuditWrapperProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16 bg-[#0B0F19] text-white">
      <div className="max-w-2xl w-full rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-8 md:p-10 shadow-2xl">
        <div className="text-xs uppercase tracking-[0.3em] text-white/45 font-bold mb-4">Pretalk Audit</div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight mb-4">
          Audit personnalisé pour <span className="text-[#48D951]">{username}</span>
        </h1>
        <p className="text-white/70 leading-relaxed mb-8">
          Votre page d\'audit est prête. Le lead <span className="font-semibold text-white">{leadId}</span> peut maintenant recevoir une analyse structurée et un plan d\'action.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card title="Qualification" text="Questions contextuelles et score d\'intention." />
          <Card title="Recommandations" text="Synthèse claire et prochaine étape." />
          <Card title="Conversion" text="CTA orienté rendez-vous ou achat." />
        </div>
        <a href="/" className="inline-flex items-center justify-center rounded-xl bg-[#48D951] px-5 py-3 font-bold text-black hover:brightness-105 transition-all">
          Retour au site
        </a>
      </div>
    </div>
  );
}

function Card({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="text-sm font-bold mb-2">{title}</div>
      <div className="text-sm text-white/65 leading-relaxed">{text}</div>
    </div>
  );
}
