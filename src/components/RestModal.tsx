import React, { useState } from 'react';
import { Combatant } from '../types/combat';
import { rollDice } from '../utils/dice';
import { Moon, Sun, Heart, Sparkles, X, Check } from 'lucide-react';

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
  const [hitDiceSpent, setHitDiceSpent] = useState(1);
  const [healingRolled, setHealingRolled] = useState<number | null>(null);

  if (!isOpen) return null;

  const conMod = Math.floor((player.attributes.con - 10) / 2);

  const handleExecuteShortRest = () => {
    // Roll Hit Dice
    const roll = rollDice(`${hitDiceSpent}d8 + ${hitDiceSpent * conMod}`);
    const healTotal = roll.total;
    setHealingRolled(healTotal);

    const updated = JSON.parse(JSON.stringify(player)) as Combatant;
    updated.vitals.currentHp = Math.min(updated.vitals.maxHp, updated.vitals.currentHp + healTotal);

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

        {/* Rest Type Selector */}
        <div className="grid grid-cols-2 gap-2 my-4">
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
              <div className="text-[10px] text-slate-400">Spend Hit Dice to heal, recover Ki / Action Surge</div>
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
              <div className="text-[10px] text-slate-400">Full HP recovery, restores all spell slots & features</div>
            </div>
          </button>
        </div>

        {/* Short Rest Panel */}
        {restType === 'short' ? (
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="font-bold text-slate-200 mb-1 flex items-center justify-between">
                <span>Spend Hit Dice</span>
                <span className="font-mono text-amber-400">3d8 available</span>
              </div>
              <p className="text-slate-400 text-[11px] mb-3">
                In 5e, a character can spend 1 or more Hit Dice during a short rest. Each die rolled adds your CON modifier (+{conMod}) to your HP.
              </p>

              <div className="flex items-center gap-3">
                <label className="text-slate-300 font-semibold">Dice to roll:</label>
                <div className="flex gap-2">
                  {[1, 2, 3].map((num) => (
                    <button
                      key={num}
                      onClick={() => setHitDiceSpent(num)}
                      className={`px-3 py-1 rounded-lg font-mono font-bold text-xs transition ${
                        hitDiceSpent === num
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-900 border border-slate-800 text-slate-400'
                      }`}
                    >
                      {num}d8
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {healingRolled !== null && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-200 font-mono text-center">
                Rolled {hitDiceSpent}d8 + {hitDiceSpent * conMod}: Regained <strong>+{healingRolled} HP</strong>!
              </div>
            )}

            <button
              onClick={handleExecuteShortRest}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-xs shadow-md transition"
            >
              Take Short Rest & Roll Hit Dice
            </button>
          </div>
        ) : (
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="font-bold text-slate-200 mb-1">Long Rest Benefits</div>
              <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                <li>Hit Points fully restored to maximum (<strong className="text-slate-200">{player.vitals.maxHp} HP</strong>).</li>
                <li>All daily spell slots and features restored (e.g. Wails from the Grave, Vampiric Bite, Action Surge).</li>
                <li>Temporary conditions and exhaustion cleared.</li>
              </ul>
            </div>

            <button
              onClick={handleExecuteLongRest}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-md transition"
            >
              Complete Long Rest (Full Recovery)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
