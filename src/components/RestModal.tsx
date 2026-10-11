import React, { useState } from 'react';
import { ART_ASSETS } from '../utils/artAssets';
import { Combatant } from '../types/combat';
import { rollDice } from '../utils/dice';
import { Moon, Sun, Heart, Sparkles, X, Check, AlertCircle, Info } from 'lucide-react';
import { FantasyCornerBrackets, WaxSealBadge } from './FantasyDecorations';

interface RestModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Combatant;
  onApplyRest: (updatedPlayer: Combatant, restType: 'short' | 'long') => void;
}

export const RestModal: React.FC<RestModalProps> = ({
  isOpen,
  onClose,
  player,
  onApplyRest,
}) => {
  const [restType, setRestType] = useState<'short' | 'long'>('short');
  
  const hitDiceMax = player.vitals.hitDiceMax ?? 3;
  const hitDiceCurrent = player.vitals.hitDiceCurrent ?? hitDiceMax;
  const hitDiceDie = player.vitals.hitDiceDie ?? 'd8';
  
  const [hitDiceToSpend, setHitDiceToSpend] = useState<number>(Math.min(1, hitDiceCurrent));
  const [healingRolled, setHealingRolled] = useState<number | null>(null);
  const [rollBreakdown, setRollBreakdown] = useState<string | null>(null);

  if (!isOpen) return null;

  const conMod = Math.floor((player.attributes.con - 10) / 2);

  const handleExecuteShortRest = () => {
    if (hitDiceCurrent <= 0) return;

    let totalHealed = 0;
    const individualRollStrings: string[] = [];

    for (let i = 0; i < hitDiceToSpend; i++) {
      const roll = rollDice(`1${hitDiceDie}`);
      const dieVal = roll.individualRolls[0] || 4;
      const dieGain = Math.max(0, dieVal + conMod);
      totalHealed += dieGain;
      individualRollStrings.push(`Die ${i + 1}: [${dieVal}] + CON (${conMod >= 0 ? '+' : ''}${conMod}) = ${dieGain} HP`);
    }

    setHealingRolled(totalHealed);
    setRollBreakdown(individualRollStrings.join(' · '));

    const updated = JSON.parse(JSON.stringify(player)) as Combatant;
    updated.vitals.currentHp = Math.min(updated.vitals.maxHp, updated.vitals.currentHp + totalHealed);
    updated.vitals.hitDiceCurrent = Math.max(0, hitDiceCurrent - hitDiceToSpend);

    // Refresh short-rest pools
    updated.resources.forEach((r) => {
      if (r.refreshOn === 'shortRest') {
        r.current = r.max;
      }
    });

    onApplyRest(updated, 'short');
  };

  const handleExecuteLongRest = () => {
    const updated = JSON.parse(JSON.stringify(player)) as Combatant;
    updated.vitals.currentHp = updated.vitals.maxHp;
    updated.vitals.tempHp = 0;
    updated.conditions = [];

    // Regain up to half total hit dice (min 1) per 5e rules
    const diceRegained = Math.max(1, Math.floor(hitDiceMax / 2));
    updated.vitals.hitDiceCurrent = Math.min(hitDiceMax, hitDiceCurrent + diceRegained);

    // Refresh all resources
    updated.resources.forEach((r) => {
      r.current = r.max;
    });

    onApplyRest(updated, 'long');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-950 border-4 border-amber-700/80 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.95)] max-w-xl w-full p-5 flex flex-col relative overflow-hidden max-h-[90vh]">
        <FantasyCornerBrackets className="w-6 h-6 text-amber-500" />
        <div className="absolute inset-0 z-0 pointer-events-none opacity-25 mix-blend-overlay" style={{ backgroundImage: `url(${ART_ASSETS.darkWood})` }} />
        <div className="absolute top-0 right-0 opacity-15 pointer-events-none" style={{ backgroundImage: `url(${ART_ASSETS.crestEmblem})`, width: '160px', height: '160px', backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'top right', mixBlendMode: 'overlay' }} />
        <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-900/60">
          <div>
            <h2 className="text-xl font-fantasy text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 flex items-center gap-2 drop-shadow-md">
              {restType === 'short' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-400" />}
              Rest & Recovery Mechanics
            </h2>
            <p className="text-xs text-amber-200/70 font-serif-rpg text-sm">Experience how 5e short and long rests replenish hit points and action pools</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-amber-400 hover:text-amber-200 hover:bg-slate-800 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Status Banner (Real Parchment Document) */}
        <div 
          className="my-3 p-3 rounded-xl border-2 border-amber-800/70 flex items-center justify-between text-xs shadow-md"
          style={{
            backgroundImage: `linear-gradient(rgba(247, 233, 201, 0.94), rgba(235, 212, 168, 0.96)), url(${ART_ASSETS.parchment})`,
            backgroundSize: 'cover',
            color: '#2b170a'
          }}
        >
          <div>
            <span className="font-fantasy font-black text-amber-950 text-xs">Hit Points: </span>
            <span className="font-bold text-rose-950 font-mono text-sm bg-rose-950/15 px-2 py-0.5 rounded border border-rose-900/30">
              {player.vitals.currentHp} / {player.vitals.maxHp} HP
            </span>
          </div>
          <div>
            <span className="font-fantasy font-black text-amber-950 text-xs">Hit Dice Pool: </span>
            <span className="font-bold text-amber-950 font-mono text-sm bg-amber-950/15 px-2 py-0.5 rounded border border-amber-900/30">
              {hitDiceCurrent} / {hitDiceMax} {hitDiceDie}
            </span>
          </div>
        </div>

        {/* Rest Type Selector */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <button
            onClick={() => { setRestType('short'); setHealingRolled(null); }}
            className={`p-3 rounded-xl border-2 text-left transition flex items-center gap-2.5 cursor-pointer shadow-md ${
              restType === 'short'
                ? 'bg-amber-600 text-white border-amber-400 shadow-amber-950/60 ring-2 ring-amber-500'
                : 'bg-slate-900/80 border-amber-900/50 text-amber-200/70 hover:text-amber-100 hover:bg-slate-850'
            }`}
          >
            <Sun className={`w-5 h-5 shrink-0 ${restType === 'short' ? 'text-white' : 'text-amber-400'}`} />
            <div>
              <div className="font-fantasy font-black text-xs">Short Rest (1 Hour)</div>
              <div className={`text-[10px] ${restType === 'short' ? 'text-amber-100' : 'text-slate-400'}`}>Spend Hit Dice to heal; recover Ki & Action Surge</div>
            </div>
          </button>

          <button
            onClick={() => { setRestType('long'); setHealingRolled(null); }}
            className={`p-3 rounded-xl border-2 text-left transition flex items-center gap-2.5 cursor-pointer shadow-md ${
              restType === 'long'
                ? 'bg-indigo-700 text-white border-indigo-400 shadow-indigo-950/60 ring-2 ring-indigo-500'
                : 'bg-slate-900/80 border-amber-900/50 text-amber-200/70 hover:text-amber-100 hover:bg-slate-850'
            }`}
          >
            <Moon className={`w-5 h-5 shrink-0 ${restType === 'long' ? 'text-white' : 'text-indigo-400'}`} />
            <div>
              <div className="font-fantasy font-black text-xs">Long Rest (8 Hours)</div>
              <div className={`text-[10px] ${restType === 'long' ? 'text-indigo-100' : 'text-slate-400'}`}>Restore 100% HP & recover half spent Hit Dice</div>
            </div>
          </button>
        </div>

        {/* Short Rest Panel */}
        {restType === 'short' ? (
          <div className="space-y-3 text-xs">
            <div 
              className="p-4 rounded-xl border-2 border-amber-800/70 shadow-md space-y-2 relative overflow-hidden"
              style={{
                backgroundImage: `linear-gradient(rgba(247, 233, 201, 0.94), rgba(235, 212, 168, 0.96)), url(${ART_ASSETS.parchment})`,
                backgroundSize: 'cover',
                color: '#2b170a'
              }}
            >
              <FantasyCornerBrackets className="w-3.5 h-3.5 text-amber-800/60" />
              <div className="relative z-10 font-fantasy font-black text-amber-950 text-sm flex items-center justify-between">
                <span>Spend Hit Dice</span>
                <span className="font-mono text-amber-950 font-bold bg-amber-900/15 px-2 py-0.5 rounded border border-amber-900/30">
                  {hitDiceCurrent} {hitDiceDie} remaining
                </span>
              </div>
              
              <div className="relative z-10 flex items-center gap-2 my-2">
                {Array.from({ length: hitDiceMax }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-full border-2 transition shadow-sm ${
                      i < hitDiceCurrent 
                        ? 'bg-amber-600 border-amber-800 shadow-amber-900/40' 
                        : 'bg-stone-300 border-stone-400 opacity-40'
                    }`}
                    title={i < hitDiceCurrent ? 'Available Hit Die' : 'Spent Hit Die'}
                  />
                ))}
              </div>

              <p className="relative z-10 font-serif-rpg font-semibold text-amber-900 text-xs leading-relaxed">
                Each die rolled adds your CON modifier ({conMod >= 0 ? `+${conMod}` : conMod}) to HP (minimum of 0).
              </p>

              {hitDiceCurrent > 0 ? (
                <div className="relative z-10 flex items-center gap-3 pt-1">
                  <label className="font-fantasy font-black text-amber-950 text-xs">Dice to spend:</label>
                  <div className="flex gap-2">
                    {Array.from({ length: hitDiceCurrent }).map((_, idx) => {
                      const count = idx + 1;
                      return (
                        <button
                          key={count}
                          onClick={() => setHitDiceToSpend(count)}
                          className={`px-3 py-1 rounded-lg font-mono font-bold text-xs transition cursor-pointer shadow-sm ${
                            hitDiceToSpend === count
                              ? 'bg-amber-800 text-amber-100 font-bold border border-amber-700 shadow-md'
                              : 'bg-amber-900/10 border border-amber-900/30 text-amber-950 hover:bg-amber-900/20'
                          }`}
                        >
                          {count} {hitDiceDie}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="relative z-10 flex items-center gap-2 p-2.5 rounded-lg bg-rose-950/20 border border-rose-900/40 text-rose-950 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-800" />
                  <span>No Hit Dice remaining! You must complete a <strong>Long Rest</strong> to regain Hit Dice.</span>
                </div>
              )}
            </div>

            {healingRolled !== null && (
              <div className="p-3 rounded-xl bg-emerald-950/20 border-2 border-emerald-800/60 text-emerald-950 font-mono text-center space-y-1 shadow">
                <div className="font-bold text-sm">Regained <strong>+{healingRolled} HP</strong>! (Current: {Math.min(player.vitals.maxHp, player.vitals.currentHp + healingRolled)}/{player.vitals.maxHp})</div>
                {rollBreakdown && <div className="text-xs text-emerald-900 font-semibold">{rollBreakdown}</div>}
              </div>
            )}

            <button
              onClick={handleExecuteShortRest}
              disabled={hitDiceCurrent <= 0}
              className={`w-full py-2.5 rounded-xl font-fantasy font-black text-xs shadow-md transition cursor-pointer ${
                hitDiceCurrent > 0
                  ? 'btn-fantasy-gold'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              Take Short Rest & Roll {hitDiceToSpend} {hitDiceDie}
            </button>
          </div>
        ) : (
          <div className="space-y-3 text-xs">
            <div 
              className="p-4 rounded-xl border-2 border-indigo-900/50 shadow-md space-y-2 relative overflow-hidden"
              style={{
                backgroundImage: `linear-gradient(rgba(247, 233, 201, 0.94), rgba(235, 212, 168, 0.96)), url(${ART_ASSETS.parchment})`,
                backgroundSize: 'cover',
                color: '#2b170a'
              }}
            >
              <FantasyCornerBrackets className="w-3.5 h-3.5 text-indigo-900/60" />
              <div className="relative z-10 font-fantasy font-black text-amber-950 text-sm mb-1">5e Official Long Rest Rules</div>
              <ul className="relative z-10 list-disc list-inside space-y-1.5 font-serif-rpg font-semibold text-amber-950 text-xs leading-relaxed">
                <li>Hit Points fully restored to maximum (<strong className="text-amber-950 font-black">{player.vitals.maxHp} HP</strong>).</li>
                <li>Temporary conditions and exhaustion cleared.</li>
                <li>All daily spell slots and limited abilities fully recharged.</li>
                <li>
                  Regain spent Hit Dice up to <strong className="text-amber-900 font-black">half your maximum ({Math.max(1, Math.floor(hitDiceMax / 2))} {hitDiceDie})</strong>.
                </li>
              </ul>
            </div>

            <button
              onClick={handleExecuteLongRest}
              className="w-full py-2.5 rounded-xl btn-fantasy-gold font-fantasy font-black text-xs shadow-md transition cursor-pointer"
            >
              Complete Long Rest (Full Recovery & Regain Hit Dice)
            </button>
          </div>
        )}
      </div></div>
    </div>
  );
};
