import React from 'react';
import { ConnectionStatus } from '../types/chat';
import { Activity, AlertTriangle, CheckCircle2, WifiOff } from 'lucide-react';

interface StatusIndicatorProps {
  status: ConnectionStatus;
  onClick?: () => void;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, onClick }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          label: 'Connected',
          dotBg: 'bg-emerald-500',
          badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
          icon: CheckCircle2,
          pulse: true,
        };
      case 'no_webhook':
        return {
          label: 'Sin Webhook',
          dotBg: 'bg-amber-500',
          badgeBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
          icon: AlertTriangle,
          pulse: false,
        };
      case 'disconnected':
        return {
          label: 'Disconnected',
          dotBg: 'bg-rose-500',
          badgeBg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60',
          icon: WifiOff,
          pulse: false,
        };
      case 'connecting':
      default:
        return {
          label: 'Conectando...',
          dotBg: 'bg-slate-400',
          badgeBg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
          icon: Activity,
          pulse: true,
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border transition-all hover:opacity-90 cursor-pointer ${config.badgeBg}`}
      title={`Estado del servicio: ${config.label}. Haz clic para ver detalles.`}
    >
      <span className="relative flex h-2 w-2">
        {config.pulse && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.dotBg} opacity-75`}
          />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dotBg}`} />
      </span>
      <Icon className="w-3.5 h-3.5 opacity-80" />
      <span>{config.label}</span>
    </button>
  );
};
