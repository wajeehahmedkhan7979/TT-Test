'use client';

import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useChat } from '@/hooks/useChats';
import { useMessages, useSendMessage } from '@/hooks/useMessages';
import { MessageList } from '@/components/chat/message-list';
import { ChatInput } from '@/components/chat/chat-input';

export default function ChatDetailPage() {
  const params = useParams();
  const chatId = params.id as string;

  const { data: chat, error: chatError } = useChat(chatId);
  const { data: messages, isLoading: messagesLoading, error: messagesError } = useMessages(chatId);
  const sendMessage = useSendMessage(chatId);

  const isWaitingForReply = (() => {
    if (!messages || messages.length === 0) return false;
    const lastMessage = messages[messages.length - 1];
    return lastMessage.role === 'USER' || lastMessage.status === 'PENDING';
  })();

  const handleSend = (content: string) => {
    if (sendMessage.isPending || isWaitingForReply) return;

    sendMessage.mutate(content, {
      onError: () => {
        toast.error('Failed to send message. Please try again.');
      },
    });
  };

  if (chatError) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-zinc-300 mb-2">
            Chat not found
          </h2>
          <p className="text-sm text-zinc-500">
            This chat may have been deleted or you don&apos;t have access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Chat Header */}
      {chat && (
        <header className="flex items-center border-b border-zinc-800 px-6 py-3 bg-zinc-950/80 backdrop-blur-sm">
          <h2 className="text-sm font-medium text-zinc-300 truncate">
            {chat.title}
          </h2>
        </header>
      )}

      {/* Messages */}
      <MessageList
        messages={messages}
        isLoading={messagesLoading}
        error={messagesError}
      />

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        disabled={sendMessage.isPending}
        isWaitingForReply={isWaitingForReply}
      />
    </div>
  );
}
