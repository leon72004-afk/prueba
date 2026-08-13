import { ChatApiRequest, ChatApiResponse, ConversationHistoryItem } from '../types/chat';

/**
 * Sends a user message to the internal Next.js/Express API route (/api/chat).
 * The API server proxies the request safely to n8n without exposing the webhook URL.
 */
export async function sendChatMessage(
  message: string,
  sessionId: string,
  history: ConversationHistoryItem[]
): Promise<ChatApiResponse> {
  try {
    const payload: ChatApiRequest = {
      message,
      sessionId,
      history,
    };

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorMsg = `Error HTTP ${response.status}`;
      try {
        const errJson = await response.json();
        if (errJson.reply) return errJson;
        if (errJson.error) errorMsg = errJson.error;
      } catch {
        // ignore JSON parse error
      }
      return {
        success: false,
        reply: 'No pude procesar tu mensaje en este momento. Inténtalo nuevamente.',
        error: errorMsg,
      };
    }

    const data: ChatApiResponse = await response.json();
    return data;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error de red';
    return {
      success: false,
      reply: 'No se pudo conectar con el servidor interno de chat. Verifica tu conexión a internet.',
      error: message,
    };
  }
}

/**
 * Checks backend health and n8n webhook status
 */
export async function checkBackendHealth(): Promise<{ status: string; webhookConfigured: boolean }> {
  try {
    const response = await fetch('/api/health');
    if (response.ok) {
      const data = await response.json();
      return {
        status: data.status || 'ok',
        webhookConfigured: Boolean(data.webhookConfigured),
      };
    }
  } catch {
    // ignore
  }
  return { status: 'disconnected', webhookConfigured: false };
}
