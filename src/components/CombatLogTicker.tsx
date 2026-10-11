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
    <div className="w-full max-w-[1950px] mx-auto px-1 mb-1 select-none">
      <div 
        onClick={onOpenDrawer}
        title="Click or press [L] to open full Combat Chronicle"
        className="flex items-center justify-between gap-2.5 px-3 py-1 rounded-lg bg-black/80 hover:bg-black/95 border border-amber-900/60 hover:border-amber-500/80 transition-all shadow cursor-pointer text-xs group"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <ScrollText className="w-3.5 h-3.5 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-mono text-amber-400/90 shrink-0 font-bold px-1 py-0.2 rounded bg-amber-950/80 border border-amber-800/60">
            R{latestLog.round}
          </span>
          <span className="text-amber-100/90 truncate font-serif-rpg text-xs tracking-wide">
            {latestLog.message}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0 text-amber-400/80 group-hover:text-amber-200 text-[10px] font-mono font-bold">
          <span className="font-fantasy hidden sm:inline">Chronicle</span>
          <span>[L]</span>
          <ChevronUp className="w-3 h-3 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
};
