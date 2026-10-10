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
  HelpCircle,
  Plus,
  Moon,
  BookOpen,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { getTokenImage } from '../utils/artAssets';

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
    <div className="w-full flex flex-col gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-xl">
      {/* Vitals Card */}
      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3">
          <img
            src={getTokenImage(player)}
            alt={player.name}
            className="w-14 h-14 rounded-full border-2 border-amber-400 shadow-md shadow-amber-500/20 object-cover shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-1.5 truncate">
                {player.name}
                {player.spatial.isHiding && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-700 flex items-center gap-1 font-sans">
                    <EyeOff className="w-2.5 h-2.5" /> Hidden
                  </span>
                )}
              </h2>
              <button
                onClick={onOpenRestModal}
                title="Take a Short or Long Rest to replenish hit points and spell slots"
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 text-xs font-semibold transition shrink-0 ml-1"
              >
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Rest</span>
              </button>
            </div>
            <div className="text-xs text-amber-400 font-medium truncate">
              {player.race} · {player.archetype}
            </div>
          </div>
        </div>

        {/* HP Bar */}
        <div className="mt-2.5">
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="flex items-center gap-1 text-rose-400">
              <Heart className="w-3.5 h-3.5 fill-current" /> HP
            </span>
            <span className="font-mono text-slate-200">
              {player.vitals.currentHp} / {player.vitals.maxHp}
            </span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                hpPercent > 50 ? 'bg-emerald-500' : hpPercent > 25 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${hpPercent}%` }}
            />
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-slate-800 text-center text-xs">
          <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Armor Class</div>
            <div className="text-sm font-bold text-slate-100 flex items-center justify-center gap-1 font-mono">
              <Shield className="w-3 h-3 text-sky-400" />
              {player.vitals.baseAc}
            </div>
          </div>
          <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Speed</div>
            <div className="text-sm font-bold text-slate-100 flex items-center justify-center gap-1 font-mono">
              <Footprints className="w-3 h-3 text-amber-400" />
              {player.vitals.speedFt} ft
            </div>
          </div>
          <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">DEX / STR</div>
            <div className="text-xs font-bold text-slate-100 font-mono">
              +{Math.floor((player.attributes.dex - 10) / 2)} / +{Math.floor((player.attributes.str - 10) / 2)}
            </div>
          </div>
        </div>

        {/* Hit Dice & Spellcasting Metrics */}
        <div className="mt-2.5 pt-2 border-t border-slate-800 space-y-1.5">
          {/* Hit Dice Tracker */}
          <div className="flex items-center justify-between text-xs bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Hit Dice:</span>
              <span className="font-mono font-bold text-amber-400">
                {(player.vitals.hitDiceCurrent ?? player.vitals.hitDiceMax ?? 3)}/{(player.vitals.hitDiceMax ?? 3)} {(player.vitals.hitDiceDie ?? 'd8')}
              </span>
              <div className="flex items-center gap-1 ml-1.5">
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
              className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold underline"
            >
              Short/Long Rest
            </button>
          </div>

          {/* Spell Save DC & Attack Mod */}
          <div className="grid grid-cols-2 gap-1.5 text-center text-xs">
            <div className="bg-slate-900/60 px-2 py-1 rounded-md border border-slate-800">
              <span className="text-[9px] text-slate-400 uppercase font-semibold block">Spell Save DC</span>
              <span className="font-mono font-bold text-indigo-300 text-xs">
                DC {8 + 2 + Math.max(
                  Math.floor((player.attributes.int - 10) / 2),
                  Math.floor((player.attributes.wis - 10) / 2),
                  Math.floor((player.attributes.cha - 10) / 2)
                )}
              </span>
            </div>
            <div className="bg-slate-900/60 px-2 py-1 rounded-md border border-slate-800">
              <span className="text-[9px] text-slate-400 uppercase font-semibold block">Spell Attack</span>
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
      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
        <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-2 flex items-center justify-between">
          <span>Action Economy Budget</span>
          <span className="text-[10px] text-cyan-400 font-mono">Turn Ledger</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Movement */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-1.5">
              <Footprints className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-300 font-medium">Movement</span>
            </div>
            <span className="font-mono font-bold text-cyan-300">
              {player.budget.movementRemainingFt} ft
            </span>
          </div>

          {/* Action */}
          <div className={`flex items-center justify-between p-2 rounded-lg border transition-colors ${
            player.budget.actionAvailable 
              ? 'bg-emerald-950/30 border-emerald-800 text-emerald-300' 
              : 'bg-slate-900/40 border-slate-800 text-slate-500'
          }`}>
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span className="font-medium">Action</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {player.budget.actionAvailable ? 'Ready' : 'Spent'}
            </span>
          </div>

          {/* Bonus Action */}
          <div className={`flex items-center justify-between p-2 rounded-lg border transition-colors ${
            player.budget.bonusActionAvailable 
              ? 'bg-amber-950/30 border-amber-800 text-amber-300' 
              : 'bg-slate-900/40 border-slate-800 text-slate-500'
          }`}>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="font-medium">Bonus</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {player.budget.bonusActionAvailable ? 'Ready' : 'Spent'}
            </span>
          </div>

          {/* Reaction */}
          <div className={`flex items-center justify-between p-2 rounded-lg border transition-colors ${
            player.budget.reactionAvailable 
              ? 'bg-purple-950/30 border-purple-800 text-purple-300' 
              : 'bg-slate-900/40 border-slate-800 text-slate-500'
          }`}>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span className="font-medium">Reaction</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {player.budget.reactionAvailable ? 'Armed' : 'Spent'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs: Action Deck vs 5e Rules */}
      <div className="flex gap-1 border-b border-slate-800 pb-1 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('actions')}
          className={`flex-1 py-1.5 text-center rounded-lg transition ${
            activeTab === 'actions'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Combat Deck ({player.actionDeck.actions.length})
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`flex-1 py-1.5 text-center rounded-lg transition flex items-center justify-center gap-1 ${
            activeTab === 'rules'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" /> 5e Rules Guide
        </button>
      </div>

      {/* TAB 1: ACTIONS & SPELLS */}
      {activeTab === 'actions' && (
        <div className="flex flex-col gap-3">
          {/* Add Spell / Action Button */}
          <button
            onClick={onOpenSpellPicker}
            className="w-full py-2 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Spell or Cantrip from 5e SRD</span>
          </button>

          {/* Actions (Standard) */}
          <div>
            <div className="text-xs font-bold text-slate-400 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1 text-emerald-400">
                <Zap className="w-3.5 h-3.5" /> Standard Actions
              </span>
              <span className="text-[10px] text-slate-500">1 per turn</span>
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
                    className={`w-full text-left p-2.5 rounded-xl border transition-all text-xs flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-amber-200 ring-1 ring-amber-500'
                        : disabled
                        ? 'bg-slate-950/40 border-slate-900 text-slate-600 opacity-60 cursor-not-allowed'
                        : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <Swords className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <div className="truncate">
                        <div className="font-semibold text-slate-200 truncate">{act.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {act.toHitMod !== undefined && `+${act.toHitMod} to hit `}
                          {act.damageFormula && `· ${act.damageFormula} `}
                          {act.rangeFt && `· ${act.rangeFt} ft`}
                        </div>
                      </div>
                    </div>
                    {isSelected ? (
                      <Target className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 shrink-0 font-medium">
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
              <div className="text-xs font-bold text-slate-400 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1 text-amber-400">
                  <Sparkles className="w-3.5 h-3.5" /> Bonus Actions
                </span>
                <span className="text-[10px] text-slate-500">1 per turn</span>
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
                      className={`w-full text-left p-2.5 rounded-xl border transition-all text-xs flex items-center justify-between ${
                        disabled
                          ? 'bg-slate-950/40 border-slate-900 text-slate-600 opacity-60 cursor-not-allowed'
                          : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-200'
                      }`}
                    >
                      <div className="pr-2">
                        <div className="font-semibold text-amber-300">{act.name}</div>
                        <div className="text-[10px] text-slate-400 leading-snug">{act.description}</div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/40 text-amber-400 border border-amber-900 shrink-0 font-semibold">
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
              <div className="text-xs font-bold text-slate-400 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1 text-purple-400">
                  <Clock className="w-3.5 h-3.5" /> Reactions (Auto-Prompted)
                </span>
                <span className="text-[10px] text-slate-500">1 per round</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {player.actionDeck.reactions.map((act) => (
                  <div
                    key={act.id}
                    title={act.description}
                    className="p-2.5 rounded-xl border bg-slate-950 border-slate-800 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-purple-300">{act.name}</span>
                      <span className={`text-[10px] font-mono font-bold ${player.budget.reactionAvailable ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {player.budget.reactionAvailable ? 'Armed' : 'Spent'}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      <strong className="text-slate-300">Trigger:</strong> {act.triggerCondition || 'Reactive window'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: 5E CORE RULES GUIDE */}
      {activeTab === 'rules' && (
        <div className="space-y-2 text-xs">
          <div className="p-2.5 rounded-xl bg-indigo-950/20 border border-indigo-900/40 text-[11px] text-indigo-300 leading-relaxed">
            📖 <strong>Physical Tabletop Reference:</strong> Common actions you can take on your turn beyond standard weapon swings.
          </div>

          {coreRules.map((r) => {
            const isExpanded = expandedRule === r.id;

            return (
              <div
                key={r.id}
                className="rounded-xl border bg-slate-950 border-slate-800 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedRule(isExpanded ? null : r.id)}
                  className="w-full p-2.5 text-left flex items-center justify-between hover:bg-slate-900 transition"
                >
                  <div>
                    <div className="font-bold text-slate-200">{r.name}</div>
                    <div className="text-[10px] text-slate-400">{r.summary}</div>
                  </div>
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                </button>

                {isExpanded && (
                  <div className="p-2.5 bg-slate-900/70 border-t border-slate-800 text-[11px] text-slate-300 leading-relaxed font-sans">
                    {r.details}
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
