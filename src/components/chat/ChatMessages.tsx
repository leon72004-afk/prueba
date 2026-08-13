import React, { useRef, useEffect } from 'react';
import { Message } from '../../types/chat';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import { EmptyState } from './EmptyState';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  onSelectPrompt: (promptText: string) => void;
  onRetry?: (messageId: string) => void;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  isLoading,
  onSelectPrompt,
  onRetry,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  if (messages.length === 0) {
    return <EmptyState onSelectPrompt={onSelectPrompt} />;
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-2">
      <div className="max-w-4xl mx-auto space-y-1">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} onRetry={onRetry} />
        ))}

        {isLoading && <TypingIndicator />}

        <div ref={bottomRef} className="h-4" />
      </div>
    </div>
  );
};
