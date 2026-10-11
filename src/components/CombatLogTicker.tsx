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
    <div className="w-full max-w-6xl mx-auto px-2 mb-1.5 select-none">
      <div 
        onClick={onOpenDrawer}
        title="Click or press [L] to open full Combat Chronicle"
        className="flex items-center justify-between gap-2.5 px-3 py-1.5 rounded-xl bg-black/75 hover:bg-black/90 border border-amber-900/50 hover:border-amber-600/70 transition shadow-lg cursor-pointer text-xs group"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <ScrollText className="w-3.5 h-3.5 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-mono text-amber-400/80 shrink-0 font-bold">
            [R{latestLog.round}]
          </span>
          <span className="text-amber-200/90 truncate font-serif-rpg text-xs">
            {latestLog.message}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0 text-amber-400/70 group-hover:text-amber-200 text-[10px] font-mono font-bold">
          <span>Log [L]</span>
          <ChevronUp className="w-3 h-3 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
};
