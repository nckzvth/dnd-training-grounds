import React from 'react';
import { CombatLogEntry } from '../types/combat';
import { ScrollText, ChevronUp } from 'lucide-react';

interface CombatLogTickerProps {
  logs: CombatLogEntry[];
  onOpenDrawer: () => void;
}

export const CombatLogTicker: React.FC<CombatLogTickerProps> = ({ logs, onOpenDrawer }) => {
  const latestLog = logs[logs.length - 1];

  if (!latestLog) return null;

  return (
    <div className="w-full max-w-[1750px] 2xl:max-w-[1950px] mx-auto px-2 mb-2 select-none">
      <div 
        onClick={onOpenDrawer}
        title="Click or press [L] to open full Combat Chronicle"
        className="flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl bg-black/80 hover:bg-black/95 border border-amber-900/60 hover:border-amber-500/80 transition-all shadow-xl cursor-pointer text-xs group"
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <ScrollText className="w-4 h-4 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
          <span className="text-[11px] font-mono text-amber-400/90 shrink-0 font-bold px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-800/60">
            Round {latestLog.round}
          </span>
          <span className="text-amber-100/90 truncate font-serif-rpg text-xs sm:text-[13px] tracking-wide">
            {latestLog.message}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 text-amber-400/80 group-hover:text-amber-200 text-[11px] font-mono font-bold">
          <span className="font-fantasy hidden sm:inline">Chronicle</span>
          <span>[L]</span>
          <ChevronUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
};
