'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled: boolean;
  isWaitingForReply: boolean;
}

export function ChatInput({ onSend, disabled, isWaitingForReply }: ChatInputProps) {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isDisabled = disabled || !content.trim();

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [content]);

  const handleSubmit = () => {
    if (isDisabled) return;
    const trimmed = content.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setContent('');
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
      <div className="max-w-3xl mx-auto px-4 py-4">
        {isWaitingForReply && (
          <div className="flex items-center gap-2 mb-3 px-1">
            <Loader2 className="h-3 w-3 animate-spin text-emerald-500" />
            <span className="text-xs text-zinc-500">
              Assistant is thinking...
            </span>
          </div>
        )}

        <div className="relative flex items-end gap-2 rounded-xl border border-zinc-700 bg-zinc-900 p-2 focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/25 transition-all duration-200">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isWaitingForReply
                ? 'Wait for the assistant to respond...'
                : 'Type your message...'
            }
            disabled={disabled}
            rows={1}
            className={cn(
              'flex-1 resize-none bg-transparent text-sm text-zinc-200 placeholder:text-zinc-500',
              'focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
              'min-h-[36px] max-h-[200px] py-2 px-2',
            )}
            id="chat-input"
          />
          <Button
            variant="primary"
            size="icon"
            onClick={handleSubmit}
            disabled={isDisabled}
            className="h-9 w-9 shrink-0"
            aria-label="Send message"
            id="send-message-button"
          >
            {disabled ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        <p className="mt-2 text-center text-[11px] text-zinc-600">
          AI responses are simulated for demonstration purposes.
        </p>
      </div>
    </div>
  );
}
