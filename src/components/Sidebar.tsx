import React from 'react';
import { SavedConversation } from '../types/chat';
import {
  Plus,
  MessageSquare,
  Trash2,
  Workflow,
  X,
  Copy,
  Check,
  Code2,
} from 'lucide-react';

interface SidebarProps {
  savedConversations: SavedConversation[];
  activeSessionId: string;
  onNewConversation: () => void;
  onSelectConversation: (sessionId: string) => void;
  onDeleteConversation: (sessionId: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenConfigModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  savedConversations,
  activeSessionId,
  onNewConversation,
  onSelectConversation,
  onDeleteConversation,
  isOpen,
  onClose,
  onOpenConfigModal,
}) => {
  const [copiedSessionId, setCopiedSessionId] = React.useState(false);

  const copySessionId = () => {
    navigator.clipboard.writeText(activeSessionId);
    setCopiedSessionId(true);
    setTimeout(() => setCopiedSessionId(false), 2000);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Header / New Chat */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between gap-2">
          <button
            onClick={() => {
              onNewConversation();
              onClose();
            }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl shadow-xs transition-colors cursor-pointer group"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
            <span>New conversation</span>
          </button>

          <button
            onClick={onClose}
            className="md:hidden p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-700">
          <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Conversations
          </div>

          {savedConversations.length === 0 ? (
            <div className="px-3 py-6 text-center text-xs text-slate-500 space-y-1">
              <MessageSquare className="w-8 h-8 mx-auto opacity-30 mb-2" />
              <p>Sin conversaciones previas</p>
              <p className="text-[11px] opacity-75">Las charlas se guardarán aquí</p>
            </div>
          ) : (
            savedConversations.map((conv) => {
              const isActive = conv.sessionId === activeSessionId;
              return (
                <div
                  key={conv.sessionId}
                  className={`group relative flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-slate-800/90 text-white font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                  }`}
                  onClick={() => {
                    onSelectConversation(conv.sessionId);
                    onClose();
                  }}
                >
                  <MessageSquare
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-400'
                    }`}
                  />
                  <span className="truncate flex-1">{conv.title}</span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(conv.sessionId);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 rounded-md transition-all cursor-pointer"
                    title="Eliminar conversación"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info & Session ID */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 space-y-2">
          {/* Active Session Info */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-2 flex items-center justify-between text-[11px] text-slate-400">
            <div className="truncate pr-1">
              <span className="text-slate-500 block text-[10px]">Session ID:</span>
              <span className="font-mono text-slate-300 truncate block max-w-[150px]">
                {activeSessionId}
              </span>
            </div>
            <button
              onClick={copySessionId}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors cursor-pointer shrink-0"
              title="Copiar Session ID"
            >
              {copiedSessionId ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Dev / Config Button */}
          {onOpenConfigModal && (
            <button
              onClick={onOpenConfigModal}
              className="w-full flex items-center justify-between px-3 py-1.5 bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs transition-colors cursor-pointer border border-slate-800"
            >
              <span className="flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Configuración n8n</span>
              </span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-mono">
                API Proxy
              </span>
            </button>
          )}

          {/* Powered by n8n badge */}
          <div className="flex items-center justify-center gap-2 py-1 text-xs text-slate-400 font-medium">
            <Workflow className="w-4 h-4 text-rose-500 animate-pulse" />
            <span>Powered by <strong className="text-slate-200 font-semibold">n8n</strong></span>
          </div>
        </div>
      </aside>
    </>
  );
};
