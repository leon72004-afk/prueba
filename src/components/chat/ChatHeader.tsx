import React from 'react';
import { ConnectionStatus } from '../../types/chat';
import { StatusIndicator } from '../StatusIndicator';
import { Menu, Trash2, Bot, Sparkles, Settings2 } from 'lucide-react';

interface ChatHeaderProps {
  connectionStatus: ConnectionStatus;
  onClearConversation: () => void;
  onToggleSidebar: () => void;
  onOpenConfigModal?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  connectionStatus,
  onClearConversation,
  onToggleSidebar,
  onOpenConfigModal,
}) => {
  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-30 shrink-0">
      {/* Left section: Mobile menu toggle + Branding */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 leading-none">
              <span>AI Workflow Chat</span>
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 fill-indigo-500/20" />
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-none">
              Conectado a Webhook n8n
            </p>
          </div>
        </div>
      </div>

      {/* Right section: Status Indicator + Action buttons */}
      <div className="flex items-center gap-3">
        <StatusIndicator status={connectionStatus} onClick={onOpenConfigModal} />

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

        {onOpenConfigModal && (
          <button
            onClick={onOpenConfigModal}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Configuración de la API n8n"
          >
            <Settings2 className="w-3.5 h-3.5 text-slate-500" />
            <span>n8n Config</span>
          </button>
        )}

        <button
          onClick={onClearConversation}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
          title="Limpiar conversación actual"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Limpiar chat</span>
        </button>
      </div>
    </header>
  );
};
