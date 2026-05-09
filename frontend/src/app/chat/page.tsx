'use client';

import { MessageSquarePlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCreateChat } from '@/hooks/useChats';
import { Button } from '@/components/ui/button';

/**
 * Default chat page shown when no chat is selected.
 * Provides a prominent "Start a new chat" CTA.
 */
export default function ChatIndexPage() {
  const router = useRouter();
  const createChat = useCreateChat();

  const handleNewChat = async () => {
    try {
      const chat = await createChat.mutateAsync();
      router.push(`/chat/${chat.id}`);
    } catch {
      // Error handled by React Query
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4">
      <div className="text-center max-w-lg animate-fade-in">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 mb-6">
          <MessageSquarePlus className="h-10 w-10 text-emerald-400" />
        </div>

        <h1 className="text-3xl font-bold text-zinc-100 mb-3">
          How can I help you today?
        </h1>

        <p className="text-zinc-500 mb-8 leading-relaxed">
          Start a new conversation with the AI assistant. Ask questions,
          get explanations, or just have a chat.
        </p>

        <Button
          variant="primary"
          size="lg"
          onClick={handleNewChat}
          disabled={createChat.isPending}
          className="px-8"
          id="start-chat-button"
        >
          {createChat.isPending ? 'Creating...' : 'Start New Chat'}
        </Button>
      </div>
    </div>
  );
}
