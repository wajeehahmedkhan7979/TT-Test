'use client';

import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { Message } from '@/types';

interface MessageItemProps {
  message: Message;
}

export function MessageItem({ message }: MessageItemProps) {
  const isAssistant = message.role === 'ASSISTANT';
  const isPending = message.status === 'PENDING';
  const isFailed = message.status === 'FAILED';

  return (
    <div
      className={cn(
        'flex gap-4 px-4 py-6 md:px-8 transition-all duration-300',
        isAssistant ? 'bg-zinc-900/30' : '',
      )}
      id={`message-${message.id}`}
    >
      <Avatar
        fallback={isAssistant ? 'AI' : 'U'}
        variant={isAssistant ? 'assistant' : 'user'}
      />
      <div className="flex-1 space-y-1 min-w-0">
        <p className="text-xs font-medium text-zinc-500">
          {isAssistant ? 'Assistant' : 'You'}
        </p>
        <div
          className={cn(
            'text-sm leading-relaxed',
            isPending ? 'text-zinc-500' : isFailed ? 'text-red-400' : 'text-zinc-200',
          )}
        >
          {isPending ? (
            <TypingIndicator />
          ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
        </div>
        {isFailed && (
          <p className="text-xs text-red-500 mt-1">
            Failed to generate response
          </p>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 py-2">
      <div className="flex gap-1">
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="ml-2 text-zinc-500 text-xs">Thinking...</span>
    </div>
  );
}
