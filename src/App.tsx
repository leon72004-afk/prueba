import React, { useState } from 'react';
import { useChat } from './hooks/useChat';
import { Sidebar } from './components/Sidebar';
import { Chat } from './components/chat/Chat';
import { ConfigModal } from './components/ConfigModal';

export default function App() {
  const {
    messages,
    sendMessage,
    clearConversation,
    retryMessage,
    selectConversation,
    deleteConversation,
    isLoading,
    sessionId,
    connectionStatus,
    savedConversations,
  } = useChat();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-900 font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        savedConversations={savedConversations}
        activeSessionId={sessionId}
        onNewConversation={clearConversation}
        onSelectConversation={selectConversation}
        onDeleteConversation={deleteConversation}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenConfigModal={() => setConfigModalOpen(true)}
      />

      {/* Main Chat Interface */}
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        <Chat
          messages={messages}
          isLoading={isLoading}
          connectionStatus={connectionStatus}
          onSendMessage={sendMessage}
          onClearConversation={clearConversation}
          onRetry={retryMessage}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          onOpenConfigModal={() => setConfigModalOpen(true)}
        />
      </main>

      {/* Configuration / Architecture Modal */}
      <ConfigModal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
        activeSessionId={sessionId}
      />
    </div>
  );
}
