'use client';

import { useRouter, useParams } from 'next/navigation';
import { Plus, MessageSquare, Trash2, LogOut, Loader2 } from 'lucide-react';
import { useChats, useCreateChat, useDeleteChat } from '@/hooks/useChats';
import { useAuthContext } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function ChatSidebar() {
  const router = useRouter();
  const params = useParams();
  const currentChatId = params?.id as string | undefined;

  const { data: chats, isLoading, error } = useChats();
  const createChat = useCreateChat();
  const deleteChat = useDeleteChat();
  const { user, signOut } = useAuthContext();

  const handleNewChat = async () => {
    try {
      const chat = await createChat.mutateAsync();
      router.push(`/chat/${chat.id}`);
    } catch {
      // Error handled by React Query
    }
  };

  const handleDeleteChat = async (
    e: React.MouseEvent,
    chatId: string,
  ) => {
    e.stopPropagation();
    try {
      await deleteChat.mutateAsync(chatId);
      if (currentChatId === chatId) {
        router.push('/chat');
      }
    } catch {
      // Error handled by React Query
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <aside className="flex h-full w-72 flex-col border-r border-zinc-800 bg-zinc-950">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 p-4">
        <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
          ChatGPT Clone
        </h1>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={handleNewChat}
          disabled={createChat.isPending}
          id="new-chat-button"
        >
          {createChat.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          New Chat
        </Button>
      </div>

      {/* Chat List */}
      <nav className="flex-1 overflow-y-auto px-3 pb-3">
        {isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        )}

        {error && (
          <p className="px-3 py-2 text-sm text-red-400">
            Failed to load chats
          </p>
        )}

        {chats && chats.length === 0 && (
          <p className="px-3 py-8 text-center text-sm text-zinc-500">
            No conversations yet.
            <br />
            Start a new chat!
          </p>
        )}

        {chats?.map((chat) => (
          <div
            key={chat.id}
            className={cn(
              'group flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm cursor-pointer transition-all duration-150 mb-1',
              currentChatId === chat.id
                ? 'bg-zinc-800 text-zinc-100'
                : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200',
            )}
            onClick={() => router.push(`/chat/${chat.id}`)}
            id={`chat-item-${chat.id}`}
          >
            <MessageSquare className="h-4 w-4 shrink-0 text-zinc-500" />
            <span className="flex-1 truncate">{chat.title}</span>
            <button
              className="hidden group-hover:flex items-center justify-center h-6 w-6 rounded hover:bg-zinc-700 text-zinc-500 hover:text-red-400 transition-colors"
              onClick={(e) => handleDeleteChat(e, chat.id)}
              aria-label={`Delete chat ${chat.title}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div className="border-t border-zinc-800 p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-xs font-semibold text-white">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm text-zinc-300">
              {user?.email || 'User'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="h-8 w-8"
            aria-label="Sign out"
            id="sign-out-button"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
