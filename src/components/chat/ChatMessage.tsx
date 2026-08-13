import React, { useState } from 'react';
import { Message } from '../../types/chat';
import { formatDate } from '../../lib/utils';
import { Bot, User, Copy, Check, RotateCcw, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessageProps {
  message: Message;
  onRetry?: (messageId: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onRetry }) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const isError = message.status === 'error';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`group flex gap-3 max-w-3xl my-3 px-4 transition-all animate-fade-in ${
        isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
      }`}
    >
      {/* Avatar Icon */}
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs ${
          isUser
            ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-700 dark:border-slate-300'
            : isError
            ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border-rose-300 dark:border-rose-800'
            : 'bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/50'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4" />
        ) : isError ? (
          <AlertCircle className="w-4 h-4" />
        ) : (
          <Bot className="w-4 h-4" />
        )}
      </div>

      {/* Content Container */}
      <div className={`flex flex-col min-w-0 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Header meta */}
        <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          <span>{isUser ? 'Tú' : 'Asistente n8n'}</span>
          <span>•</span>
          <span>{formatDate(message.timestamp)}</span>
        </div>

        {/* Bubble */}
        <div
          className={`relative px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-2xs ${
            isUser
              ? 'bg-indigo-600 text-white rounded-tr-xs'
              : isError
              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 border border-rose-200 dark:border-rose-800/80 rounded-tl-xs'
              : 'bg-white dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 rounded-tl-xs'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none break-words space-y-2">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 mb-2">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1 mb-2">{children}</ol>,
                  li: ({ children }) => <li>{children}</li>,
                  code: ({ className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || '');
                    const isInline = !match && !String(children).includes('\n');
                    return isInline ? (
                      <code
                        className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-mono text-xs text-indigo-600 dark:text-indigo-300"
                        {...props}
                      >
                        {children}
                      </code>
                    ) : (
                      <div className="my-2 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs p-3 overflow-x-auto border border-slate-800">
                        <code {...props}>{children}</code>
                      </div>
                    );
                  },
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 dark:text-indigo-400 underline font-medium hover:text-indigo-500"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}

          {/* Error Details if any */}
          {isError && message.errorDetails && (
            <div className="mt-2 text-xs font-mono bg-rose-100/60 dark:bg-rose-900/40 p-2 rounded border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 overflow-x-auto">
              Detalles: {message.errorDetails}
            </div>
          )}
        </div>

        {/* Action Controls for Assistant & Error retry */}
        <div className="flex items-center gap-2 mt-1 px-1">
          {!isUser && !isError && (
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors py-0.5 px-1.5 rounded cursor-pointer"
              title="Copiar texto"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-500" />
                  <span className="text-emerald-500 font-medium">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          )}

          {isError && onRetry && (
            <button
              onClick={() => onRetry(message.id)}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400 hover:underline cursor-pointer py-0.5"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reintentar envío</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
