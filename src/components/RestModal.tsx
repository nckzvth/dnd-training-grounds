import React, { useState } from 'react';
import { Combatant } from '../types/combat';
import { rollDice } from '../utils/dice';
import { Moon, Sun, Heart, Sparkles, X, Check, AlertCircle, Info } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              {restType === 'short' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-400" />}
              Rest & Recovery Mechanics
            </h2>
            <p className="text-xs text-slate-400">Experience how 5e short and long rests replenish hit points and action pools</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Status Banner */}
        <div className="my-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400">Hit Points: </span>
            <span className="font-bold text-emerald-400 font-mono">
              {player.vitals.currentHp} / {player.vitals.maxHp} HP
            </span>
          </div>
          <div>
            <span className="text-slate-400">Hit Dice Pool: </span>
            <span className="font-bold text-amber-400 font-mono">
              {hitDiceCurrent} / {hitDiceMax} {hitDiceDie}
            </span>
          </div>
        </div>

        {/* Rest Type Selector */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={() => { setRestType('short'); setHealingRolled(null); }}
            className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 ${
              restType === 'short'
                ? 'bg-amber-500/20 border-amber-500 text-amber-200 ring-1 ring-amber-500'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sun className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="font-bold text-xs">Short Rest (1 Hour)</div>
              <div className="text-[10px] text-slate-400">Spend Hit Dice to heal; recover Ki & Action Surge</div>
            </div>
          </button>

          <button
            onClick={() => { setRestType('long'); setHealingRolled(null); }}
            className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 ${
              restType === 'long'
                ? 'bg-indigo-500/20 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Moon className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <div className="font-bold text-xs">Long Rest (8 Hours)</div>
              <div className="text-[10px] text-slate-400">Restore 100% HP & recover half spent Hit Dice</div>
            </div>
          </button>
        </div>

        {/* Short Rest Panel */}
        {restType === 'short' ? (
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="font-bold text-slate-200 mb-1 flex items-center justify-between">
                <span>Spend Hit Dice</span>
                <span className="font-mono text-amber-400 font-bold">{hitDiceCurrent} {hitDiceDie} remaining</span>
              </div>
              
              <div className="flex items-center gap-1.5 my-2">
                {Array.from({ length: hitDiceMax }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full border transition ${
                      i < hitDiceCurrent 
                        ? 'bg-amber-400 border-amber-300 shadow-sm shadow-amber-400/50' 
                        : 'bg-slate-800 border-slate-700 opacity-40'
                    }`}
                    title={i < hitDiceCurrent ? 'Available Hit Die' : 'Spent Hit Die'}
                  />
                ))}
              </div>

              <p className="text-slate-400 text-[11px] mb-3">
                Each die rolled adds your CON modifier ({conMod >= 0 ? `+${conMod}` : conMod}) to HP (minimum of 0).
              </p>

              {hitDiceCurrent > 0 ? (
                <div className="flex items-center gap-3">
                  <label className="text-slate-300 font-semibold">Dice to spend:</label>
                  <div className="flex gap-2">
                    {Array.from({ length: hitDiceCurrent }).map((_, idx) => {
                      const count = idx + 1;
                      return (
                        <button
                          key={count}
                          onClick={() => setHitDiceToSpend(count)}
                          className={`px-3 py-1 rounded-lg font-mono font-bold text-xs transition ${
                            hitDiceToSpend === count
                              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {count} {hitDiceDie}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-rose-950/30 border border-rose-800/60 text-rose-300 text-[11px]">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>No Hit Dice remaining! You must complete a <strong>Long Rest</strong> to regain Hit Dice.</span>
                </div>
              )}
            </div>

            {healingRolled !== null && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-200 font-mono text-center space-y-1">
                <div>Regained <strong>+{healingRolled} HP</strong>! (Current: {Math.min(player.vitals.maxHp, player.vitals.currentHp + healingRolled)}/{player.vitals.maxHp})</div>
                {rollBreakdown && <div className="text-[10px] text-emerald-400">{rollBreakdown}</div>}
              </div>
            )}

            <button
              onClick={handleExecuteShortRest}
              disabled={hitDiceCurrent <= 0}
              className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-md transition ${
                hitDiceCurrent > 0
                  ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              Take Short Rest & Roll {hitDiceToSpend} {hitDiceDie}
            </button>
          </div>
        ) : (
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="font-bold text-slate-200 mb-1">5e Official Long Rest Rules</div>
              <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                <li>Hit Points fully restored to maximum (<strong className="text-slate-200">{player.vitals.maxHp} HP</strong>).</li>
                <li>Temporary conditions and exhaustion cleared.</li>
                <li>All daily spell slots and limited abilities fully recharged.</li>
                <li>
                  Regain spent Hit Dice up to <strong className="text-amber-400">half your maximum ({Math.max(1, Math.floor(hitDiceMax / 2))} {hitDiceDie})</strong>.
                </li>
              </ul>
            </div>

            <button
              onClick={handleExecuteLongRest}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-md transition"
            >
              Complete Long Rest (Full Recovery & Regain Hit Dice)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
