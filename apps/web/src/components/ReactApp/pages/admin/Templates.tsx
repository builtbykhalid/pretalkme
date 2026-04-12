import { Clock3 } from 'lucide-react';

export default function AdminTemplates() {
  return (
    <div className="w-full space-y-8 pb-10 animate-in fade-in duration-700">
      <div className="page-header">
        <div className="space-y-1">
          <h1 className="page-title">Templates</h1>
          <p className="page-subtitle">Module temporairement indisponible.</p>
        </div>
      </div>

      <section className="premium-card p-10 md:p-14 border border-dashed border-[#E5E7EB] bg-[#FCFCFD]">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-[#F3F4F6] text-[#111827] flex items-center justify-center">
            <Clock3 size={26} />
          </div>
          <p className="text-[11px] font-black tracking-[0.2em] uppercase text-[#6B7280]">Bientot</p>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-[#111827]">
            Templates PDF Audit en preparation
          </h2>
          <p className="text-sm text-[#6B7280] leading-relaxed">
            La gestion des templates PDF est desactivee dans toute l'application pour le moment.
            Les envois client se font en email structure et le module reviendra prochainement.
          </p>
        </div>
      </section>
    </div>
  );
}
