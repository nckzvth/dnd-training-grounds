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
} from 'lucide-react';
import { ART_ASSETS, getTokenImage, getDarkVellumStyle, getWarmParchmentStyle } from '../utils/artAssets';
import { FantasyCornerBrackets, WaxSealBadge } from './FantasyDecorations';

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
    if (action.type === 'utility' || (action.type === 'class_feature' && !action.toHitMod && !action.damageFormula)) {
      onExecuteUtilityAction(action);
      return;
    }

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
    <div 
      className="relative flex flex-col gap-3.5 rounded-2xl border-4 border-amber-900/90 p-3 sm:p-4 shadow-2xl select-none"
      style={{
        backgroundImage: `radial-gradient(circle at 50% 10%, rgba(26, 18, 12, 0.94) 0%, rgba(15, 10, 6, 0.98) 100%), url(${ART_ASSETS.darkWood})`,
        backgroundSize: 'cover',
        boxShadow: '0 15px 35px rgba(0,0,0,0.8), inset 0 0 40px rgba(0,0,0,0.7)'
      }}
    >
      <FantasyCornerBrackets className="w-5 h-5 text-amber-500/90" />

      {/* Vitals Card (Dark Antiqued Vellum Manuscript) */}
      <div 
        className="relative rounded-xl border border-amber-900/50 p-3.5 shadow-xl overflow-hidden"
        style={{
          ...getDarkVellumStyle(0.92),
          boxShadow: 'inset 0 0 30px rgba(0, 0, 0, 0.85), 0 6px 15px rgba(0,0,0,0.6)'
        }}
      >
        <FantasyCornerBrackets className="w-4 h-4 text-amber-600/50" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="relative group shrink-0">
            <img
              src={getTokenImage(player)}
              alt={player.name}
              className="w-14 h-14 rounded-full border-2 border-amber-500/80 shadow-md shadow-black/80 object-cover"
            />
            <div className="absolute -inset-0.5 rounded-full bg-amber-500/20 blur pointer-events-none" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h2 className="font-fantasy text-base sm:text-lg font-black text-amber-100 flex items-center gap-1.5 truncate drop-shadow-sm">
                {player.name}
                {player.spatial.isHiding && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-200 border border-purple-600/70 flex items-center gap-1 font-sans">
                    <EyeOff className="w-2.5 h-2.5" /> Hidden
                  </span>
                )}
              </h2>
              <button
                onClick={onOpenRestModal}
                title="Take a Short or Long Rest to replenish hit points and spell slots"
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-900 to-amber-950 hover:from-amber-800 hover:to-amber-900 text-amber-200 border border-amber-700/60 text-xs font-fantasy font-bold transition shadow-sm cursor-pointer ml-1"
              >
                <Moon className="w-3.5 h-3.5 text-amber-300" />
                <span>Rest</span>
              </button>
            </div>
            <div className="text-xs text-amber-300/80 font-bold font-fantasy truncate">
              {player.race} · {player.archetype}
            </div>
          </div>
        </div>

        {/* HP Bar (Illuminated Health Vial) */}
        <div className="relative z-10 mt-3">
          <div className="flex justify-between text-xs font-bold mb-1 text-amber-200 font-fantasy">
            <span className="flex items-center gap-1 text-rose-300">
              <Heart className="w-3.5 h-3.5 fill-current" /> Vitality HP
            </span>
            <span className="font-mono text-amber-100 font-black">
              {player.vitals.currentHp} / {player.vitals.maxHp}
            </span>
          </div>
          <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden border border-amber-900/40 shadow-inner">
            <div
              className={`h-full transition-all duration-300 ${
                hpPercent > 50 ? 'bg-gradient-to-r from-emerald-700 to-emerald-500' : 
                hpPercent > 25 ? 'bg-gradient-to-r from-amber-700 to-amber-500' : 
                'bg-gradient-to-r from-rose-800 to-rose-600'
              }`}
              style={{ width: `${hpPercent}%` }}
            />
          </div>
        </div>

        {/* Quick Stats Grid (Dark Vellum Tablets) */}
        <div className="relative z-10 grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-amber-900/40 text-center text-xs">
          <div className="bg-black/40 p-2 rounded-xl border border-amber-900/35 shadow-inner">
            <div className="text-[10px] text-amber-400/80 uppercase font-black font-fantasy">Armor Class</div>
            <div className="text-sm font-black text-amber-100 flex items-center justify-center gap-1 font-mono mt-0.5">
              <Shield className="w-3.5 h-3.5 text-sky-400" />
              {player.vitals.baseAc}
            </div>
          </div>
          <div className="bg-black/40 p-2 rounded-xl border border-amber-900/35 shadow-inner">
            <div className="text-[10px] text-amber-400/80 uppercase font-black font-fantasy">Speed</div>
            <div className="text-sm font-black text-amber-100 flex items-center justify-center gap-1 font-mono mt-0.5">
              <Footprints className="w-3.5 h-3.5 text-amber-400" />
              {player.vitals.speedFt} ft
            </div>
          </div>
          <div className="bg-black/40 p-2 rounded-xl border border-amber-900/35 shadow-inner">
            <div className="text-[10px] text-amber-400/80 uppercase font-black font-fantasy">DEX / STR</div>
            <div className="text-xs font-black text-amber-100 font-mono mt-0.5">
              +{Math.floor((player.attributes.dex - 10) / 2)} / +{Math.floor((player.attributes.str - 10) / 2)}
            </div>
          </div>
        </div>

        {/* Hit Dice & Spellcasting Metrics */}
        <div className="relative z-10 mt-2.5 pt-2 border-t border-amber-900/40 space-y-2">
          {/* Hit Dice Tracker */}
          <div className="flex items-center justify-between text-xs bg-black/40 px-3 py-1.5 rounded-xl border border-amber-900/35">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-amber-300 font-black uppercase font-fantasy">Hit Dice:</span>
              <span className="font-mono font-black text-amber-100">
                {(player.vitals.hitDiceCurrent ?? player.vitals.hitDiceMax ?? 3)}/{(player.vitals.hitDiceMax ?? 3)} {(player.vitals.hitDiceDie ?? 'd8')}
              </span>
              <div className="flex items-center gap-1 ml-2">
                {Array.from({ length: (player.vitals.hitDiceMax ?? 3) }).map((_, i) => (
                  <span
                    key={i}
                    className={`w-2.5 h-2.5 rounded-full ${
                      i < (player.vitals.hitDiceCurrent ?? player.vitals.hitDiceMax ?? 3)
                        ? 'bg-amber-500 shadow-sm shadow-amber-950/80 border border-amber-400'
                        : 'bg-black/50 border border-amber-900/50'
                    }`}
                  />
                ))}
              </div>
            </div>
            <button
              onClick={onOpenRestModal}
              className="text-[10px] text-amber-400 hover:text-amber-200 font-black underline font-fantasy cursor-pointer"
            >
              Short Rest
            </button>
          </div>

          {/* Spell Save DC & Attack Mod */}
          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="bg-black/40 px-2 py-1.5 rounded-xl border border-amber-900/35">
              <span className="text-[9px] text-amber-400/80 uppercase font-black font-fantasy block">Spell Save DC</span>
              <span className="font-mono font-black text-amber-100 text-xs">
                DC {8 + 2 + Math.max(
                  Math.floor((player.attributes.int - 10) / 2),
                  Math.floor((player.attributes.wis - 10) / 2),
                  Math.floor((player.attributes.cha - 10) / 2)
                )}
              </span>
            </div>
            <div className="bg-black/40 px-2 py-1.5 rounded-xl border border-amber-900/35">
              <span className="text-[9px] text-amber-400/80 uppercase font-black font-fantasy block">Spell Attack</span>
              <span className="font-mono font-black text-amber-100 text-xs">
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
      <div className="relative bg-[#140e0a]/95 p-3 rounded-xl border border-amber-900/50 shadow-lg">
        <div className="text-[11px] font-fantasy uppercase tracking-wider font-bold text-amber-200/90 mb-2 flex items-center justify-between">
          <span>Action Economy Ledger</span>
          <span className="text-[10px] text-amber-400/70 font-mono">Turn Budget</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Movement */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#1c1510] border border-amber-900/35">
            <div className="flex items-center gap-1.5">
              <Footprints className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-amber-200/90 font-medium">Movement</span>
            </div>
            <span className="font-mono font-bold text-sky-300">
              {player.budget.movementRemainingFt} ft
            </span>
          </div>

          {/* Action */}
          <div className={`flex items-center justify-between p-2 rounded-xl border transition-colors ${
            player.budget.actionAvailable 
              ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300' 
              : 'bg-[#18120d] border-stone-900 text-stone-500'
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
              ? 'bg-amber-950/40 border-amber-800/50 text-amber-300' 
              : 'bg-[#18120d] border-stone-900 text-stone-500'
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
              ? 'bg-purple-950/40 border-purple-800/50 text-purple-300' 
              : 'bg-[#18120d] border-stone-900 text-stone-500'
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
      <div className="relative flex gap-1.5 border-b border-amber-800/40 pb-1 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('actions')}
          className={`flex-1 py-1.5 text-center rounded-xl font-fantasy transition ${
            activeTab === 'actions'
              ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-sm'
              : 'text-amber-200/60 hover:text-amber-200'
          }`}
        >
          Combat Deck ({player.actionDeck.actions.length})
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`flex-1 py-1.5 text-center rounded-xl font-fantasy transition flex items-center justify-center gap-1.5 ${
            activeTab === 'rules'
              ? 'bg-indigo-500/25 text-indigo-300 border border-indigo-500/50 shadow-sm'
              : 'text-amber-200/60 hover:text-amber-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" /> 5e Rules Guide
        </button>
      </div>

      {/* TAB 1: ACTIONS & SPELLS (Parchment Deck Cards) */}
      {activeTab === 'actions' && (
        <div className="relative flex flex-col gap-3">
          {/* Add Spell / Action Button */}
          <button
            onClick={onOpenSpellPicker}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 hover:brightness-110 border border-indigo-500/60 text-indigo-200 font-semibold text-xs flex items-center justify-center gap-2 transition shadow-md font-fantasy cursor-pointer"
          >
            <Plus className="w-4 h-4 text-indigo-400" />
            <span>Add Spell or Cantrip from 5e SRD</span>
          </button>

          {/* Standard Actions */}
          <div>
            <div className="text-xs font-bold text-amber-300 mb-1.5 flex items-center justify-between font-fantasy">
              <span className="flex items-center gap-1 text-emerald-400">
                <Zap className="w-3.5 h-3.5" /> Standard Actions
              </span>
              <span className="text-[10px] text-amber-400/80 font-mono">1 per turn</span>
            </div>
            <div className="flex flex-col gap-2">
              {player.actionDeck.actions.map((act) => {
                const isSelected = selectedAction?.id === act.id;
                const disabled = !player.budget.actionAvailable;

                return (
                  <button
                    key={act.id}
                    onClick={() => handleActionClick(act)}
                    disabled={disabled}
                    title={act.description}
                    className={`relative overflow-hidden w-full text-left p-3 rounded-xl border transition-all text-xs flex items-center justify-between cursor-pointer shadow-md ${
                      isSelected
                        ? 'border-amber-400 ring-2 ring-amber-400/80 scale-[1.02] shadow-amber-500/25'
                        : disabled
                        ? 'border-stone-900 opacity-40 cursor-not-allowed'
                        : 'border-amber-900/40 hover:border-amber-600/70'
                    }`}
                    style={getDarkVellumStyle(0.90)}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <Swords className="w-4 h-4 text-amber-400 shrink-0" />
                      <div className="truncate">
                        <div className="font-fantasy font-black text-amber-100 text-sm truncate drop-shadow-sm">{act.name}</div>
                        <div className="text-[10px] text-amber-300/80 font-bold font-mono">
                          {act.toHitMod !== undefined && `+${act.toHitMod} to hit `}
                          {act.damageFormula && `· ${act.damageFormula} `}
                          {act.rangeFt && `· ${act.rangeFt} ft`}
                        </div>
                      </div>
                    </div>
                    {isSelected ? (
                      <span className="px-2.5 py-1 rounded-full bg-rose-800 text-rose-100 font-fantasy font-black text-[10px] border border-rose-500 animate-pulse shadow-md">
                        TARGETING
                      </span>
                    ) : (
                      <span className="text-[10px] px-2.5 py-0.5 rounded-lg bg-[#140e0a] text-amber-200 border border-amber-900/40 shrink-0 font-bold font-fantasy">
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
              <div className="text-xs font-bold text-amber-200/90 mb-1.5 flex items-center justify-between font-fantasy">
                <span className="flex items-center gap-1 text-amber-400">
                  <Sparkles className="w-3.5 h-3.5" /> Bonus Actions
                </span>
                <span className="text-[10px] text-amber-400/70 font-mono">1 per turn</span>
              </div>
              <div className="flex flex-col gap-2">
                {player.actionDeck.bonusActions.map((act) => {
                  const disabled = !player.budget.bonusActionAvailable;

                  return (
                    <button
                      key={act.id}
                      onClick={() => handleActionClick(act)}
                      disabled={disabled}
                      title={act.description}
                      className={`relative overflow-hidden w-full text-left p-3 rounded-xl border transition-all text-xs flex items-center justify-between cursor-pointer shadow-md ${
                        disabled
                          ? 'border-stone-900 opacity-40 cursor-not-allowed'
                          : 'border-amber-900/40 hover:border-amber-600/70'
                      }`}
                      style={getDarkVellumStyle(0.90)}
                    >
                      <div className="pr-2">
                        <div className="font-fantasy font-black text-amber-100 text-sm">{act.name}</div>
                        <div className="text-[10px] text-amber-300/80 font-semibold leading-snug">{act.description}</div>
                      </div>
                      <span className="text-[10px] px-2.5 py-1 rounded-lg bg-amber-900 hover:bg-amber-800 text-amber-100 border border-amber-700/80 shrink-0 font-black font-fantasy shadow-sm">
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
              <div className="text-xs font-bold text-amber-300 mb-1.5 flex items-center justify-between font-fantasy">
                <span className="flex items-center gap-1 text-purple-400">
                  <Clock className="w-3.5 h-3.5" /> Reactions (Auto-Prompted)
                </span>
                <span className="text-[10px] text-amber-400/80 font-mono">1 per round</span>
              </div>
              <div className="flex flex-col gap-2">
                {player.actionDeck.reactions.map((act) => (
                  <div
                    key={act.id}
                    title={act.description}
                    className="p-3 rounded-xl border-2 border-purple-900/60 bg-slate-900/90 text-xs shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-fantasy font-bold text-purple-300 text-sm">{act.name}</span>
                      <span className={`text-[10px] font-mono font-bold ${player.budget.reactionAvailable ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {player.budget.reactionAvailable ? 'Armed' : 'Spent'}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-300 mt-1">
                      <strong className="text-amber-300">Trigger:</strong> {act.triggerCondition || 'Reactive window'}
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
        <div className="relative flex flex-col gap-2">
          {coreRules.map((rule) => {
            const isExpanded = expandedRule === rule.id;

            return (
              <div
                key={rule.id}
                className="rounded-xl border border-amber-900/40 overflow-hidden shadow-md"
                style={getDarkVellumStyle(0.90)}
              >
                <button
                  onClick={() => setExpandedRule(isExpanded ? null : rule.id)}
                  className="w-full text-left p-3 flex items-center justify-between text-xs hover:bg-black/30 transition cursor-pointer"
                >
                  <div>
                    <div className="font-fantasy font-black text-amber-100 text-sm">{rule.name}</div>
                    <div className="text-[10px] text-amber-300/80 font-bold font-mono">{rule.type}</div>
                  </div>
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-amber-300" /> : <ChevronRight className="w-4 h-4 text-amber-400/60" />}
                </button>

                {isExpanded && (
                  <div className="p-3 bg-black/40 border-t border-amber-900/35 text-xs text-amber-200/90 font-serif-rpg font-semibold leading-relaxed">
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
