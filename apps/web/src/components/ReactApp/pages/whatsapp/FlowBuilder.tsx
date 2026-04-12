import { useState, useCallback, useEffect, useRef } from 'react';
import ReactFlow, { 
  Controls, 
  Background, 
  applyEdgeChanges, 
  applyNodeChanges,
  addEdge,
  Panel,
  Handle,
  Position,
  type Connection,
  type Edge,
  type Node,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  Zap, 
  MessageSquare, 
  Split, 
  Clock, 
  Save, 
  Plus, 
  UserPlus,
  Package,
  ChevronRight,
  Trash2,
  X,
  Image as ImageIcon,
  MousePointer2,
  List as ListIcon,
  FileText,
  Tag,
  Kanban,
  Repeat,
  GitBranch
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';
import { toast } from 'react-hot-toast';

/* ─── CUSTOM NODES (Premium Light Style) ─── */
const TriggerNode = ({ data }: any) => (
  <div className="bg-white p-5 rounded-3xl border-2 border-[#00A884] shadow-2xl min-w-[240px] ring-8 ring-[#00A884]/5">
    <div className="flex items-center gap-2 mb-4">
      <div className="bg-[#00A884] p-2 rounded-xl text-white shadow-lg shadow-[#00A884]/20">
        <Zap size={16} fill="white" />
      </div>
      <div className="flex flex-col">
          <span className="text-[10px] font-black text-[#00A884] uppercase tracking-[0.2em]">Déclencheur</span>
          <span className="text-[15px] font-extrabold text-[#111B21]">{data.label || 'Nouveau Message'}</span>
      </div>
    </div>
    <div className="bg-[#F0F2F5] px-3 py-2 rounded-xl text-[12px] font-bold text-[#54656F] flex flex-col gap-1">
       <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00A884]" />
          <span>Mots-clés: {data.keywords || 'Tous'}</span>
       </div>
       <div className="text-[10px] font-black text-[#8696A0] uppercase tracking-wider ml-3.5 italic">
          Match: {data.matchType || 'Contains'}
       </div>
    </div>
    <Handle type="source" position={Position.Bottom} className="w-4 h-4 bg-[#00A884] border-4 border-white shadow-sm" />
  </div>
);

const ActionNode = ({ data, selected }: any) => {
  const iconMap: any = {
    message: <MessageSquare size={16} />,
    media: <ImageIcon size={16} />,
    buttons: <MousePointer2 size={16} />,
    list: <ListIcon size={16} />,
    template: <FileText size={16} />,
    condition: <Split size={16} />,
    wait: <Clock size={16} />,
    hitl: <UserPlus size={16} />,
    stock: <Package size={16} />,
    tag: <Tag size={16} />,
    pipeline: <Kanban size={16} />,
    noreply: <Repeat size={16} />,
  };

  const colorMap: any = {
    message: 'text-blue-600 bg-blue-50 border-blue-100',
    media: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    buttons: 'text-[#00A884] bg-[#E7F3EF] border-[#00A884]/20',
    list: 'text-[#00A884] bg-[#E7F3EF] border-[#00A884]/20',
    template: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    condition: 'text-purple-600 bg-purple-50 border-purple-100',
    wait: 'text-rose-600 bg-rose-50 border-rose-100',
    hitl: 'text-red-600 bg-red-50 border-red-200',
    stock: 'text-amber-600 bg-amber-50 border-amber-200',
    tag: 'text-teal-600 bg-teal-50 border-teal-100',
    pipeline: 'text-cyan-600 bg-cyan-50 border-cyan-100',
    noreply: 'text-slate-600 bg-slate-50 border-slate-200',
  };

  const isMultiHandle = data.icon === 'buttons' || data.icon === 'condition' || data.icon === 'list';

  return (
    <div className={`bg-white p-5 rounded-3xl border ${selected ? 'border-[#00A884] ring-4 ring-[#00A884]/10 shadow-2xl' : 'border-[#D1D7DB] shadow-lg'} min-w-[240px] transition-all group`}>
      <Handle type="target" position={Position.Top} className="w-4 h-4 bg-white border-4 border-[#D1D7DB]" />
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-xl border ${colorMap[data.icon] || 'bg-[#F0F2F5]'}`}>
          {iconMap[data.icon]}
        </div>
        <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8696A0]">{data.type || 'ACTION'}</span>
            <span className="text-[15px] font-extrabold text-[#111B21]">{data.label}</span>
        </div>
      </div>
      <p className="text-[12px] text-[#667781] leading-relaxed line-clamp-2 font-medium bg-[#F8F9FA] p-3 rounded-2xl">{data.description || 'Configurez cette étape.'}</p>
      
      {!isMultiHandle && (
        <Handle type="source" position={Position.Bottom} className="w-4 h-4 bg-[#111B21] border-4 border-white shadow-sm" />
      )}
      
      {data.icon === 'buttons' && (
        <div className="flex justify-around mt-4 pt-4 border-t border-[#F0F2F5]">
           {[1,2,3].map(i => (
             <div key={i} className="relative flex flex-col items-center">
                <span className="text-[9px] font-black text-[#8696A0] mb-2">BTN {i}</span>
                <Handle 
                  type="source" 
                  position={Position.Bottom} 
                  id={`btn_${i}`} 
                  className="w-4 h-4 bg-[#00A884] border-4 border-white shadow-sm static" 
                />
             </div>
           ))}
        </div>
      )}

      {data.icon === 'condition' && (
        <div className="flex justify-between mt-4 pt-4 border-t border-[#F0F2F5]">
           <div className="relative flex flex-col items-center">
              <span className="text-[9px] font-black text-[#00A884] mb-2 uppercase">Vrai</span>
              <Handle type="source" position={Position.Bottom} id="true" className="w-4 h-4 bg-[#00A884] border-4 border-white shadow-sm static" />
           </div>
           <div className="relative flex flex-col items-center">
              <span className="text-[9px] font-black text-rose-500 mb-2 uppercase">Faux</span>
              <Handle type="source" position={Position.Bottom} id="false" className="w-4 h-4 bg-rose-500 border-4 border-white shadow-sm static" />
           </div>
        </div>
      )}
    </div>
  );
};

const nodeTypes = {
  trigger: TriggerNode,
  logic: ActionNode,
};

function FlowEditor() {
  const { tenantId } = useApp();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const { screenToFlowPosition } = useReactFlow();

  const onNodesChange = useCallback((changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#00A884', strokeWidth: 3 } }, eds)), []);

  const onNodeClick = (_: any, node: Node) => setSelectedNode(node);
  const onPaneClick = () => setSelectedNode(null);

  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: any) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      const label = event.dataTransfer.getData('label');
      const icon = event.dataTransfer.getData('icon');

      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: `node_${Date.now()}`,
        type: type === 'trigger' ? 'trigger' : 'logic',
        position,
        data: { label, icon, type: label.toUpperCase(), description: 'Cliquez pour configurer cette action WhatsApp.' },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition]
  );

  const saveFlow = async () => {
    if (!tenantId) return;
    try {
      const { error } = await supabase.from('flows').upsert({
        tenant_id: tenantId,
        name: 'Mon Automation WhatsApp',
        trigger_type: 'message_received',
        nodes_json: nodes,
        edges_json: edges,
        active: true,
      });
      if (error) throw error;
      toast.success('Flow sauvegardé avec succès !');
    } catch (err: any) {
      toast.error('Erreur lors de la sauvegarde: ' + err.message);
    }
  };

  return (
    <div className="flex h-full bg-[#F0F2F5] overflow-hidden font-sans">
      {/* Sidebar Palette - Premium Design */}
      <div className="w-85 bg-white border-r border-[#D1D7DB] flex flex-col shadow-2xl z-20 overflow-hidden">
        <div className="p-8 border-b border-[#E9EDEF] bg-[#F0F2F5]/30">
          <div className="flex items-center gap-3 mb-2">
             <div className="w-9 h-9 bg-[#111B21] rounded-xl flex items-center justify-center text-white shadow-lg">
                <GitBranch size={18} />
             </div>
             <h1 className="text-xl font-black text-[#111B21] tracking-tight">Flow Builder</h1>
          </div>
          <p className="text-[11px] font-bold text-[#8696A0] uppercase tracking-[0.2em]">Automatisations No-Code</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-10 scrollbar-hide bg-[#FBFBFB]">
          <section>
            <div className="flex items-center justify-between mb-5">
               <h4 className="text-[11px] font-black text-[#8696A0] uppercase tracking-[0.3em]">Déclencheurs</h4>
               <div className="h-[1px] flex-1 bg-[#E9EDEF] ml-4" />
            </div>
            <DraggablePaletteItem type="trigger" icon={Zap} color="bg-emerald-50 text-[#00A884]" label="Message Entrant" />
          </section>

          <section>
            <div className="flex items-center justify-between mb-5">
               <h4 className="text-[11px] font-black text-[#8696A0] uppercase tracking-[0.3em]">Messages & Média</h4>
               <div className="h-[1px] flex-1 bg-[#E9EDEF] ml-4" />
            </div>
            <div className="space-y-3">
              <DraggablePaletteItem type="message" icon={MessageSquare} color="bg-blue-50 text-blue-600" label="Simple Texte" />
              <DraggablePaletteItem type="media" icon={ImageIcon} color="bg-indigo-50 text-indigo-600" label="Média (Image/Vid)" />
              <DraggablePaletteItem type="buttons" icon={MousePointer2} color="bg-[#E7F3EF] text-[#00A884]" label="Boutons Intéractifs" />
              <DraggablePaletteItem type="list" icon={ListIcon} color="bg-[#E7F3EF] text-[#00A884]" label="Menu Liste" />
              <DraggablePaletteItem type="template" icon={FileText} color="bg-emerald-50 text-emerald-700" label="Template Meta" />
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-5">
               <h4 className="text-[11px] font-black text-[#8696A0] uppercase tracking-[0.3em]">CRM & Actions</h4>
               <div className="h-[1px] flex-1 bg-[#E9EDEF] ml-4" />
            </div>
            <div className="space-y-3">
              <DraggablePaletteItem type="tag" icon={Tag} color="bg-teal-50 text-teal-600" label="Gérer les Tags" />
              <DraggablePaletteItem type="pipeline" icon={Kanban} color="bg-cyan-50 text-cyan-600" label="Move Pipeline" />
              <DraggablePaletteItem type="hitl" icon={UserPlus} color="bg-red-50 text-red-600" label="Transfert Humain" />
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-5">
               <h4 className="text-[11px] font-black text-[#8696A0] uppercase tracking-[0.3em]">Logique Avancée</h4>
               <div className="h-[1px] flex-1 bg-[#E9EDEF] ml-4" />
            </div>
            <div className="space-y-3">
              <DraggablePaletteItem type="condition" icon={Split} color="bg-purple-50 text-purple-600" label="Condition Smart" />
              <DraggablePaletteItem type="wait" icon={Clock} color="bg-rose-50 text-rose-600" label="Délai d'Attente" />
              <DraggablePaletteItem type="noreply" icon={Repeat} color="bg-slate-50 text-slate-600" label="Si pas de réponse" />
              <DraggablePaletteItem type="stock" icon={Package} color="bg-amber-50 text-amber-600" label="Vérifier Stock" />
            </div>
          </section>
        </div>

        <div className="p-8 border-t border-[#E9EDEF] bg-white">
          <button 
            onClick={saveFlow}
            className="w-full bg-[#111B21] text-white py-4 rounded-2xl font-black text-[13px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl hover:bg-[#00A884] transition-all duration-300"
          >
            <Save size={20} /> Sauvegarder Flow
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden bg-[#F0F2F5]" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background color="#D1D7DB" gap={30} size={1} />
          <Controls className="bg-white border text-[#111B21] border-[#D1D7DB] rounded-2xl shadow-xl p-1" />
          
          <Panel position="top-right" className="flex flex-col gap-3">
             <div className="bg-white/95 backdrop-blur-sm border border-[#D1D7DB] px-5 py-2.5 rounded-2xl flex items-center gap-3 shadow-xl">
                <div className="w-2.5 h-2.5 rounded-full bg-[#00A884] animate-pulse" />
                <span className="text-[12px] font-black text-[#111B21] uppercase tracking-wider">Moteur IA Actif</span>
             </div>
             <button 
                onClick={() => setIsPublished(!isPublished)}
                className={`${isPublished ? 'bg-[#EA0038]' : 'bg-[#00A884]'} text-white px-5 py-2.5 rounded-2xl font-black text-[12px] uppercase tracking-wider shadow-xl hover:scale-105 transition-all flex items-center gap-2`}
             >
                {isPublished ? <X size={14} /> : <Zap size={14} fill="white" />}
                {isPublished ? 'Dépublier Flow' : 'Publier Flow'}
             </button>
          </Panel>
        </ReactFlow>

        {/* Settings Drawer (Right Side) */}
        {selectedNode && (
          <div className="absolute right-8 top-8 bottom-8 w-100 bg-white border border-[#D1D7DB] rounded-[40px] shadow-2xl z-30 flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden">
             <div className="p-8 border-b border-[#F0F2F5] flex items-center justify-between bg-[#FBFBFB]">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-[#F0F2F5] rounded-2xl flex items-center justify-center text-[#111B21]">
                      {selectedNode.type === 'trigger' ? <Zap size={24} /> : <MessageSquare size={24} />}
                   </div>
                   <div>
                      <h3 className="font-black text-[#111B21] text-lg uppercase tracking-tight leading-none">{selectedNode.data.label}</h3>
                      <p className="text-[10px] text-[#8696A0] font-black uppercase tracking-[0.2em] mt-2">ID: {selectedNode.id}</p>
                   </div>
                </div>
                <button onClick={() => setSelectedNode(null)} className="p-3 hover:bg-[#F0F2F5] rounded-2xl text-[#54656F] transition-all"><X size={24} /></button>
             </div>

             <div className="flex-1 p-8 space-y-8 overflow-y-auto scrollbar-hide">
                <div className="space-y-6">
                   <div>
                      <label className="text-[11px] font-black text-[#8696A0] uppercase tracking-[0.2em] block mb-3">Titre de l'étape</label>
                      <input 
                        type="text" 
                        value={selectedNode.data.label}
                        onChange={(e) => {
                          const newLabel = e.target.value;
                          setNodes(nds => nds.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, label: newLabel } } : n));
                          setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, label: newLabel } });
                        }}
                        className="w-full bg-[#F0F2F5] border-2 border-transparent focus:border-[#00A884] focus:bg-white rounded-2xl px-5 py-4 text-[15px] font-bold text-[#111B21] outline-none transition-all"
                      />
                   </div>

                   {selectedNode.type === 'trigger' ? (
                      <div className="space-y-6">
                        <div>
                          <label className="text-[11px] font-black text-[#8696A0] uppercase tracking-[0.2em] block mb-3">Mots-clés (séparés par virgule)</label>
                          <input 
                            type="text" 
                            value={selectedNode.data.keywords || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setNodes(nds => nds.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, keywords: val } } : n));
                              setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, keywords: val } });
                            }}
                            className="w-full bg-[#F0F2F5] border-2 border-transparent focus:border-[#00A884] focus:bg-white rounded-2xl px-5 py-4 text-[15px] font-bold text-[#111B21] outline-none transition-all"
                            placeholder="Ex: prix, commande, info"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-black text-[#8696A0] uppercase tracking-[0.2em] block mb-3">Type de Match</label>
                          <select 
                            value={selectedNode.data.matchType || 'Contains'}
                            onChange={(e) => {
                              const val = e.target.value;
                              setNodes(nds => nds.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, matchType: val } } : n));
                              setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, matchType: val } });
                            }}
                            className="w-full bg-[#F0F2F5] border-2 border-transparent focus:border-[#00A884] focus:bg-white rounded-2xl px-5 py-4 text-[15px] font-bold text-[#111B21] transition-all outline-none"
                          >
                             <option value="Exact">Mot exact</option>
                             <option value="Contains">Contient</option>
                             <option value="Fuzzy">Fuzzy (IA)</option>
                          </select>
                        </div>
                      </div>
                   ) : (
                      <div>
                        <label className="text-[11px] font-black text-[#8696A0] uppercase tracking-[0.2em] block mb-3">Contenu du Message</label>
                        <textarea 
                          className="w-full bg-[#F0F2F5] border-2 border-transparent focus:border-[#00A884] focus:bg-white rounded-2xl px-5 py-4 text-[15px] font-bold text-[#111B21] outline-none transition-all h-48 resize-none leading-relaxed"
                          value={selectedNode.data.description}
                          onChange={(e) => {
                            const newDesc = e.target.value;
                            setNodes(nds => nds.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, description: newDesc } } : n));
                            setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, description: newDesc } });
                          }}
                        />
                        <p className="text-[10px] text-[#8696A0] font-bold mt-2 italic">Supporte le markdown WhatsApp (*gras*, _italique_)</p>
                      </div>
                   )}
                </div>
             </div>

             <div className="p-8 border-t border-[#F0F2F5] bg-[#FBFBFB]">
                <button 
                   onClick={() => {
                     setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
                     setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
                     setSelectedNode(null);
                   }}
                   className="w-full py-4 text-rose-500 font-black text-[12px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-rose-50 rounded-2xl transition-all"
                >
                   <Trash2 size={20} /> Supprimer l'étape
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DraggablePaletteItem({ type, icon: Icon, color, label }: any) {
  const onDragStart = (event: any, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('label', label);
    event.dataTransfer.setData('icon', type === 'trigger' ? 'zap' : type);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div 
      draggable 
      onDragStart={(e) => onDragStart(e, type)}
      className="flex items-center gap-4 p-5 bg-white border border-[#D1D7DB] rounded-3xl hover:border-[#00A884] hover:shadow-xl transition-all cursor-grab active:cursor-grabbing group shadow-sm"
    >
       <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${color} shadow-sm border border-black/5 group-hover:scale-110 transition-transform`}>
          <Icon size={20} strokeWidth={2.5} />
       </div>
       <div className="flex-1">
          <span className="text-[14px] font-extrabold text-[#111B21] block leading-tight">{label}</span>
          <span className="text-[10px] text-[#8696A0] font-black uppercase tracking-wider">Drag & Drop</span>
       </div>
       <ChevronRight size={18} className="text-[#D1D7DB] group-hover:text-[#00A884] transform group-hover:translate-x-1 transition-all" />
    </div>
  );
}

export default function FlowBuilder() {
  return (
    <div className="h-full w-full">
       <ReactFlowProvider>
          <FlowEditor />
       </ReactFlowProvider>
    </div>
  );
}
