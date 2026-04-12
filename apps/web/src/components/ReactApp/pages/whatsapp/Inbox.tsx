import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ConversationList } from '../../components/inbox/ConversationList';
import { ChatPanel } from '../../components/inbox/ChatPanel';
import { ContactPanel } from '../../components/inbox/ContactPanel';
import { useChatStore } from '../../stores/useChatStore';
import { useApp } from '../../context/AppContext';
import { useConversations } from '../../hooks/useConversations';

export default function Inbox() {
  const { conversationId } = useParams();
  const { setActiveConversation } = useChatStore();
  
  // Use the new Supabase hook for real-time conversations
  useConversations();

  useEffect(() => {
    setActiveConversation(conversationId || null);
  }, [conversationId, setActiveConversation]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F0F2F5] p-0 md:p-4 lg:p-6 lg:pb-0">
      <div className="flex w-full max-w-[1600px] mx-auto bg-white shadow-lg overflow-hidden h-full">
        {/* Column 1: Conversations List */}
        <div className={`w-full md:w-[400px] border-r border-[#E9EDEF] flex flex-col ${conversationId ? 'hidden md:flex' : 'flex'}`}>
          <ConversationList />
        </div>

        {/* Column 2 & 3 Combined: Chat & Contact Panel Stacked Vertically */}
        <div className={`flex-1 flex flex-col min-w-0 ${!conversationId ? 'hidden md:flex' : 'flex'}`}>
          {conversationId ? (
            <div className="flex-1 flex flex-col min-h-0 bg-white">
              {/* Top: Chat (60%) */}
              <div className="flex-[6] min-h-0 flex flex-col border-b border-[#E9EDEF]">
                <ChatPanel conversationId={conversationId} />
              </div>
              
              {/* Bottom: Contact CRM Panel (40%) */}
              <div className="flex-[4] min-h-0 flex flex-col bg-[#FAFAFA]">
                <ContactPanel conversationId={conversationId} />
              </div>
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-[#F8F9FA] border-b-[6px] border-[#00A884]">
      <div className="w-64 h-64 mb-10 opacity-80">
         <img src="https://static.whatsapp.net/rsrc.php/v3/y6/r/wa669ae5dbc.png" alt="WhatsApp Web" className="w-full h-full object-contain" />
      </div>
      <h3 className="text-[32px] font-light text-[#41525d] mb-4">WhatsApp Web</h3>
      <p className="text-[#667781] max-w-md text-[14px] leading-relaxed">
        Envoyez et recevez des messages sans garder votre téléphone en ligne.<br/>
        Utilisez Pretalk Hub pour automatiser vos ventes avec l'IA.
      </p>
    </div>
  );
}
