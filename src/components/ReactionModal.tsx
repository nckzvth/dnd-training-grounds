import React from 'react';
import { ART_ASSETS } from '../utils/artAssets';
import { ReactionPrompt } from '../types/combat';
import { ShieldAlert, Zap, AlertCircle } from 'lucide-react';
import { FantasyCornerBrackets, WaxSealBadge } from './FantasyDecorations';

interface ReactionModalProps {
  prompt: ReactionPrompt | null;
}

export const ReactionModal: React.FC<ReactionModalProps> = ({ prompt }) => {
  if (!prompt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-950 border-4 border-amber-700/80 rounded-2xl max-w-md w-full p-5 shadow-[0_20px_60px_rgba(0,0,0,0.95)] relative overflow-hidden">
        <FantasyCornerBrackets className="w-6 h-6 text-amber-500" />
        <div className="absolute inset-0 z-0 pointer-events-none opacity-25 mix-blend-overlay" style={{ backgroundImage: `url(${ART_ASSETS.darkWood})` }} />
        <div className="absolute top-0 right-0 opacity-15 pointer-events-none" style={{ backgroundImage: `url(${ART_ASSETS.crestEmblem})`, width: '140px', height: '140px', backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'top right', mixBlendMode: 'overlay' }} />

        <div className="relative z-10 flex flex-col">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-950/40 text-amber-400 border border-amber-600/60 shadow">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="mb-1">
                <WaxSealBadge text="REACTIVE WINDOW" color="red" />
              </div>
              <h3 className="text-lg font-fantasy font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 drop-shadow-md">
                {prompt.title}
              </h3>
            </div>
          </div>

          {/* Description & Rules explanation (Real Parchment Dispatch) */}
          <div 
            className="mt-3.5 p-3.5 rounded-xl border-2 border-amber-800/70 text-xs shadow-md relative overflow-hidden"
            style={{
              backgroundImage: `linear-gradient(rgba(247, 233, 201, 0.94), rgba(235, 212, 168, 0.96)), url(${ART_ASSETS.parchment})`,
              backgroundSize: 'cover',
              color: '#2b170a'
            }}
          >
            <FantasyCornerBrackets className="w-3.5 h-3.5 text-amber-800/60" />
            <div className="relative z-10 font-serif-rpg text-amber-950 font-semibold text-xs leading-relaxed">
              {prompt.description}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex flex-col gap-2">
            {prompt.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={opt.onExecute}
                className="w-full py-2.5 px-3 rounded-xl btn-fantasy-gold font-fantasy font-black text-xs transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                {opt.label}
              </button>
            ))}

            <button
              onClick={prompt.onCancel}
              className="w-full py-2 px-3 rounded-xl text-xs font-fantasy font-semibold text-amber-200/70 hover:text-amber-100 hover:bg-slate-900 border border-amber-900/40 transition cursor-pointer"
            >
              Pass / Hold Reaction
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
