import React, { useState, useEffect } from 'react';
import { X, Check, Code2, Terminal, Workflow, RefreshCw } from 'lucide-react';
import { checkBackendHealth } from '../lib/chat';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSessionId: string;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({ isOpen, onClose, activeSessionId }) => {
  const [healthStatus, setHealthStatus] = useState<{ status: string; webhookConfigured: boolean } | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'payload' | 'curl'>('info');

  const verifyHealth = async () => {
    setIsChecking(true);
    const res = await checkBackendHealth();
    setHealthStatus(res);
    setIsChecking(false);
  };

  useEffect(() => {
    if (isOpen) {
      verifyHealth();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const samplePayload = {
    message: 'Hola n8n, explícame los servicios',
    sessionId: activeSessionId,
    history: [
      { role: 'user', content: 'Hola' },
      { role: 'assistant', content: 'Hola, ¿en qué puedo ayudarte?' },
    ],
    metadata: {
      source: 'web-chat',
      timestamp: new Date().toISOString(),
    },
  };

  const sampleCurl = `curl -X POST http://localhost:3000/api/chat \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": "Hola",
    "sessionId": "${activeSessionId}",
    "history": []
  }'`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
              <Workflow className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Arquitectura de Integración n8n
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Información técnica y configuración del Webhook
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 gap-4 bg-white dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'info'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            Estado y Flujo
          </button>
          <button
            onClick={() => setActiveTab('payload')}
            className={`py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'payload'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            Payload JSON
          </button>
          <button
            onClick={() => setActiveTab('curl')}
            className={`py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'curl'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            Ejemplo cURL
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'info' && (
            <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
              {/* Health Box */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
                    <span>Estado del Backend (/api/health)</span>
                    {healthStatus?.webhookConfigured ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
                        N8N_WEBHOOK_URL Configurada
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-mono">
                        N8N_WEBHOOK_URL Pendiente
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">
                    {healthStatus?.webhookConfigured
                      ? 'Las solicitudes son reenviadas desde la API de Express hacia tu Webhook de n8n.'
                      : 'Define N8N_WEBHOOK_URL en el archivo .env.local para apuntar a tu n8n.'}
                  </p>
                </div>
                <button
                  onClick={verifyHealth}
                  disabled={isChecking}
                  className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  title="Volver a comprobar estado"
                >
                  <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Architectural Diagram */}
              <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] leading-relaxed border border-slate-800">
                <div className="text-indigo-400 font-bold mb-2">// Flujo seguro de extremo a extremo</div>
                <p>Navegador (React) → POST /api/chat → Server Node.js (Proxy) → Webhook n8n → Agente AI → Respuesta</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                  Puntos Clave de Seguridad:
                </h4>
                <ul className="list-disc pl-4 space-y-1 text-slate-500 dark:text-slate-400">
                  <li>La URL del Webhook de n8n permanece protegida en el servidor y nunca se expone al cliente.</li>
                  <li>Inclusión de timeout de 60 segundos controlado por <code className="font-mono text-indigo-500">AbortController</code>.</li>
                  <li>Aislamiento de sesiones mediante <code className="font-mono text-indigo-500">sessionId</code> UUID persistible.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'payload' && (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Estructura del payload JSON enviado en cada solicitud POST hacia tu Webhook de n8n:
              </p>
              <pre className="p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800">
                {JSON.stringify(samplePayload, null, 2)}
              </pre>
            </div>
          )}

          {activeTab === 'curl' && (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Puedes probar la API interna localmente desde tu terminal ejecutando:
              </p>
              <pre className="p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800">
                {sampleCurl}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
