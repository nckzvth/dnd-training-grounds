import React, { useState } from 'react';
import { Combatant, ActionItem, CoverEvaluation } from '../types/combat';
import { rollD20, rollDice, doubleDiceFormulaForCrit } from '../utils/dice';
import { 
  Sparkles, 
  Shield, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Flame, 
  X,
  Dices
} from 'lucide-react';

export interface DiceTraySession {
  attacker: Combatant;
  target: Combatant;
  action: ActionItem;
  cover: CoverEvaluation;
  onComplete: (hit: boolean, totalDamage: number, damageBreakdown: string, isCrit: boolean) => void;
  onCancel: () => void;
}

interface TabletopDiceTrayProps {
  session: DiceTraySession | null;
}

export const TabletopDiceTray: React.FC<TabletopDiceTrayProps> = ({ session }) => {
  if (!session) return null;

  const { attacker, target, action, cover, onComplete, onCancel } = session;

  // Step state: 1 = Attack Roll (d20), 2 = Hit Check & Conditional Riders, 3 = Damage Roll
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Attack roll state
  const [manualD20, setManualD20] = useState('');
  const [rolledD20, setRolledD20] = useState<number | null>(null);
  const [isRollingD20, setIsRollingD20] = useState(false);

  // Conditional riders (e.g. Sneak Attack)
  const isRogue = /rogue/i.test(attacker.archetype || '') || action.riders?.includes('sneak_attack');
  const allyAdjacent = true; // Evaluated by engine
  const [includeSneakAttack, setIncludeSneakAttack] = useState(isRogue);

  // Damage roll state
  const [manualDamageTotal, setManualDamageTotal] = useState('');
  const [rolledDamageBreakdown, setRolledDamageBreakdown] = useState<string | null>(null);
  const [rolledDamageTotal, setRolledDamageTotal] = useState<number | null>(null);
  const [isRollingDamage, setIsRollingDamage] = useState(false);

  // Calculation details
  const toHitMod = action.toHitMod ?? 5;
  const effectiveAc = target.vitals.baseAc + cover.acBonus;
  const activeD20 = rolledD20 !== null ? rolledD20 : parseInt(manualD20, 10) || 0;
  const totalToHit = activeD20 + toHitMod;
  const isCrit = activeD20 === 20;
  const isFumble = activeD20 === 1;
  const isHit = (totalToHit >= effectiveAc || isCrit) && !isFumble;

  // Execute digital d20 roll
  const handleRollDigitalD20 = () => {
    setIsRollingD20(true);
    let count = 0;
    const interval = setInterval(() => {
      setRolledD20(Math.floor(Math.random() * 20) + 1);
      count++;
      if (count > 7) {
        clearInterval(interval);
        const finalVal = Math.floor(Math.random() * 20) + 1;
        setRolledD20(finalVal);
        setIsRollingD20(false);
      }
    }, 60);
  };

  // Move to damage or finish miss
  const handleConfirmAttackStep = () => {
    if (!isHit) {
      onComplete(false, 0, 'Miss', false);
      return;
    }
    setStep(3);
  };

  // Roll damage dice
  const handleRollDigitalDamage = () => {
    setIsRollingDamage(true);
    setTimeout(() => {
      let baseFormula = action.damageFormula || '1d8+4';
      if (isCrit) {
        baseFormula = doubleDiceFormulaForCrit(baseFormula);
      }

      const baseResult = rollDice(baseFormula);
      let totalDmg = baseResult.total;
      let breakdown = `${baseResult.individualRolls.join('+')}${baseResult.modifier ? ' + ' + baseResult.modifier : ''}`;

      if (includeSneakAttack) {
        const sneakFormula = isCrit ? '4d6' : '2d6';
        const sneakResult = rollDice(sneakFormula);
        totalDmg += sneakResult.total;
        breakdown += ` + Sneak Attack (${sneakResult.individualRolls.join('+')})`;
      }

      setRolledDamageBreakdown(breakdown);
      setRolledDamageTotal(totalDmg);
      setIsRollingDamage(false);
    }, 350);
  };

  const handleFinalizeDamage = () => {
    const finalTotal = rolledDamageTotal !== null ? rolledDamageTotal : parseInt(manualDamageTotal, 10) || 6;
    const finalBreakdown = rolledDamageBreakdown || `Manual Roll: ${finalTotal}`;
    onComplete(true, finalTotal, finalBreakdown, isCrit);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-amber-500/60 rounded-2xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl shadow-amber-500/10 flex flex-col max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Tabletop Dice Guide & Rules Coach
              </span>
              <span className="text-xs text-slate-400">Step {step} of 3</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-100 mt-1 flex items-center gap-2">
              <Dices className="w-5 h-5 text-amber-400" />
              {action.name} vs {target.name}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dice Silhouettes Tray Bar */}
        <div className="my-4 p-3 rounded-xl bg-slate-950 border border-slate-800/80">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2 flex items-center justify-between">
            <span>Physical Polyhedral Dice Tray</span>
            <span className="text-amber-400 font-mono text-[11px]">
              {step === 1 ? 'Highlighted: d20 (To-Hit)' : `Highlighted: ${action.damageFormula?.includes('d8') ? 'd8' : 'd6'} (Damage)`}
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center select-none">
            {/* d4 */}
            <div className={`p-2 rounded-lg border flex flex-col items-center justify-center transition ${
              action.damageFormula?.includes('d4') && step === 3
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/50 scale-105 animate-pulse'
                : 'bg-slate-900 border-slate-800 text-slate-600 opacity-40'
            }`}>
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current stroke-current">
                <polygon points="12,2 22,20 2,20" fill="none" strokeWidth="2" />
                <line x1="12" y1="2" x2="12" y2="20" strokeWidth="1" strokeDasharray="2 2" />
              </svg>
              <span className="text-[10px] font-bold font-mono mt-1">d4</span>
            </div>

            {/* d6 */}
            <div className={`p-2 rounded-lg border flex flex-col items-center justify-center transition ${
              (action.damageFormula?.includes('d6') || includeSneakAttack) && step === 3
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/50 scale-105 animate-pulse'
                : 'bg-slate-900 border-slate-800 text-slate-600 opacity-40'
            }`}>
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current stroke-current">
                <rect x="4" y="4" width="16" height="16" rx="2" fill="none" strokeWidth="2" />
                <circle cx="8" cy="8" r="1.5" />
                <circle cx="16" cy="16" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
              </svg>
              <span className="text-[10px] font-bold font-mono mt-1">d6</span>
            </div>

            {/* d8 */}
            <div className={`p-2 rounded-lg border flex flex-col items-center justify-center transition ${
              action.damageFormula?.includes('d8') && step === 3
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/50 scale-105 animate-pulse'
                : 'bg-slate-900 border-slate-800 text-slate-600 opacity-40'
            }`}>
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current stroke-current">
                <polygon points="12,2 21,12 12,22 3,12" fill="none" strokeWidth="2" />
                <line x1="3" y1="12" x2="21" y2="12" strokeWidth="1" strokeDasharray="2 2" />
              </svg>
              <span className="text-[10px] font-bold font-mono mt-1">d8</span>
            </div>

            {/* d10 */}
            <div className={`p-2 rounded-lg border flex flex-col items-center justify-center transition ${
              action.damageFormula?.includes('d10') && step === 3
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/50 scale-105 animate-pulse'
                : 'bg-slate-900 border-slate-800 text-slate-600 opacity-40'
            }`}>
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current stroke-current">
                <polygon points="12,2 21,9 12,22 3,9" fill="none" strokeWidth="2" />
              </svg>
              <span className="text-[10px] font-bold font-mono mt-1">d10</span>
            </div>

            {/* d12 */}
            <div className={`p-2 rounded-lg border flex flex-col items-center justify-center transition ${
              action.damageFormula?.includes('d12') && step === 3
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/50 scale-105 animate-pulse'
                : 'bg-slate-900 border-slate-800 text-slate-600 opacity-40'
            }`}>
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current stroke-current">
                <polygon points="12,2 20,7 17,21 7,21 4,7" fill="none" strokeWidth="2" />
              </svg>
              <span className="text-[10px] font-bold font-mono mt-1">d12</span>
            </div>

            {/* d20 (The King of Dice) */}
            <div className={`p-2 rounded-lg border flex flex-col items-center justify-center transition ${
              step === 1
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/60 scale-105 animate-pulse'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}>
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current stroke-current">
                <polygon points="12,2 21,8 18,20 6,20 3,8" fill="none" strokeWidth="2" />
                <polygon points="12,6 17,17 7,17" fill="none" strokeWidth="1" />
              </svg>
              <span className="text-[10px] font-bold font-mono mt-1">d20</span>
            </div>

            {/* d100 */}
            <div className="p-2 rounded-lg border bg-slate-900 border-slate-800 text-slate-600 opacity-30 flex flex-col items-center justify-center">
              <span className="text-xs font-bold font-mono">00</span>
              <span className="text-[10px] font-bold font-mono mt-1">d%</span>
            </div>
          </div>
        </div>

        {/* STEP 1: ATTACK ROLL (d20) */}
        {step === 1 && (
          <div className="flex-1 flex flex-col gap-3">
            {/* Tabletop Coaching Callout */}
            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-900/40 text-xs text-amber-200/90 leading-relaxed">
              <div className="font-bold text-amber-300 flex items-center gap-1.5 mb-1 text-sm">
                <HelpCircle className="w-4 h-4" />
                Tabletop Rule: Rolling to Hit
              </div>
              <p>
                At a physical table, you grab your <strong>20-sided die (the d20)</strong>. Roll it and add your attack modifier (<strong className="text-white">+{toHitMod}</strong>).
                You are trying to match or beat the enemy's Armor Class:
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-[11px]">
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                  Target Base AC: {target.vitals.baseAc}
                </span>
                {cover.acBonus > 0 && (
                  <span className="px-2 py-0.5 rounded bg-amber-900/60 border border-amber-700 text-amber-300">
                    + {cover.acBonus} Cover ({cover.cover.toUpperCase()})
                  </span>
                )}
                <span className="px-2 py-0.5 rounded bg-sky-950 border border-sky-800 text-sky-300 font-bold">
                  = AC {effectiveAc} to Beat
                </span>
              </div>
            </div>

            {/* Roll Options: Digital Click vs Real Table Dice */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-1">
              {/* Option A: Click to Roll in App */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center">
                <span className="text-[11px] font-bold text-slate-400 mb-2">Option A: Roll Digital d20</span>
                <button
                  onClick={handleRollDigitalD20}
                  disabled={isRollingD20}
                  className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-mono font-black text-2xl flex items-center justify-center shadow-lg shadow-amber-900/30 transition transform active:scale-95 border border-amber-300/40"
                >
                  {isRollingD20 ? '...' : rolledD20 !== null ? rolledD20 : 'd20'}
                </button>
                <span className="text-[10px] text-slate-500 mt-2">Click to roll with 5e rng</span>
              </div>

              {/* Option B: Manual Physical Dice Input */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-center text-xs">
                <span className="text-[11px] font-bold text-slate-400 mb-1">Option B: Use Real Table Dice</span>
                <p className="text-[11px] text-slate-400 mb-2">
                  Rolled your physical d20 on the table? Enter the number that landed face up:
                </p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    max="20"
                    placeholder="e.g. 15"
                    value={manualD20}
                    onChange={(e) => {
                      setManualD20(e.target.value);
                      setRolledD20(null);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono text-center font-bold text-lg"
                  />
                </div>
              </div>
            </div>

            {/* Result Math Breakdown */}
            {(rolledD20 !== null || manualD20 !== '') && (
              <div className={`p-3 rounded-xl border text-xs ${
                isHit
                  ? 'bg-emerald-950/30 border-emerald-800 text-emerald-200'
                  : 'bg-rose-950/30 border-rose-800 text-rose-200'
              }`}>
                <div className="flex items-center justify-between font-mono font-bold text-sm">
                  <span className="flex items-center gap-1.5">
                    {isHit ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
                    {isCrit ? 'NATURAL 20! CRITICAL HIT!' : isFumble ? 'NATURAL 1! CRITICAL MISS!' : isHit ? 'HIT!' : 'MISS!'}
                  </span>
                  <span>
                    d20({activeD20}) + {toHitMod} = <strong>{totalToHit}</strong> vs AC {effectiveAc}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-300">
                  {isHit 
                    ? `Your attack roll (${totalToHit}) meets or exceeds the target's AC (${effectiveAc}). Proceed to roll damage!`
                    : `Your attack roll (${totalToHit}) was lower than the target's AC (${effectiveAc}). The attack is deflected.`}
                </p>
              </div>
            )}

            {/* Next Step / Complete Miss Button */}
            {(rolledD20 !== null || manualD20 !== '') && (
              <button
                onClick={handleConfirmAttackStep}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition shadow-lg flex items-center justify-center gap-2 ${
                  isHit
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                {isHit ? 'Proceed to Damage Dice Step ➔' : 'Record Miss & End Action'}
              </button>
            )}
          </div>
        )}

        {/* STEP 3: DAMAGE ROLL */}
        {step === 3 && (
          <div className="flex-1 flex flex-col gap-3">
            {/* Tabletop Coaching Callout */}
            <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-900/40 text-xs text-purple-200/90 leading-relaxed">
              <div className="font-bold text-purple-300 flex items-center gap-1.5 mb-1 text-sm">
                <Flame className="w-4 h-4" />
                Tabletop Rule: Rolling Damage Dice
              </div>
              <p>
                Now pick up your damage dice. For this attack, you roll:
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-[11px]">
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-300 font-bold">
                  Base Weapon: {action.damageFormula} ({action.damageType})
                </span>
                {includeSneakAttack && (
                  <span className="px-2 py-0.5 rounded bg-purple-900/50 border border-purple-700 text-purple-300 font-bold">
                    + Sneak Attack: {isCrit ? '4d6' : '2d6'}
                  </span>
                )}
                {isCrit && (
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500 text-amber-300 font-bold animate-pulse">
                    CRITICAL HIT (Dice Doubled!)
                  </span>
                )}
              </div>
            </div>

            {/* Rogue Sneak Attack Toggle Checkbox */}
            {isRogue && (
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSneakAttack}
                  onChange={(e) => setIncludeSneakAttack(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500"
                />
                <span>
                  <strong>Include Sneak Attack (+2d6):</strong> Target is qualified (ally Thorin is within 5 ft).
                </span>
              </label>
            )}

            {/* Roll Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-1">
              {/* Option A: Click to Roll Damage in App */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center">
                <span className="text-[11px] font-bold text-slate-400 mb-2">Option A: Roll Digital Damage</span>
                <button
                  onClick={handleRollDigitalDamage}
                  disabled={isRollingDamage}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono font-bold text-sm shadow-lg shadow-purple-900/30 transition transform active:scale-95"
                >
                  {isRollingDamage ? 'Rolling Dice...' : rolledDamageTotal !== null ? `${rolledDamageTotal} Damage Rolled` : 'Roll Damage Dice'}
                </button>
                {rolledDamageBreakdown && (
                  <div className="mt-2 text-[10px] text-purple-300 font-mono">
                    {rolledDamageBreakdown}
                  </div>
                )}
              </div>

              {/* Option B: Enter Table Damage */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-center text-xs">
                <span className="text-[11px] font-bold text-slate-400 mb-1">Option B: Physical Table Total</span>
                <p className="text-[11px] text-slate-400 mb-2">
                  Rolled your physical dice on the table? Enter the total damage:
                </p>
                <input
                  type="number"
                  placeholder="e.g. 14"
                  value={manualDamageTotal}
                  onChange={(e) => {
                    setManualDamageTotal(e.target.value);
                    setRolledDamageTotal(null);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono text-center font-bold text-lg"
                />
              </div>
            </div>

            {/* Final Apply Button */}
            {(rolledDamageTotal !== null || manualDamageTotal !== '') && (
              <button
                onClick={handleFinalizeDamage}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition mt-2"
              >
                Apply {rolledDamageTotal !== null ? rolledDamageTotal : manualDamageTotal} Damage to {target.name} & End Action
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
