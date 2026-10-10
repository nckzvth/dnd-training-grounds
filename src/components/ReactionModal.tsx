import React from 'react';
import { ReactionPrompt } from '../types/combat';
import { ShieldAlert, Zap, AlertCircle } from 'lucide-react';

interface ReactionModalProps {
  prompt: ReactionPrompt | null;
}

export const ReactionModal: React.FC<ReactionModalProps> = ({ prompt }) => {
  if (!prompt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-amber-500/50 rounded-xl max-w-md w-full p-5 shadow-2xl shadow-amber-500/10">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-amber-400 font-mono">
              Reactive Event Interceptor
            </div>
            <h3 className="text-base font-bold text-slate-100">{prompt.title}</h3>
          </div>
        </div>

        {/* Description & Rules explanation */}
        <div className="mt-3.5 p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
          {prompt.description}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex flex-col gap-2">
          {prompt.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={opt.onExecute}
              className={`w-full py-2 px-3 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                opt.primary
                  ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-lg shadow-amber-900/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              {opt.label}
            </button>
          ))}

          <button
            onClick={prompt.onCancel}
            className="w-full py-1.5 px-3 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition"
          >
            Pass / Save for Later
          </button>
        </div>
      </div>
    </div>
  );
};
