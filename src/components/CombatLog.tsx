import React, { useState, useRef, useEffect } from 'react';
import { CombatLogEntry } from '../types/combat';
import { ScrollText, ShieldAlert, Swords, Zap, Info, Filter } from 'lucide-react';

interface CombatLogProps {
  logs: CombatLogEntry[];
}

export const CombatLog: React.FC<CombatLogProps> = ({ logs }) => {
  const [filter, setFilter] = useState<'all' | 'attack' | 'reaction' | 'rule'>('all');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const filteredLogs = logs.filter((log) => {
    if (filter === 'all') return true;
    if (filter === 'attack') return log.type === 'attack' || log.type === 'damage';
    if (filter === 'reaction') return log.type === 'reaction';
    if (filter === 'rule') return log.type === 'rule';
    return true;
  });

  return (
    <div className="flex-1 flex flex-col bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-xl max-h-64 md:max-h-80 overflow-hidden">
      {/* Header & Filter Controls */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-200">
          <ScrollText className="w-4 h-4 text-amber-400" />
          <span>Combat Ledger & Rules Arbitration</span>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
          {(['all', 'attack', 'reaction', 'rule'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-2 py-0.5 rounded capitalize text-[10px] font-semibold transition ${
                filter === tab
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Log Feed */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto mt-2 space-y-1.5 pr-1 font-mono text-xs">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-6 text-slate-500 italic text-[11px]">
            No combat actions recorded yet. Move, take an action, or attack an enemy to begin the log.
          </div>
        ) : (
          filteredLogs.map((entry) => {
            const isAttack = entry.type === 'attack';
            const isDamage = entry.type === 'damage';
            const isReaction = entry.type === 'reaction';
            const isRule = entry.type === 'rule';

            return (
              <div
                key={entry.id}
                className={`p-2 rounded border transition text-[11px] leading-relaxed ${
                  isAttack
                    ? 'bg-slate-950/70 border-slate-800/80 text-slate-200'
                    : isDamage
                    ? 'bg-rose-950/30 border-rose-900/40 text-rose-200'
                    : isReaction
                    ? 'bg-purple-950/30 border-purple-900/40 text-purple-200'
                    : isRule
                    ? 'bg-amber-950/20 border-amber-900/30 text-amber-200'
                    : 'bg-slate-950/50 border-slate-900 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1 rounded bg-slate-900 font-bold text-slate-400">R{entry.round}</span>
                    <span className="font-semibold text-slate-300">{entry.actorName}</span>
                  </div>
                  <span>{entry.timestamp}</span>
                </div>

                <div>{entry.message}</div>

                {/* Math breakdown pills */}
                {entry.details && (
                  <div className="mt-1 flex flex-wrap gap-1 text-[10px]">
                    {entry.details.d20Roll !== undefined && (
                      <span className="px-1.5 py-0.2 rounded bg-slate-900 text-slate-300 border border-slate-800">
                        Roll: d20({entry.details.d20Roll}) + {entry.details.modifier} = {entry.details.totalToHit}
                      </span>
                    )}
                    {entry.details.targetAc !== undefined && (
                      <span className="px-1.5 py-0.2 rounded bg-slate-900 text-slate-300 border border-slate-800">
                        vs AC: {entry.details.targetAc}
                        {entry.details.coverBonusApplied ? ` (+${entry.details.coverBonusApplied} Cover)` : ''}
                      </span>
                    )}
                    {entry.details.isHit !== undefined && (
                      <span
                        className={`px-1.5 py-0.2 rounded font-bold uppercase ${
                          entry.details.isHit
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}
                      >
                        {entry.details.isCrit ? 'CRITICAL HIT!' : entry.details.isHit ? 'HIT' : 'MISS'}
                      </span>
                    )}
                    {entry.details.damageRolls && (
                      <span className="px-1.5 py-0.2 rounded bg-rose-950/80 text-rose-300 border border-rose-800">
                        Dmg: {entry.details.damageRolls} = {entry.details.damageTotal} {entry.details.damageType}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
