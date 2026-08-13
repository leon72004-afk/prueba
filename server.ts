import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { extractReply } from './src/lib/utils';

// Load environment variables
dotenv.config();
dotenv.config({ path: '.env.local' });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '5mb' }));

  // --- API ROUTES ---

  /**
   * Health Check Endpoint
   * GET /api/health
   */
  app.get('/api/health', (req: Request, res: Response) => {
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      webhookConfigured: Boolean(webhookUrl && webhookUrl.trim().length > 0),
    });
  });

  /**
   * Chat Webhook Proxy Endpoint
   * POST /api/chat
   */
  app.post('/api/chat', async (req: Request, res: Response): Promise<void> => {
    try {
      const { message, sessionId, history } = req.body;

      // 1. Validation
      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'BAD_REQUEST',
          reply: 'El campo "message" es obligatorio y debe ser un texto válido no vacío.',
        });
        return;
      }

      if (message.length > 10000) {
        res.status(400).json({
          success: false,
          error: 'MESSAGE_TOO_LONG',
          reply: 'El mensaje excede el límite máximo permitido de 10.000 caracteres.',
        });
        return;
      }

      if (!sessionId || typeof sessionId !== 'string' || sessionId.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'BAD_REQUEST',
          reply: 'El campo "sessionId" es obligatorio.',
        });
        return;
      }

      // Check N8N_WEBHOOK_URL configuration
      const webhookUrl = process.env.N8N_WEBHOOK_URL;

      if (!webhookUrl || webhookUrl.trim().length === 0) {
        console.error('[n8n] Error: N8N_WEBHOOK_URL environment variable is not configured.');
        res.status(200).json({
          success: false,
          error: 'WEBHOOK_NOT_CONFIGURED',
          reply:
            '⚠️ **Webhook de n8n no configurado.**\n\nPor favor, añade la variable `N8N_WEBHOOK_URL` en tu archivo `.env.local` (o en la configuración del servidor) con la dirección de tu Webhook de n8n para conectar la conversación.\n\n*Ejemplo: `N8N_WEBHOOK_URL=https://tu-n8n.com/webhook/chat`*',
        });
        return;
      }

      // 2. Prepare payload for n8n
      const payload = {
        message: message.trim(),
        sessionId: sessionId.trim(),
        history: Array.isArray(history) ? history : [],
        metadata: {
          source: 'web-chat',
          timestamp: new Date().toISOString(),
          userAgent: req.headers['user-agent'] || 'unknown',
        },
      };

      console.log(`[n8n] Sending request to webhook for sessionId: ${sessionId}`);

      // 3. Timeout setup (60 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 60000);

      try {
        const response = await fetch(webhookUrl.trim(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        console.log(`[n8n] Request completed. HTTP status: ${response.status}`);

        // Handle HTTP Errors
        if (!response.ok) {
          console.error(`[n8n] Webhook HTTP Error: ${response.status} ${response.statusText}`);
          let statusMessage = `HTTP ${response.status}`;
          
          if (response.status === 404) {
            statusMessage = 'El Webhook de n8n no fue encontrado (404). Verifica la URL y asegúrate de que el workflow esté activo en n8n.';
          } else if (response.status === 401 || response.status === 403) {
            statusMessage = 'Acceso no autorizado al Webhook de n8n (401/403). Verifica los permisos o autenticación.';
          } else if (response.status >= 500) {
            statusMessage = 'El servidor de n8n devolvió un error interno (500). Revisa las ejecuciones en n8n.';
          }

          res.status(200).json({
            success: false,
            error: `HTTP_${response.status}`,
            reply: `No pude procesar tu mensaje en este momento (${statusMessage}). Inténtalo nuevamente.`,
            details: `Status: ${response.status} ${response.statusText}`,
          });
          return;
        }

        // Parse Response Content
        const contentType = response.headers.get('content-type') || '';
        let responseData: unknown;

        if (contentType.includes('application/json')) {
          responseData = await response.json();
        } else {
          const rawText = await response.text();
          try {
            responseData = JSON.parse(rawText);
          } catch {
            responseData = rawText;
          }
        }

        // Extract normalized reply
        const extractedReply = extractReply(responseData);

        res.json({
          success: true,
          reply: extractedReply,
        });
      } catch (fetchError: unknown) {
        clearTimeout(timeoutId);

        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          console.error('[n8n] Error: Request timed out after 60 seconds.');
          res.status(200).json({
            success: false,
            error: 'TIMEOUT',
            reply: 'El workflow de n8n tardó demasiado en responder (tiempo límite de 60 segundos excedido). Inténtalo de nuevo.',
          });
          return;
        }

        const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError);
        console.error(`[n8n] Connection failure: ${errorMessage}`);

        res.status(200).json({
          success: false,
          error: 'CONNECTION_ERROR',
          reply: 'No se pudo establecer comunicación con el Webhook de n8n. Comprueba que el servicio de n8n está encendido y accesible.',
          details: errorMessage,
        });
      }
    } catch (err: unknown) {
      const errStr = err instanceof Error ? err.message : String(err);
      console.error(`[n8n] Internal Server Error: ${errStr}`);
      res.status(500).json({
        success: false,
        error: 'INTERNAL_ERROR',
        reply: 'Ocurrió un error interno en el servidor al procesar tu solicitud.',
      });
    }
  });

  // --- VITE / STATIC SERVING ---

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[server] Server listening on http://0.0.0.0:${PORT}`);
    console.log(`[server] N8N_WEBHOOK_URL is ${process.env.N8N_WEBHOOK_URL ? 'CONFIGURED' : 'NOT SET'}`);
  });
}

startServer().catch((err) => {
  console.error('[server] Fatal error starting server:', err);
});
