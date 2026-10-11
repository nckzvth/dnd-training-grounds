import React, { useState, useRef, useEffect } from 'react';
import { CombatLogEntry } from '../types/combat';
import { ScrollText, Swords, Zap, Info, ShieldAlert, X } from 'lucide-react';
import { ART_ASSETS, getDarkVellumStyle } from '../utils/artAssets';
import { FantasyCornerBrackets, ScrollRod, WaxSealBadge } from './FantasyDecorations';

interface CombatLogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  logs: CombatLogEntry[];
}

export const CombatLogDrawer: React.FC<CombatLogDrawerProps> = ({
  isOpen,
  onClose,
  logs,
}) => {
  const [filter, setFilter] = useState<'all' | 'attack' | 'reaction' | 'rule'>('all');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && isOpen) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isOpen]);

  if (!isOpen) return null;

  const filteredLogs = logs.filter((log) => {
    if (filter === 'all') return true;
    if (filter === 'attack') return log.type === 'attack' || log.type === 'damage';
    if (filter === 'reaction') return log.type === 'reaction';
    if (filter === 'rule') return log.type === 'rule';
    return true;
  });

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-200 animate-in fade-in"
      />

      {/* Slide-out Drawer from Right */}
      <div 
        className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-[#120c08] border-l-2 border-amber-800/70 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-250 select-none"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 10%, rgba(26, 18, 12, 0.96) 0%, rgba(15, 10, 6, 0.98) 100%), url(${ART_ASSETS.darkWood})`,
          backgroundSize: 'cover',
        }}
      >
        <FantasyCornerBrackets className="w-5 h-5 text-amber-600/50" />

        {/* Header */}
        <div className="relative z-10 p-4 border-b border-amber-900/50 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-fantasy font-black text-amber-200 text-base">
                Combat Chronicle & Log
              </h2>
              <p className="text-[11px] text-amber-300/80 font-serif-rpg">
                Every dice roll, modifier, reaction, and tabletop arbitration
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            title="Close Log Drawer [Esc] or [L]"
            className="p-1.5 rounded-lg hover:bg-slate-800 text-amber-400 hover:text-amber-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="relative z-10 flex gap-1 p-2.5 bg-black/30 border-b border-amber-900/40 text-xs font-fantasy font-bold">
          {(['all', 'attack', 'reaction', 'rule'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex-1 py-1.5 rounded-lg capitalize transition cursor-pointer ${
                filter === tab
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-950/60'
                  : 'text-amber-200/70 hover:text-amber-100 hover:bg-amber-950/40'
              }`}
            >
              {tab === 'attack' ? 'Attacks' : tab === 'reaction' ? 'Reactions' : tab === 'rule' ? 'Rules' : 'All'}
            </button>
          ))}
        </div>

        {/* Scrollable Chronicle Content */}
        <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto p-4 space-y-2.5 font-serif-rpg text-xs">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-amber-300/60 italic">
              No entries logged under this category yet.
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isCrit = log.details?.isCrit;
              const isAttack = log.type === 'attack';
              const isReaction = log.type === 'reaction';
              const isRule = log.type === 'rule';

              return (
                <div
                  key={log.id}
                  className={`relative p-3 rounded-xl border transition shadow-sm leading-relaxed ${
                    isCrit
                      ? 'border-amber-500/80 bg-amber-950/40 text-amber-100 ring-1 ring-amber-500/50'
                      : isAttack
                      ? 'border-amber-900/50 bg-black/40 text-amber-200'
                      : isReaction
                      ? 'border-purple-900/50 bg-purple-950/20 text-purple-200'
                      : isRule
                      ? 'border-sky-900/50 bg-sky-950/20 text-sky-200'
                      : 'border-amber-900/40 bg-black/30 text-amber-200/90'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono mb-1 text-amber-400/70">
                    <span className="font-bold">
                      Round {log.round} · {log.timestamp}
                    </span>
                    <span className="capitalize font-fantasy font-semibold">
                      {log.type}
                    </span>
                  </div>

                  <div className="font-semibold text-amber-100">
                    {log.message}
                  </div>

                  {log.details && (
                    <div className="mt-1 text-[11px] text-amber-300/80 font-mono bg-black/40 p-1.5 rounded border border-amber-900/30">
                      {log.details.d20Roll !== undefined && (
                        <span>d20({log.details.d20Roll}) + {log.details.modifier} = {log.details.totalToHit} vs AC {log.details.targetAc} </span>
                      )}
                      {log.details.damageRolls && (
                        <span>Dmg: {log.details.damageRolls} = {log.details.damageTotal} {log.details.damageType} </span>
                      )}
                      {log.details.ruleNotes && (
                        <span>{log.details.ruleNotes}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};
