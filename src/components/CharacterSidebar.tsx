import React, { useState } from 'react';
import { Combatant, ActionItem } from '../types/combat';
import { 
  Heart, 
  Shield, 
  Zap, 
  Footprints, 
  Swords, 
  Sparkles, 
  Clock, 
  Target,
  EyeOff,
  Plus,
  Moon,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Flame,
  Wand2
} from 'lucide-react';
import { ART_ASSETS, getTokenImage } from '../utils/artAssets';

interface CharacterSidebarProps {
  player: Combatant;
  selectedAction: ActionItem | null;
  onSelectAction: (action: ActionItem | null) => void;
  onExecuteUtilityAction: (action: ActionItem) => void;
  onOpenRestModal: () => void;
  onOpenSpellPicker: () => void;
}

export const CharacterSidebar: React.FC<CharacterSidebarProps> = ({
  player,
  selectedAction,
  onSelectAction,
  onExecuteUtilityAction,
  onOpenRestModal,
  onOpenSpellPicker,
}) => {
  const [activeTab, setActiveTab] = useState<'actions' | 'rules'>('actions');
  const [expandedRule, setExpandedRule] = useState<string | null>(null);

  const hpPercent = Math.max(0, Math.min(100, (player.vitals.currentHp / player.vitals.maxHp) * 100));

  const handleActionClick = (action: ActionItem) => {
    // If utility (Dash, Dodge, Cunning Dash, etc.), execute directly
    if (action.type === 'utility' || (action.type === 'class_feature' && !action.toHitMod && !action.damageFormula)) {
      onExecuteUtilityAction(action);
      return;
    }

    // If attack / spell with range, toggle targeting
    if (selectedAction?.id === action.id) {
      onSelectAction(null);
    } else {
      onSelectAction(action);
    }
  };

  const coreRules = [
    {
      id: 'rule-help',
      name: 'Help Action',
      type: 'Action',
      summary: 'Give an ally Advantage on an attack or check.',
      details: 'You can lend your aid to an ally. When you take the Help action, the ally you choose gains Advantage on the next ability check or attack roll made against a creature within 5 feet of you before the start of your next turn.',
    },
    {
      id: 'rule-hide',
      name: 'Hide & Stealth',
      type: 'Action / Bonus Action',
      summary: 'Stealth check vs enemy Passive Perception.',
      details: 'You cannot hide from a creature that can see you clearly. You must have cover (half/three-quarters/total) or be in darkness. If successful, you gain the Unseen Attacker benefit: attack rolls against you have Disadvantage, and your attack rolls have Advantage!',
    },
    {
      id: 'rule-ready',
      name: 'Ready an Action',
      type: 'Action + Reaction',
      summary: 'Prepare an action to trigger on an enemy turn.',
      details: 'At physical tables, you state: "If [Trigger], then I will [Action]". For example: "If the Orc moves out from behind the pillar, I will shoot him with my bow." When the trigger occurs, you spend your Reaction to execute it. If readying a spell, you must maintain Concentration on it until triggered!',
    },
    {
      id: 'rule-two-weapon',
      name: 'Two-Weapon Fighting',
      type: 'Bonus Action',
      summary: 'Off-hand attack with a light weapon.',
      details: 'When you take the Attack action with a light melee weapon in one hand, you can use a Bonus Action to attack with a different light melee weapon in your other hand. Important: you DO NOT add your ability modifier to the damage of the bonus attack unless it is negative, or you have the Fighting Style!',
    },
    {
      id: 'rule-oa',
      name: 'Opportunity Attacks',
      type: 'Reaction',
      summary: 'Triggered when an enemy moves out of your 5-ft reach.',
      details: 'You can spend your Reaction to make 1 melee attack when a hostile creature moves out of your reach. Important: Moving WITHIN someone\'s reach does NOT trigger an OA. Only LEAVING their reach triggers it (unless they took the Disengage action or teleported with Misty Step).',
    },
  ];

  return (
    <div className="relative overflow-hidden w-full flex flex-col gap-3.5 bg-slate-950 border-2 border-amber-800/70 rounded-2xl p-3.5 sm:p-4 shadow-2xl">
      {/* Ambient tavern oak wood texture */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20 pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: `url(${ART_ASSETS.darkWood})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/95 to-slate-950 pointer-events-none" />

      {/* Vitals Card (Adventurer Folio) */}
      <div className="relative z-10 bg-slate-900/95 p-3.5 rounded-xl border border-amber-700/60 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="relative group shrink-0">
            <img
              src={getTokenImage(player)}
              alt={player.name}
              className="w-14 h-14 rounded-full border-2 border-amber-400 shadow-md shadow-amber-500/30 object-cover"
            />
            <div className="absolute -inset-0.5 rounded-full bg-amber-400/20 blur pointer-events-none" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h2 className="font-fantasy text-base font-extrabold text-amber-100 flex items-center gap-1.5 truncate">
                {player.name}
                {player.spatial.isHiding && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-900/80 text-purple-200 border border-purple-500 flex items-center gap-1 font-sans">
                    <EyeOff className="w-2.5 h-2.5" /> Hidden
                  </span>
                )}
              </h2>
              <button
                onClick={onOpenRestModal}
                title="Take a Short or Long Rest to replenish hit points and spell slots"
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-600/60 text-xs font-semibold transition shrink-0 ml-1 shadow-sm cursor-pointer"
              >
                <Moon className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-fantasy text-[11px]">Rest</span>
              </button>
            </div>
            <div className="text-xs text-amber-400 font-medium truncate font-fantasy">
              {player.race} · {player.archetype}
            </div>
          </div>
        </div>

        {/* HP Bar (Illuminated Arcane Vitality Meter) */}
        <div className="mt-3">
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="flex items-center gap-1 text-rose-400 font-fantasy">
              <Heart className="w-3.5 h-3.5 fill-current" /> Vitality HP
            </span>
            <span className="font-mono text-amber-100 font-bold">
              {player.vitals.currentHp} / {player.vitals.maxHp}
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 shadow-inner">
            <div
              className={`h-full transition-all duration-300 ${
                hpPercent > 50 ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : 
                hpPercent > 25 ? 'bg-gradient-to-r from-amber-600 to-amber-400' : 
                'bg-gradient-to-r from-rose-600 to-rose-400'
              }`}
              style={{ width: `${hpPercent}%` }}
            />
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-amber-900/40 text-center text-xs">
          <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
            <div className="text-[10px] text-amber-300/80 uppercase font-bold font-fantasy">Armor Class</div>
            <div className="text-sm font-bold text-slate-100 flex items-center justify-center gap-1 font-mono mt-0.5">
              <Shield className="w-3.5 h-3.5 text-sky-400" />
              {player.vitals.baseAc}
            </div>
          </div>
          <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
            <div className="text-[10px] text-amber-300/80 uppercase font-bold font-fantasy">Speed</div>
            <div className="text-sm font-bold text-slate-100 flex items-center justify-center gap-1 font-mono mt-0.5">
              <Footprints className="w-3.5 h-3.5 text-amber-400" />
              {player.vitals.speedFt} ft
            </div>
          </div>
          <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
            <div className="text-[10px] text-amber-300/80 uppercase font-bold font-fantasy">DEX / STR</div>
            <div className="text-xs font-bold text-amber-200 font-mono mt-0.5">
              +{Math.floor((player.attributes.dex - 10) / 2)} / +{Math.floor((player.attributes.str - 10) / 2)}
            </div>
          </div>
        </div>

        {/* Hit Dice & Spellcasting Metrics */}
        <div className="mt-2.5 pt-2 border-t border-amber-900/40 space-y-2">
          {/* Hit Dice Tracker */}
          <div className="flex items-center justify-between text-xs bg-slate-950/90 px-3 py-1.5 rounded-xl border border-amber-800/40">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-amber-400/80 font-bold uppercase font-fantasy">Hit Dice:</span>
              <span className="font-mono font-bold text-amber-300">
                {(player.vitals.hitDiceCurrent ?? player.vitals.hitDiceMax ?? 3)}/{(player.vitals.hitDiceMax ?? 3)} {(player.vitals.hitDiceDie ?? 'd8')}
              </span>
              <div className="flex items-center gap-1 ml-2">
                {Array.from({ length: (player.vitals.hitDiceMax ?? 3) }).map((_, i) => (
                  <span
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < (player.vitals.hitDiceCurrent ?? player.vitals.hitDiceMax ?? 3)
                        ? 'bg-amber-400 shadow-sm shadow-amber-400/50'
                        : 'bg-slate-800 border border-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>
            <button
              onClick={onOpenRestModal}
              className="text-[10px] text-amber-400 hover:text-amber-200 font-semibold underline font-fantasy cursor-pointer"
            >
              Recover
            </button>
          </div>

          {/* Spell Save DC & Attack Mod */}
          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="bg-slate-950/80 px-2 py-1.5 rounded-xl border border-indigo-900/50">
              <span className="text-[9px] text-indigo-300 uppercase font-bold font-fantasy block">Spell Save DC</span>
              <span className="font-mono font-bold text-indigo-300 text-xs">
                DC {8 + 2 + Math.max(
                  Math.floor((player.attributes.int - 10) / 2),
                  Math.floor((player.attributes.wis - 10) / 2),
                  Math.floor((player.attributes.cha - 10) / 2)
                )}
              </span>
            </div>
            <div className="bg-slate-950/80 px-2 py-1.5 rounded-xl border border-indigo-900/50">
              <span className="text-[9px] text-indigo-300 uppercase font-bold font-fantasy block">Spell Attack</span>
              <span className="font-mono font-bold text-indigo-300 text-xs">
                +{2 + Math.max(
                  Math.floor((player.attributes.int - 10) / 2),
                  Math.floor((player.attributes.wis - 10) / 2),
                  Math.floor((player.attributes.cha - 10) / 2)
                )} to hit
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Economy Ledger */}
      <div className="relative z-10 bg-slate-900/95 p-3 rounded-xl border border-amber-700/60 shadow-lg">
        <div className="text-[11px] font-fantasy uppercase tracking-wider font-bold text-amber-300 mb-2 flex items-center justify-between">
          <span>Action Economy Ledger</span>
          <span className="text-[10px] text-cyan-400 font-mono">Turn Budget</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Movement */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-1.5">
              <Footprints className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-amber-100 font-medium">Movement</span>
            </div>
            <span className="font-mono font-bold text-cyan-300">
              {player.budget.movementRemainingFt} ft
            </span>
          </div>

          {/* Action */}
          <div className={`flex items-center justify-between p-2 rounded-xl border transition-colors ${
            player.budget.actionAvailable 
              ? 'bg-emerald-950/40 border-emerald-600/70 text-emerald-300' 
              : 'bg-slate-950/60 border-slate-800 text-slate-500'
          }`}>
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span className="font-medium">Action</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">
              {player.budget.actionAvailable ? 'Ready' : 'Spent'}
            </span>
          </div>

          {/* Bonus Action */}
          <div className={`flex items-center justify-between p-2 rounded-xl border transition-colors ${
            player.budget.bonusActionAvailable 
              ? 'bg-amber-950/40 border-amber-600/70 text-amber-300' 
              : 'bg-slate-950/60 border-slate-800 text-slate-500'
          }`}>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="font-medium">Bonus</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">
              {player.budget.bonusActionAvailable ? 'Ready' : 'Spent'}
            </span>
          </div>

          {/* Reaction */}
          <div className={`flex items-center justify-between p-2 rounded-xl border transition-colors ${
            player.budget.reactionAvailable 
              ? 'bg-purple-950/40 border-purple-600/70 text-purple-300' 
              : 'bg-slate-950/60 border-slate-800 text-slate-500'
          }`}>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span className="font-medium">Reaction</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">
              {player.budget.reactionAvailable ? 'Armed' : 'Spent'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs: Combat Deck vs 5e Rules */}
      <div className="relative z-10 flex gap-1.5 border-b border-amber-800/40 pb-1 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('actions')}
          className={`flex-1 py-1.5 text-center rounded-xl font-fantasy transition ${
            activeTab === 'actions'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-amber-200/60 hover:text-amber-200'
          }`}
        >
          Combat Deck ({player.actionDeck.actions.length})
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`flex-1 py-1.5 text-center rounded-xl font-fantasy transition flex items-center justify-center gap-1.5 ${
            activeTab === 'rules'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
              : 'text-amber-200/60 hover:text-amber-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" /> 5e Rules Guide
        </button>
      </div>

      {/* TAB 1: ACTIONS & SPELLS */}
      {activeTab === 'actions' && (
        <div className="relative z-10 flex flex-col gap-3">
          {/* Add Spell / Action Button */}
          <button
            onClick={onOpenSpellPicker}
            className="w-full py-2 px-3 rounded-xl bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-500/50 text-indigo-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition shadow-sm font-fantasy cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span>Add Spell or Cantrip from 5e SRD</span>
          </button>

          {/* Actions (Standard) */}
          <div>
            <div className="text-xs font-bold text-amber-300/80 mb-1.5 flex items-center justify-between font-fantasy">
              <span className="flex items-center gap-1 text-emerald-400">
                <Zap className="w-3.5 h-3.5" /> Standard Actions
              </span>
              <span className="text-[10px] text-slate-500 font-mono">1 per turn</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {player.actionDeck.actions.map((act) => {
                const isSelected = selectedAction?.id === act.id;
                const disabled = !player.budget.actionAvailable;

                return (
                  <button
                    key={act.id}
                    onClick={() => handleActionClick(act)}
                    disabled={disabled}
                    title={act.description}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all text-xs flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/25 border-amber-400 text-amber-200 ring-2 ring-amber-400/80 shadow-lg shadow-amber-500/20 scale-[1.01]'
                        : disabled
                        ? 'bg-slate-950/40 border-slate-900 text-slate-600 opacity-60 cursor-not-allowed'
                        : 'bg-slate-900/90 hover:bg-slate-850 hover:border-amber-600/70 border-slate-800 text-amber-100 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <Swords className="w-4 h-4 text-amber-400 shrink-0" />
                      <div className="truncate">
                        <div className="font-bold text-amber-100 truncate font-fantasy">{act.name}</div>
                        <div className="text-[10px] text-amber-200/70 font-mono">
                          {act.toHitMod !== undefined && `+${act.toHitMod} to hit `}
                          {act.damageFormula && `· ${act.damageFormula} `}
                          {act.rangeFt && `· ${act.rangeFt} ft`}
                        </div>
                      </div>
                    </div>
                    {isSelected ? (
                      <Target className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-950 text-amber-300 border border-slate-700 shrink-0 font-medium font-fantasy">
                        {act.damageFormula ? 'Target' : 'Execute'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bonus Actions */}
          {player.actionDeck.bonusActions.length > 0 && (
            <div>
              <div className="text-xs font-bold text-amber-300/80 mb-1.5 flex items-center justify-between font-fantasy">
                <span className="flex items-center gap-1 text-amber-400">
                  <Sparkles className="w-3.5 h-3.5" /> Bonus Actions
                </span>
                <span className="text-[10px] text-slate-500 font-mono">1 per turn</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {player.actionDeck.bonusActions.map((act) => {
                  const disabled = !player.budget.bonusActionAvailable;

                  return (
                    <button
                      key={act.id}
                      onClick={() => handleActionClick(act)}
                      disabled={disabled}
                      title={act.description}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all text-xs flex items-center justify-between cursor-pointer ${
                        disabled
                          ? 'bg-slate-950/40 border-slate-900 text-slate-600 opacity-60 cursor-not-allowed'
                          : 'bg-slate-900/90 hover:bg-slate-850 hover:border-amber-600/70 border-slate-800 text-amber-100 shadow-sm'
                      }`}
                    >
                      <div className="pr-2">
                        <div className="font-bold text-amber-200 font-fantasy">{act.name}</div>
                        <div className="text-[10px] text-amber-200/60 leading-snug">{act.description}</div>
                      </div>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-lg bg-amber-950/60 text-amber-300 border border-amber-800 shrink-0 font-semibold font-fantasy">
                        Use
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Reactions */}
          {player.actionDeck.reactions.length > 0 && (
            <div>
              <div className="text-xs font-bold text-amber-300/80 mb-1.5 flex items-center justify-between font-fantasy">
                <span className="flex items-center gap-1 text-purple-400">
                  <Clock className="w-3.5 h-3.5" /> Reactions (Auto-Prompted)
                </span>
                <span className="text-[10px] text-slate-500 font-mono">1 per round</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {player.actionDeck.reactions.map((act) => (
                  <div
                    key={act.id}
                    title={act.description}
                    className="p-2.5 rounded-xl border bg-slate-900/90 border-slate-800 text-xs shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-300 font-fantasy">{act.name}</span>
                      <span className={`text-[10px] font-mono font-bold ${player.budget.reactionAvailable ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {player.budget.reactionAvailable ? 'Armed' : 'Spent'}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      <strong className="text-amber-200/80">Trigger:</strong> {act.triggerCondition || 'Reactive window'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: RULES CODEX */}
      {activeTab === 'rules' && (
        <div className="relative z-10 flex flex-col gap-2">
          {coreRules.map((rule) => {
            const isExpanded = expandedRule === rule.id;

            return (
              <div
                key={rule.id}
                className="rounded-xl border border-amber-800/40 bg-slate-900/90 overflow-hidden shadow-sm transition"
              >
                <button
                  onClick={() => setExpandedRule(isExpanded ? null : rule.id)}
                  className="w-full text-left p-2.5 flex items-center justify-between text-xs hover:bg-slate-800/80 transition cursor-pointer"
                >
                  <div>
                    <div className="font-bold text-amber-200 font-fantasy">{rule.name}</div>
                    <div className="text-[10px] text-amber-400/80 font-mono">{rule.type}</div>
                  </div>
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-amber-400" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                </button>

                {isExpanded && (
                  <div className="p-2.5 bg-slate-950 border-t border-slate-800 text-[11px] text-amber-100/90 space-y-1.5 leading-relaxed font-serif-rpg text-sm">
                    <p>{rule.details}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
