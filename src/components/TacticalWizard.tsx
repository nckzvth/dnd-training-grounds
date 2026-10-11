import React, { useState } from 'react';
import { Combatant, ActionItem } from '../types/combat';
import { EncounterPreset } from '../data/presetEncounters';
import { calculateDistanceFt } from '../utils/raycastCover';
import { 
  Sparkles, 
  Compass, 
  Shield, 
  Swords, 
  Target, 
  Footprints, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  ChevronDown, 
  X, 
  Zap, 
  BookOpen, 
  HelpCircle,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { FantasyCornerBrackets } from './FantasyDecorations';

interface TacticalWizardProps {
  isOpen: boolean;
  onClose: () => void;
  activeEncounter: EncounterPreset;
  player: Combatant;
  combatants: Combatant[];
  selectedAction: ActionItem | null;
  onSelectAction: (action: ActionItem | null) => void;
  onExecuteUtilityAction: (action: ActionItem) => void;
  onEndTurn: () => void;
  currentRound: number;
  isPlayerTurn: boolean;
}

interface ScenarioGuide {
  scenarioId: string;
  missionTitle: string;
  tacticalTheme: string;
  keyRule: string;
  ruleExplanation: string;
  recommendedSteps: string[];
}

const SCENARIO_GUIDES: Record<string, ScenarioGuide> = {
  'sandbox-open-world': {
    scenarioId: 'sandbox-open-world',
    missionTitle: 'Open World & Range Practice',
    tacticalTheme: 'Combat Range Bands, Cover Raycasting & Turn Budgets',
    keyRule: 'Action Economy & 5-Foot Grid Mechanics',
    ruleExplanation: 'On your turn, you have Movement (35 ft), 1 Action, and 1 Bonus Action. Attacking or Dashing as an Action leaves your Bonus Action free for Rogue features like Cunning Action.',
    recommendedSteps: [
      'Click any walkable square to practice movement. Notice how distance and path costs update in real time.',
      'Step behind timber crates at (7, 5) to inspect the +2 AC Half Cover raycast line of sight.',
      'Select [1] Rapier (melee) or [2] Dagger (ranged) to strike practice dummies or the sparring orc.',
      'Use Bonus Action [7] Cunning Dash to double your movement or [8] Cunning Disengage to practice hit-and-run.'
    ]
  },
  'arena-duel': {
    scenarioId: 'arena-duel',
    missionTitle: 'The Proving Grounds (1v1 Duel)',
    tacticalTheme: 'Kiting, Opportunity Attacks & Reaction Defense',
    keyRule: 'Disengage vs Opportunity Attacks',
    ruleExplanation: 'Leaving an enemy 5-ft reach triggers a free Opportunity Attack! Use your Bonus Action [8] Cunning Disengage BEFORE moving away to retreat with total safety.',
    recommendedSteps: [
      'Maintain range! The Orc Bruiser has 30 ft movement and a Greataxe dealing 1d12+3 slashing damage.',
      'Fire from range with [2] Dagger or [3] Sling, then step behind low stone pillars for Half Cover (+2 AC).',
      'If the Orc closes into melee reach (5 ft): DO NOT walk away directly! Activate [8] Cunning Disengage first.',
      'When the Orc strikes you: Use your Reaction prompt to trigger Uncanny Dodge, halving the incoming damage!'
    ]
  },
  'alley-ambush': {
    scenarioId: 'alley-ambush',
    missionTitle: 'The Alley Ambush (Cover & Kiting)',
    tacticalTheme: 'Raycast Cover (+2 AC), Difficult Terrain & Stealth',
    keyRule: 'Raycast Line of Sight & Cover Bonuses',
    ruleExplanation: 'Creatures behind crates gain Half Cover (+2 AC and +2 DEX saves). Rubble cobblestones cost 10 ft of movement per 5 ft square (2x cost).',
    recommendedSteps: [
      'Observe the Goblin Sniper at (10, 5) behind crates. Their cover grants them +2 AC against ranged attacks.',
      'Move through the sides to flank the crates and eliminate their cover bonus.',
      'Beware cobblestones in the center: moving through difficult terrain halves your effective speed.',
      'Break line of sight behind solid brick walls to take the Hide action, granting Advantage on your next attack!'
    ]
  },
  'companion-anchor-skirmish': {
    scenarioId: 'companion-anchor-skirmish',
    missionTitle: 'Party Synergy (Companion Anchor)',
    tacticalTheme: 'Sneak Attack Flanking Synergy & Frontline Screens',
    keyRule: '5e Sneak Attack Ally Proximity Trigger',
    ruleExplanation: 'Rogues deal +2d6 Sneak Attack damage whenever an ally (like Thorin) is within 5 ft of the enemy target, even without having Advantage on the attack roll!',
    recommendedSteps: [
      'Thorin is locked in melee with the Veteran Thug at (6, 3), holding threat with the Dodge action.',
      'Move adjacent to the Thug and equip [1] Rapier.',
      'Notice that Sneak Attack (+2d6) automatically primes because Thorin is within 5 ft of the enemy!',
      'Strike the Thug, then use [8] Cunning Disengage to safely retreat behind Thorin without taking damage.'
    ]
  },
  'target-dummy-dpr': {
    scenarioId: 'target-dummy-dpr',
    missionTitle: 'DPR Benchmark (Damage Audit)',
    tacticalTheme: 'Burst vs Sustained Turn Rotations & Resource Timing',
    keyRule: 'Damage Per Round (DPR) Optimization',
    ruleExplanation: 'Maximize damage by landing Sneak Attack every round (+2d6) and layering resource abilities like Wails from the Grave or Vampiric Bite.',
    recommendedSteps: [
      'Strike the Iron Dummy with [1] Rapier (+6 to hit, 1d8+4 piercing).',
      'Confirm your Sneak Attack trigger (+2d6 damage) and observe calculation breakdown in the Tabletop Dice Tray.',
      'Layer your necrotic Phantom feature (Wails from the Grave) for secondary burst.',
      'Open the Action Economy Audit modal (top-right navbar) to review your average DPR across rounds.'
    ]
  }
};

export const TacticalWizard: React.FC<TacticalWizardProps> = ({
  isOpen,
  onClose,
  activeEncounter,
  player,
  combatants,
  selectedAction,
  onSelectAction,
  onExecuteUtilityAction,
  onEndTurn,
  currentRound,
  isPlayerTurn,
}) => {
  const [activeTab, setActiveTab] = useState<'advisor' | 'scenario' | 'codex'>('advisor');
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isOpen) return null;

  // Retrieve or fallback scenario guide
  const guide = SCENARIO_GUIDES[activeEncounter.id] || {
    scenarioId: activeEncounter.id,
    missionTitle: activeEncounter.title,
    tacticalTheme: activeEncounter.tacticalFocus || 'Tactical Combat Simulation',
    keyRule: '5e Action Economy',
    ruleExplanation: 'Plan your turn around your Action, Bonus Action, and remaining Movement speed.',
    recommendedSteps: [
      'Position your character behind cover or into weapon reach.',
      'Select an action from your hotbar [1-8] and click a target.',
      'Use bonus actions or utility moves before ending your turn.'
    ]
  };

  // Find hostiles and evaluate tactical positions
  const enemies = combatants.filter(c => !c.isPlayer && !c.isFriendly && c.vitals.currentHp > 0);
  const allies = combatants.filter(c => !c.isPlayer && c.isFriendly && c.vitals.currentHp > 0);

  // Check if any enemy is within 5 ft of the player
  const enemyInMelee = enemies.find(e => 
    calculateDistanceFt(player.spatial.x, player.spatial.y, e.spatial.x, e.spatial.y) <= 5
  );

  // Check if any ally is adjacent to an enemy (Sneak attack trigger)
  const enemyWithAdjacentAlly = enemies.find(e => 
    allies.some(a => calculateDistanceFt(a.spatial.x, a.spatial.y, e.spatial.x, e.spatial.y) <= 5)
  );

  // Calculate Live Situational Advice
  const getLiveAdvice = () => {
    if (!isPlayerTurn) {
      return {
        type: 'wait',
        title: 'Opponent Turn in Progress',
        desc: 'Hold your position and watch for incoming strikes. Prepare to trigger Uncanny Dodge [Reaction] if you are hit!',
        actionText: null,
        actionType: null,
      };
    }

    // High Alert: Enemy in Melee
    if (enemyInMelee) {
      if (player.budget.bonusActionAvailable) {
        return {
          type: 'danger',
          title: '⚠️ Melee Threat Warning',
          desc: `${enemyInMelee.name} is within 5 ft! If you walk away now, they will trigger an Opportunity Attack! Use [8] Cunning Disengage first to retreat freely.`,
          actionText: 'Activate Cunning Disengage [8]',
          actionId: 'cunning-disengage',
        };
      }
      if (player.budget.actionAvailable) {
        return {
          type: 'attack',
          title: '⚔️ Melee Counter-Strike',
          desc: `You are in close combat with ${enemyInMelee.name}. Strike with your [1] Rapier for 1d8+4 piercing damage!`,
          actionText: 'Equip Rapier [1]',
          actionId: 'arty-rapier',
        };
      }
    }

    // High Value: Sneak Attack Primed by Ally
    if (enemyWithAdjacentAlly && player.budget.actionAvailable) {
      return {
        type: 'opportunity',
        title: '🎯 Sneak Attack Primed!',
        desc: `${enemyWithAdjacentAlly.name} is engaged with Thorin! In 5e, ally proximity grants you +2d6 Sneak Attack damage without needing Advantage.`,
        actionText: 'Equip Rapier [1] to Strike',
        actionId: 'arty-rapier',
      };
    }

    // Standard Action Ready
    if (player.budget.actionAvailable) {
      if (selectedAction) {
        return {
          type: 'targeting',
          title: `🎯 Targeting: ${selectedAction.name}`,
          desc: `Click any glowing hostile token on the battlemap to roll your attack in the Tabletop Dice Tray!`,
          actionText: null,
          actionId: null,
        };
      }
      return {
        type: 'action',
        title: '⚔️ Action Available (Standard)',
        desc: 'Your main Action is ready! Choose [1] Rapier for close combat, [2] Dagger (20 ft) or [3] Sling (30 ft) for ranged attacks, or [5] Dash / [6] Dodge.',
        actionText: 'Equip Primary Weapon [1]',
        actionId: 'arty-rapier',
      };
    }

    // Bonus Action Ready
    if (player.budget.bonusActionAvailable) {
      return {
        type: 'bonus',
        title: '✨ Bonus Action Window Available',
        desc: 'Your standard Action is spent, but your Bonus Action is ready! Activate [7] Cunning Dash for +35 ft movement or [8] Cunning Disengage.',
        actionText: 'Activate Cunning Dash [7]',
        actionId: 'cunning-dash',
      };
    }

    // Movement Remaining
    if (player.budget.movementRemainingFt > 0) {
      return {
        type: 'move',
        title: `👟 ${player.budget.movementRemainingFt} ft Movement Remaining`,
        desc: 'All combat actions are spent for this turn. Reposition behind timber crates (+2 AC Half Cover) or stone ramparts before ending your turn.',
        actionText: null,
        actionId: null,
      };
    }

    // Turn Budget Exhausted
    return {
      type: 'complete',
      title: '✅ Turn Execution Complete',
      desc: 'You have utilized your entire turn budget for Round ' + currentRound + '. Click "End Turn" or press [Space] to pass initiative to the next combatant.',
      actionText: 'End Turn [Space]',
      actionId: 'end-turn',
    };
  };

  const advice = getLiveAdvice();

  // Handle recommendation shortcut click
  const handleAdvisorAction = (actionId: string | null) => {
    if (!actionId) return;
    if (actionId === 'end-turn') {
      onEndTurn();
      return;
    }
    const allActions = [...player.actionDeck.actions, ...player.actionDeck.bonusActions];
    const target = allActions.find(a => a.id.includes(actionId) || a.name.toLowerCase().includes(actionId.replace('-', ' ')));
    if (target) {
      if (target.type === 'utility' || (target.type === 'class_feature' && !target.toHitMod && !target.damageFormula)) {
        onExecuteUtilityAction(target);
      } else {
        onSelectAction(target);
      }
    }
  };

  // If minimized, display a sleek floating talisman
  if (isMinimized) {
    return (
      <div className="absolute top-3 left-3 z-30 select-none animate-in fade-in duration-200">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-950/95 via-slate-950/95 to-amber-950/95 border-2 border-purple-500/80 hover:border-purple-300 shadow-2xl backdrop-blur-md text-xs font-fantasy font-black text-amber-200 cursor-pointer group"
          title="Expand Tactical Wizard Advisor [W]"
        >
          <Sparkles className="w-4 h-4 text-purple-300 animate-spin-slow group-hover:scale-110 transition-transform" />
          <span>Tactical Wizard</span>
          <span className="text-[10px] font-mono text-amber-400/80">[W]</span>
          <Maximize2 className="w-3.5 h-3.5 text-purple-300 ml-1" />
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-3 left-3 z-30 w-84 sm:w-96 select-none animate-in fade-in zoom-in-95 duration-200">
      {/* Floating Tactical Wizard HUD Card */}
      <div 
        className="relative rounded-2xl border-2 border-amber-600/80 bg-slate-950/98 shadow-[0_15px_45px_rgba(0,0,0,0.95)] backdrop-blur-md overflow-hidden flex flex-col"
        style={{
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9), 0 0 25px rgba(168, 85, 247, 0.25)',
        }}
      >
        <FantasyCornerBrackets className="w-4 h-4 text-purple-400/60" />

        {/* Wizard Header Bar */}
        <div className="px-3.5 py-2.5 bg-gradient-to-r from-purple-950/90 via-[#18110c]/95 to-amber-950/90 border-b border-amber-800/60 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {/* Glowing Archmage Crest */}
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-900 border border-purple-300/80 flex items-center justify-center shadow-md shadow-purple-950 shrink-0">
              <Sparkles className="w-4 h-4 text-purple-100 animate-pulse" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-fantasy font-black text-xs sm:text-[13px] text-amber-100 truncate tracking-wide flex items-center gap-1.5">
                Archmage Eldrin <span className="text-[10px] text-purple-300 font-mono font-bold">Advisor</span>
              </span>
              <span className="text-[10px] font-serif-rpg text-amber-300/70 truncate">
                {guide.missionTitle}
              </span>
            </div>
          </div>

          {/* Window Control Buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1 rounded-md text-amber-300/70 hover:text-amber-100 hover:bg-white/10 transition cursor-pointer"
              title="Minimize Wizard to Pill"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-amber-300/70 hover:text-amber-100 hover:bg-white/10 transition cursor-pointer"
              title="Close Wizard [W]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-3 bg-black/60 border-b border-amber-900/50 text-[11px] font-fantasy font-bold text-center">
          <button
            onClick={() => setActiveTab('advisor')}
            className={`py-1.5 transition cursor-pointer ${
              activeTab === 'advisor'
                ? 'bg-purple-950/60 text-purple-200 border-b-2 border-purple-400 font-black'
                : 'text-amber-300/60 hover:text-amber-200'
            }`}
          >
            Live Advice
          </button>
          <button
            onClick={() => setActiveTab('scenario')}
            className={`py-1.5 transition cursor-pointer ${
              activeTab === 'scenario'
                ? 'bg-purple-950/60 text-purple-200 border-b-2 border-purple-400 font-black'
                : 'text-amber-300/60 hover:text-amber-200'
            }`}
          >
            Objectives
          </button>
          <button
            onClick={() => setActiveTab('codex')}
            className={`py-1.5 transition cursor-pointer ${
              activeTab === 'codex'
                ? 'bg-purple-950/60 text-purple-200 border-b-2 border-purple-400 font-black'
                : 'text-amber-300/60 hover:text-amber-200'
            }`}
          >
            5e Rules
          </button>
        </div>

        {/* Tab 1: Live Situational Turn Advice */}
        {activeTab === 'advisor' && (
          <div className="p-3 flex flex-col gap-2.5 text-xs">
            {/* Live Status Callout Box */}
            <div className={`p-2.5 rounded-xl border flex flex-col gap-1.5 shadow-inner transition-all ${
              advice.type === 'danger'
                ? 'bg-rose-950/70 border-rose-600/80 text-rose-200' :
              advice.type === 'opportunity'
                ? 'bg-purple-950/70 border-purple-500/80 text-purple-200' :
              advice.type === 'targeting'
                ? 'bg-amber-950/70 border-amber-500/80 text-amber-200' :
              advice.type === 'complete'
                ? 'bg-emerald-950/70 border-emerald-500/80 text-emerald-200' :
                'bg-blue-950/60 border-blue-600/70 text-blue-200'
            }`}>
              <div className="flex items-center justify-between font-fantasy font-black text-xs tracking-wide">
                <span>{advice.title}</span>
                <span className="text-[10px] font-mono opacity-80 font-bold">Round {currentRound}</span>
              </div>
              <p className="text-[11px] leading-relaxed opacity-90 font-serif-rpg">
                {advice.desc}
              </p>

              {/* Quick Action Trigger Button */}
              {advice.actionText && advice.actionId && (
                <button
                  onClick={() => handleAdvisorAction(advice.actionId)}
                  className={`mt-1 py-1.5 px-3 rounded-lg font-fantasy font-black text-xs shadow-md transition-transform active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer ${
                    advice.actionId === 'end-turn'
                      ? 'btn-fantasy-gold'
                      : 'bg-purple-700 hover:bg-purple-600 text-white border border-purple-400'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{advice.actionText}</span>
                </button>
              )}
            </div>

            {/* Turn Budget Checklist */}
            <div className="bg-black/40 rounded-xl p-2 border border-amber-900/40 flex flex-col gap-1 text-[11px] font-mono">
              <span className="text-[10px] font-fantasy font-bold text-amber-300 uppercase tracking-widest pb-0.5 border-b border-amber-900/30">
                Turn Action Economy
              </span>
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-stone-300">Standard Action:</span>
                <span className={player.budget.actionAvailable ? 'text-emerald-400 font-bold' : 'text-stone-500 line-through'}>
                  {player.budget.actionAvailable ? 'Ready' : 'Spent'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-300">Bonus Action:</span>
                <span className={player.budget.bonusActionAvailable ? 'text-amber-400 font-bold' : 'text-stone-500 line-through'}>
                  {player.budget.bonusActionAvailable ? 'Ready' : 'Spent'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-300">Movement Speed:</span>
                <span className="text-sky-300 font-bold">
                  {player.budget.movementRemainingFt} / {player.vitals.speedFt} ft
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-300">Reaction Window:</span>
                <span className={player.budget.reactionAvailable ? 'text-purple-300 font-bold' : 'text-stone-500 line-through'}>
                  {player.budget.reactionAvailable ? 'Held (Uncanny Dodge)' : 'Spent'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Scenario Specific Objectives */}
        {activeTab === 'scenario' && (
          <div className="p-3 flex flex-col gap-2.5 text-xs max-h-[300px] overflow-y-auto">
            <div className="bg-purple-950/40 rounded-xl p-2.5 border border-purple-800/50 flex flex-col gap-1">
              <span className="font-fantasy font-black text-amber-200 text-xs uppercase tracking-wide">
                Tactical Focus
              </span>
              <p className="text-[11px] text-purple-200/90 font-serif-rpg leading-relaxed">
                {guide.tacticalTheme}
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="font-fantasy font-bold text-amber-300 text-[11px] uppercase tracking-wider">
                Roadmap to Victory
              </span>
              {guide.recommendedSteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-black/40 p-2 rounded-lg border border-amber-900/30 text-[11px] text-amber-100">
                  <span className="w-4 h-4 rounded-full bg-amber-950 border border-amber-600 text-amber-300 flex items-center justify-center font-mono font-bold shrink-0 text-[10px]">
                    {idx + 1}
                  </span>
                  <p className="leading-snug">{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Tabletop 5e Rules Codex */}
        {activeTab === 'codex' && (
          <div className="p-3 flex flex-col gap-2 text-xs max-h-[300px] overflow-y-auto">
            <div className="bg-amber-950/40 p-2.5 rounded-xl border border-amber-800/60 flex flex-col gap-1">
              <span className="font-fantasy font-black text-amber-200 text-xs flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                Featured 5e Rule: {guide.keyRule}
              </span>
              <p className="text-[11px] text-amber-200/90 font-serif-rpg leading-relaxed">
                {guide.ruleExplanation}
              </p>
            </div>

            <div className="bg-black/50 p-2.5 rounded-xl border border-amber-900/40 flex flex-col gap-1.5 text-[11px]">
              <span className="font-fantasy font-bold text-amber-300">
                Core Tabletop Quick Reference
              </span>
              <ul className="list-disc list-inside space-y-1 text-stone-300 leading-snug">
                <li><strong className="text-amber-200">Half Cover:</strong> Grants +2 AC and +2 Dexterity saving throws against ranged attacks.</li>
                <li><strong className="text-amber-200">Opportunity Attack:</strong> Occurs when leaving an enemy reach (5 ft) without taking the Disengage action.</li>
                <li><strong className="text-amber-200">Sneak Attack:</strong> Requires a finesse weapon and either Advantage OR an ally within 5 ft of the enemy.</li>
                <li><strong className="text-amber-200">Uncanny Dodge:</strong> Uses your Reaction when hit to halve the incoming damage.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Footer Bar with Hotkey Note */}
        <div className="px-3 py-1.5 bg-black/80 border-t border-amber-900/50 flex items-center justify-between text-[10px] text-amber-300/70 font-mono">
          <span>Toggle with Hotkey: <strong className="text-amber-200">[W]</strong></span>
          <button 
            onClick={() => setIsMinimized(true)}
            className="text-purple-300 hover:text-purple-100 font-fantasy font-bold cursor-pointer"
          >
            Minimize HUD
          </button>
        </div>
      </div>
    </div>
  );
};
