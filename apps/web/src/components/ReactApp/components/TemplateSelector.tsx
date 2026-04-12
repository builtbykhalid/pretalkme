import { useState } from 'react';
import { FileText, Eye, CheckCircle2, Sparkles, Check, X } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  category: string;
  description?: string;
  html?: string;
  css?: string;
  preview_image_url?: string;
  tags?: string[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (t: Template) => void;
  onSetDefault?: (t: Template) => void;
  defaultTemplateId?: string | null;
  templates?: Template[];
}

export default function TemplateSelector({ open, onClose, onSelect, onSetDefault, defaultTemplateId, templates }: Props) {
  const pool = templates || [];
  const [selected, setSelected] = useState<string | null>(defaultTemplateId || (pool[0] && pool[0].id) || null);

  if (!open) return null;

  const openPreview = (t: Template) => {
    const previewHtml = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1" /><style>${t.css || ''}</style></head><body>${t.html || ''}</body></html>`;
    const w = window.open();
    if (w) {
      w.document.open();
      w.document.write(previewHtml);
      w.document.close();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
      {/* Unified backdrop */}
      <div
        className="absolute inset-0 bg-dark/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="relative w-full md:max-w-5xl bg-white rounded-t-2xl md:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] md:max-h-[90vh] overflow-hidden border border-neutral-200/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Mobile drag handle */}
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-neutral-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 md:px-6 py-3 md:py-4 border-b border-neutral-100 flex items-center justify-between shrink-0 bg-neutral-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-50 text-primary-600 rounded-xl">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-dark tracking-tight">Sélectionnez un design</h3>
              <p className="text-xs font-medium text-neutral-400 mt-0.5">Personnalisez l'apparence du rapport final</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-xl text-neutral-400 hover:text-dark transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content - Scrollable Grid */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
            {pool.length === 0 ? (
              <div className="col-span-full py-16 md:py-20 flex flex-col items-center text-center">
                <FileText size={48} className="text-neutral-200 mb-4" />
                <p className="text-sm font-bold text-neutral-400">Aucun template disponible</p>
              </div>
            ) : (
              pool.map((tpl) => {
                const isActive = selected === tpl.id;
                const isDefault = defaultTemplateId === tpl.id;

                return (
                  <div
                    key={tpl.id}
                    onClick={() => setSelected(tpl.id)}
                    className={`group relative flex flex-col bg-white border rounded-2xl overflow-hidden transition-all cursor-pointer
                      ${isActive
                        ? 'border-primary-500 ring-4 ring-primary-500/5 shadow-md'
                        : 'border-neutral-200/60 hover:border-primary-300 hover:shadow-sm'}`}
                  >
                    {/* Thumbnail */}
                    <div className="relative h-28 md:h-32 bg-neutral-100 overflow-hidden shrink-0">
                      <img
                        src={tpl.preview_image_url || 'https://images.unsplash.com/photo-1586282391129-59a998fd204c?q=80&w=1470&auto=format&fit=crop'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        alt={tpl.name}
                      />
                      <div className="hidden md:flex absolute inset-0 bg-dark/10 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center">
                        <button
                          onClick={(e) => { e.stopPropagation(); openPreview(tpl); }}
                          className="p-2 bg-white rounded-lg shadow-lg text-dark hover:scale-110 transition-transform"
                        >
                          <Eye size={14} />
                        </button>
                      </div>

                      {isDefault && (
                        <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-white/90 backdrop-blur-md rounded-md border border-white shadow-sm flex items-center gap-1">
                          <CheckCircle2 size={10} className="text-emerald-500" />
                          <span className="text-xs font-bold text-dark">Par défaut</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-3 md:p-4 flex flex-col flex-1">
                      <div className="mb-2 md:mb-3">
                        <h4 className="text-xs font-bold text-dark tracking-tight mb-1 truncate">{tpl.name}</h4>
                        <p className="text-xs text-neutral-400 font-medium line-clamp-2 leading-relaxed">
                          {tpl.description || "Design professionnel optimisé pour la lecture."}
                        </p>
                      </div>

                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex gap-1">
                          {tpl.tags?.slice(0, 1).map(tag => (
                            <span key={tag} className="text-xs font-bold text-neutral-400 bg-neutral-50 px-1.5 py-0.5 rounded border border-neutral-100">{tag}</span>
                          ))}
                        </div>
                        {isActive && <CheckCircle2 size={14} className="text-primary-500" />}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-4 md:px-6 py-3 md:py-4 border-t border-neutral-100 flex items-center justify-between shrink-0 bg-neutral-50/50">
          <button
            onClick={onClose}
            className="text-xs font-bold text-neutral-400 hover:text-dark transition-colors px-3 py-2"
          >
            Annuler
          </button>

          <div className="flex items-center gap-2 md:gap-3">
            {selected && onSetDefault && (
              <button
                onClick={() => {
                  const tpl = pool.find(p => p.id === selected);
                  if (tpl) onSetDefault(tpl);
                }}
                className="text-xs font-bold text-primary-600 hover:underline mr-1 md:mr-2 hidden md:block"
              >
                Définir par défaut
              </button>
            )}
            <button
              onClick={() => {
                const tpl = pool.find(x => x.id === selected) || pool[0];
                if (tpl) onSelect(tpl);
              }}
              disabled={!selected}
              className="flex items-center gap-2 px-5 md:px-6 py-2.5 bg-primary-600 text-white rounded-xl text-xs font-semibold shadow-lg shadow-primary-500/20 hover:bg-primary-700 active:scale-95 disabled:opacity-50 transition-all"
            >
              <Check size={14} strokeWidth={3} />
              Confirmer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
