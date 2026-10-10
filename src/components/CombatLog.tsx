import React, { useState, useRef, useEffect } from 'react';
import { CombatLogEntry } from '../types/combat';
import { ScrollText, ShieldAlert, Swords, Zap, Info, Filter } from 'lucide-react';
import { ART_ASSETS } from '../utils/artAssets';

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
    <div className="relative overflow-hidden flex-1 flex flex-col bg-slate-950 border-2 border-amber-800/70 rounded-2xl p-3.5 shadow-2xl max-h-64 md:max-h-80">
      {/* Ambient parchment texture */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: `url(${ART_ASSETS.parchment})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/95 to-slate-950 pointer-events-none" />

      {/* Header & Filter Controls */}
      <div className="relative z-10 flex items-center justify-between pb-2 border-b border-amber-900/40 text-xs">
        <div className="flex items-center gap-2">
          <ScrollText className="w-4 h-4 text-amber-400" />
          <h3 className="font-fantasy font-bold text-amber-200 tracking-wide text-xs sm:text-sm">
            Combat Chronicle & Rules Arbitration
          </h3>
        </div>

        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-amber-800/50">
          {(['all', 'attack', 'reaction', 'rule'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-2.5 py-0.5 rounded-lg capitalize text-[10px] font-fantasy font-semibold transition cursor-pointer ${
                filter === tab
                  ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-sm'
                  : 'text-amber-200/60 hover:text-amber-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Log Feed (Ancient Scroll Chronicle) */}
      <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto mt-2 space-y-2 pr-1 font-mono text-xs">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-6 text-amber-200/50 italic text-[11px] font-serif-rpg">
            No combat actions recorded yet. Move, take an action, or attack an enemy to begin the chronicle.
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
                className={`p-2.5 rounded-xl border transition text-[11px] leading-relaxed shadow-sm ${
                  isAttack
                    ? 'bg-slate-900/90 border-amber-800/60 text-amber-100'
                    : isDamage
                    ? 'bg-rose-950/40 border-rose-800/60 text-rose-200'
                    : isReaction
                    ? 'bg-purple-950/40 border-purple-800/60 text-purple-200'
                    : isRule
                    ? 'bg-amber-950/30 border-amber-800/60 text-amber-200'
                    : 'bg-slate-900/70 border-slate-800 text-amber-200/80'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-amber-200/60 mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.2 rounded-md bg-slate-950 font-bold text-amber-400 font-mono border border-amber-900/40">
                      R{entry.round}
                    </span>
                    <span className="font-bold text-amber-300 font-fantasy">{entry.actorName}</span>
                  </div>
                  <span className="font-mono text-slate-500">{entry.timestamp}</span>
                </div>

                <div className="font-serif-rpg text-xs sm:text-sm text-amber-100/95 leading-normal">
                  {entry.message}
                </div>

                {/* Math breakdown pills */}
                {entry.details && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5 text-[10px]">
                    {entry.details.d20Roll !== undefined && (
                      <span className="px-2 py-0.5 rounded-lg bg-slate-950 text-amber-200 border border-amber-900/50">
                        Roll: d20({entry.details.d20Roll}) + {entry.details.modifier} = <strong>{entry.details.totalToHit}</strong>
                      </span>
                    )}
                    {entry.details.targetAc !== undefined && (
                      <span className="px-2 py-0.5 rounded-lg bg-slate-950 text-amber-200 border border-amber-900/50">
                        vs AC: <strong>{entry.details.targetAc}</strong>
                        {entry.details.coverBonusApplied ? ` (+${entry.details.coverBonusApplied} Cover)` : ''}
                      </span>
                    )}
                    {entry.details.isHit !== undefined && (
                      <span
                        className={`px-2 py-0.5 rounded-lg font-bold font-fantasy uppercase ${
                          entry.details.isHit
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                            : 'bg-rose-950 text-rose-300 border border-rose-600'
                        }`}
                      >
                        {entry.details.isCrit ? '💥 CRITICAL HIT!' : entry.details.isHit ? '🎯 HIT' : '❌ MISS'}
                      </span>
                    )}
                    {entry.details.damageRolls && (
                      <span className="px-2 py-0.5 rounded-lg bg-rose-950/80 text-rose-200 border border-rose-700/80 font-bold">
                        Dmg: {entry.details.damageRolls} = <strong>{entry.details.damageTotal} {entry.details.damageType}</strong>
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
