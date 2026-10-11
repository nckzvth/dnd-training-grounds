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
      return <Sparkles className="w-4 h-4 text-amber-300 drop-shadow" />;
    }
    if (action.name.toLowerCase().includes('hide')) {
      return <EyeOff className="w-4 h-4 text-indigo-300 drop-shadow" />;
    }
    if (action.name.toLowerCase().includes('dash') || action.name.toLowerCase().includes('disengage')) {
      return <Footprints className="w-4 h-4 text-sky-300 drop-shadow" />;
    }
    if (action.name.toLowerCase().includes('bow') || action.name.toLowerCase().includes('dagger') || action.name.toLowerCase().includes('dart') || action.name.toLowerCase().includes('sling') || action.rangeFt) {
      return <Target className="w-4 h-4 text-emerald-300 drop-shadow" />;
    }
    if (action.name.toLowerCase().includes('unarmed') || action.name.toLowerCase().includes('bite')) {
      return <Zap className="w-4 h-4 text-amber-400 drop-shadow" />;
    }
    return <Swords className="w-4 h-4 text-amber-300 drop-shadow" />;
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
      return 'Stealth Roll';
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

  const topRowActions = equippedActions.slice(0, 4);
  const bottomRowActions = equippedActions.slice(4, 8);

  const renderActionTile = (action: ActionItem, globalIdx: number) => {
    const hotkey = globalIdx + 1;
    const isSelected = selectedAction?.id === action.id;
    const isBonus = action.cost === 'bonus';
    const isUsable = isBonus ? player.budget.bonusActionAvailable : player.budget.actionAvailable;

    return (
      <button
        key={action.id}
        onClick={() => handleActionClick(action)}
        disabled={!isPlayerTurn || !isUsable}
        title={`${action.name} [${hotkey}]\nCost: ${action.cost.toUpperCase()}\n${action.damageFormula ? `Damage: ${action.damageFormula}` : ''}\n${action.description}`}
        className={`relative group flex items-center justify-between gap-1.5 px-2 py-1 h-[36px] sm:h-[38px] flex-1 min-w-[120px] max-w-[160px] rounded-lg border transition-all cursor-pointer shadow select-none ${
          isSelected
            ? 'border-amber-400 bg-gradient-to-r from-amber-900/90 via-amber-950/95 to-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.7)] ring-2 ring-amber-400/60 scale-[1.02]'
            : isUsable && isPlayerTurn
            ? 'border-amber-800/80 hover:border-amber-400 bg-gradient-to-r from-[#221812]/95 to-[#140c08]/95 hover:from-[#2e2017] hover:to-[#1a110a]'
            : 'border-slate-800/80 bg-slate-950/70 opacity-40 cursor-not-allowed'
        }`}
      >
        {/* Left: Hotkey Badge & Cost Tag */}
        <div className="flex items-center gap-1 shrink-0">
          <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-black ${
            isSelected ? 'bg-amber-400 text-black' : 'bg-black/80 text-amber-200 border border-amber-700/80'
          }`}>
            [{hotkey}]
          </span>
          <span className={`px-1 py-0.2 rounded text-[9px] font-mono font-black uppercase ${
            isBonus 
              ? 'bg-amber-950 text-amber-300 border border-amber-600/80' 
              : 'bg-emerald-950 text-emerald-300 border border-emerald-600/80'
          }`}>
            {isBonus ? 'BONUS' : 'ACT'}
          </span>
        </div>

        {/* Center: Icon + Action Title */}
        <div className="flex items-center gap-1.5 min-w-0 flex-1 justify-start overflow-hidden">
          <div className="shrink-0 group-hover:scale-110 transition-transform">
            {getActionIcon(action)}
          </div>
          <span className="font-fantasy font-black text-xs text-amber-100 group-hover:text-amber-300 truncate uppercase tracking-wide">
            {formatActionName(action)}
          </span>
        </div>

        {/* Right: Damage Formula / Subtitle */}
        <span className="shrink-0 text-[10px] sm:text-[11px] font-mono font-bold text-amber-300 group-hover:text-amber-200 pl-1 border-l border-amber-900/60">
          {getActionSubtitle(action)}
        </span>
      </button>
    );
  };

  return (
    <div className="w-full max-w-[1950px] mx-auto px-1 select-none overflow-hidden">
      {/* Floating Tactical Dock (Zero Horizontal Scrolling, 100% Fit Baldur's Gate 3 Style Hotbar) */}
      <div 
        className="relative rounded-2xl border-2 border-amber-900/80 p-2 shadow-[0_15px_45px_rgba(0,0,0,0.95)] flex items-center justify-between gap-3 overflow-hidden"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 10%, rgba(26, 18, 12, 0.96) 0%, rgba(15, 10, 6, 0.98) 100%), url(${ART_ASSETS.darkWood})`,
          backgroundSize: 'cover',
          backgroundColor: '#120c08',
        }}
      >
        <FantasyCornerBrackets className="w-4 h-4 text-amber-600/40" />

        {/* LEFT: Player Hero Vitals Banner + Action Economy (No Scroll) */}
        <div className="relative z-10 flex items-center gap-2.5 shrink-0">
          <div 
            onClick={onToggleCharDrawer}
            title="Click or press [C] to open full Character Sheet"
            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl border-2 border-amber-900/60 hover:border-amber-500/80 transition-all bg-black/60 hover:bg-black/80 cursor-pointer group shadow shrink-0"
          >
            {/* Hero Token Portrait */}
            <div className="relative shrink-0">
              <img 
                src={getTokenImage(player)} 
                alt={player.name}
                className="w-12 h-12 rounded-full border-2 border-amber-500/90 object-cover shadow-xl ring-2 ring-black/80 group-hover:scale-105 transition-transform"
              />
              <span className="absolute -bottom-1 -right-1 text-[9px] font-mono font-black bg-amber-950 text-amber-200 border border-amber-600/80 rounded px-1 shadow">
                [C]
              </span>
            </div>

            <div className="flex flex-col min-w-[120px] sm:min-w-[140px]">
              {/* Name + Subclass */}
              <div className="flex items-baseline justify-between gap-1.5">
                <span className="font-fantasy font-black text-amber-100 text-sm tracking-wide group-hover:text-amber-300 transition-colors">
                  {player.name}
                </span>
                <span className="text-[11px] font-serif-rpg text-amber-300/80 truncate">
                  {player.archetype || 'Hero'}
                </span>
              </div>

              {/* HP Bar */}
              <div className="w-full h-2 rounded-full bg-slate-950 border border-amber-950 overflow-hidden mt-1 shadow-inner relative">
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
              <div className="flex items-center justify-between text-xs text-amber-200 font-mono font-bold mt-0.5">
                <span>
                  {player.vitals.currentHp}/{player.vitals.maxHp} HP
                </span>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-0.5 text-amber-300" title="Armor Class">
                    <Shield className="w-3 h-3 text-amber-400" /> AC {player.vitals.baseAc}
                  </span>
                  <span className="flex items-center gap-0.5 text-sky-300" title="Remaining Movement Speed">
                    <Footprints className="w-3 h-3 text-sky-400" /> {player.budget.movementRemainingFt} ft
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Economy Pips Strip */}
          <div className="hidden xl:flex flex-col gap-1 px-2 py-1 rounded-xl bg-black/50 border border-amber-900/50 text-[10px] font-mono shrink-0 shadow-inner">
            <div className="flex items-center gap-1.5" title={player.budget.actionAvailable ? 'Standard Action Ready' : 'Standard Action Spent'}>
              <span className={`w-2 h-2 rounded-full ${player.budget.actionAvailable ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]' : 'bg-slate-800 border border-slate-700'}`} />
              <span className={player.budget.actionAvailable ? 'text-emerald-300 font-bold' : 'text-slate-500 line-through'}>Act</span>
            </div>
            <div className="flex items-center gap-1.5" title={player.budget.bonusActionAvailable ? 'Bonus Action Ready' : 'Bonus Action Spent'}>
              <span className={`w-2 h-2 rounded-full ${player.budget.bonusActionAvailable ? 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.9)]' : 'bg-slate-800 border border-slate-700'}`} />
              <span className={player.budget.bonusActionAvailable ? 'text-amber-300 font-bold' : 'text-slate-500 line-through'}>Bonus</span>
            </div>
            <div className="flex items-center gap-1.5" title={player.budget.reactionAvailable ? 'Reaction Window Held' : 'Reaction Window Spent'}>
              <span className={`w-2 h-2 rounded-full ${player.budget.reactionAvailable ? 'bg-purple-400 shadow-[0_0_6px_rgba(192,132,252,0.9)]' : 'bg-slate-800 border border-slate-700'}`} />
              <span className={player.budget.reactionAvailable ? 'text-purple-300 font-bold' : 'text-slate-500 line-through'}>React</span>
            </div>
          </div>
        </div>

        {/* CENTER: 2-Row Tactical Action Grid + Scribe Slot (Zero Horizontal Scrolling!) */}
        <div className="relative z-10 flex items-center gap-2 flex-1 justify-center min-w-0 overflow-hidden">
          <div className="flex flex-col gap-1.5 flex-1 min-w-0 max-w-[680px]">
            {/* Top Row: Hotkeys [1] to [4] */}
            <div className="flex items-center gap-1.5 w-full">
              {topRowActions.map((action, idx) => renderActionTile(action, idx))}
            </div>

            {/* Bottom Row: Hotkeys [5] to [8] */}
            <div className="flex items-center gap-1.5 w-full">
              {bottomRowActions.map((action, idx) => renderActionTile(action, idx + 4))}
            </div>
          </div>

          {/* Scribe / Add Spell Slot */}
          <button
            onClick={onOpenSpellPicker}
            title="Open Arcane Spellbook & Compendium to Scribe Spells or Actions"
            className="relative group flex flex-col items-center justify-center w-14 h-[76px] sm:h-[80px] rounded-xl border-2 border-dashed border-amber-800/70 hover:border-amber-400 bg-black/40 hover:bg-amber-950/40 text-amber-300 hover:text-amber-100 transition-all cursor-pointer shadow shrink-0"
          >
            <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-fantasy font-black mt-1">Scribe</span>
            <span className="text-[9px] font-mono text-amber-400/70 font-semibold">Spells</span>
          </button>
        </div>

        {/* RIGHT: Compact 2x2 Drawers + Big End Turn Button (Zero Scroll) */}
        <div className="relative z-10 flex items-center gap-2 shrink-0">
          {/* 2x2 Utility Buttons Grid */}
          <div className="grid grid-cols-2 gap-1.5 w-[210px] sm:w-[230px]">
            {/* Dice Tray */}
            <button
              onClick={onToggleDiceTray}
              title="Toggle Tabletop Dice Tray & Math Inspector [D]"
              className={`h-[36px] sm:h-[38px] px-2 rounded-lg border font-fantasy transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow ${
                isDiceTrayOpen
                  ? 'bg-amber-600 text-white border-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.7)]'
                  : 'bg-[#18110c] hover:bg-[#251b14] text-amber-200 border-amber-900/70 hover:border-amber-500'
              }`}
            >
              <Dices className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="text-xs font-black truncate">Dice Tray</span>
              <span className="text-[10px] font-mono text-amber-400 font-bold shrink-0">[D]</span>
            </button>

            {/* Combat Log */}
            <button
              onClick={onToggleLogDrawer}
              title="Toggle Combat Chronicle & Log Drawer [L]"
              className={`h-[36px] sm:h-[38px] px-2 rounded-lg border font-fantasy transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow ${
                isLogDrawerOpen
                  ? 'bg-amber-600 text-white border-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.7)]'
                  : 'bg-[#18110c] hover:bg-[#251b14] text-amber-200 border-amber-900/70 hover:border-amber-500'
              }`}
            >
              <ScrollText className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="text-xs font-black truncate">Chronicle</span>
              <span className="text-[10px] font-mono text-amber-400 font-bold shrink-0">[L]</span>
            </button>

            {/* Rest Campfire */}
            <button
              onClick={onOpenRestModal}
              title="Short & Long Rest Campfire [R]"
              className="h-[36px] sm:h-[38px] px-2 rounded-lg bg-[#18110c] hover:bg-[#251b14] text-amber-200 border border-amber-900/70 hover:border-amber-500 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow"
            >
              <Moon className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="text-xs font-black font-fantasy truncate">Campfire</span>
              <span className="text-[10px] font-mono text-amber-400 font-bold shrink-0">[R]</span>
            </button>

            {/* Rules Codex */}
            <button
              onClick={onOpenHelpModal}
              title="5e Rules Codex & Hotkey Reference [H]"
              className="h-[36px] sm:h-[38px] px-2 rounded-lg bg-[#18110c] hover:bg-[#251b14] text-amber-300 border border-amber-900/70 hover:border-amber-500 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-xs font-fantasy font-black truncate">Codex</span>
              <span className="text-[10px] font-mono text-amber-400 font-bold shrink-0">[?]</span>
            </button>
          </div>

          {/* Big End Turn Button */}
          <button
            onClick={onEndTurn}
            disabled={!isPlayerTurn}
            title="End Turn [Space]"
            className="btn-fantasy-gold h-[76px] sm:h-[80px] px-5 sm:px-6 rounded-xl flex flex-col items-center justify-center gap-1 shadow-2xl transition-all active:scale-95 disabled:opacity-50 disabled:grayscale cursor-pointer shrink-0"
          >
            <Play className="w-4 h-4 fill-current" />
            <span className="font-fantasy font-black text-xs sm:text-sm tracking-wider uppercase">End Turn</span>
            <span className="text-[10px] font-mono opacity-85 font-black">[Space]</span>
          </button>
        </div>
      </div>
    </div>
  );
};
