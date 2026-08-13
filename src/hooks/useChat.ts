import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Message,
  ConversationHistoryItem,
  SavedConversation,
  ConnectionStatus,
} from '../types/chat';
import { sendChatMessage, checkBackendHealth } from '../lib/chat';

const STORAGE_KEY = 'n8n_chat_conversations_v1';
const CURRENT_SESSION_KEY = 'n8n_chat_active_session_id';

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'sess-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now().toString(36);
}

export function useChat() {
  const [sessionId, setSessionId] = useState<string>(() => {
    const saved = localStorage.getItem(CURRENT_SESSION_KEY);
    if (saved) return saved;
    const newId = generateUUID();
    localStorage.setItem(CURRENT_SESSION_KEY, newId);
    return newId;
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [savedConversations, setSavedConversations] = useState<SavedConversation[]>([]);

  const isMounted = useRef(true);

  // Load conversations from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: SavedConversation[] = JSON.parse(stored);
        setSavedConversations(parsed);
        const current = parsed.find((c) => c.sessionId === sessionId);
        if (current && current.messages) {
          setMessages(current.messages);
        }
      }
    } catch (e) {
      console.error('Failed to parse saved conversations', e);
    }
  }, [sessionId]);

  // Save current conversation state to localStorage
  const persistConversation = useCallback(
    (currentSessionId: string, currentMessages: Message[]) => {
      try {
        localStorage.setItem(CURRENT_SESSION_KEY, currentSessionId);
        const stored = localStorage.getItem(STORAGE_KEY);
        let list: SavedConversation[] = stored ? JSON.parse(stored) : [];

        if (currentMessages.length === 0) {
          // Clean up empty ones if desired or keep as draft
          list = list.filter((c) => c.sessionId !== currentSessionId);
        } else {
          const firstUserMsg = currentMessages.find((m) => m.role === 'user');
          const title = firstUserMsg
            ? firstUserMsg.content.slice(0, 32) + (firstUserMsg.content.length > 32 ? '...' : '')
            : 'Nueva conversación';

          const existingIndex = list.findIndex((c) => c.sessionId === currentSessionId);
          const now = new Date().toISOString();

          if (existingIndex >= 0) {
            list[existingIndex] = {
              ...list[existingIndex],
              title,
              updatedAt: now,
              messages: currentMessages,
            };
          } else {
            list.unshift({
              sessionId: currentSessionId,
              title,
              createdAt: now,
              updatedAt: now,
              messages: currentMessages,
            });
          }
        }

        // Limit stored conversations to last 20
        list = list.slice(0, 20);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        setSavedConversations(list);
      } catch (e) {
        console.error('Failed to persist conversation', e);
      }
    },
    []
  );

  // Check health on mount and periodically
  const refreshHealth = useCallback(async () => {
    const health = await checkBackendHealth();
    if (!isMounted.current) return;

    if (health.status === 'ok') {
      if (health.webhookConfigured) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('no_webhook');
      }
    } else {
      setConnectionStatus('disconnected');
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    refreshHealth();
    const interval = setInterval(refreshHealth, 15000);
    return () => {
      isMounted.current = false;
      clearInterval(interval);
    };
  }, [refreshHealth]);

  // Send message action
  const sendMessage = useCallback(
    async (text: string) => {
      const cleanText = text.trim();
      if (!cleanText || isLoading) return;

      setError(null);
      setIsLoading(true);

      const userMsgId = generateUUID();
      const userMessage: Message = {
        id: userMsgId,
        role: 'user',
        content: cleanText,
        timestamp: new Date().toISOString(),
        status: 'sent',
      };

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      persistConversation(sessionId, updatedMessages);

      // Build clean history without system/error artifacts
      const history: ConversationHistoryItem[] = updatedMessages
        .filter((m) => m.status !== 'error')
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      // Send to backend API (/api/chat)
      const response = await sendChatMessage(cleanText, sessionId, history);

      if (!isMounted.current) return;

      if (response.success && response.reply) {
        const assistantMsg: Message = {
          id: generateUUID(),
          role: 'assistant',
          content: response.reply,
          timestamp: new Date().toISOString(),
          status: 'sent',
        };

        const finalMessages = [...updatedMessages, assistantMsg];
        setMessages(finalMessages);
        persistConversation(sessionId, finalMessages);
      } else {
        const errorContent =
          response.reply || 'No pude procesar tu mensaje en este momento. Inténtalo nuevamente.';

        const assistantMsg: Message = {
          id: generateUUID(),
          role: 'assistant',
          content: errorContent,
          timestamp: new Date().toISOString(),
          status: 'error',
          errorDetails: response.error || response.details,
        };

        const finalMessages = [...updatedMessages, assistantMsg];
        setMessages(finalMessages);
        setError(errorContent);
        persistConversation(sessionId, finalMessages);
      }

      setIsLoading(false);
    },
    [isLoading, messages, sessionId, persistConversation]
  );

  // Retry message
  const retryMessage = useCallback(
    async (messageId?: string) => {
      let targetUserMessage: Message | undefined;

      if (messageId) {
        targetUserMessage = messages.find((m) => m.id === messageId && m.role === 'user');
      } else {
        // Find last user message
        for (let i = messages.length - 1; i >= 0; i--) {
          if (messages[i].role === 'user') {
            targetUserMessage = messages[i];
            break;
          }
        }
      }

      if (!targetUserMessage) return;

      // Remove assistant messages that came after this user message or errored
      const targetIndex = messages.findIndex((m) => m.id === targetUserMessage!.id);
      const filteredMessages = messages.slice(0, targetIndex + 1);

      setMessages(filteredMessages);
      setError(null);
      setIsLoading(true);

      const history: ConversationHistoryItem[] = filteredMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await sendChatMessage(targetUserMessage.content, sessionId, history);

      if (!isMounted.current) return;

      if (response.success && response.reply) {
        const assistantMsg: Message = {
          id: generateUUID(),
          role: 'assistant',
          content: response.reply,
          timestamp: new Date().toISOString(),
          status: 'sent',
        };

        const finalMessages = [...filteredMessages, assistantMsg];
        setMessages(finalMessages);
        persistConversation(sessionId, finalMessages);
      } else {
        const errorContent =
          response.reply || 'No pude procesar tu mensaje en este momento. Inténtalo nuevamente.';

        const assistantMsg: Message = {
          id: generateUUID(),
          role: 'assistant',
          content: errorContent,
          timestamp: new Date().toISOString(),
          status: 'error',
          errorDetails: response.error || response.details,
        };

        const finalMessages = [...filteredMessages, assistantMsg];
        setMessages(finalMessages);
        setError(errorContent);
        persistConversation(sessionId, finalMessages);
      }

      setIsLoading(false);
    },
    [messages, sessionId, persistConversation]
  );

  // Clear conversation / Start New Conversation
  const clearConversation = useCallback(() => {
    const newSessionId = generateUUID();
    setSessionId(newSessionId);
    setMessages([]);
    setError(null);
    localStorage.setItem(CURRENT_SESSION_KEY, newSessionId);
  }, []);

  // Select a saved conversation
  const selectConversation = useCallback((convSessionId: string) => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    const list: SavedConversation[] = JSON.parse(stored);
    const target = list.find((c) => c.sessionId === convSessionId);
    if (target) {
      setSessionId(target.sessionId);
      setMessages(target.messages || []);
      setError(null);
      localStorage.setItem(CURRENT_SESSION_KEY, target.sessionId);
    }
  }, []);

  // Delete a saved conversation
  const deleteConversation = useCallback(
    (convSessionId: string) => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      let list: SavedConversation[] = JSON.parse(stored);
      list = list.filter((c) => c.sessionId !== convSessionId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      setSavedConversations(list);

      if (sessionId === convSessionId) {
        clearConversation();
      }
    },
    [sessionId, clearConversation]
  );

  return {
    messages,
    sendMessage,
    clearConversation,
    retryMessage,
    selectConversation,
    deleteConversation,
    isLoading,
    error,
    sessionId,
    connectionStatus,
    savedConversations,
    refreshHealth,
  };
}
