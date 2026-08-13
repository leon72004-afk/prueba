import React from 'react';
import { Message, ConnectionStatus } from '../../types/chat';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';

interface ChatProps {
  messages: Message[];
  isLoading: boolean;
  connectionStatus: ConnectionStatus;
  onSendMessage: (text: string) => void;
  onClearConversation: () => void;
  onRetry: (messageId: string) => void;
  onToggleSidebar: () => void;
  onOpenConfigModal?: () => void;
}

export const Chat: React.FC<ChatProps> = ({
  messages,
  isLoading,
  connectionStatus,
  onSendMessage,
  onClearConversation,
  onRetry,
  onToggleSidebar,
  onOpenConfigModal,
}) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden">
      <ChatHeader
        connectionStatus={connectionStatus}
        onClearConversation={onClearConversation}
        onToggleSidebar={onToggleSidebar}
        onOpenConfigModal={onOpenConfigModal}
      />

      <ChatMessages
        messages={messages}
        isLoading={isLoading}
        onSelectPrompt={onSendMessage}
        onRetry={onRetry}
      />

      <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
    </div>
  );
};
