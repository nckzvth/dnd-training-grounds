import React, { useState, useEffect } from 'react';
import { Combatant, ActionItem, CoverEvaluation } from '../types/combat';
import { rollDice, doubleDiceFormulaForCrit } from '../utils/dice';
import { ART_ASSETS, getTokenImage, getDarkVellumStyle } from '../utils/artAssets';
import { 
  Dices, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  X,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  Info,
  Shield,
  Zap,
  Target
} from 'lucide-react';
import { FantasyCornerBrackets } from './FantasyDecorations';

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
  // Idle Sandbox State
  const [sandboxFormula, setSandboxFormula] = useState('1d20+5');
  const [sandboxResult, setSandboxResult] = useState<{ total: number; breakdown: string; rolls: number[] } | null>(null);
  const [lastCompletedAction, setLastCompletedAction] = useState<{
    actionName: string;
    targetName: string;
    breakdown: string;
    totalDamage: number;
    hit: boolean;
  } | null>(null);
  const [showLastRollDetails, setShowLastRollDetails] = useState(false);

  // Active Session State
  const isSavingThrowAction = session?.action.type === 'saving_throw_spell' || !!session?.action.saveType;
  const [sessionStep, setSessionStep] = useState<1 | 2 | 3>(1);

  // Attack Roll States (Step 1)
  const [manualD20, setManualD20] = useState('');
  const [rolledD20, setRolledD20] = useState<number | null>(null);
  const [isRollingD20, setIsRollingD20] = useState(false);

  // Saving Throw States (Step 1 for Save Spells)
  const [manualSaveD20, setManualSaveD20] = useState('');
  const [rolledSaveD20, setRolledSaveD20] = useState<number | null>(null);
  const [isRollingSaveD20, setIsRollingSaveD20] = useState(false);

  // Conditional Riders (Sneak Attack, etc.)
  const isRogueAttacker = session ? (/rogue/i.test(session.attacker.archetype || '') || session.action.riders?.includes('sneak_attack')) : false;
  const [includeSneakAttack, setIncludeSneakAttack] = useState(isRogueAttacker);

  // Damage Roll States (Step 3)
  const [manualDamageTotal, setManualDamageTotal] = useState('');
  const [rolledDamageBreakdown, setRolledDamageBreakdown] = useState<string | null>(null);
  const [rolledDamageTotal, setRolledDamageTotal] = useState<number | null>(null);
  const [isRollingDamage, setIsRollingDamage] = useState(false);

  // Reset session state when a new attack/spell is initiated
  useEffect(() => {
    if (session) {
      setSessionStep(1);
      setManualD20('');
      setRolledD20(null);
      setManualSaveD20('');
      setRolledSaveD20(null);
      setManualDamageTotal('');
      setRolledDamageBreakdown(null);
      setRolledDamageTotal(null);
      setIncludeSneakAttack(isRogueAttacker);
    }
  }, [session?.action.id, session?.target.id]);

  // IDLE TRAY: Free roll a single die type
  const handleRollSingleDie = (die: 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100') => {
    const sides = die === 'd100' ? 100 : parseInt(die.replace('d', ''), 10);
    const val = Math.floor(Math.random() * sides) + 1;
    setSandboxResult({
      total: val,
      breakdown: `Single ${die} roll`,
      rolls: [val],
    });
  };

  const handleRollSandboxFormula = (formula: string) => {
    try {
      const res = rollDice(formula);
      setSandboxResult({
        total: res.total,
        breakdown: `${res.individualRolls.join(' + ')}${res.modifier ? ` + ${res.modifier}` : ''} = ${res.total}`,
        rolls: res.individualRolls,
      });
    } catch {
      setSandboxResult(null);
    }
  };

  // -------------------------------------------------------------
  // ACTIVE SESSION CALCULATIONS & DERIVATIONS
  // -------------------------------------------------------------
  if (session) {
    const { attacker, target, action, cover, onComplete, onCancel } = session;

    // Spatial & Range calculations
    const distFt = Math.round(
      Math.sqrt(
        Math.pow((attacker.spatial.x - target.spatial.x) * 5, 2) +
        Math.pow((attacker.spatial.y - target.spatial.y) * 5, 2)
      )
    );
    const normalRange = action.rangeFt || action.reachFt || 5;
    const longRange = action.longRangeFt || normalRange;
    const isLongRangeDisadvantage = distFt > normalRange && distFt <= longRange;

    // Attributes & Modifiers
    const strMod = Math.floor((attacker.attributes.str - 10) / 2);
    const dexMod = Math.floor((attacker.attributes.dex - 10) / 2);
    const intMod = Math.floor((attacker.attributes.int - 10) / 2);
    const wisMod = Math.floor((attacker.attributes.wis - 10) / 2);
    const chaMod = Math.floor((attacker.attributes.cha - 10) / 2);
    const proficiencyBonus = 2; // Level 1-4 standard

    // Finesse / Attribute reasoning
    const isFinesse = action.type === 'melee_weapon' && dexMod > strMod;
    const chosenAbility = isFinesse ? 'DEX' : action.type === 'ranged_weapon' ? 'DEX' : 'STR';
    const chosenMod = isFinesse ? dexMod : action.type === 'ranged_weapon' ? dexMod : strMod;
    const toHitMod = action.toHitMod ?? (chosenMod + proficiencyBonus);

    // Cover & AC Calculations
    const targetBaseAc = target.vitals.baseAc;
    const coverBonusAc = cover.acBonus;
    const effectiveAc = targetBaseAc + coverBonusAc;

    // Active Attack d20 Calculation
    const activeD20 = rolledD20 !== null ? rolledD20 : parseInt(manualD20, 10) || 0;
    const totalToHit = activeD20 + toHitMod;
    const isCrit = activeD20 === 20;
    const isFumble = activeD20 === 1;
    const isHit = (totalToHit >= effectiveAc || isCrit) && !isFumble;

    // Active Saving Throw Calculations
    const saveType = action.saveType || 'dex';
    const targetSaveMod = (target.attributes[saveType] ? Math.floor((target.attributes[saveType] - 10) / 2) : 0) + (target.saves.includes(saveType) ? 2 : 0);
    const ignoresCover = action.name.toLowerCase().includes('sacred flame');
    const targetSaveCoverBonus = (!ignoresCover && saveType === 'dex') ? cover.dexSaveBonus : 0;
    
    // Spell Save DC calculation: 8 + PB + primary casting mod
    const primaryCastingMod = Math.max(intMod, wisMod, chaMod);
    const spellSaveDC = action.saveDC || (8 + proficiencyBonus + primaryCastingMod);

    const activeSaveD20 = rolledSaveD20 !== null ? rolledSaveD20 : parseInt(manualSaveD20, 10) || 0;
    const totalSaveRoll = activeSaveD20 + targetSaveMod + targetSaveCoverBonus;
    const targetSaveSucceeded = totalSaveRoll >= spellSaveDC;

    // Digital roll animations
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
      }, 50);
    };

    const handleRollDigitalSaveD20 = () => {
      setIsRollingSaveD20(true);
      let count = 0;
      const interval = setInterval(() => {
        setRolledSaveD20(Math.floor(Math.random() * 20) + 1);
        count++;
        if (count > 7) {
          clearInterval(interval);
          const finalVal = Math.floor(Math.random() * 20) + 1;
          setRolledSaveD20(finalVal);
          setIsRollingSaveD20(false);
        }
      }, 50);
    };

    // Damage roll resolution
    const handleRollDigitalDamage = () => {
      setIsRollingDamage(true);
      setTimeout(() => {
        let baseFormula = action.damageFormula || (isSavingThrowAction ? '1d8' : '1d8+4');
        if (isCrit && !isSavingThrowAction) {
          baseFormula = doubleDiceFormulaForCrit(baseFormula);
        }

        const baseResult = rollDice(baseFormula);
        let totalDmg = baseResult.total;
        let breakdown = `${baseResult.individualRolls.join('+')}${baseResult.modifier ? ' + ' + baseResult.modifier : ''}`;

        // Rogue Sneak Attack
        if (includeSneakAttack && !isSavingThrowAction) {
          const sneakFormula = isCrit ? '4d6' : '2d6';
          const sneakResult = rollDice(sneakFormula);
          totalDmg += sneakResult.total;
          breakdown += ` + Sneak Attack [${sneakResult.individualRolls.join('+')}]`;
        }

        // Saving Throw Spell Half-Damage resolution
        if (isSavingThrowAction && targetSaveSucceeded) {
          if (action.halfDamageOnSave) {
            const halved = Math.floor(totalDmg / 2);
            breakdown = `[Full: ${totalDmg}] -> Saved (Half): ${halved} damage`;
            totalDmg = halved;
          } else {
            breakdown = `[Full: ${totalDmg}] -> Saved: 0 damage (Spell negated)`;
            totalDmg = 0;
          }
        }

        setRolledDamageBreakdown(breakdown);
        setRolledDamageTotal(totalDmg);
        setIsRollingDamage(false);
      }, 250);
    };

    const handleFinalizeDamage = () => {
      let finalTotal = rolledDamageTotal !== null ? rolledDamageTotal : parseInt(manualDamageTotal, 10);
      if (isNaN(finalTotal)) finalTotal = 6;

      if (isSavingThrowAction && targetSaveSucceeded && !action.halfDamageOnSave) {
        finalTotal = 0;
      }

      const finalBreakdown = rolledDamageBreakdown || `Manual Roll: ${finalTotal}`;

      setLastCompletedAction({
        actionName: action.name,
        targetName: target.name,
        breakdown: finalBreakdown,
        totalDamage: finalTotal,
        hit: !isSavingThrowAction ? isHit : !targetSaveSucceeded,
      });

      onComplete(!isSavingThrowAction ? isHit : !targetSaveSucceeded, finalTotal, finalBreakdown, isCrit);
    };

    return (
      <section className="relative overflow-hidden w-full bg-slate-950 border-2 border-amber-600/70 rounded-2xl p-4 sm:p-5 shadow-2xl shadow-amber-950/40 flex flex-col gap-4 animate-in fade-in duration-200">
        <FantasyCornerBrackets className="w-5 h-5 text-amber-500" />
        {/* Subtle tabletop felt ambient background */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-25 pointer-events-none mix-blend-overlay"
          style={{ backgroundImage: `url(${ART_ASSETS.diceTray})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/95 to-slate-950 pointer-events-none" />

        {/* Tray Header */}
        <div className="relative z-10 flex items-start justify-between pb-3 border-b border-amber-900/40">
          <div className="flex items-center gap-3">
            <img 
              src={getTokenImage(attacker)} 
              alt={attacker.name} 
              className="w-11 h-11 rounded-full border-2 border-amber-400 shadow-md object-cover shrink-0" 
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                  <Dices className="w-3.5 h-3.5" />
                  Tabletop Dice Tray & Rules Coach
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  {isSavingThrowAction ? 'Spell Saving Throw' : `Step ${sessionStep} of 3`}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-100 mt-0.5 flex flex-wrap items-center gap-2">
                <span className="text-amber-400">{attacker.name}</span>
                <span className="text-slate-500">→</span>
                <span className="text-emerald-300 font-semibold">{action.name}</span>
                <span className="text-slate-500">vs</span>
                <span className="text-rose-400 flex items-center gap-1.5 font-semibold">
                  <img 
                    src={getTokenImage(target)} 
                    alt={target.name} 
                    className="w-5 h-5 rounded-full border border-rose-500/80 inline object-cover" 
                  />
                  {target.name}
                </span>
              </h2>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="relative z-10 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700/80 flex items-center gap-1 transition shrink-0"
          >
            <X className="w-3.5 h-3.5" /> Cancel
          </button>
        </div>

        {/* Tactical Context & 5e Math Inspector (Dark Antiqued Vellum) */}
        <div 
          className="relative z-10 p-3.5 rounded-xl border border-amber-900/50 text-xs space-y-2 shadow-lg overflow-hidden"
          style={getDarkVellumStyle(0.92)}
        >
          <FantasyCornerBrackets className="w-4 h-4 text-amber-600/50" />
          <div className="relative z-10 font-bold text-amber-200 flex items-center justify-between text-[11px] uppercase tracking-wider font-fantasy">
            <span className="flex items-center gap-1.5 text-amber-100 font-black">
              <Info className="w-3.5 h-3.5 text-amber-400" /> 5e Decision & Calculation Inspector
            </span>
            <span className="font-mono text-amber-200 bg-black/40 px-2 py-0.5 rounded font-black border border-amber-900/40">
              Distance: {distFt} ft
            </span>
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1 text-[11px]">
            {/* Box 1: Attacker Choices */}
            <div className="bg-black/40 p-2.5 rounded-lg border border-amber-900/35 space-y-1">
              <div className="font-black text-amber-300 uppercase text-[10px] font-fantasy">1. Attacker Choice</div>
              <div className="text-amber-200/90 font-medium">
                • <strong>Modifier:</strong> {chosenAbility} ({chosenMod >= 0 ? `+${chosenMod}` : chosenMod}) + PB (+{proficiencyBonus})
                {isFinesse && <span className="text-emerald-300 block text-[10px] font-bold">↳ Finesse weapon: DEX preferred over STR.</span>}
              </div>
              <div className="text-amber-100 font-mono text-[10px] font-black">
                Total To-Hit Mod = <strong>+{toHitMod}</strong>
              </div>
            </div>

            {/* Box 2: Spatial & Cover Math */}
            <div className="bg-black/40 p-2.5 rounded-lg border border-amber-900/35 space-y-1">
              <div className="font-black text-amber-300 uppercase text-[10px] font-fantasy">2. Spatial Defense</div>
              <div className="text-amber-200/90 font-medium">
                • <strong>Target Defense:</strong> Base AC {targetBaseAc}
              </div>
              <div className="text-amber-200/90 font-medium">
                • <strong>Cover:</strong> {cover.cover.toUpperCase()} ({coverBonusAc > 0 ? `+${coverBonusAc} AC bonus` : '0 AC bonus'})
              </div>
              <div className="text-amber-100 font-mono text-[10px] font-black">
                Effective AC = {targetBaseAc} + {coverBonusAc} = <strong>{effectiveAc} AC</strong>
              </div>
            </div>

            {/* Box 3: Tactical Modifiers */}
            <div className="bg-black/40 p-2.5 rounded-lg border border-amber-900/35 space-y-1">
              <div className="font-black text-amber-300 uppercase text-[10px] font-fantasy">3. Tactical Modifiers</div>
              <div className="text-amber-200/90 font-medium">
                • <strong>Range Check:</strong> {distFt} ft / normal {normalRange} ft
                {isLongRangeDisadvantage && <span className="text-rose-300 block font-bold">↳ Long Range! Attack has Disadvantage.</span>}
              </div>
              {attacker.spatial.isHiding && (
                <div className="text-emerald-300 text-[10px] font-bold">
                  • <strong>Attacker Hidden:</strong> Grants Advantage!
                </div>
              )}
              {isSavingThrowAction && (
                <div className="text-purple-300 text-[10px] font-bold">
                  • <strong>Spell Save DC:</strong> 8 + PB({proficiencyBonus}) + Mod({primaryCastingMod}) = <strong>DC {spellSaveDC}</strong>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Physical Polyhedral Dice Tray Silhouettes */}
        <div className="relative z-10 p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-sm">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Target className="w-3 h-3 text-amber-400" /> Physical Tabletop Dice Guide
            </span>
            <span className="text-amber-400 font-mono text-[11px] font-bold">
              {isSavingThrowAction 
                ? (sessionStep === 1 ? `Target rolls d20 (${saveType.toUpperCase()} Save)` : `Pick up ${action.damageFormula?.includes('d8') ? 'd8' : 'd6'} (Damage)`)
                : (sessionStep === 1 ? 'Highlighted: d20 (To-Hit Roll)' : `Highlighted: ${action.damageFormula?.includes('d8') ? 'd8' : 'd6'} (Damage Roll)`)}
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center select-none">
            {/* d4 */}
            <div className={`p-2 rounded-xl border flex flex-col items-center justify-center transition ${
              action.damageFormula?.includes('d4') && sessionStep === 3
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/60 scale-105 shadow-md animate-pulse'
                : 'bg-slate-950/60 border-slate-800 text-slate-600 opacity-40'
            }`}>
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current stroke-current"><polygon points="12,2 22,20 2,20" fill="none" strokeWidth="2" /><line x1="12" y1="2" x2="12" y2="20" strokeWidth="1" strokeDasharray="2 2" /></svg>
              <span className="text-[10px] font-bold font-mono mt-1">d4</span>
            </div>

            {/* d6 */}
            <div className={`p-2 rounded-xl border flex flex-col items-center justify-center transition ${
              (action.damageFormula?.includes('d6') || includeSneakAttack) && sessionStep === 3
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/60 scale-105 shadow-md animate-pulse'
                : 'bg-slate-950/60 border-slate-800 text-slate-600 opacity-40'
            }`}>
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current stroke-current"><rect x="4" y="4" width="16" height="16" rx="2" fill="none" strokeWidth="2" /><circle cx="8" cy="8" r="1.5" /><circle cx="16" cy="16" r="1.5" /><circle cx="12" cy="12" r="1.5" /></svg>
              <span className="text-[10px] font-bold font-mono mt-1">d6</span>
            </div>

            {/* d8 */}
            <div className={`p-2 rounded-xl border flex flex-col items-center justify-center transition ${
              action.damageFormula?.includes('d8') && sessionStep === 3
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/60 scale-105 shadow-md animate-pulse'
                : 'bg-slate-950/60 border-slate-800 text-slate-600 opacity-40'
            }`}>
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current stroke-current"><polygon points="12,2 21,12 12,22 3,12" fill="none" strokeWidth="2" /><line x1="3" y1="12" x2="21" y2="12" strokeWidth="1" strokeDasharray="2 2" /></svg>
              <span className="text-[10px] font-bold font-mono mt-1">d8</span>
            </div>

            {/* d10 */}
            <div className={`p-2 rounded-xl border flex flex-col items-center justify-center transition ${
              action.damageFormula?.includes('d10') && sessionStep === 3
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/60 scale-105 shadow-md animate-pulse'
                : 'bg-slate-950/60 border-slate-800 text-slate-600 opacity-40'
            }`}>
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current stroke-current"><polygon points="12,2 21,9 12,22 3,9" fill="none" strokeWidth="2" /><line x1="12" y1="2" x2="12" y2="22" strokeWidth="1" strokeDasharray="2 2" /></svg>
              <span className="text-[10px] font-bold font-mono mt-1">d10</span>
            </div>

            {/* d12 */}
            <div className={`p-2 rounded-xl border flex flex-col items-center justify-center transition ${
              action.damageFormula?.includes('d12') && sessionStep === 3
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/60 scale-105 shadow-md animate-pulse'
                : 'bg-slate-950/60 border-slate-800 text-slate-600 opacity-40'
            }`}>
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current stroke-current"><polygon points="12,2 20,7 17,21 7,21 4,7" fill="none" strokeWidth="2" /></svg>
              <span className="text-[10px] font-bold font-mono mt-1">d12</span>
            </div>

            {/* d20 */}
            <div className={`p-2 rounded-xl border flex flex-col items-center justify-center transition ${
              sessionStep === 1
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/60 scale-105 shadow-md animate-pulse'
                : 'bg-slate-950/60 border-slate-800 text-slate-600 opacity-40'
            }`}>
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current stroke-current"><polygon points="12,2 22,8 18,20 6,20 2,8" fill="none" strokeWidth="2" /><polygon points="12,6 18,17 6,17" fill="none" strokeWidth="1.5" /></svg>
              <span className="text-[10px] font-bold font-mono mt-1">d20</span>
            </div>

            {/* d100 */}
            <div className="p-2 rounded-xl border bg-slate-950/60 border-slate-800 text-slate-600 opacity-40 flex flex-col items-center justify-center">
              <span className="font-bold text-xs font-mono">00</span>
              <span className="text-[10px] font-bold font-mono mt-1">d100</span>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* FLOW A: STANDARD ATTACK ROLL FLOW (STEP 1 -> 2 -> 3) */}
        {/* ------------------------------------------------------------------ */}
        {!isSavingThrowAction ? (
          <div className="relative z-10 space-y-3">
            {/* STEP 1: d20 ATTACK ROLL */}
            {sessionStep === 1 && (
              <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-600/50 space-y-3 shadow-lg">
                <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                  <span className="font-bold text-slate-100 text-xs sm:text-sm flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs">1</span>
                    Roll d20 To-Hit vs Target AC ({effectiveAc})
                  </span>
                  <span className="text-[11px] font-mono text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/50">
                    Formula: [d20 Roll] + {toHitMod}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Option A: Digital Roll (Big & Obvious) */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-600/40 flex flex-col justify-between items-center text-center gap-2">
                    <div>
                      <span className="text-xs font-bold text-amber-300 block">🎲 Digital Tray Roll</span>
                      <span className="text-[11px] text-slate-400">Roll directly on the felt table</span>
                    </div>
                    <button
                      onClick={handleRollDigitalD20}
                      disabled={isRollingD20}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-amber-600/30"
                    >
                      <RotateCcw className={`w-4 h-4 ${isRollingD20 ? 'animate-spin' : ''}`} />
                      {isRollingD20 ? 'Rolling d20...' : 'Roll Digital d20'}
                    </button>
                    {rolledD20 !== null && (
                      <span className="text-xs text-amber-200 font-mono font-bold bg-amber-950/60 px-3 py-1 rounded-full border border-amber-700/60">
                        Die landed on: <strong>{rolledD20}</strong>
                      </span>
                    )}
                  </div>

                  {/* Option B: Manual Desk Roll */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between items-center text-center gap-2">
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">✍️ Physical Tabletop Roll</span>
                      <span className="text-[11px] text-slate-400">Roll physical dice and enter result</span>
                    </div>
                    <div className="flex items-center gap-2 w-full justify-center">
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={manualD20}
                        onChange={(e) => {
                          setManualD20(e.target.value);
                          setRolledD20(null);
                        }}
                        placeholder="e.g. 15"
                        className="w-24 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 font-mono text-center font-bold text-amber-300 text-base focus:outline-none focus:border-amber-500 shadow-inner"
                      />
                      <span className="text-xs text-slate-400 font-mono">+ {toHitMod} mod</span>
                    </div>
                    <span className="text-[10px] text-slate-500">Supports real-life dice at your desk</span>
                  </div>
                </div>

                {/* Clear Outcome Verdict Banner */}
                {activeD20 > 0 && (
                  <div className={`p-3.5 rounded-xl border text-xs space-y-1.5 transition ${
                    isHit 
                      ? 'bg-emerald-950/70 border-emerald-500/80 text-emerald-200 shadow-lg shadow-emerald-950/50' 
                      : 'bg-rose-950/70 border-rose-500/80 text-rose-200 shadow-lg shadow-rose-950/50'
                  }`}>
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-2 text-sm">
                        {isHit ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <XCircle className="w-5 h-5 text-rose-400" />}
                        {isCrit ? '💥 NATURAL 20! CRITICAL HIT!' : isFumble ? '💀 NATURAL 1! AUTOMATIC MISS!' : isHit ? '🎯 ATTACK HITS!' : '❌ ATTACK MISSES!'}
                      </span>
                      <span className="font-mono text-base font-extrabold px-3 py-1 rounded-lg bg-slate-950/80 border border-current">
                        {activeD20} + {toHitMod} = {totalToHit} vs AC {effectiveAc}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300">
                      Math: {totalToHit} is {totalToHit >= effectiveAc ? 'equal to or greater than' : 'less than'} target AC {effectiveAc} ({targetBaseAc} base + {coverBonusAc} cover).
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      if (!isHit) {
                        onComplete(false, 0, 'Attack Missed', false);
                      } else {
                        setSessionStep(isRogueAttacker ? 2 : 3);
                      }
                    }}
                    disabled={activeD20 <= 0}
                    className={`py-2.5 px-6 rounded-xl font-bold text-xs sm:text-sm transition shadow-lg ${
                      activeD20 > 0
                        ? isHit 
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                          : 'bg-rose-600 hover:bg-rose-500 text-white'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {isHit ? 'Proceed to Damage Step →' : 'Confirm Miss (End Action)'}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: TACTICAL RIDERS & CHOICES (Sneak Attack Check) */}
            {sessionStep === 2 && (
              <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-600/50 space-y-3 shadow-lg">
                <div className="font-bold text-slate-100 text-xs sm:text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs">2</span>
                  Tactical Feature Validation: 5e Sneak Attack
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="font-semibold text-amber-300">5e Sneak Attack Requirements Checklist:</div>
                  <ul className="space-y-1.5 text-slate-300 text-[11px]">
                    <li className="flex items-center gap-2">✓ <strong>Weapon Type:</strong> Finesse or Ranged weapon ({action.name})</li>
                    <li className="flex items-center gap-2">✓ <strong>Disadvantage Check:</strong> Attacker does not suffer from long range/dodge disadvantage</li>
                    <li className="flex items-center gap-2">✓ <strong>Proximity Condition:</strong> Ally is adjacent to target OR player has combat advantage!</li>
                  </ul>

                  <label className="flex items-center gap-3 pt-3 mt-1 cursor-pointer border-t border-slate-800">
                    <input
                      type="checkbox"
                      checked={includeSneakAttack}
                      onChange={(e) => setIncludeSneakAttack(e.target.checked)}
                      className="w-5 h-5 rounded text-amber-500 accent-amber-500"
                    />
                    <span className="font-bold text-amber-200 text-xs">
                      Apply Sneak Attack (+{isCrit ? '4d6' : '2d6'} damage)?
                    </span>
                  </label>
                </div>

                <div className="flex justify-between pt-1">
                  <button
                    onClick={() => setSessionStep(1)}
                    className="text-xs text-slate-400 hover:text-slate-200 font-semibold"
                  >
                    ← Back to Attack Roll
                  </button>
                  <button
                    onClick={() => setSessionStep(3)}
                    className="py-2 px-5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition"
                  >
                    Proceed to Roll Damage →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: DAMAGE ROLL */}
            {sessionStep === 3 && (
              <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-600/50 space-y-3 shadow-lg">
                <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                  <span className="font-bold text-slate-100 text-xs sm:text-sm flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs">3</span>
                    Roll Damage Dice ({isCrit ? '💥 CRITICAL HIT! Dice doubled' : 'Normal Hit'})
                  </span>
                  <span className="text-[11px] font-mono text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/50">
                    Formula: {action.damageFormula} {includeSneakAttack ? '+ 2d6 Sneak' : ''}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Digital Damage Roll */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-600/40 flex flex-col justify-between items-center text-center gap-2">
                    <div>
                      <span className="text-xs font-bold text-amber-300 block">🎲 Digital Damage Roll</span>
                      <span className="text-[11px] text-slate-400">Roll weapon damage on tabletop felt</span>
                    </div>
                    <button
                      onClick={handleRollDigitalDamage}
                      disabled={isRollingDamage}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-amber-600/30"
                    >
                      <RotateCcw className={`w-4 h-4 ${isRollingDamage ? 'animate-spin' : ''}`} />
                      {isRollingDamage ? 'Rolling damage dice...' : 'Roll Digital Damage'}
                    </button>
                    {rolledDamageTotal !== null && (
                      <span className="text-xs text-amber-200 font-mono font-bold bg-amber-950/60 px-3 py-1 rounded-full border border-amber-700/60">
                        Total Damage: <strong>{rolledDamageTotal} HP</strong>
                      </span>
                    )}
                  </div>

                  {/* Manual Damage Input */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between items-center text-center gap-2">
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">✍️ Physical Dice Result</span>
                      <span className="text-[11px] text-slate-400">Roll at your desk & enter total damage</span>
                    </div>
                    <input
                      type="number"
                      min="1"
                      value={manualDamageTotal}
                      onChange={(e) => {
                        setManualDamageTotal(e.target.value);
                        setRolledDamageTotal(null);
                      }}
                      placeholder="e.g. 14"
                      className="w-24 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 font-mono text-center font-bold text-amber-300 text-base focus:outline-none focus:border-amber-500 shadow-inner"
                    />
                    <span className="text-[10px] text-slate-500">Includes base dice + ability modifier</span>
                  </div>
                </div>

                {/* Arithmetic Breakdown & Target HP Preview */}
                {(rolledDamageTotal !== null || manualDamageTotal) && (
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-amber-300">Damage Resolution Math:</span>
                      <span className="font-mono text-slate-300 font-bold">
                        {rolledDamageBreakdown || `Manual Total: ${manualDamageTotal}`}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 pt-1.5 border-t border-slate-800 flex items-center justify-between">
                      <span>Target <strong>{target.name}</strong> HP:</span>
                      <span className="font-mono text-emerald-400 font-bold">
                        {target.vitals.currentHp} → {Math.max(0, target.vitals.currentHp - (rolledDamageTotal !== null ? rolledDamageTotal : parseInt(manualDamageTotal, 10)))} HP
                        {target.vitals.currentHp - (rolledDamageTotal !== null ? rolledDamageTotal : parseInt(manualDamageTotal, 10)) <= 0 && (
                          <span className="text-rose-400 ml-1.5 font-extrabold uppercase">(DEFEATED!)</span>
                        )}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-1">
                  <button
                    onClick={() => setSessionStep(1)}
                    className="text-xs text-slate-400 hover:text-slate-200 font-semibold"
                  >
                    ← Back to Attack Roll
                  </button>
                  <button
                    onClick={handleFinalizeDamage}
                    disabled={rolledDamageTotal === null && !manualDamageTotal}
                    className={`py-2.5 px-6 rounded-xl font-bold text-xs sm:text-sm transition shadow-lg ${
                      (rolledDamageTotal !== null || manualDamageTotal)
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    Apply Damage & Complete Turn Action ✓
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ------------------------------------------------------------------ */
          /* FLOW B: 5E SAVING THROW RESOLUTION FLOW (Sacred Flame, Fireball)   */
          /* ------------------------------------------------------------------ */
          <div className="relative z-10 space-y-3">
            {/* SAVING THROW STEP 1: TARGET ROLLS SAVE VS SPELL SAVE DC */}
            {sessionStep === 1 && (
              <div className="p-4 rounded-xl bg-slate-900/90 border border-indigo-700/60 space-y-3 shadow-lg">
                <div className="flex items-center justify-between pb-1 border-b border-indigo-900/50">
                  <span className="font-bold text-indigo-200 text-xs sm:text-sm flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center text-xs">1</span>
                    Target {target.name} Rolls {saveType.toUpperCase()} Save vs DC ({spellSaveDC})
                  </span>
                  <span className="text-[11px] font-mono text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/60">
                    Caster DC = 8 + PB(2) + Mod({primaryCastingMod}) = {spellSaveDC}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-900/40 text-[11px] text-indigo-200 space-y-1">
                  <div>• In 5e, the caster does <strong>not roll to hit</strong>. The target must roll a saving throw against your Spell Save DC.</div>
                  <div>• Target Save Modifier: <strong>{targetSaveMod >= 0 ? `+${targetSaveMod}` : targetSaveMod}</strong></div>
                  {targetSaveCoverBonus > 0 && <div>• Cover bonus to DEX save: <strong>+{targetSaveCoverBonus}</strong></div>}
                  {ignoresCover && <div className="text-amber-300 font-semibold">• Sacred Flame ignores cover bonuses!</div>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Digital Target Save Roll */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-indigo-700/50 flex flex-col justify-between items-center text-center gap-2">
                    <div>
                      <span className="text-xs font-bold text-indigo-300 block">🎲 Digital Save Roll</span>
                      <span className="text-[11px] text-slate-400">Roll target's saving throw die</span>
                    </div>
                    <button
                      onClick={handleRollDigitalSaveD20}
                      disabled={isRollingSaveD20}
                      className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md"
                    >
                      <RotateCcw className={`w-4 h-4 ${isRollingSaveD20 ? 'animate-spin' : ''}`} />
                      {isRollingSaveD20 ? 'Rolling Target Save...' : 'Roll Digital Save for Target'}
                    </button>
                    {rolledSaveD20 !== null && (
                      <span className="text-xs text-indigo-200 font-mono font-bold bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-700/60">
                        Target Rolled: <strong>{rolledSaveD20}</strong>
                      </span>
                    )}
                  </div>

                  {/* Manual Target Save */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between items-center text-center gap-2">
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">✍️ Physical Tabletop Save</span>
                      <span className="text-[11px] text-slate-400">Enter target's physical d20 roll</span>
                    </div>
                    <div className="flex items-center gap-2 w-full justify-center">
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={manualSaveD20}
                        onChange={(e) => {
                          setManualSaveD20(e.target.value);
                          setRolledSaveD20(null);
                        }}
                        placeholder="e.g. 11"
                        className="w-24 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 font-mono text-center font-bold text-indigo-300 text-base focus:outline-none focus:border-indigo-500 shadow-inner"
                      />
                      <span className="text-xs text-slate-400 font-mono">
                        + {targetSaveMod + targetSaveCoverBonus} mod
                      </span>
                    </div>
                  </div>
                </div>

                {/* Save Outcome Box */}
                {activeSaveD20 > 0 && (
                  <div className={`p-3.5 rounded-xl border text-xs space-y-1.5 transition ${
                    targetSaveSucceeded 
                      ? 'bg-amber-950/60 border-amber-600/70 text-amber-200' 
                      : 'bg-emerald-950/60 border-emerald-600/70 text-emerald-200'
                  }`}>
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-sm">
                        {targetSaveSucceeded 
                          ? `🛡️ TARGET SUCCEEDED SAVE (${totalSaveRoll} vs DC ${spellSaveDC})` 
                          : `💥 TARGET FAILED SAVE (${totalSaveRoll} vs DC ${spellSaveDC})`}
                      </span>
                      <span className="font-mono text-sm px-2.5 py-0.5 rounded bg-slate-950/80 border border-current">
                        {activeSaveD20} + {targetSaveMod + targetSaveCoverBonus} = {totalSaveRoll}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300">
                      {targetSaveSucceeded 
                        ? (action.halfDamageOnSave ? 'Target takes HALF damage on success.' : 'Target resists completely and takes 0 damage!')
                        : 'Target takes FULL spell damage!'}
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      if (targetSaveSucceeded && !action.halfDamageOnSave) {
                        onComplete(false, 0, 'Target succeeded save (0 damage)', false);
                      } else {
                        setSessionStep(3);
                      }
                    }}
                    disabled={activeSaveD20 <= 0}
                    className="py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md transition"
                  >
                    {targetSaveSucceeded && !action.halfDamageOnSave 
                      ? 'Confirm 0 Damage (End Action)' 
                      : 'Proceed to Roll Spell Damage →'}
                  </button>
                </div>
              </div>
            )}

            {/* SAVING THROW STEP 3: ROLL SPELL DAMAGE */}
            {sessionStep === 3 && (
              <div className="p-4 rounded-xl bg-slate-900/90 border border-indigo-700/60 space-y-3 shadow-lg">
                <div className="flex items-center justify-between pb-1 border-b border-indigo-900/50">
                  <span className="font-bold text-slate-100 text-xs sm:text-sm flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center text-xs">2</span>
                    Roll Spell Damage ({action.damageFormula})
                  </span>
                  <span className="text-[11px] font-mono text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/60">
                    {targetSaveSucceeded ? 'Half Damage on Successful Save' : 'Full Damage on Failed Save'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Digital Spell Damage */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-indigo-700/50 flex flex-col justify-between items-center text-center gap-2">
                    <div>
                      <span className="text-xs font-bold text-indigo-300 block">🎲 Digital Spell Damage</span>
                      <span className="text-[11px] text-slate-400">Roll spell damage dice</span>
                    </div>
                    <button
                      onClick={handleRollDigitalDamage}
                      disabled={isRollingDamage}
                      className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md"
                    >
                      <RotateCcw className={`w-4 h-4 ${isRollingDamage ? 'animate-spin' : ''}`} />
                      {isRollingDamage ? 'Rolling spell damage...' : 'Roll Digital Damage'}
                    </button>
                    {rolledDamageTotal !== null && (
                      <span className="text-xs text-indigo-200 font-mono font-bold bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-700/60">
                        Damage: <strong>{rolledDamageTotal} HP</strong>
                      </span>
                    )}
                  </div>

                  {/* Manual Spell Damage */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between items-center text-center gap-2">
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">✍️ Physical Spell Dice</span>
                      <span className="text-[11px] text-slate-400">Enter total rolled at your desk</span>
                    </div>
                    <input
                      type="number"
                      min="1"
                      value={manualDamageTotal}
                      onChange={(e) => {
                        setManualDamageTotal(e.target.value);
                        setRolledDamageTotal(null);
                      }}
                      placeholder="e.g. 18"
                      className="w-24 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 font-mono text-center font-bold text-indigo-300 text-base focus:outline-none focus:border-indigo-500 shadow-inner"
                    />
                  </div>
                </div>

                {/* Calculation breakdown */}
                {(rolledDamageTotal !== null || manualDamageTotal) && (
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                    <div className="font-semibold text-indigo-300">Spell Damage Calculation:</div>
                    <div className="text-slate-300 font-mono">
                      {rolledDamageBreakdown || `Manual Roll: ${manualDamageTotal}`}
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-1">
                  <button
                    onClick={() => setSessionStep(1)}
                    className="text-xs text-slate-400 hover:text-slate-200 font-semibold"
                  >
                    ← Back to Save Roll
                  </button>
                  <button
                    onClick={handleFinalizeDamage}
                    disabled={rolledDamageTotal === null && !manualDamageTotal}
                    className="py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md transition"
                  >
                    Apply Spell Damage & Complete Turn Action ✓
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    );
  }

  // -------------------------------------------------------------
  // IDLE MODE: PERMANENT EMBEDDED TABLETOP DICE TRAY & PRACTICE SANDBOX
  // -------------------------------------------------------------
  return (
    <section className="relative overflow-hidden w-full bg-slate-950 border-2 border-amber-600/70 rounded-2xl p-4 sm:p-5 shadow-2xl shadow-amber-950/40 flex flex-col gap-3.5">
      <FantasyCornerBrackets className="w-5 h-5 text-amber-500" />
      {/* Tabletop felt ambient background */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-25 pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: `url(${ART_ASSETS.diceTray})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/95 to-slate-950 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between pb-2.5 border-b border-amber-900/50">
        <div className="flex items-center gap-2">
          <Dices className="w-5 h-5 text-amber-400" />
          <h2 className="text-sm sm:text-base font-fantasy font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 drop-shadow-sm">
            Tabletop Dice Tray & Rules Practice Sandbox
          </h2>
        </div>
        <span className="text-[11px] font-fantasy font-black uppercase text-amber-100 bg-gradient-to-r from-emerald-800 to-emerald-950 border border-emerald-500/60 px-3 py-0.5 rounded-full shadow-md">
          Ready for Action
        </span>
      </div>

      {/* Interactive Polyhedral Dice Tray */}
      <div className="relative z-10">
        <div className="text-[10px] font-fantasy uppercase font-black text-amber-300 tracking-wider mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Click any physical die below to roll directly on felt:
          </span>
          <span className="text-amber-400/80 font-mono">Polyhedral Dice Set</span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center select-none">
          {(['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'] as const).map((die) => (
            <button
              key={die}
              onClick={() => handleRollSingleDie(die)}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border-2 border-amber-900/50 hover:border-amber-400/80 text-amber-200 hover:text-amber-100 flex flex-col items-center justify-center transition group shadow-md hover:scale-105 active:scale-95 cursor-pointer"
              title={`Roll 1${die}`}
            >
              <div className="w-6 h-6 flex items-center justify-center font-bold text-xs group-hover:scale-110 transition font-fantasy">
                {die === 'd100' ? '%' : die}
              </div>
              <span className="text-[9px] font-mono text-amber-400/70 group-hover:text-amber-300 mt-1 uppercase font-black">
                {die}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Free Roll Output or Formula Tester */}
      <div className="relative z-10 bg-slate-900/90 p-3 rounded-xl border border-amber-900/50 flex flex-wrap items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-amber-200 font-fantasy font-bold text-xs">Test Formula:</span>
          <input
            type="text"
            value={sandboxFormula}
            onChange={(e) => setSandboxFormula(e.target.value)}
            className="w-24 bg-slate-950 border border-amber-800/80 rounded-lg px-2.5 py-1.5 font-mono text-amber-300 text-xs focus:outline-none focus:border-amber-400"
            placeholder="e.g. 2d6+3"
          />
          <button
            onClick={() => handleRollSandboxFormula(sandboxFormula)}
            className="px-3 py-1.5 rounded-lg btn-fantasy-gold font-fantasy font-bold text-xs transition shadow cursor-pointer"
          >
            Roll
          </button>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5">
          <span className="text-amber-400/70 font-fantasy text-[10px] font-semibold">Presets:</span>
          {['1d20+5', '2d6+3', '1d8+4', '8d6'].map((f) => (
            <button
              key={f}
              onClick={() => {
                setSandboxFormula(f);
                handleRollSandboxFormula(f);
              }}
              className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 hover:bg-slate-800 text-amber-200 hover:text-amber-100 border border-amber-900/50 transition cursor-pointer"
            >
              {f}
            </button>
          ))}
        </div>

        {sandboxResult && (
          <div className="w-full sm:w-auto font-mono text-xs flex items-center gap-2 pt-1 sm:pt-0">
            <span className="text-amber-200/80">{sandboxResult.breakdown}</span>
            <span className="font-bold text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded-lg border border-amber-500/60 shadow">
              Total: {sandboxResult.total}
            </span>
          </div>
        )}
      </div>

      {/* Tabletop Coach Advice Card (Dark Antiqued Vellum) */}
      <div 
        className="relative z-10 p-3.5 rounded-xl border border-amber-900/50 text-xs shadow-md flex items-start gap-3 overflow-hidden"
        style={getDarkVellumStyle(0.92)}
      >
        <FantasyCornerBrackets className="w-3.5 h-3.5 text-amber-600/50" />
        <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="relative z-10 space-y-0.5">
          <div className="font-fantasy font-black text-amber-100 text-sm">Tabletop Combat Flow & Instructions:</div>
          <p className="font-serif-rpg text-amber-200/90 text-sm font-semibold leading-relaxed">
            Select an attack or spell from your <strong>Action Deck</strong> on the left, then click any enemy with the pulsing red reticle on the battlemap. 
            The <strong>Tabletop Dice Tray</strong> will immediately engage here, guiding you through every single dice roll, AC comparison, and damage calculation without skipping rules!
          </p>
        </div>
      </div>

      {/* Previous Roll Recap (If Available) */}
      {lastCompletedAction && (
        <div className="relative z-10 border-t border-slate-800 pt-2 text-xs">
          <button
            onClick={() => setShowLastRollDetails(!showLastRollDetails)}
            className="w-full flex items-center justify-between text-slate-400 hover:text-slate-200 py-1"
          >
            <span className="font-semibold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Last Action Recap: {lastCompletedAction.actionName} vs {lastCompletedAction.targetName}
            </span>
            {showLastRollDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showLastRollDetails && (
            <div className="mt-1.5 p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1 animate-in fade-in">
              <div>Result: <strong>{lastCompletedAction.hit ? 'HIT / DAMAGE DEALT' : 'MISSED / NO DAMAGE'}</strong></div>
              <div>Damage Applied: <strong>{lastCompletedAction.totalDamage} HP</strong></div>
              <div className="text-slate-400">Breakdown: {lastCompletedAction.breakdown}</div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
