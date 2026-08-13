import React from 'react';
import { Bot, Sparkles, MessageSquare, HelpCircle, Headphones } from 'lucide-react';

interface EmptyStateProps {
  onSelectPrompt: (promptText: string) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onSelectPrompt }) => {
  const suggestions = [
    {
      icon: Sparkles,
      text: 'Explícame qué servicios puedes ofrecer',
      desc: 'Conoce las capacidades y respuestas configuradas en el flujo de trabajo.',
    },
    {
      icon: HelpCircle,
      text: 'Ayúdame con una consulta',
      desc: 'Realiza preguntas y obtén respuestas procesadas en tiempo real por n8n.',
    },
    {
      icon: Headphones,
      text: 'Quiero hablar con un asesor',
      desc: 'Prueba la lógica de derivación a soporte o gestión de tickets.',
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto my-auto animate-fade-in">
      {/* Bot Icon */}
      <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6 shadow-xs border border-indigo-200 dark:border-indigo-800/50">
        <Bot className="w-8 h-8" />
      </div>

      {/* Main Title & Subtitle */}
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-2">
        ¿Cómo puedo ayudarte?
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-8">
        Escribe un mensaje para comenzar una conversación. Las solicitudes serán procesadas a través del flujo de automatización en n8n.
      </p>

      {/* Suggestions List */}
      <div className="w-full grid grid-cols-1 gap-3">
        {suggestions.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectPrompt(item.text)}
              className="group flex items-start gap-3 p-4 text-left bg-white dark:bg-slate-800/60 hover:bg-indigo-50/50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-500/50 rounded-2xl transition-all shadow-2xs hover:shadow-md cursor-pointer"
            >
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {item.text}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {item.desc}
                </p>
              </div>
              <MessageSquare className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors my-auto opacity-0 group-hover:opacity-100" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
