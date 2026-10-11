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
  X,
  UserCheck
} from 'lucide-react';
import { ART_ASSETS, getTokenImage, getDarkVellumStyle } from '../utils/artAssets';
import { FantasyCornerBrackets, WaxSealBadge } from './FantasyDecorations';

interface CharacterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  player: Combatant;
  selectedAction: ActionItem | null;
  onSelectAction: (action: ActionItem | null) => void;
  onExecuteUtilityAction: (action: ActionItem) => void;
  onOpenRestModal: () => void;
  onOpenSpellPicker: () => void;
  onOpenCharacterModal: () => void;
}

export const CharacterDrawer: React.FC<CharacterDrawerProps> = ({
  isOpen,
  onClose,
  player,
  selectedAction,
  onSelectAction,
  onExecuteUtilityAction,
  onOpenRestModal,
  onOpenSpellPicker,
  onOpenCharacterModal,
}) => {
  const [activeTab, setActiveTab] = useState<'vitals' | 'actions' | 'rules'>('vitals');
  const [expandedRule, setExpandedRule] = useState<string | null>(null);

  if (!isOpen) return null;

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
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-200 animate-in fade-in"
      />

      {/* Slide-out Drawer */}
      <div 
        className="fixed inset-y-0 left-0 z-50 w-full sm:w-[480px] bg-[#120c08] border-r-2 border-amber-800/70 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-left duration-250 select-none"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 10%, rgba(26, 18, 12, 0.96) 0%, rgba(15, 10, 6, 0.98) 100%), url(${ART_ASSETS.darkWood})`,
          backgroundSize: 'cover',
        }}
      >
        <FantasyCornerBrackets className="w-5 h-5 text-amber-600/50" />

        {/* Header */}
        <div className="relative z-10 p-4 border-b border-amber-900/50 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-2.5">
            <img 
              src={getTokenImage(player)} 
              alt={player.name}
              className="w-10 h-10 rounded-full border-2 border-amber-700 object-cover shadow-md shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-fantasy font-black text-amber-200 text-base">
                  {player.name}
                </h2>
                <WaxSealBadge text={player.archetype || 'Hero'} color="amber" />
              </div>
              <p className="text-[11px] text-amber-300/80 font-serif-rpg">
                Character Sheet Dossier & Action Economy
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenCharacterModal}
              title="Import or Switch Character"
              className="p-1.5 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-800/50 transition cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              title="Close Drawer [Esc] or [C]"
              className="p-1.5 rounded-lg hover:bg-slate-800 text-amber-400 hover:text-amber-200 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="relative z-10 flex gap-1 p-2.5 bg-black/30 border-b border-amber-900/40 text-xs font-fantasy font-bold">
          <button
            onClick={() => setActiveTab('vitals')}
            className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'vitals'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-950/60'
                : 'text-amber-200/70 hover:text-amber-100 hover:bg-amber-950/40'
            }`}
          >
            Vitals & Stats
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'actions'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-950/60'
                : 'text-amber-200/70 hover:text-amber-100 hover:bg-amber-950/40'
            }`}
          >
            Action Catalog ({player.actionDeck.actions.length + player.actionDeck.bonusActions.length})
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'rules'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-950/60'
                : 'text-amber-200/70 hover:text-amber-100 hover:bg-amber-950/40'
            }`}
          >
            Rules Codex
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="relative z-10 flex-1 overflow-y-auto p-4 space-y-3.5 pr-2">
          {/* TAB 1: VITALS & ABILITIES */}
          {activeTab === 'vitals' && (
            <div className="space-y-3">
              {/* HP & AC Card */}
              <div 
                className="p-3.5 rounded-xl border-2 border-amber-800/70 space-y-2.5 shadow-md relative overflow-hidden"
                style={getDarkVellumStyle(0.92)}
              >
                <FantasyCornerBrackets className="w-3 h-3 text-amber-600/50" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-fantasy font-bold text-amber-200 text-sm">
                    <Heart className="w-4 h-4 text-rose-400" /> Hit Points (HP)
                  </div>
                  <span className="font-mono font-bold text-sm text-amber-100">
                    {player.vitals.currentHp} / {player.vitals.maxHp}
                  </span>
                </div>

                <div className="w-full h-3 rounded-full bg-slate-900 border border-amber-950 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      hpPercent > 50 ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' :
                      hpPercent > 20 ? 'bg-gradient-to-r from-amber-600 to-amber-400' :
                      'bg-gradient-to-r from-rose-700 to-rose-500'
                    }`}
                    style={{ width: `${hpPercent}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 text-xs font-mono">
                  <div className="p-2 rounded-lg bg-black/30 border border-amber-900/40 flex items-center justify-between">
                    <span className="text-amber-300 font-sans flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-indigo-400" /> Armor Class
                    </span>
                    <strong className="text-amber-100">{player.vitals.baseAc}</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-black/30 border border-amber-900/40 flex items-center justify-between">
                    <span className="text-amber-300 font-sans flex items-center gap-1">
                      <Footprints className="w-3.5 h-3.5 text-sky-400" /> Speed (ft)
                    </span>
                    <strong className="text-amber-100">{player.vitals.speedFt} ft</strong>
                  </div>
                </div>
              </div>

              {/* Ability Scores Grid */}
              <div 
                className="p-3.5 rounded-xl border-2 border-amber-800/70 shadow-md relative overflow-hidden"
                style={getDarkVellumStyle(0.92)}
              >
                <FantasyCornerBrackets className="w-3 h-3 text-amber-600/50" />
                <div className="font-fantasy font-black text-amber-200 text-xs uppercase mb-2.5">
                  Ability Scores & Modifiers
                </div>
                <div className="grid grid-cols-6 gap-1.5 text-center">
                  {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as const).map((stat) => {
                    const score = player.attributes[stat] || 10;
                    const mod = Math.floor((score - 10) / 2);
                    const modStr = mod >= 0 ? `+${mod}` : `${mod}`;
                    return (
                      <div key={stat} className="p-1.5 rounded-lg bg-black/30 border border-amber-900/40">
                        <div className="text-[10px] uppercase font-fantasy font-bold text-amber-300/80">
                          {stat}
                        </div>
                        <div className="text-sm font-black font-mono text-amber-100">{score}</div>
                        <div className="text-[10px] font-mono font-bold text-amber-400">{modStr}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Hit Dice Pool Tracker */}
              <div 
                className="p-3.5 rounded-xl border-2 border-amber-800/70 shadow-md relative overflow-hidden"
                style={getDarkVellumStyle(0.92)}
              >
                <FantasyCornerBrackets className="w-3 h-3 text-amber-600/50" />
                <div className="flex items-center justify-between mb-2">
                  <span className="font-fantasy font-black text-amber-200 text-xs uppercase flex items-center gap-1.5">
                    <Moon className="w-3.5 h-3.5 text-sky-400" /> Hit Dice Pool
                  </span>
                  <span className="font-mono font-bold text-xs text-amber-100">
                    {player.vitals.hitDiceCurrent ?? player.vitals.hitDiceMax ?? 3} / {player.vitals.hitDiceMax ?? 3} {player.vitals.hitDiceDie ?? 'd8'}
                  </span>
                </div>
                <p className="text-[11px] text-amber-300/80 font-serif-rpg leading-relaxed mb-3">
                  Hit Dice are spent during Short Rests to restore Hit Points. Half are restored upon taking a Long Rest.
                </p>
                <button
                  onClick={onOpenRestModal}
                  className="w-full py-2 rounded-xl btn-fantasy-gold font-fantasy font-black text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Moon className="w-3.5 h-3.5" /> Take Short / Long Rest
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: ACTION CATALOG */}
          {activeTab === 'actions' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-fantasy font-bold text-amber-300">
                  Standard Actions ({player.actionDeck.actions.length})
                </span>
                <button
                  onClick={onOpenSpellPicker}
                  className="text-xs text-amber-400 hover:text-amber-200 font-fantasy flex items-center gap-1 transition cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Scribe Spell
                </button>
              </div>

              <div className="space-y-2">
                {player.actionDeck.actions.map((act) => {
                  const isSelected = selectedAction?.id === act.id;
                  return (
                    <div
                      key={act.id}
                      onClick={() => handleActionClick(act)}
                      className={`p-3 rounded-xl border-2 transition cursor-pointer relative overflow-hidden shadow-sm ${
                        isSelected
                          ? 'border-amber-400 bg-amber-950/80 ring-2 ring-amber-500/50'
                          : 'border-amber-900/60 hover:border-amber-600 bg-black/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-fantasy font-bold text-amber-200 text-sm">{act.name}</span>
                        {act.damageFormula && (
                          <span className="text-xs font-mono font-bold text-amber-400">
                            {act.damageFormula} {act.damageType}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-amber-300/80 font-serif-rpg mt-1 leading-relaxed">
                        {act.description}
                      </p>
                      {(act as any).tabletopTip && (
                        <div className="mt-2 text-[10px] text-amber-400/90 bg-amber-950/40 p-1.5 rounded border border-amber-900/40 font-serif-rpg">
                          💡 {(act as any).tabletopTip}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-2">
                <span className="text-xs font-fantasy font-bold text-amber-300 block mb-2">
                  Bonus Actions ({player.actionDeck.bonusActions.length})
                </span>
                <div className="space-y-2">
                  {player.actionDeck.bonusActions.map((act) => (
                    <div
                      key={act.id}
                      onClick={() => handleActionClick(act)}
                      className="p-3 rounded-xl border-2 border-amber-900/60 hover:border-amber-600 bg-black/40 transition cursor-pointer relative overflow-hidden shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-fantasy font-bold text-amber-200 text-sm">{act.name}</span>
                        <WaxSealBadge text="Bonus Action" color="amber" />
                      </div>
                      <p className="text-xs text-amber-300/80 font-serif-rpg mt-1 leading-relaxed">
                        {act.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RULES CODEX */}
          {activeTab === 'rules' && (
            <div className="space-y-2.5">
              {coreRules.map((rule) => {
                const isExpanded = expandedRule === rule.id;
                return (
                  <div
                    key={rule.id}
                    className="p-3 rounded-xl border-2 border-amber-900/60 bg-black/40 transition cursor-pointer relative overflow-hidden"
                    onClick={() => setExpandedRule(isExpanded ? null : rule.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-amber-400" /> : <ChevronRight className="w-4 h-4 text-amber-400" />}
                        <span className="font-fantasy font-bold text-amber-200 text-sm">{rule.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-amber-400/80 font-semibold">{rule.type}</span>
                    </div>
                    <div className="text-xs text-amber-300/90 font-serif-rpg mt-1">
                      {rule.summary}
                    </div>
                    {isExpanded && (
                      <p className="text-xs text-amber-200/90 font-serif-rpg mt-2 pt-2 border-t border-amber-900/40 leading-relaxed">
                        {rule.details}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
