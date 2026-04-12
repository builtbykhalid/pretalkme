import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
    Plus, Trash2, GripVertical, ChevronDown, ChevronUp,
    Link2, Star, Calendar, Briefcase, Image as ImageIcon,
    Type, LayoutGrid, List, Settings2, MoreHorizontal, Search, Sparkles, X
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import type { ProfileTab, ProfileSection, ProfileItem } from '../context/AppContext';
import IconPicker from '../ui/IconPicker';
import ImageCropper from '../ui/ImageCropper';

interface Props {
    structure: ProfileTab[];
    onChange: (newStructure: ProfileTab[]) => void;
    availableForms: any[];
    availableServices: any[];
    onUploadImage: (file: File) => Promise<string | null>;
}

export default function ProfileStructureBuilder({ structure, onChange, availableForms, availableServices, onUploadImage }: Props) {
    const [expandedTabs, setExpandedTabs] = useState<string[]>(structure.map(t => t.id));
    const [expandedSections, setExpandedSections] = useState<string[]>(structure.flatMap(t => t.sections.map(s => s.id)));
    const [iconPickerItem, setIconPickerItem] = useState<{ tabId: string, sectionId: string, itemId: string } | null>(null);
    const [cropperItem, setCropperItem] = useState<{ tabId: string, sectionId: string, itemId: string, imageUrl: string } | null>(null);
    
    // Automatically expand any new tabs AND their sections that appear in structure
    useEffect(() => {
        const tabIds = structure.map(t => t.id);
        const newTabIds = tabIds.filter(id => !expandedTabs.includes(id));
        
        if (newTabIds.length > 0) {
            setExpandedTabs(prev => [...prev, ...newTabIds]);
            
            // Also identify sections within these new tabs to expand them automatically
            const sectionsToExpand: string[] = [];
            structure.filter(t => newTabIds.includes(t.id)).forEach(t => {
                t.sections.forEach(s => sectionsToExpand.push(s.id));
            });
            
            if (sectionsToExpand.length > 0) {
                setExpandedSections(prev => [...prev, ...sectionsToExpand]);
            }
        }
    }, [structure]);

    const toggleTab = (id: string) => {
        setExpandedTabs(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
    };

    const toggleSection = (id: string) => {
        setExpandedSections(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
    };

    const addTab = () => {
        const newTab: ProfileTab = {
            id: crypto.randomUUID(),
            title: 'Nouvel Onglet',
            sections: []
        };
        onChange([...structure, newTab]);
        setExpandedTabs(prev => [...prev, newTab.id]);
    };

    const updateTabTitle = (tabId: string, title: string) => {
        onChange(structure.map(t => t.id === tabId ? { ...t, title } : t));
    };

    const removeTab = (tabId: string) => {
        if (confirm('Supprimer cet onglet et tout son contenu ?')) {
            onChange(structure.filter(t => t.id !== tabId));
        }
    };

    const addSection = (tabId: string) => {
        const newSection: ProfileSection = {
            id: crypto.randomUUID(),
            title: 'Nouvelle Section',
            layout: 'carousel',
            items: []
        };
        onChange(structure.map(t => t.id === tabId ? { ...t, sections: [...t.sections, newSection] } : t));
        setExpandedSections(prev => [...prev, newSection.id]);
    };

    const updateSection = (tabId: string, sectionId: string, updates: Partial<ProfileSection>) => {
        onChange(structure.map(t => t.id === tabId ? {
            ...t,
            sections: t.sections.map(s => s.id === sectionId ? { ...s, ...updates } : s)
        } : t));
    };

    const removeSection = (tabId: string, sectionId: string) => {
        onChange(structure.map(t => t.id === tabId ? {
            ...t,
            sections: t.sections.filter(s => s.id !== sectionId)
        } : t));
    };

    const addItem = (tabId: string, sectionId: string, type: ProfileItem['type']) => {
        const newItem: ProfileItem = {
            id: crypto.randomUUID(),
            type,
            title: type === 'link' ? 'Nouveau Lien' : type === 'form' ? 'Sélectionner Formulaire' : type === 'service' ? 'Sélectionner Service' : 'Calendrier',
        };
        onChange(structure.map(t => t.id === tabId ? {
            ...t,
            sections: t.sections.map(s => s.id === sectionId ? { ...s, items: [...s.items, newItem] } : s)
        } : t));
    };

    const updateItem = (tabId: string, sectionId: string, itemId: string, updates: Partial<ProfileItem>) => {
        onChange(structure.map(t => t.id === tabId ? {
            ...t,
            sections: t.sections.map(s => s.id === sectionId ? {
                ...s,
                items: s.items.map(i => i.id === itemId ? { ...i, ...updates } : i)
            } : s)
        } : t));
    };

    const removeItem = (tabId: string, sectionId: string, itemId: string) => {
        onChange(structure.map(t => t.id === tabId ? {
            ...t,
            sections: t.sections.map(s => s.id === sectionId ? { ...s, items: s.items.filter(i => i.id !== itemId) } : s)
        } : t));
    };

    const onDragEnd = (result: any) => {
        if (!result.destination) return;
        const { source, destination, type } = result;

        if (type === 'tab') {
            const items = Array.from(structure);
            const [reorderedItem] = items.splice(source.index, 1);
            items.splice(destination.index, 0, reorderedItem);
            onChange(items);
            return;
        }

        if (type === 'section') {
            const tabId = source.droppableId.split('-')[1];
            const tab = structure.find(t => t.id === tabId);
            if (!tab) return;

            const sections = Array.from(tab.sections);
            const [reorderedSection] = sections.splice(source.index, 1);
            sections.splice(destination.index, 0, reorderedSection);

            onChange(structure.map(t => t.id === tabId ? { ...t, sections } : t));
            return;
        }

        if (type === 'item') {
            const sourceSectionId = source.droppableId.split('-')[1];
            const destSectionId = destination.droppableId.split('-')[1];

            let sourceTabId = '';
            let destTabId = '';

            structure.forEach(t => {
                if (t.sections.find(s => s.id === sourceSectionId)) sourceTabId = t.id;
                if (t.sections.find(s => s.id === destSectionId)) destTabId = t.id;
            });

            if (!sourceTabId || !destTabId) return;

            const sourceTab = structure.find(t => t.id === sourceTabId)!;
            const sourceSection = sourceTab.sections.find(s => s.id === sourceSectionId)!;
            const items = Array.from(sourceSection.items);
            const [movedItem] = items.splice(source.index, 1);

            if (sourceSectionId === destSectionId) {
                items.splice(destination.index, 0, movedItem);
                onChange(structure.map(t => t.id === sourceTabId ? {
                    ...t,
                    sections: t.sections.map(s => s.id === sourceSectionId ? { ...s, items } : s)
                } : t));
            } else {
                onChange(structure.map(t => {
                    if (t.id === sourceTabId) {
                        return {
                            ...t,
                            sections: t.sections.map(s => {
                                if (s.id === sourceSectionId) return { ...s, items };
                                if (s.id === destSectionId) {
                                    const destItems = Array.from(s.items);
                                    destItems.splice(destination.index, 0, movedItem);
                                    return { ...s, items: destItems };
                                }
                                return s;
                            })
                        };
                    }
                    if (t.id === destTabId && sourceTabId !== destTabId) {
                        return {
                            ...t,
                            sections: t.sections.map(s => {
                                if (s.id === destSectionId) {
                                    const destItems = Array.from(s.items);
                                    destItems.splice(destination.index, 0, movedItem);
                                    return { ...s, items: destItems };
                                }
                                return s;
                            })
                        };
                    }
                    return t;
                }));
            }
        }
    };

    const inputClass = "w-full px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-[10px] outline-none focus:border-primary-500 transition-all";

    return (
        <div className="space-y-4 px-2 pb-24">

            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="tabs" type="tab">
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                            {structure.map((tab, tabIndex) => (
                                <Draggable key={tab.id} draggableId={tab.id} index={tabIndex}>
                                    {(provided) => (
                                        <div ref={provided.innerRef} {...provided.draggableProps} className="bg-white border border-neutral-100 rounded-2xl shadow-sm overflow-hidden">
                                            <div className="flex items-center gap-3 p-4 bg-neutral-50/50 border-b border-neutral-100">
                                                <div {...provided.dragHandleProps} className="text-neutral-300 pointer-events-auto cursor-grab"><GripVertical size={16} /></div>
                                                <input
                                                    type="text"
                                                    value={tab.title}
                                                    onChange={(e) => updateTabTitle(tab.id, e.target.value)}
                                                    className="flex-1 bg-transparent border-none text-sm font-bold text-dark outline-none p-0 focus:ring-0"
                                                    placeholder="Nom de l'onglet"
                                                />
                                                <div className="flex items-center gap-1">
                                                    <button onClick={() => addSection(tab.id)} className="p-1.5 text-neutral-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-all" title="Ajouter une section">
                                                        <Plus size={16} />
                                                    </button>
                                                    <button onClick={() => removeTab(tab.id)} className="p-1.5 text-neutral-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                                                        <Trash2 size={16} />
                                                    </button>
                                                    <button onClick={() => toggleTab(tab.id)} className="p-1.5 text-neutral-400 hover:bg-neutral-100 rounded-lg transition-all ml-1">
                                                        {expandedTabs.includes(tab.id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                    </button>
                                                </div>
                                            </div>

                                            {expandedTabs.includes(tab.id) && (
                                                <div className="p-4 space-y-4">
                                                    {tab.sections.length === 0 && (
                                                        <div className="text-center py-8 border-2 border-dashed border-neutral-100 rounded-xl">
                                                            <p className="text-xs text-neutral-400 mb-2">Aucune section dans cet onglet</p>
                                                            <button onClick={() => addSection(tab.id)} className="text-xs font-bold text-primary-600 hover:underline">Créer ma première section</button>
                                                        </div>
                                                    )}
                                                    <Droppable droppableId={`sections-${tab.id}`} type="section">
                                                        {(provided) => (
                                                            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                                                                {tab.sections.map((section, sectionIndex) => (
                                                                    <Draggable key={section.id} draggableId={section.id} index={sectionIndex}>
                                                                        {(provided) => (
                                                                            <div ref={provided.innerRef} {...provided.draggableProps} className="border border-neutral-100 rounded-xl overflow-hidden shadow-sm">
                                                                                <div className="flex items-center gap-3 p-3 bg-neutral-50/30 border-b border-white">
                                                                                    <div {...provided.dragHandleProps} className="text-neutral-300 cursor-grab"><GripVertical size={14} /></div>
                                                                                    <input
                                                                                        type="text"
                                                                                        value={section.title}
                                                                                        onChange={(e) => updateSection(tab.id, section.id, { title: e.target.value })}
                                                                                        className="flex-1 bg-transparent border-none text-xs font-bold text-neutral-700 outline-none p-0 focus:ring-0"
                                                                                        placeholder="Titre de la section"
                                                                                    />
                                                                                    <div className="flex items-center gap-2">
                                                                                        <div className="flex bg-neutral-100 p-1 rounded-lg">
                                                                                            <button
                                                                                                onClick={() => updateSection(tab.id, section.id, { layout: 'list' })}
                                                                                                className={`p-1 rounded-md transition-all ${section.layout === 'list' ? 'bg-white text-primary-500 shadow-sm' : 'text-neutral-400'}`}
                                                                                            >
                                                                                                <List size={12} />
                                                                                            </button>
                                                                                            <button
                                                                                                onClick={() => updateSection(tab.id, section.id, { layout: 'carousel' })}
                                                                                                className={`p-1 rounded-md transition-all ${section.layout === 'carousel' ? 'bg-white text-primary-500 shadow-sm' : 'text-neutral-400'}`}
                                                                                            >
                                                                                                <LayoutGrid size={12} />
                                                                                            </button>
                                                                                        </div>
                                                                                        <button onClick={() => removeSection(tab.id, section.id)} className="p-1 text-neutral-300 hover:text-rose-500 transition-all">
                                                                                            <Trash2 size={14} />
                                                                                        </button>
                                                                                        <button onClick={() => toggleSection(section.id)} className="p-1 text-neutral-300 hover:bg-neutral-100 rounded-lg transition-all">
                                                                                            {expandedSections.includes(section.id) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                                                        </button>
                                                                                    </div>
                                                                                </div>

                                                                                {expandedSections.includes(section.id) && (
                                                                                    <div className="p-3 bg-white">
                                                                                        {section.items.length === 0 && (
                                                                                            <div className="text-center py-6 border border-dashed border-neutral-50 rounded-lg mb-3">
                                                                                                <p className="text-[10px] uppercase tracking-wider font-bold text-neutral-300">Ajoutez votre contenu ci-dessous</p>
                                                                                            </div>
                                                                                        )}
                                                                                        <Droppable droppableId={`items-${section.id}`} type="item">
                                                                                            {(provided) => (
                                                                                                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2 mb-3">
                                                                                                    {section.items.map((item, itemIndex) => (
                                                                                                        <Draggable key={item.id} draggableId={item.id} index={itemIndex}>
                                                                                                            {(provided) => (
                                                                                                                <div ref={provided.innerRef} {...provided.draggableProps} className="p-3 bg-neutral-50/50 border border-neutral-100 rounded-lg group">
                                                                                                                    <div className="flex items-center gap-3">
                                                                                                                        <div {...provided.dragHandleProps} className="text-neutral-300 cursor-grab"><GripVertical size={12} /></div>
                                                                                                                        <div className="flex-1 space-y-2">
                                                                                                                            <div className="flex items-center gap-2">
                                                                                                                                <span className={`px-1.5 py-0.5 rounded text-xs ${item.type === 'link' ? 'bg-blue-50 text-blue-600' :
                                                                                                                                    item.type === 'form' ? 'bg-amber-50 text-amber-600' :
                                                                                                                                        item.type === 'service' ? 'bg-emerald-50 text-emerald-600' : 'bg-purple-50 text-purple-600'
                                                                                                                                    }`}>
                                                                                                                                    {item.type}
                                                                                                                                </span>
                                                                                                                                <input
                                                                                                                                    type="text"
                                                                                                                                    value={item.title}
                                                                                                                                    onChange={(e) => updateItem(tab.id, section.id, item.id, { title: e.target.value })}
                                                                                                                                    className="flex-1 bg-transparent border-none text-xs font-bold text-dark outline-none p-0 focus:ring-0"
                                                                                                                                    placeholder="Titre de l'élément"
                                                                                                                                />
                                                                                                                                <button onClick={() => removeItem(tab.id, section.id, item.id)} className="opacity-0 group-hover:opacity-100 p-1 text-neutral-300 hover:text-rose-500 transition-all">
                                                                                                                                    <Trash2 size={12} />
                                                                                                                                </button>
                                                                                                                            </div>

                                                                                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                                                                                {item.type === 'link' && (
                                                                                                                                    <input
                                                                                                                                        type="url"
                                                                                                                                        value={item.url || ''}
                                                                                                                                        onChange={(e) => updateItem(tab.id, section.id, item.id, { url: e.target.value })}
                                                                                                                                        className={inputClass}
                                                                                                                                        placeholder="Lien externe (https://...)"
                                                                                                                                    />
                                                                                                                                )}
                                                                                                                                {item.type === 'form' && (
                                                                                                                                    <select
                                                                                                                                        value={item.targetId || ''}
                                                                                                                                        onChange={(e) => updateItem(tab.id, section.id, item.id, { targetId: e.target.value, title: availableForms.find(f => f.id === e.target.value)?.title || item.title })}
                                                                                                                                        className={inputClass}
                                                                                                                                    >
                                                                                                                                        <option value="">Sélectionner un formulaire</option>
                                                                                                                                        {availableForms.map(f => <option key={f.id} value={f.id}>{f.title}</option>)}
                                                                                                                                    </select>
                                                                                                                                )}
                                                                                                                                {item.type === 'service' && (
                                                                                                                                    <select
                                                                                                                                        value={item.targetId || ''}
                                                                                                                                        onChange={(e) => updateItem(tab.id, section.id, item.id, { targetId: e.target.value, title: availableServices.find(s => s.id === e.target.value)?.name || item.title })}
                                                                                                                                        className={inputClass}
                                                                                                                                    >
                                                                                                                                        <option value="">Sélectionner un service</option>
                                                                                                                                        {availableServices.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                                                                                                                    </select>
                                                                                                                                )}
                                                                                                                                <div className="flex gap-2">
                                                                                                                                    <div className="flex-1 flex gap-2">
                                                                                                                                        <label className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-white border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-50 transition-all shadow-sm">
                                                                                                                                            <input type="file" accept="image/*" className="hidden"
                                                                                                                                                onChange={async (e) => {
                                                                                                                                                    if (e.target.files?.[0]) {
                                                                                                                                                        const file = e.target.files[0];
                                                                                                                                                        const reader = new FileReader();
                                                                                                                                                        reader.onload = () => {
                                                                                                                                                            setCropperItem({
                                                                                                                                                                tabId: tab.id,
                                                                                                                                                                sectionId: section.id,
                                                                                                                                                                itemId: item.id,
                                                                                                                                                                imageUrl: reader.result as string
                                                                                                                                                            });
                                                                                                                                                        };
                                                                                                                                                        reader.readAsDataURL(file);
                                                                                                                                                    }
                                                                                                                                                }}
                                                                                                                                            />
                                                                                                                                            <ImageIcon size={10} className="text-neutral-400" />
                                                                                                                                            <span className="text-xs font-bold text-neutral-500">{item.imageUrl ? 'Image OK' : 'Upload Image'}</span>
                                                                                                                                        </label>

                                                                                                                                        <button
                                                                                                                                            onClick={() => setIconPickerItem({ tabId: tab.id, sectionId: section.id, itemId: item.id })}
                                                                                                                                            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-all shadow-sm"
                                                                                                                                        >
                                                                                                                                            <Plus size={10} className="text-neutral-400" />
                                                                                                                                            <span className="text-xs font-bold text-neutral-500">{item.iconName ? 'Icon OK' : 'Choisir Icon'}</span>
                                                                                                                                        </button>
                                                                                                                                    </div>

                                                                                                                                    <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-neutral-200 shadow-sm shrink-0 flex items-center justify-center bg-white">
                                                                                                                                        {item.imageUrl ? (
                                                                                                                                            <img src={item.imageUrl} className="w-full h-full object-cover" />
                                                                                                                                        ) : item.iconName ? (
                                                                                                                                            (() => {
                                                                                                                                                const Icon = (LucideIcons as any)[item.iconName!];
                                                                                                                                                return Icon ? <Icon size={16} className="text-primary-500" /> : <Sparkles size={16} className="text-neutral-300" />;
                                                                                                                                            })()
                                                                                                                                        ) : item.type === 'link' ? (
                                                                                                                                            <Link2 size={14} className="text-neutral-300" />
                                                                                                                                        ) : item.type === 'form' ? (
                                                                                                                                            <Star size={14} className="text-neutral-300" />
                                                                                                                                        ) : item.type === 'service' ? (
                                                                                                                                            <Briefcase size={14} className="text-neutral-300" />
                                                                                                                                        ) : (
                                                                                                                                            <Calendar size={14} className="text-neutral-300" />
                                                                                                                                        )}
                                                                                                                                        {(item.imageUrl || item.iconName) && (
                                                                                                                                            <button
                                                                                                                                                onClick={() => updateItem(tab.id, section.id, item.id, { imageUrl: undefined, iconName: undefined })}
                                                                                                                                                className="absolute top-0 right-0 -m-1.5 p-0.5 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                                                                                                                            >
                                                                                                                                                <X size={8} strokeWidth={3} />
                                                                                                                                            </button>
                                                                                                                                        )}
                                                                                                                                    </div>
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            )}
                                                                                                        </Draggable>
                                                                                                    ))}
                                                                                                    {provided.placeholder}
                                                                                                </div>
                                                                                            )}
                                                                                        </Droppable>

                                                                                        <div className="flex flex-wrap gap-2 justify-center pt-2 border-t border-dashed border-neutral-100">
                                                                                            <button onClick={() => addItem(tab.id, section.id, 'link')} className="flex items-center gap-1 px-2 py-1 rounded bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition-all">
                                                                                                <Link2 size={10} /> + LIEN
                                                                                            </button>
                                                                                            <button onClick={() => addItem(tab.id, section.id, 'form')} className="flex items-center gap-1 px-2 py-1 rounded bg-amber-50 text-amber-600 text-xs font-semibold hover:bg-amber-100 transition-all">
                                                                                                <Star size={10} /> + FORMULAIRE
                                                                                            </button>
                                                                                            <button onClick={() => addItem(tab.id, section.id, 'service')} className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-50 text-emerald-600 text-xs font-semibold hover:bg-emerald-100 transition-all">
                                                                                                <Briefcase size={10} /> + SERVICE
                                                                                            </button>
                                                                                            <button onClick={() => addItem(tab.id, section.id, 'calendar')} className="flex items-center gap-1 px-2 py-1 rounded bg-purple-50 text-purple-600 text-xs font-semibold hover:bg-purple-100 transition-all">
                                                                                                <Calendar size={10} /> + CALENDRIER
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </Draggable>
                                                                ))}
                                                                {provided.placeholder}
                                                            </div>
                                                        )}
                                                    </Droppable>
                                                    <button onClick={() => addSection(tab.id)} className="w-full py-2 border-2 border-dashed border-neutral-100 rounded-xl text-neutral-400 hover:text-primary-500 hover:border-primary-200 hover:bg-primary-50 transition-all text-xs font-semibold flex items-center justify-center gap-2">
                                                        <Plus size={14} /> Ajouter une section
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            {structure.length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl border border-neutral-100 shadow-sm">
                    <Settings2 size={40} className="mx-auto text-neutral-200 mb-3" />
                    <h4 className="text-sm font-bold text-dark mb-1">Aucune structure définie</h4>
                    <p className="text-xs text-neutral-400 mb-4 max-w-xs mx-auto">Commencez par ajouter un onglet pour organiser vos liens, services et formulaires.</p>
                    <button onClick={addTab} className="px-6 py-2 bg-primary-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-primary-500/20 hover:scale-[1.02] active:scale-95 transition-all">
                        Créer ma structure
                    </button>
                </div>
            )}

            {iconPickerItem && (
                <IconPicker
                    value={structure.find(t => t.id === iconPickerItem.tabId)?.sections.find(s => s.id === iconPickerItem.sectionId)?.items.find(i => i.id === iconPickerItem.itemId)?.iconName}
                    onChange={(iconName) => updateItem(iconPickerItem.tabId, iconPickerItem.sectionId, iconPickerItem.itemId, { iconName, imageUrl: undefined })}
                    onClose={() => setIconPickerItem(null)}
                />
            )}

            {cropperItem && (
                <ImageCropper
                    image={cropperItem.imageUrl}
                    onCancel={() => setCropperItem(null)}
                    onCropComplete={async (blob) => {
                        const file = new File([blob], 'cropped_image.jpg', { type: 'image/jpeg' });
                        const url = await onUploadImage(file);
                        if (url) {
                            updateItem(cropperItem.tabId, cropperItem.sectionId, cropperItem.itemId, { imageUrl: url, iconName: undefined });
                        }
                        setCropperItem(null);
                    }}
                />
            )}
        </div>
    );
}
