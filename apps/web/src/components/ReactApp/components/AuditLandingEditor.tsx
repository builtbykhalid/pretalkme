import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { Eye, EyeOff, GripVertical, Plus, Trash2 } from 'lucide-react';
import { type ChangeEvent, useRef, useState } from 'react';
import { useFileUpload } from '../hooks/useFileUpload';
import type { AuditLandingData } from '../lib/auditLanding';

const DEFAULT_ORDER = ['hero', 'context_block', 'checklist', 'visualizations', 'analysis_block', 'problems_block', 'solutions_block', 'cta'];

const BLOCK_LABELS: Record<string, string> = {
  hero: 'Hero',
  context_block: 'Contexte',
  checklist: 'Checklist',
  visualizations: 'Visualisations',
  analysis_block: 'Analyse',
  problems_block: 'Problemes',
  solutions_block: 'Solutions',
  cta: 'CTA final',
};

const toHtml = (value: string) => {
  const raw = String(value || '').trim();
  if (!raw) return '<p></p>';
  if (raw.includes('<')) return raw;
  const lines = raw.split('\n').map((line) => line.trim()).filter(Boolean);
  return lines.length > 0 ? `<p>${lines.join('</p><p>')}</p>` : '<p></p>';
};

const stripHtml = (value: string) => String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

interface Props {
  data: AuditLandingData;
  onChange: (next: AuditLandingData) => void;
  uploadFolder?: string;
}

export default function AuditLandingEditor({ data, onChange, uploadFolder }: Props) {
  const { handleFileUpload } = useFileUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadBlockId, setActiveUploadBlockId] = useState<string | null>(null);
  const [uploadingBlockId, setUploadingBlockId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const order = (data.consultant_edits?.block_order || []).length > 0
    ? [...new Set([...(data.consultant_edits?.block_order || []).filter((id) => DEFAULT_ORDER.includes(id)), ...DEFAULT_ORDER])]
    : DEFAULT_ORDER;

  const blockVisibility = data.consultant_edits?.block_visibility || {};
  const blockImages = data.consultant_edits?.block_images || {};

  const setOrder = (nextOrder: string[]) => {
    onChange({
      ...data,
      consultant_edits: {
        ...(data.consultant_edits || {}),
        block_order: nextOrder,
        block_visibility: blockVisibility,
        block_images: blockImages,
      },
    });
  };

  const setVisibility = (blockId: string, visible: boolean) => {
    onChange({
      ...data,
      consultant_edits: {
        ...(data.consultant_edits || {}),
        block_order: order,
        block_images: blockImages,
        block_visibility: {
          ...blockVisibility,
          [blockId]: visible,
        },
      },
    });
  };

  const setBlockImage = (blockId: string, key: 'url' | 'position', value: string) => {
    onChange({
      ...data,
      consultant_edits: {
        ...(data.consultant_edits || {}),
        block_order: order,
        block_visibility: blockVisibility,
        block_images: {
          ...blockImages,
          [blockId]: {
            ...(blockImages[blockId] || {}),
            [key]: value,
          },
        },
      },
    });
  };

  const openImagePicker = (blockId: string) => {
    setActiveUploadBlockId(blockId);
    setUploadError(null);
    fileInputRef.current?.click();
  };

  const onSelectImageFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const blockId = activeUploadBlockId;
    if (!file || !blockId) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploadingBlockId(blockId);
    setUploadError(null);

    try {
      const folder = uploadFolder || 'audit-landing';
      const uploadedUrl = await handleFileUpload(file, 'forms', folder);
      if (!uploadedUrl) {
        setUploadError('Upload image impossible. Verifiez le format (image) et la taille (max 2 Mo).');
      } else {
        setBlockImage(blockId, 'url', uploadedUrl);
      }
    } finally {
      setUploadingBlockId(null);
      setActiveUploadBlockId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const next = Array.from(order);
    const [moved] = next.splice(result.source.index, 1);
    next.splice(result.destination.index, 0, moved);
    setOrder(next);
  };

  const update = (patch: Partial<AuditLandingData>) => onChange({ ...data, ...patch });

  return (
    <div className="space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        className="hidden"
        onChange={onSelectImageFile}
      />

      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-[12px] text-red-700 font-medium">
          {uploadError}
        </div>
      )}

      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
        <p className="text-[11px] font-black uppercase tracking-wider text-[#9CA3AF] mb-3">Ordre, visibilité et images des blocs</p>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="audit-block-order">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                {order.map((blockId, index) => {
                  const visible = blockVisibility[blockId] !== false;
                  return (
                    <Draggable key={blockId} draggableId={blockId} index={index}>
                      {(dragProvided) => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          className="rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] p-3"
                        >
                          <div className="flex items-center gap-3">
                            <button {...dragProvided.dragHandleProps} className="text-[#9CA3AF]">
                              <GripVertical size={16} />
                            </button>
                            <div className="flex-1 text-[12px] font-bold text-[#111827]">{BLOCK_LABELS[blockId] || blockId}</div>
                            <button
                              onClick={() => setVisibility(blockId, !visible)}
                              className="h-8 px-3 rounded-lg border border-[#E5E7EB] text-[10px] font-black uppercase tracking-wider"
                            >
                              {visible ? <Eye size={14} /> : <EyeOff size={14} />}
                            </button>
                          </div>

                          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                            <input
                              value={blockImages[blockId]?.url || ''}
                              onChange={(e) => setBlockImage(blockId, 'url', e.target.value)}
                              placeholder="Image URL (optionnel)"
                              className="h-9 px-3 rounded-lg border border-[#E5E7EB] text-[11px]"
                            />
                            <select
                              value={blockImages[blockId]?.position || 'after'}
                              onChange={(e) => setBlockImage(blockId, 'position', e.target.value)}
                              className="h-9 px-3 rounded-lg border border-[#E5E7EB] text-[11px]"
                            >
                              <option value="after">Image apres le texte</option>
                              <option value="before">Image avant le texte</option>
                              <option value="grid">Image en grille</option>
                              <option value="background">Image en arriere-plan</option>
                            </select>
                          </div>

                          <div className="mt-2 flex items-center justify-between gap-2">
                            <button
                              onClick={() => openImagePicker(blockId)}
                              disabled={uploadingBlockId === blockId}
                              className="h-8 px-3 rounded-lg border border-[#E5E7EB] text-[10px] font-black uppercase tracking-wider disabled:opacity-50"
                            >
                              {uploadingBlockId === blockId ? 'Upload...' : 'Uploader image'}
                            </button>
                            {!!blockImages[blockId]?.url && (
                              <button
                                onClick={() => setBlockImage(blockId, 'url', '')}
                                className="h-8 px-3 rounded-lg border border-[#E5E7EB] text-[10px] font-black uppercase tracking-wider"
                              >
                                Retirer
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 space-y-4">
        <p className="text-[11px] font-black uppercase tracking-wider text-[#9CA3AF]">Contenu des sections</p>

        <input value={data.hero.headline} onChange={(e) => update({ hero: { ...data.hero, headline: e.target.value } })} className="w-full h-10 px-3 rounded-lg border border-[#E5E7EB] text-[12px] font-bold" placeholder="Titre hero" />
        <input value={data.hero.subline} onChange={(e) => update({ hero: { ...data.hero, subline: e.target.value } })} className="w-full h-10 px-3 rounded-lg border border-[#E5E7EB] text-[12px]" placeholder="Sous-titre hero" />

        <input value={data.context_block.title} onChange={(e) => update({ context_block: { ...data.context_block, title: e.target.value } })} className="w-full h-10 px-3 rounded-lg border border-[#E5E7EB] text-[12px] font-bold" placeholder="Titre contexte" />
        <textarea value={stripHtml(data.context_block.content)} onChange={(e) => update({ context_block: { ...data.context_block, content: toHtml(e.target.value) } })} className="w-full min-h-22.5 p-3 rounded-lg border border-[#E5E7EB] text-[12px]" placeholder="Contenu contexte" />

        <input value={data.analysis_block.title} onChange={(e) => update({ analysis_block: { ...data.analysis_block, title: e.target.value } })} className="w-full h-10 px-3 rounded-lg border border-[#E5E7EB] text-[12px] font-bold" placeholder="Titre analyse" />
        <textarea value={stripHtml(data.analysis_block.content)} onChange={(e) => update({ analysis_block: { ...data.analysis_block, content: toHtml(e.target.value) } })} className="w-full min-h-22.5 p-3 rounded-lg border border-[#E5E7EB] text-[12px]" placeholder="Contenu analyse" />

        <input value={data.cta.headline} onChange={(e) => update({ cta: { ...data.cta, headline: e.target.value } })} className="w-full h-10 px-3 rounded-lg border border-[#E5E7EB] text-[12px] font-bold" placeholder="Titre CTA" />
        <input value={data.cta.sublabel} onChange={(e) => update({ cta: { ...data.cta, sublabel: e.target.value } })} className="w-full h-10 px-3 rounded-lg border border-[#E5E7EB] text-[12px]" placeholder="Sous-texte CTA" />
        <input value={data.cta.cta_label} onChange={(e) => update({ cta: { ...data.cta, cta_label: e.target.value } })} className="w-full h-10 px-3 rounded-lg border border-[#E5E7EB] text-[12px]" placeholder="Label bouton CTA" />
        <input value={data.cta.booking_url} onChange={(e) => update({ cta: { ...data.cta, booking_url: e.target.value } })} className="w-full h-10 px-3 rounded-lg border border-[#E5E7EB] text-[12px]" placeholder="URL de reservation" />
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-black uppercase tracking-wider text-[#9CA3AF]">Checklist</p>
          <button
            onClick={() => update({ checklist: { ...data.checklist, items: [...data.checklist.items, { label: 'Nouvel item', status: 'partial' }] } })}
            className="h-8 px-3 rounded-lg border border-[#E5E7EB] text-[10px] font-black uppercase tracking-wider"
          >
            <Plus size={12} />
          </button>
        </div>
        <div className="space-y-2">
          {data.checklist.items.map((item, idx) => (
            <div key={`check-${idx}`} className="grid grid-cols-[1fr_auto_auto] gap-2">
              <input
                value={item.label}
                onChange={(e) => {
                  const next = [...data.checklist.items];
                  next[idx] = { ...next[idx], label: e.target.value };
                  update({ checklist: { ...data.checklist, items: next } });
                }}
                className="h-9 px-3 rounded-lg border border-[#E5E7EB] text-[11px]"
              />
              <select
                value={item.status}
                onChange={(e) => {
                  const next = [...data.checklist.items];
                  next[idx] = { ...next[idx], status: e.target.value as any };
                  update({ checklist: { ...data.checklist, items: next } });
                }}
                className="h-9 px-3 rounded-lg border border-[#E5E7EB] text-[11px]"
              >
                <option value="missing">Manquant</option>
                <option value="partial">Partiel</option>
                <option value="ok">Valide</option>
              </select>
              <button
                onClick={() => {
                  const next = data.checklist.items.filter((_, i) => i !== idx);
                  update({ checklist: { ...data.checklist, items: next } });
                }}
                className="h-9 w-9 grid place-items-center rounded-lg border border-[#E5E7EB]"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-black uppercase tracking-wider text-[#9CA3AF]">Highlights contexte</p>
          <button
            onClick={() => update({ context_block: { ...data.context_block, highlights: [...(data.context_block.highlights || []), 'Nouveau highlight'] } })}
            className="h-8 px-3 rounded-lg border border-[#E5E7EB] text-[10px] font-black uppercase tracking-wider"
          >
            <Plus size={12} />
          </button>
        </div>
        <div className="space-y-2">
          {(data.context_block.highlights || []).map((highlight, idx) => (
            <div key={`highlight-${idx}`} className="grid grid-cols-[1fr_auto] gap-2">
              <input
                value={highlight}
                onChange={(e) => {
                  const next = [...(data.context_block.highlights || [])];
                  next[idx] = e.target.value;
                  update({ context_block: { ...data.context_block, highlights: next } });
                }}
                className="h-9 px-3 rounded-lg border border-[#E5E7EB] text-[11px]"
              />
              <button
                onClick={() => {
                  const next = (data.context_block.highlights || []).filter((_, i) => i !== idx);
                  update({ context_block: { ...data.context_block, highlights: next } });
                }}
                className="h-9 w-9 grid place-items-center rounded-lg border border-[#E5E7EB]"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-black uppercase tracking-wider text-[#9CA3AF]">Problèmes</p>
          <button
            onClick={() => update({
              problems_block: {
                ...data.problems_block,
                items: [...(data.problems_block.items || []), { title: 'Nouveau problème', description: '', severity: 'medium' }],
              },
            })}
            className="h-8 px-3 rounded-lg border border-[#E5E7EB] text-[10px] font-black uppercase tracking-wider"
          >
            <Plus size={12} />
          </button>
        </div>
        <input
          value={data.problems_block.title}
          onChange={(e) => update({ problems_block: { ...data.problems_block, title: e.target.value } })}
          className="w-full h-10 px-3 rounded-lg border border-[#E5E7EB] text-[12px] font-bold mb-3"
          placeholder="Titre problèmes"
        />
        <div className="space-y-3">
          {(data.problems_block.items || []).map((item, idx) => (
            <div key={`problem-${idx}`} className="rounded-xl border border-[#E5E7EB] p-3 space-y-2 bg-[#FAFAFA]">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-2">
                <input
                  value={item.title}
                  onChange={(e) => {
                    const next = [...(data.problems_block.items || [])];
                    next[idx] = { ...next[idx], title: e.target.value };
                    update({ problems_block: { ...data.problems_block, items: next } });
                  }}
                  className="h-9 px-3 rounded-lg border border-[#E5E7EB] text-[11px] font-semibold"
                  placeholder="Titre"
                />
                <select
                  value={item.severity}
                  onChange={(e) => {
                    const next = [...(data.problems_block.items || [])];
                    next[idx] = { ...next[idx], severity: e.target.value as 'critical' | 'high' | 'medium' | 'low' };
                    update({ problems_block: { ...data.problems_block, items: next } });
                  }}
                  className="h-9 px-3 rounded-lg border border-[#E5E7EB] text-[11px]"
                >
                  <option value="critical">Critique</option>
                  <option value="high">Eleve</option>
                  <option value="medium">Moyen</option>
                  <option value="low">Faible</option>
                </select>
                <button
                  onClick={() => {
                    const next = (data.problems_block.items || []).filter((_, i) => i !== idx);
                    update({ problems_block: { ...data.problems_block, items: next } });
                  }}
                  className="h-9 w-9 grid place-items-center rounded-lg border border-[#E5E7EB]"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <textarea
                value={item.description}
                onChange={(e) => {
                  const next = [...(data.problems_block.items || [])];
                  next[idx] = { ...next[idx], description: e.target.value };
                  update({ problems_block: { ...data.problems_block, items: next } });
                }}
                className="w-full min-h-20 p-3 rounded-lg border border-[#E5E7EB] text-[11px]"
                placeholder="Description"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-black uppercase tracking-wider text-[#9CA3AF]">Solutions</p>
          <button
            onClick={() => update({
              solutions_block: {
                ...data.solutions_block,
                items: [...(data.solutions_block.items || []), { title: 'Nouvelle solution', description: '', impact: 'Moyen' }],
              },
            })}
            className="h-8 px-3 rounded-lg border border-[#E5E7EB] text-[10px] font-black uppercase tracking-wider"
          >
            <Plus size={12} />
          </button>
        </div>
        <input
          value={data.solutions_block.title}
          onChange={(e) => update({ solutions_block: { ...data.solutions_block, title: e.target.value } })}
          className="w-full h-10 px-3 rounded-lg border border-[#E5E7EB] text-[12px] font-bold mb-3"
          placeholder="Titre solutions"
        />
        <div className="space-y-3">
          {(data.solutions_block.items || []).map((item, idx) => (
            <div key={`solution-${idx}`} className="rounded-xl border border-[#E5E7EB] p-3 space-y-2 bg-[#FAFAFA]">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-2">
                <input
                  value={item.title}
                  onChange={(e) => {
                    const next = [...(data.solutions_block.items || [])];
                    next[idx] = { ...next[idx], title: e.target.value };
                    update({ solutions_block: { ...data.solutions_block, items: next } });
                  }}
                  className="h-9 px-3 rounded-lg border border-[#E5E7EB] text-[11px] font-semibold"
                  placeholder="Titre"
                />
                <input
                  value={item.impact}
                  onChange={(e) => {
                    const next = [...(data.solutions_block.items || [])];
                    next[idx] = { ...next[idx], impact: e.target.value };
                    update({ solutions_block: { ...data.solutions_block, items: next } });
                  }}
                  className="h-9 px-3 rounded-lg border border-[#E5E7EB] text-[11px]"
                  placeholder="Impact"
                />
                <button
                  onClick={() => {
                    const next = (data.solutions_block.items || []).filter((_, i) => i !== idx);
                    update({ solutions_block: { ...data.solutions_block, items: next } });
                  }}
                  className="h-9 w-9 grid place-items-center rounded-lg border border-[#E5E7EB]"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <textarea
                value={item.description}
                onChange={(e) => {
                  const next = [...(data.solutions_block.items || [])];
                  next[idx] = { ...next[idx], description: e.target.value };
                  update({ solutions_block: { ...data.solutions_block, items: next } });
                }}
                className="w-full min-h-20 p-3 rounded-lg border border-[#E5E7EB] text-[11px]"
                placeholder="Description"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-black uppercase tracking-wider text-[#9CA3AF]">Visualisations</p>
          <button
            onClick={() => update({
              visualizations: [
                ...(data.visualizations || []),
                {
                  id: `viz-${Date.now()}`,
                  type: 'bar',
                  title: 'Nouvelle visualisation',
                  label_unite: '€',
                  enabled: true,
                  points: [
                    { label: 'Point 1', value: 10 },
                    { label: 'Point 2', value: 20 },
                  ],
                },
              ],
            })}
            className="h-8 px-3 rounded-lg border border-[#E5E7EB] text-[10px] font-black uppercase tracking-wider"
          >
            <Plus size={12} />
          </button>
        </div>
        <div className="space-y-3">
          {(data.visualizations || []).map((viz, vizIndex) => (
            <div key={viz.id || `viz-${vizIndex}`} className="rounded-xl border border-[#E5E7EB] p-3 space-y-2 bg-[#FAFAFA]">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-2">
                <input
                  value={viz.title}
                  onChange={(e) => {
                    const next = [...(data.visualizations || [])];
                    next[vizIndex] = { ...next[vizIndex], title: e.target.value };
                    update({ visualizations: next });
                  }}
                  className="h-9 px-3 rounded-lg border border-[#E5E7EB] text-[11px] font-semibold"
                  placeholder="Titre"
                />
                <select
                  value={viz.type}
                  onChange={(e) => {
                    const next = [...(data.visualizations || [])];
                    next[vizIndex] = { ...next[vizIndex], type: e.target.value as 'bar' | 'line' | 'table' | 'radar' };
                    update({ visualizations: next });
                  }}
                  className="h-9 px-3 rounded-lg border border-[#E5E7EB] text-[11px]"
                >
                  <option value="bar">Barres</option>
                  <option value="line">Ligne</option>
                  <option value="table">Tableau</option>
                  <option value="radar">Radar</option>
                </select>
                <input
                  value={viz.label_unite}
                  onChange={(e) => {
                    const next = [...(data.visualizations || [])];
                    next[vizIndex] = { ...next[vizIndex], label_unite: e.target.value };
                    update({ visualizations: next });
                  }}
                  className="h-9 px-3 rounded-lg border border-[#E5E7EB] text-[11px]"
                  placeholder="Unité"
                />
                <button
                  onClick={() => {
                    const next = (data.visualizations || []).filter((_, i) => i !== vizIndex);
                    update({ visualizations: next });
                  }}
                  className="h-9 w-9 grid place-items-center rounded-lg border border-[#E5E7EB]"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="space-y-2">
                {(viz.points || []).map((point, pointIndex) => (
                  <div key={`${viz.id || vizIndex}-point-${pointIndex}`} className="grid grid-cols-[1fr_120px_auto] gap-2">
                    <input
                      value={point.label}
                      onChange={(e) => {
                        const next = [...(data.visualizations || [])];
                        const nextPoints = [...(next[vizIndex].points || [])];
                        nextPoints[pointIndex] = { ...nextPoints[pointIndex], label: e.target.value };
                        next[vizIndex] = { ...next[vizIndex], points: nextPoints };
                        update({ visualizations: next });
                      }}
                      className="h-9 px-3 rounded-lg border border-[#E5E7EB] text-[11px]"
                      placeholder="Label"
                    />
                    <input
                      type="number"
                      value={Number(point.value || 0)}
                      onChange={(e) => {
                        const next = [...(data.visualizations || [])];
                        const nextPoints = [...(next[vizIndex].points || [])];
                        nextPoints[pointIndex] = { ...nextPoints[pointIndex], value: Number(e.target.value || 0) };
                        next[vizIndex] = { ...next[vizIndex], points: nextPoints };
                        update({ visualizations: next });
                      }}
                      className="h-9 px-3 rounded-lg border border-[#E5E7EB] text-[11px]"
                    />
                    <button
                      onClick={() => {
                        const next = [...(data.visualizations || [])];
                        const nextPoints = (next[vizIndex].points || []).filter((_, i) => i !== pointIndex);
                        next[vizIndex] = { ...next[vizIndex], points: nextPoints };
                        update({ visualizations: next });
                      }}
                      className="h-9 w-9 grid place-items-center rounded-lg border border-[#E5E7EB]"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const next = [...(data.visualizations || [])];
                    const nextPoints = [...(next[vizIndex].points || []), { label: `Point ${(next[vizIndex].points || []).length + 1}`, value: 0 }];
                    next[vizIndex] = { ...next[vizIndex], points: nextPoints };
                    update({ visualizations: next });
                  }}
                  className="h-8 px-3 rounded-lg border border-[#E5E7EB] text-[10px] font-black uppercase tracking-wider"
                >
                  Ajouter un point
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
