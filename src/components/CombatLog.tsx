import React, { useState, useRef, useEffect } from 'react';
import { CombatLogEntry } from '../types/combat';
import { ScrollText, Swords, Zap, Info, ShieldAlert } from 'lucide-react';
import { ART_ASSETS } from '../utils/artAssets';
import { FantasyCornerBrackets, ScrollRod, WaxSealBadge } from './FantasyDecorations';

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
    <div className="relative flex-1 flex flex-col shadow-2xl max-h-72 md:max-h-80 select-none">
      {/* Top Wooden Scroll Rod */}
      <ScrollRod position="top" />

      {/* Parchment Scroll Body */}
      <div 
        className="relative flex-1 flex flex-col rounded-xl border-2 border-amber-800/80 p-3 sm:p-4 shadow-xl overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(247, 233, 201, 0.92), rgba(235, 212, 168, 0.94)), url(${ART_ASSETS.parchment})`,
          backgroundSize: 'cover',
          color: '#2b170a',
          boxShadow: 'inset 0 0 35px rgba(120, 53, 15, 0.25), 0 10px 25px rgba(0,0,0,0.6)'
        }}
      >
        <FantasyCornerBrackets className="w-5 h-5 text-amber-800/80" />

        {/* Scroll Header */}
        <div className="relative z-10 flex items-center justify-between pb-2 border-b border-amber-900/30 text-xs">
          <div className="flex items-center gap-2">
            <ScrollText className="w-4 h-4 text-amber-900" />
            <h3 className="font-fantasy font-black text-amber-950 tracking-wide text-xs sm:text-sm drop-shadow-sm">
              Combat Chronicle & Rules Arbitration
            </h3>
          </div>

          {/* Filter Wax Seals */}
          <div className="flex items-center gap-1.5 bg-amber-950/15 p-1 rounded-xl border border-amber-900/30">
            {(['all', 'attack', 'reaction', 'rule'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-2.5 py-0.5 rounded-lg capitalize text-[10px] font-fantasy font-black transition cursor-pointer ${
                  filter === tab
                    ? 'bg-gradient-to-r from-amber-800 to-amber-950 text-amber-100 shadow-md border border-amber-700'
                    : 'text-amber-950/70 hover:text-amber-950 hover:bg-amber-900/10'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Scroll Inscribed Entries */}
        <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto mt-2 space-y-2 pr-1 font-mono text-xs">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-6 text-amber-900/60 italic text-sm font-serif-rpg">
              The chronicle lies blank. Move your hero or initiate an action to record the tale.
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
                      ? 'bg-amber-900/10 border-amber-800/40 text-amber-950'
                      : isDamage
                      ? 'bg-rose-950/15 border-rose-800/40 text-rose-950'
                      : isReaction
                      ? 'bg-purple-950/15 border-purple-800/40 text-purple-950'
                      : isRule
                      ? 'bg-amber-950/15 border-amber-800/40 text-amber-950'
                      : 'bg-amber-900/5 border-amber-900/20 text-amber-900'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-amber-950/70 mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.2 rounded font-black text-amber-950 font-mono bg-amber-900/20 border border-amber-900/30">
                        R{entry.round}
                      </span>
                      <span className="font-black text-amber-950 font-fantasy text-xs">{entry.actorName}</span>
                    </div>
                    <span className="font-mono text-amber-900/60 text-[10px]">{entry.timestamp}</span>
                  </div>

                  <div className="font-serif-rpg text-sm text-[#271407] font-semibold leading-snug">
                    {entry.message}
                  </div>

                  {/* Math calculation seals */}
                  {entry.details && (
                    <div className="mt-1.5 flex flex-wrap gap-1.5 text-[10px]">
                      {entry.details.d20Roll !== undefined && (
                        <span className="px-2 py-0.5 rounded-lg bg-amber-950/10 text-amber-950 border border-amber-900/30 font-bold font-mono">
                          d20({entry.details.d20Roll}) + {entry.details.modifier} = <strong>{entry.details.totalToHit}</strong>
                        </span>
                      )}
                      {entry.details.targetAc !== undefined && (
                        <span className="px-2 py-0.5 rounded-lg bg-amber-950/10 text-amber-950 border border-amber-900/30 font-bold font-mono">
                          vs AC: <strong>{entry.details.targetAc}</strong>
                          {entry.details.coverBonusApplied ? ` (+${entry.details.coverBonusApplied} Cover)` : ''}
                        </span>
                      )}
                      {entry.details.isHit !== undefined && (
                        <WaxSealBadge 
                          text={entry.details.isCrit ? 'CRITICAL HIT!' : entry.details.isHit ? 'HIT!' : 'MISSED!'} 
                          color={entry.details.isCrit || entry.details.isHit ? 'green' : 'red'}
                        />
                      )}
                      {entry.details.damageRolls && (
                        <span className="px-2 py-0.5 rounded-lg bg-rose-900/15 text-rose-950 border border-rose-800/40 font-black font-mono">
                          Damage: {entry.details.damageRolls} = <strong>{entry.details.damageTotal} {entry.details.damageType}</strong>
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

      {/* Bottom Wooden Scroll Rod */}
      <ScrollRod position="bottom" />
    </div>
  );
};
