import { useState, useEffect, useRef } from 'react';
import { useChatStore } from '../../stores/useChatStore';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';
import { useMessages } from '../../hooks/useMessages';
import { MoreVertical, Search, Video, Smile, Plus, CheckCheck, Bot, User, HandHelping, RotateCcw, StickyNote, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { AudioPlayer } from './AudioPlayer';
import { OrderPanel } from './OrderPanel';
import { DevisModal } from './DevisModal';

export function ChatPanel({ conversationId }: { conversationId: string }) {
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [devisOpen, setDevisOpen] = useState(false);
  const rawMessages = useChatStore(state => state.messages[conversationId]);
  const messages = rawMessages || [];
  const conversations = useChatStore(state => state.conversations);
  const updateConversation = useChatStore(state => state.updateConversation);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { config } = useApp();
  const conversation = conversations.find(c => c.id === conversationId);
  const isFreelance = config?.mode_freelance === true;

  // Real-time messages hook
  useMessages(conversationId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!conversation) return null;

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#EFEAE2] relative overflow-hidden h-full">
      {/* Background */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none z-0" style={{ backgroundImage: 'url("https://web.whatsapp.com/img/bg-chat-tile-light_a4a34f9660371661.png")' }} />

      {/* Header */}
      <header className="px-4 py-2 bg-[#F0F2F5] flex items-center justify-between shrink-0 z-10 border-b border-[#E9EDEF]">
        <div className="flex items-center gap-3 min-w-0 cursor-pointer">
          <div className="w-10 h-10 bg-[#DFE5E7] rounded-full flex items-center justify-center text-white shrink-0 overflow-hidden font-bold">
             {conversation.contact_name?.[0]?.toUpperCase() || <User size={24} />}
          </div>
          <div className="min-w-0">
            <h3 className="font-medium text-[#111B21] truncate text-[16px] leading-tight">
              {conversation.contact_name || conversation.contact_phone}
            </h3>
            <p className="text-[12px] text-[#00A884] truncate font-semibold">
              {conversation.ai_active ? '🤖 IA Active' : '👤 Agent humain'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <HITLControls conversation={conversation} onUpdate={(updates) => updateConversation(conversation.id, updates)} />
           <OrderPanel conversationId={conversation.id} contactId={conversation.contact_id} />

           {/* Freelance mode — Créer Devis */}
           {isFreelance && (
             <button
               onClick={() => setDevisOpen(true)}
               className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-[#F0FDF4] border border-[#BBF7D0] text-[#00A884] rounded-full text-[12px] font-bold hover:bg-[#DCFCE7] transition-all"
               title="Créer un devis depuis cette conversation"
             >
               <FileText size={14} />
               Créer Devis
             </button>
           )}

           <div className="h-8 w-px bg-[#D1D7DB] mx-1 hidden md:block" />
           <div className="flex items-center gap-1 text-[#54656F]">
              <button className="hover:bg-[#D1D7DB] p-2 rounded-full transition-colors"><Video size={20} /></button>
              <button className="hover:bg-[#D1D7DB] p-2 rounded-full transition-colors"><Search size={20} /></button>
              <button className="hover:bg-[#D1D7DB] p-2 rounded-full transition-colors"><MoreVertical size={20} /></button>
           </div>
        </div>
      </header>

      {/* Devis Modal */}
      {devisOpen && (
        <DevisModal
          conversationId={conversationId}
          contactId={conversation.contact_id}
          contactName={conversation.contact_name || conversation.contact_phone || 'Contact'}
          onClose={() => setDevisOpen(false)}
        />
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 md:px-10 py-4 space-y-1 relative z-10 scrollbar-hide">
        {messages.map((msg: any) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isAiThinking && <TypingIndicator />}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      <MessageInput conversationId={conversationId} />
    </div>
  );
}

function HITLControls({ conversation, onUpdate }: { conversation: any, onUpdate: (u: any) => void }) {
  const handleToggleAi = async () => {
    const newState = !conversation.ai_active;
    const { error } = await supabase
      .from('conversations')
      .update({ ai_active: newState })
      .eq('id', conversation.id);
    
    if (!error) onUpdate({ ai_active: newState });
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleToggleAi}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold transition-all border shadow-sm ${
          conversation.ai_active 
            ? 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200' 
            : 'bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200'
        }`}
      >
        {conversation.ai_active ? <HandHelping size={14} /> : <RotateCcw size={14} />}
        {conversation.ai_active ? 'Prendre la main' : 'Repasser à l\'IA'}
      </button>
      
      {conversation.status === 'pending_human' && (
        <span className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-rose-500 text-white rounded-full text-[11px] font-bold animate-pulse shadow-sm">
          ⚠️ Agent requis
        </span>
      )}
    </div>
  );
}

function MessageBubble({ message }: { message: any }) {
  const isOutbound = message.direction === 'outbound';
  if (message.type === 'note') return <InternalNote message={message} />;

  return (
    <div className={`flex ${isOutbound ? 'justify-end' : 'justify-start'} mb-2`}>
       <div className={`wa-bubble ${isOutbound ? 'wa-bubble-sent' : 'wa-bubble-recv'}`}>
          {message.is_ai_generated && (
            <div className={`text-[10px] font-bold flex items-center gap-1 mb-1 ${isOutbound ? 'text-emerald-700' : 'text-indigo-600'}`}>
              <Bot size={12} /> Réponse IA
            </div>
          )}

          <div className="text-[14.2px] text-[#111B21] break-words whitespace-pre-wrap pr-16 leading-normal">
            {message.type === 'image' ? (
              <img src={message.media_url} alt="" className="rounded-lg max-w-full h-auto mb-1" />
            ) : message.type === 'audio' ? (
              <AudioPlayer url={message.media_url} />
            ) : (
              message.content
            )}
          </div>
          
          <div className="absolute bottom-1 right-2 flex items-center gap-1 select-none">
            <span className="text-[11px] text-[#667781]">
              {format(new Date(message.created_at || Date.now()), 'HH:mm')}
            </span>
            {isOutbound && (
               <div className="flex">
                  <CheckCheck size={14} className={message.status === 'read' ? 'text-[#53BDEB]' : 'text-[#8696A0]'} />
               </div>
            )}
          </div>
       </div>
    </div>
  );
}

function InternalNote({ message }: { message: any }) {
  return (
    <div className="flex justify-center my-4">
       <div className="bg-[#FFF9C4]/90 px-5 py-3 rounded-2xl text-[13px] font-medium text-[#827717] border border-[#FFF176] shadow-sm max-w-[85%] text-center">
          <div className="flex items-center justify-center gap-2 mb-1 text-[11px] font-bold uppercase tracking-wider opacity-70">
             <StickyNote size={12} /> Note Interne
          </div>
          {message.content}
       </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-white/50 rounded-xl w-fit border border-white/20 ml-2">
      <div className="flex gap-1">
        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-[12px] font-medium text-gray-500">IA réfléchit...</span>
    </div>
  );
}

function MessageInput({ conversationId }: { conversationId: string }) {
  const [text, setText] = useState('');
  const [isNote, setIsNote] = useState(false);
  const [sending, setSending] = useState(false);
  const { tenantId } = useApp();
  const addMessage = useChatStore(state => state.addMessage);

  const handleSend = async () => {
    if (!text.trim() || !tenantId || sending) return;
    const content = text;
    setText('');
    setSending(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const res = await fetch(`${apiUrl}/conversations/${conversationId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_id: tenantId, text: content, type: isNote ? 'note' : 'text' }),
      });
      const result = await res.json();
      if (result.message) {
        addMessage({ ...result.message, conversationId });
      }
    } catch (err) {
      console.error('Failed to send message', err);
      setText(content);
    } finally {
      setSending(false);
    }
  };

  return (
    <footer className={`px-4 py-2 flex items-center gap-3 shrink-0 z-10 border-t transition-colors ${isNote ? 'bg-[#FFFDE7]' : 'bg-[#F0F2F5]'}`}>
       <div className="flex items-center gap-1 text-[#54656F]">
          <button className="p-2 hover:bg-[#D1D7DB] rounded-full transition-colors"><Smile size={24} /></button>
          <button className="p-2 hover:bg-[#D1D7DB] rounded-full transition-colors" onClick={() => setIsNote(!isNote)}>
             {isNote ? <StickyNote size={24} className="text-amber-600" /> : <Plus size={24} />}
          </button>
       </div>
       
       <div className="flex-1 bg-white rounded-lg px-3 py-1.5 flex flex-col">
          {isNote && (
             <div className="text-[10px] font-bold text-amber-600 uppercase tracking-widest px-1 py-0.5">Note Interne</div>
          )}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={isNote ? "Ajouter une note interne..." : "Écrire un message..."}
            className="w-full bg-transparent border-none focus:ring-0 text-[15px] text-[#111B21] placeholder:text-[#667781] resize-none py-1 h-9 max-h-32 scrollbar-hide"
            rows={1}
          />
       </div>

       <button 
         onClick={handleSend}
         className="p-2 text-[#54656F] hover:bg-[#D1D7DB] rounded-full transition-colors"
       >
          <SendIcon />
       </button>
    </footer>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" height="24" width="24" fill="currentColor" className="text-[#54656F]"><path d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"></path></svg>
  );
}
