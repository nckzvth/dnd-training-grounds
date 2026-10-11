import React from 'react';
import { Combatant, ActionItem } from '../types/combat';
import { ART_ASSETS, getTokenImage } from '../utils/artAssets';
import { 
  Shield, 
  Footprints, 
  Swords, 
  Sparkles, 
  EyeOff, 
  Target, 
  Play, 
  Dices, 
  ScrollText, 
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
      return <Sparkles className="w-5 h-5 text-amber-300 drop-shadow" />;
    }
    if (action.name.toLowerCase().includes('hide')) {
      return <EyeOff className="w-5 h-5 text-indigo-300 drop-shadow" />;
    }
    if (action.name.toLowerCase().includes('dash') || action.name.toLowerCase().includes('disengage')) {
      return <Footprints className="w-5 h-5 text-sky-300 drop-shadow" />;
    }
    if (action.name.toLowerCase().includes('bow') || action.name.toLowerCase().includes('dagger') || action.name.toLowerCase().includes('dart') || action.rangeFt) {
      return <Target className="w-5 h-5 text-emerald-300 drop-shadow" />;
    }
    if (action.name.toLowerCase().includes('unarmed') || action.name.toLowerCase().includes('bite')) {
      return <Zap className="w-5 h-5 text-amber-400 drop-shadow" />;
    }
    return <Swords className="w-5 h-5 text-amber-300 drop-shadow" />;
  };

  // Human-readable tactical subtitle / damage formula
  const getActionSubtitle = (action: ActionItem) => {
    if (action.damageFormula) {
      const typeShort = action.damageType ? ` ${action.damageType.slice(0, 4)}` : '';
      return `${action.damageFormula}${typeShort}`;
    }
    if (action.saveType && action.saveDC) {
      return `DC ${action.saveDC} ${action.saveType.toUpperCase()}`;
    }
    if (action.name.toLowerCase().includes('dash')) {
      return `+${player.vitals.speedFt} ft Move`;
    }
    if (action.name.toLowerCase().includes('disengage')) {
      return 'No Provoke';
    }
    if (action.name.toLowerCase().includes('hide')) {
      return 'Stealth Check';
    }
    if (action.name.toLowerCase().includes('dodge')) {
      return 'Disadvantage';
    }
    if (action.rangeFt) {
      return `${action.rangeFt} ft Range`;
    }
    return action.cost === 'bonus' ? 'Bonus Action' : 'Action';
  };

  // Clean, unclipped action titles
  const formatActionName = (action: ActionItem) => {
    if (action.name.startsWith('Cunning Action: ')) {
      return action.name.replace('Cunning Action: ', 'Cunning ');
    }
    if (action.name.startsWith('Cunning Action ')) {
      return action.name.replace('Cunning Action ', 'Cunning ');
    }
    if (action.name.startsWith('Base ')) {
      return action.name.replace('Base ', '');
    }
    return action.name;
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
  ].slice(0, 8);

  return (
    <div className="w-full max-w-[1750px] 2xl:max-w-[1950px] mx-auto px-2 select-none">
      {/* Floating Tactical Dock (Spacious Baldur's Gate 3 Style Hotbar) */}
      <div 
        className="relative rounded-2xl border-2 border-amber-900/70 p-2.5 sm:p-3 shadow-[0_15px_45px_rgba(0,0,0,0.95)] flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 overflow-x-auto"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 10%, rgba(26, 18, 12, 0.96) 0%, rgba(15, 10, 6, 0.98) 100%), url(${ART_ASSETS.darkWood})`,
          backgroundSize: 'cover',
          backgroundColor: '#120c08',
        }}
      >
        <FantasyCornerBrackets className="w-4 h-4 text-amber-600/40" />

        {/* LEFT: Player Hero Vitals Banner */}
        <div 
          onClick={onToggleCharDrawer}
          title="Click or press [C] to open full Character Sheet"
          className="relative z-10 flex items-center gap-3 px-3 py-2 rounded-xl border-2 border-amber-900/60 hover:border-amber-500/80 transition-all bg-black/50 hover:bg-black/70 cursor-pointer group shadow-lg shrink-0"
        >
          {/* Hero Token Portrait */}
          <div className="relative shrink-0">
            <img 
              src={getTokenImage(player)} 
              alt={player.name}
              className="w-13 h-13 sm:w-14 sm:h-14 rounded-full border-2 border-amber-500/90 object-cover shadow-xl ring-2 ring-black/80 group-hover:scale-105 transition-transform"
            />
            <span className="absolute -bottom-1 -right-1 text-[9px] font-mono font-bold bg-amber-950 text-amber-200 border border-amber-600/80 rounded px-1.5 py-0.2 shadow">
              [C]
            </span>
          </div>

          <div className="flex flex-col min-w-[130px] sm:min-w-[155px]">
            {/* Name + Subclass */}
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-fantasy font-black text-amber-100 text-sm sm:text-base tracking-wide group-hover:text-amber-300 transition-colors">
                {player.name}
              </span>
              <span className="text-[11px] font-serif-rpg text-amber-300/70 truncate hidden sm:inline">
                {player.archetype || 'Hero'}
              </span>
            </div>

            {/* HP Bar */}
            <div className="w-full h-3 rounded-full bg-slate-950 border border-amber-950/80 overflow-hidden mt-1 shadow-inner relative">
              <div 
                className={`h-full transition-all duration-300 ${
                  hpPercent > 50 ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400' :
                  hpPercent > 20 ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400' :
                  'bg-gradient-to-r from-rose-700 via-rose-600 to-rose-500'
                }`}
                style={{ width: `${hpPercent}%` }}
              />
            </div>

            {/* Vitals Numbers: HP, AC, Speed */}
            <div className="flex items-center justify-between text-[11px] text-amber-200 font-mono mt-1">
              <span className="font-bold">
                {player.vitals.currentHp}/{player.vitals.maxHp} HP
              </span>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-0.5 text-amber-300 font-bold" title="Armor Class">
                  <Shield className="w-3 h-3 text-amber-400" /> AC {player.vitals.baseAc}
                </span>
                <span className="flex items-center gap-0.5 text-sky-300 font-bold" title="Remaining Movement Speed">
                  <Footprints className="w-3 h-3 text-sky-400" /> {player.budget.movementRemainingFt} ft
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER LEFT: Action Economy Status */}
        <div className="relative z-10 hidden xl:flex flex-col gap-1.5 px-3 py-2 rounded-xl bg-black/40 border border-amber-900/50 text-[11px] font-mono shrink-0 shadow-inner">
          <div className="flex items-center gap-2" title={player.budget.actionAvailable ? 'Standard Action Ready' : 'Standard Action Spent'}>
            <span className={`w-2.5 h-2.5 rounded-full transition-all ${
              player.budget.actionAvailable 
                ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] ring-1 ring-emerald-300' 
                : 'bg-slate-800 border border-slate-700'
            }`} />
            <span className={player.budget.actionAvailable ? 'text-emerald-300 font-bold' : 'text-slate-500 line-through'}>
              Action
            </span>
          </div>

          <div className="flex items-center gap-2" title={player.budget.bonusActionAvailable ? 'Bonus Action Ready' : 'Bonus Action Spent'}>
            <span className={`w-2.5 h-2.5 rounded-full transition-all ${
              player.budget.bonusActionAvailable 
                ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)] ring-1 ring-amber-300' 
                : 'bg-slate-800 border border-slate-700'
            }`} />
            <span className={player.budget.bonusActionAvailable ? 'text-amber-300 font-bold' : 'text-slate-500 line-through'}>
              Bonus
            </span>
          </div>

          <div className="flex items-center gap-2" title={player.budget.reactionAvailable ? 'Reaction Window Held' : 'Reaction Window Spent'}>
            <span className={`w-2.5 h-2.5 rounded-full transition-all ${
              player.budget.reactionAvailable 
                ? 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.9)] ring-1 ring-purple-300' 
                : 'bg-slate-800 border border-slate-700'
            }`} />
            <span className={player.budget.reactionAvailable ? 'text-purple-300 font-bold' : 'text-slate-500 line-through'}>
              Reaction
            </span>
          </div>
        </div>

        {/* CENTER: Generous Hotbar Action Slots [1] to [8] */}
        <div className="relative z-10 flex items-center gap-2 flex-1 justify-center overflow-x-auto py-1">
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
                className={`relative group flex flex-col items-center justify-between min-w-[102px] sm:min-w-[114px] md:min-w-[122px] h-[74px] sm:h-[80px] px-2 py-1.5 rounded-xl border-2 transition-all cursor-pointer shadow-md shrink-0 ${
                  isSelected
                    ? 'border-amber-400 bg-gradient-to-b from-amber-900/90 via-amber-950/95 to-slate-950 shadow-[0_0_18px_rgba(245,158,11,0.65)] scale-[1.03] ring-2 ring-amber-400/50'
                    : isUsable && isPlayerTurn
                    ? 'border-amber-800/70 hover:border-amber-400 bg-gradient-to-b from-[#221812]/95 to-[#120b07]/95 hover:from-[#2e2017] hover:to-[#1a110a] hover:shadow-[0_4px_14px_rgba(0,0,0,0.7)]'
                    : 'border-slate-800/80 bg-slate-950/70 opacity-40 cursor-not-allowed'
                }`}
              >
                {/* Top Row: Hotkey Badge & Action Cost Tag */}
                <div className="w-full flex items-center justify-between leading-none">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-black shadow-inner ${
                    isSelected ? 'bg-amber-400 text-black' : 'bg-black/60 text-amber-300 border border-amber-800/60'
                  }`}>
                    [{hotkey}]
                  </span>

                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase ${
                    isBonus 
                      ? 'bg-amber-950/90 text-amber-300 border border-amber-600/70' 
                      : 'bg-emerald-950/90 text-emerald-300 border border-emerald-600/70'
                  }`}>
                    {isBonus ? 'BONUS' : 'ACT'}
                  </span>
                </div>

                {/* Center Icon */}
                <div className="my-auto">
                  {getActionIcon(action)}
                </div>

                {/* Bottom Row: Full Action Title & Damage Formula */}
                <div className="w-full flex flex-col items-center justify-center leading-none mt-auto">
                  <span className="font-fantasy font-bold text-xs sm:text-[13px] text-amber-100 group-hover:text-amber-50 truncate max-w-full text-center leading-tight">
                    {formatActionName(action)}
                  </span>
                  <span className="text-[10px] font-mono text-amber-300/75 group-hover:text-amber-200 truncate max-w-full text-center mt-0.5">
                    {getActionSubtitle(action)}
                  </span>
                </div>
              </button>
            );
          })}

          {/* Scribe / Add Spell Slot */}
          <button
            onClick={onOpenSpellPicker}
            title="Open Arcane Spellbook & Compendium to Scribe Spells or Actions"
            className="relative group flex flex-col items-center justify-center min-w-[72px] h-[74px] sm:h-[80px] px-2 py-1.5 rounded-xl border-2 border-dashed border-amber-800/60 hover:border-amber-400 bg-black/30 hover:bg-amber-950/30 text-amber-300/80 hover:text-amber-200 transition-all cursor-pointer shadow-md shrink-0"
          >
            <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-fantasy font-bold mt-1">Scribe</span>
            <span className="text-[9px] font-mono text-amber-400/60">Spells</span>
          </button>
        </div>

        {/* RIGHT: Quick Drawers & Turn Finisher */}
        <div className="relative z-10 flex items-center gap-2 shrink-0">
          {/* Tabletop Dice Tray Toggle */}
          <button
            onClick={onToggleDiceTray}
            title="Toggle Tabletop Dice Tray & Math Inspector [D]"
            className={`h-[74px] sm:h-[80px] px-3 sm:px-3.5 rounded-xl border-2 font-fantasy transition-all flex flex-col items-center justify-center gap-1 cursor-pointer shadow-md ${
              isDiceTrayOpen
                ? 'bg-amber-600 text-white border-amber-300 shadow-[0_0_14px_rgba(245,158,11,0.6)]'
                : 'bg-[#18110c] hover:bg-[#251b14] text-amber-200 border-amber-900/60 hover:border-amber-500'
            }`}
          >
            <Dices className="w-5 h-5 text-amber-300" />
            <span className="text-xs font-bold">Dice Tray</span>
            <span className="text-[10px] font-mono text-amber-400/80">[D]</span>
          </button>

          {/* Combat Log Drawer Toggle */}
          <button
            onClick={onToggleLogDrawer}
            title="Toggle Combat Chronicle & Log Drawer [L]"
            className={`h-[74px] sm:h-[80px] px-3 sm:px-3.5 rounded-xl border-2 font-fantasy transition-all flex flex-col items-center justify-center gap-1 cursor-pointer shadow-md ${
              isLogDrawerOpen
                ? 'bg-amber-600 text-white border-amber-300 shadow-[0_0_14px_rgba(245,158,11,0.6)]'
                : 'bg-[#18110c] hover:bg-[#251b14] text-amber-200 border-amber-900/60 hover:border-amber-500'
            }`}
          >
            <ScrollText className="w-5 h-5 text-amber-300" />
            <span className="text-xs font-bold">Chronicle</span>
            <span className="text-[10px] font-mono text-amber-400/80">[L]</span>
          </button>

          {/* Rest Modal Button */}
          <button
            onClick={onOpenRestModal}
            title="Short & Long Rest Campfire [R]"
            className="h-[74px] sm:h-[80px] px-3 sm:px-3.5 rounded-xl bg-[#18110c] hover:bg-[#251b14] text-amber-200 border-2 border-amber-900/60 hover:border-amber-500 transition-all cursor-pointer flex flex-col items-center justify-center gap-1 shadow-md"
          >
            <Moon className="w-5 h-5 text-sky-400" />
            <span className="text-xs font-bold font-fantasy">Campfire</span>
            <span className="text-[10px] font-mono text-amber-400/80">[R]</span>
          </button>

          {/* Rules Codex Help Button */}
          <button
            onClick={onOpenHelpModal}
            title="5e Rules Codex & Hotkey Reference [H]"
            className="h-[74px] sm:h-[80px] px-2.5 rounded-xl bg-[#18110c] hover:bg-[#251b14] text-amber-300 border-2 border-amber-900/60 hover:border-amber-500 transition-all cursor-pointer flex flex-col items-center justify-center gap-1 shadow-md"
          >
            <HelpCircle className="w-5 h-5 text-amber-400" />
            <span className="text-[11px] font-fantasy font-bold">Rules</span>
            <span className="text-[10px] font-mono text-amber-400/80">[?]</span>
          </button>

          {/* Big End Turn Button */}
          <button
            onClick={onEndTurn}
            disabled={!isPlayerTurn}
            title="End Turn [Space]"
            className="btn-fantasy-gold h-[74px] sm:h-[80px] px-5 sm:px-7 rounded-xl flex flex-col items-center justify-center gap-1 shadow-2xl transition-all active:scale-95 disabled:opacity-50 disabled:grayscale cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span className="font-fantasy font-black text-xs sm:text-sm tracking-wider uppercase">End Turn</span>
            <span className="text-[10px] font-mono opacity-85 font-bold">[Space]</span>
          </button>
        </div>
      </div>
    </div>
  );
};
