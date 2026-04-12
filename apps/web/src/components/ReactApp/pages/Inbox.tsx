import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ConversationList } from '../components/inbox/ConversationList';
import { ChatPanel } from '../components/inbox/ChatPanel';
import { ContactPanel } from '../components/inbox/ContactPanel';
import { useSocket } from '../hooks/useSocket';
import { useChatStore } from '../stores/useChatStore';
import { useApi } from '../hooks/useApi';
import { useApp } from '../context/AppContext';
import { MessageSquare } from 'lucide-react';

export default function Inbox() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { tenantId } = useApp();
  const { setConversations, setActiveConversation } = useChatStore();
  const { api } = useApi();
  
  // Initialize Socket.io connection for this tenant
  useSocket(tenantId || '');

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get('/api/v1/conversations');
        setConversations(res.data || []);
      } catch (err) {
        console.error('Failed to fetch conversations:', err);
      }
    };
    
    fetchConversations();
  }, [api, setConversations]);

  useEffect(() => {
    setActiveConversation(conversationId || null);
  }, [conversationId, setActiveConversation]);

  return (
    <div className="flex h-[calc(100vh-2rem)] overflow-hidden bg-white rounded-2xl shadow-sm border border-[#EEEEEE] mx-4 mb-4">
      {/* Column 1: Conversations List */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-[#EEEEEE] flex flex-col ${conversationId ? 'hidden md:flex' : 'flex'}`}>
        <ConversationList />
      </div>

      {/* Column 2 & 3: Chat & Contact Panel */}
      <div className={`flex-1 flex flex-col md:flex-row min-w-0 ${!conversationId ? 'hidden md:flex' : 'flex'}`}>
        {conversationId ? (
          <>
            <div className="flex-1 flex flex-col min-w-0 border-r border-[#EEEEEE]">
              <ChatPanel conversationId={conversationId} />
            </div>
            <div className="w-full md:w-80 lg:w-96 flex flex-col bg-[#FAFAFA]">
              <ContactPanel conversationId={conversationId} />
            </div>
          </>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-[#FAFAFA]">
      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6">
        <MessageSquare className="text-[#AAAAAA]" size={32} />
      </div>
      <h3 className="text-xl font-bold text-[#221A40] mb-2">Sélectionnez une conversation</h3>
      <p className="text-[#AAAAAA] max-w-sm">
        Choisissez un contact à gauche pour commencer à discuter ou gérer son profil CRM.
      </p>
    </div>
  );
}
