import React from 'react';
import { Combatant, ActionItem } from '../types/combat';
import { ART_ASSETS, getTokenImage, getDarkVellumStyle } from '../utils/artAssets';
import { 
  Heart, 
  Shield, 
  Footprints, 
  Swords, 
  Sparkles, 
  EyeOff, 
  Target, 
  Play, 
  Dices, 
  ScrollText, 
  User, 
  Moon, 
  Plus,
  Zap,
  HelpCircle
} from 'lucide-react';
import { FantasyCornerBrackets } from './FantasyDecorations';

interface TacticalActionBarProps {
  player: Combatant;
  selectedAction: ActionItem | null;
  onSelectAction: (action: ActionItem | null) => void;
  onExecuteUtilityAction: (action: ActionItem) => void;
  onEndTurn: () => void;
  isPlayerTurn: boolean;
  onToggleCharDrawer: () => void;
  isCharDrawerOpen: boolean;
  onToggleLogDrawer: () => void;
  isLogDrawerOpen: boolean;
  onToggleDiceTray: () => void;
  isDiceTrayOpen: boolean;
  onOpenRestModal: () => void;
  onOpenSpellPicker: () => void;
  onOpenHelpModal: () => void;
}

export const TacticalActionBar: React.FC<TacticalActionBarProps> = ({
  player,
  selectedAction,
  onSelectAction,
  onExecuteUtilityAction,
  onEndTurn,
  isPlayerTurn,
  onToggleCharDrawer,
  isCharDrawerOpen,
  onToggleLogDrawer,
  isLogDrawerOpen,
  onToggleDiceTray,
  isDiceTrayOpen,
  onOpenRestModal,
  onOpenSpellPicker,
  onOpenHelpModal,
}) => {
  const hpPercent = Math.max(0, Math.min(100, (player.vitals.currentHp / player.vitals.maxHp) * 100));

  // Determine icon for an action item
  const getActionIcon = (action: ActionItem) => {
    if (action.type === 'spell_attack' || action.type === 'saving_throw_spell') {
      return <Sparkles className="w-4 h-4 text-amber-300" />;
    }
    if (action.name.toLowerCase().includes('hide')) {
      return <EyeOff className="w-4 h-4 text-indigo-300" />;
    }
    if (action.name.toLowerCase().includes('dash') || action.name.toLowerCase().includes('disengage')) {
      return <Footprints className="w-4 h-4 text-sky-300" />;
    }
    if (action.name.toLowerCase().includes('bow') || action.name.toLowerCase().includes('dart') || action.rangeFt) {
      return <Target className="w-4 h-4 text-emerald-300" />;
    }
    return <Swords className="w-4 h-4 text-amber-300" />;
  };

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

  // Build the list of equipped actions for the hotbar slots (1 to 8)
  const equippedActions = [
    ...player.actionDeck.actions,
    ...player.actionDeck.bonusActions,
  ].slice(0, 7);

  return (
    <div className="w-full max-w-6xl mx-auto px-2 select-none">
      {/* Floating Tactical Dock */}
      <div 
        className="relative rounded-2xl border-2 border-amber-900/70 p-2 sm:p-2.5 shadow-[0_15px_45px_rgba(0,0,0,0.9)] flex flex-wrap items-center justify-between gap-2.5 overflow-hidden"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 10%, rgba(26, 18, 12, 0.96) 0%, rgba(15, 10, 6, 0.98) 100%), url(${ART_ASSETS.darkWood})`,
          backgroundSize: 'cover',
          backgroundColor: '#120c08',
        }}
      >
        <FantasyCornerBrackets className="w-4 h-4 text-amber-600/40" />

        {/* LEFT: Player Mini-Vitals Pill */}
        <div 
          onClick={onToggleCharDrawer}
          title="Click or press [C] to open full Character Sheet"
          className="relative z-10 flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl border border-amber-900/50 hover:border-amber-600/70 transition bg-black/40 cursor-pointer group"
        >
          <div className="relative">
            <img 
              src={getTokenImage(player)} 
              alt={player.name}
              className="w-9 h-9 rounded-full border-2 border-amber-700 object-cover shadow-md shrink-0 group-hover:scale-105 transition-transform"
            />
            <span className="absolute -bottom-1 -right-1 text-[9px] font-mono font-bold bg-amber-950 text-amber-200 border border-amber-700/80 rounded px-1">
              [C]
            </span>
          </div>

          <div className="flex flex-col min-w-[110px]">
            <div className="flex items-center justify-between gap-1">
              <span className="font-fantasy font-bold text-amber-200 text-xs truncate max-w-[90px]">
                {player.name}
              </span>
              <span className="text-[10px] text-amber-400 font-mono font-semibold">
                AC {player.vitals.baseAc}
              </span>
            </div>

            {/* Compact HP Bar */}
            <div className="w-full h-2 rounded-full bg-slate-900 border border-amber-950 overflow-hidden mt-0.5">
              <div 
                className={`h-full transition-all duration-300 ${
                  hpPercent > 50 ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' :
                  hpPercent > 20 ? 'bg-gradient-to-r from-amber-600 to-amber-400' :
                  'bg-gradient-to-r from-rose-700 to-rose-500'
                }`}
                style={{ width: `${hpPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-amber-300/80 font-mono mt-0.5">
              <span>{player.vitals.currentHp}/{player.vitals.maxHp} HP</span>
              <span className="text-sky-300">{player.budget.movementRemainingFt} ft</span>
            </div>
          </div>
        </div>

        {/* CENTER LEFT: Action Economy Pips */}
        <div className="relative z-10 hidden sm:flex items-center gap-2 px-2 py-1 rounded-xl bg-black/30 border border-amber-900/40 text-[10px] font-mono">
          <div className="flex items-center gap-1" title={player.budget.actionAvailable ? 'Standard Action Ready' : 'Standard Action Spent'}>
            <span className={`w-2.5 h-2.5 rounded-full ${player.budget.actionAvailable ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-slate-700 border border-slate-600'}`} />
            <span className={player.budget.actionAvailable ? 'text-emerald-300 font-bold' : 'text-slate-500 line-through'}>Act</span>
          </div>

          <div className="flex items-center gap-1" title={player.budget.bonusActionAvailable ? 'Bonus Action Ready' : 'Bonus Action Spent'}>
            <span className={`w-2.5 h-2.5 rounded-full ${player.budget.bonusActionAvailable ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'bg-slate-700 border border-slate-600'}`} />
            <span className={player.budget.bonusActionAvailable ? 'text-amber-300 font-bold' : 'text-slate-500 line-through'}>Bonus</span>
          </div>

          <div className="flex items-center gap-1" title={player.budget.reactionAvailable ? 'Reaction Window Held' : 'Reaction Window Spent'}>
            <span className={`w-2.5 h-2.5 rounded-full ${player.budget.reactionAvailable ? 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]' : 'bg-slate-700 border border-slate-600'}`} />
            <span className={player.budget.reactionAvailable ? 'text-purple-300 font-bold' : 'text-slate-500 line-through'}>React</span>
          </div>
        </div>

        {/* CENTER: Hotbar Action Slots [1] to [7] */}
        <div className="relative z-10 flex items-center gap-1.5 flex-1 justify-center overflow-x-auto py-0.5">
          {equippedActions.map((action, idx) => {
            const hotkey = idx + 1;
            const isSelected = selectedAction?.id === action.id;
            const isBonus = action.cost === 'bonus';
            const isUsable = isBonus ? player.budget.bonusActionAvailable : player.budget.actionAvailable;

            return (
              <button
                key={action.id}
                onClick={() => handleActionClick(action)}
                disabled={!isPlayerTurn || !isUsable}
                title={`${action.name} [${hotkey}]\nCost: ${action.cost.toUpperCase()}\n${action.damageFormula ? `Damage: ${action.damageFormula}` : ''}\n${action.description}`}
                className={`relative group flex flex-col items-center justify-center w-11 h-12 sm:w-12 sm:h-13 rounded-xl border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-amber-400 bg-amber-950/80 shadow-[0_0_15px_rgba(245,158,11,0.6)] scale-105'
                    : isUsable && isPlayerTurn
                    ? 'border-amber-800/70 hover:border-amber-500 bg-[#1a130e]/90 hover:bg-[#251b14]'
                    : 'border-slate-800 bg-slate-900/50 opacity-40 cursor-not-allowed'
                }`}
              >
                {/* Hotkey Badge */}
                <span className={`absolute top-0.5 left-1 text-[9px] font-mono font-bold ${
                  isSelected ? 'text-amber-200' : 'text-amber-400/70 group-hover:text-amber-200'
                }`}>
                  [{hotkey}]
                </span>

                {/* Action Cost Dot */}
                <span className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${
                  isBonus ? 'bg-amber-400' : 'bg-emerald-400'
                }`} />

                {/* Icon */}
                <div className="mt-2.5">
                  {getActionIcon(action)}
                </div>

                {/* Name Label */}
                <span className="text-[9px] font-fantasy font-bold text-amber-200/90 truncate max-w-[42px] leading-tight">
                  {action.name.split(' ')[0]}
                </span>
              </button>
            );
          })}

          {/* Scribe / Add Spell Slot */}
          <button
            onClick={onOpenSpellPicker}
            title="Open Spellbook Compendium to Scribe Spells / Actions"
            className="flex flex-col items-center justify-center w-10 h-12 rounded-xl border border-dashed border-amber-800/60 hover:border-amber-500 bg-black/20 hover:bg-amber-950/30 text-amber-400/80 hover:text-amber-200 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="text-[8px] font-fantasy mt-0.5">Scribe</span>
          </button>
        </div>

        {/* RIGHT: Quick Drawers & End Turn Button */}
        <div className="relative z-10 flex items-center gap-1.5 shrink-0">
          {/* Tabletop Dice Tray Toggle */}
          <button
            onClick={onToggleDiceTray}
            title="Toggle Tabletop Dice Tray & Math Inspector [D]"
            className={`p-2 rounded-xl border text-xs font-fantasy transition flex items-center gap-1 cursor-pointer ${
              isDiceTrayOpen
                ? 'bg-amber-600 text-white border-amber-400 shadow-md shadow-amber-950/60'
                : 'bg-[#18110c] hover:bg-[#221710] text-amber-300 border-amber-900/50'
            }`}
          >
            <Dices className="w-4 h-4 text-amber-400" />
            <span className="hidden xl:inline text-[11px]">Dice [D]</span>
          </button>

          {/* Combat Log Drawer Toggle */}
          <button
            onClick={onToggleLogDrawer}
            title="Toggle Combat Chronicle & Log Drawer [L]"
            className={`p-2 rounded-xl border text-xs font-fantasy transition flex items-center gap-1 cursor-pointer ${
              isLogDrawerOpen
                ? 'bg-amber-600 text-white border-amber-400 shadow-md shadow-amber-950/60'
                : 'bg-[#18110c] hover:bg-[#221710] text-amber-300 border-amber-900/50'
            }`}
          >
            <ScrollText className="w-4 h-4 text-amber-400" />
            <span className="hidden xl:inline text-[11px]">Log [L]</span>
          </button>

          {/* Rest Modal Button */}
          <button
            onClick={onOpenRestModal}
            title="Short & Long Rest Campfire [R]"
            className="p-2 rounded-xl bg-[#18110c] hover:bg-[#221710] text-amber-300 border border-amber-900/50 transition cursor-pointer flex items-center gap-1"
          >
            <Moon className="w-4 h-4 text-sky-400" />
            <span className="hidden xl:inline text-[11px]">Rest [R]</span>
          </button>

          {/* Help Modal */}
          <button
            onClick={onOpenHelpModal}
            title="5e Rules Codex & Hotkey Reference [H]"
            className="p-2 rounded-xl bg-[#18110c] hover:bg-[#221710] text-amber-400 border border-amber-900/50 transition cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Big End Turn Button */}
          <button
            onClick={onEndTurn}
            disabled={!isPlayerTurn}
            title="End Turn [Space]"
            className="btn-fantasy-gold flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-fantasy font-black shadow-lg transition active:scale-95 disabled:opacity-50 disabled:grayscale cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>End Turn</span>
            <span className="text-[10px] font-mono opacity-80 hidden sm:inline">[Space]</span>
          </button>
        </div>
      </div>
    </div>
  );
};
