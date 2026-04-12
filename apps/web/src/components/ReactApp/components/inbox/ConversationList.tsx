import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useChatStore } from '../../stores/useChatStore';
import { Search, MoreVertical, PlusSquare, Check, CheckCheck, Bot, User, Clock, CheckCircle2 } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';

export function ConversationList() {
  const navigate = useNavigate();
  const { conversationId: activeId } = useParams();
  const { conversations } = useChatStore();
  const [search, setSearch] = useState('');
  const [activeChip, setActiveChip] = useState('all');

  const chips = [
    { key: 'all', label: 'Tous' },
    { key: 'ai_active', label: '🤖 IA Active' },
    { key: 'pending', label: '⏳ En attente' },
    { key: 'human', label: '👤 Humain' },
    { key: 'resolved', label: '✅ Résolu' },
  ];

  const filteredConversations = useMemo(() => {
    return conversations.filter(conv => {
      const matchesSearch = 
        conv.contact_name?.toLowerCase().includes(search.toLowerCase()) ||
        conv.contact_phone?.includes(search) ||
        conv.last_message?.content?.toLowerCase().includes(search.toLowerCase());
      
      if (!matchesSearch) return false;
      
      if (activeChip === 'all') return true;
      if (activeChip === 'ai_active') return conv.ai_active;
      if (activeChip === 'pending') return conv.status === 'pending_human';
      if (activeChip === 'human') return !conv.ai_active && conv.status !== 'resolved';
      if (activeChip === 'resolved') return conv.status === 'resolved';
      
      return true;
    });
  }, [conversations, search, activeChip]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* WhatsApp Header */}
      <div className="px-4 py-4 flex items-center justify-between">
        <h2 className="text-[22px] font-bold text-[#111B21]">Chats</h2>
        <div className="flex items-center gap-5 text-[#54656F]">
           <button className="hover:bg-[#F0F2F5] p-1 rounded-full transition-colors"><PlusSquare size={20} /></button>
           <button className="hover:bg-[#F0F2F5] p-1 rounded-full transition-colors"><MoreVertical size={20} /></button>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="px-3 pb-2">
        <div className="relative flex items-center bg-[#F0F2F5] rounded-lg px-3 py-1.5 focus-within:bg-white focus-within:ring-1 focus-within:ring-[#E9EDEF]">
          <Search className="text-[#54656F] mr-3" size={16} />
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border-none text-[14px] placeholder:text-[#667781] focus:ring-0 py-1"
          />
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 px-3 py-2 overflow-x-auto scrollbar-hide">
        {chips.map((c) => (
          <button
            key={c.key}
            onClick={() => setActiveChip(c.key)}
            className={`px-3 py-1 rounded-full text-[12px] font-medium whitespace-nowrap transition-colors border ${
              activeChip === c.key 
                ? 'bg-[#E7FCE3] text-[#00A884] border-[#D9FDD3]' 
                : 'bg-[#F0F2F5] text-[#667781] border-transparent hover:bg-[#E9EDEF]'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto border-t border-[#E9EDEF]">
        {filteredConversations.map((conv) => (
          <ConversationItem 
            key={conv.id} 
            conv={conv} 
            isActive={activeId === conv.id}
            onClick={() => navigate(`/inbox/${conv.id}`)}
          />
        ))}
      </div>
    </div>
  );
}

function ConversationItem({ conv, isActive, onClick }: { conv: any; isActive: boolean; onClick: () => void }) {
  const lastMsgAt = conv.last_message_at ? new Date(conv.last_message_at) : null;
  
  const formatTime = (date: Date) => {
    if (isToday(date)) return format(date, 'HH:mm');
    if (isYesterday(date)) return 'Hier';
    return format(date, 'dd/MM/yy');
  };

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all border-b border-[#F5F6F6] select-none ${
        isActive ? 'bg-[#F0F2F5]' : 'hover:bg-[#F5F6F6]'
      }`}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="w-12 h-12 bg-[#DFE5E7] rounded-full flex items-center justify-center text-[#FFFFFF] font-bold">
           {conv.contact_name?.[0]?.toUpperCase() || <User size={24} />}
        </div>
        {/* Status indicator badge */}
        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[10px] shadow-sm ${
           conv.status === 'pending_human' ? 'bg-orange-500' : conv.ai_active ? 'bg-indigo-500' : 'bg-emerald-500'
        }`}>
           {conv.status === 'pending_human' ? '⏳' : conv.ai_active ? '🤖' : '👤'}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center justify-between mb-0.5">
          <h4 className="font-medium text-[#111B21] truncate text-[16px]">
            {conv.contact_name || conv.contact_phone}
          </h4>
          {lastMsgAt && (
             <span className={`text-[11px] ${conv.unreadCount > 0 ? 'text-[#00A884] font-bold' : 'text-[#667781]'}`}>
                {formatTime(lastMsgAt)}
             </span>
          )}
        </div>
        
        <div className="flex items-center gap-1 min-w-0">
          {conv.last_message?.direction === 'outbound' && (
             <div className="shrink-0">
                {conv.last_message.status === 'read' 
                  ? <CheckCheck size={16} className="text-[#53BDEB]" /> 
                  : <CheckCheck size={16} className="text-[#8696A0]" />
                }
             </div>
          )}
          <p className={`text-[13px] truncate flex-1 ${conv.unreadCount > 0 ? 'text-[#111B21]' : 'text-[#667781]'}`}>
            {conv.last_message?.content || 'Pas de message'}
          </p>
          {conv.unreadCount > 0 && (
            <span className="shrink-0 w-5 h-5 bg-[#25D366] text-white rounded-full flex items-center justify-center text-[10px] font-bold ml-1">
              {conv.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
