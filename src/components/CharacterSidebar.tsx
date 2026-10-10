import React from 'react';
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
  Info
} from 'lucide-react';

interface CharacterSidebarProps {
  player: Combatant;
  selectedAction: ActionItem | null;
  onSelectAction: (action: ActionItem | null) => void;
  onExecuteUtilityAction: (action: ActionItem) => void;
}

export const CharacterSidebar: React.FC<CharacterSidebarProps> = ({
  player,
  selectedAction,
  onSelectAction,
  onExecuteUtilityAction,
}) => {
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

  return (
    <div className="w-full flex flex-col gap-3 bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-xl">
      {/* Vitals Card */}
      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
              {player.name}
              {player.spatial.isHiding && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-700 flex items-center gap-1 font-sans">
                  <EyeOff className="w-2.5 h-2.5" /> Hidden
                </span>
              )}
            </h2>
            <div className="text-xs text-amber-400 font-medium">
              {player.race} · {player.archetype}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-mono text-slate-400">Initiative</span>
            <div className="text-sm font-bold text-slate-200 font-mono">
              {player.vitals.initiativeMod >= 0 ? `+${player.vitals.initiativeMod}` : player.vitals.initiativeMod}
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
          <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Armor Class</div>
            <div className="text-sm font-bold text-slate-100 flex items-center justify-center gap-1 font-mono">
              <Shield className="w-3 h-3 text-sky-400" />
              {player.vitals.baseAc}
            </div>
          </div>
          <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Speed</div>
            <div className="text-sm font-bold text-slate-100 flex items-center justify-center gap-1 font-mono">
              <Footprints className="w-3 h-3 text-amber-400" />
              {player.vitals.speedFt} ft
            </div>
          </div>
          <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">DEX / STR</div>
            <div className="text-xs font-bold text-slate-100 font-mono">
              +{Math.floor((player.attributes.dex - 10) / 2)} / +{Math.floor((player.attributes.str - 10) / 2)}
            </div>
          </div>
        </div>
      </div>

      {/* Action Economy Ledger */}
      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
        <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-2 flex items-center justify-between">
          <span>Action Economy Budget</span>
          <span className="text-[10px] text-cyan-400 font-mono">Turn Ledger</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Movement */}
          <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-1.5">
              <Footprints className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-300 font-medium">Movement</span>
            </div>
            <span className="font-mono font-bold text-cyan-300">
              {player.budget.movementRemainingFt} ft
            </span>
          </div>

          {/* Action */}
          <div className={`flex items-center justify-between p-2 rounded border transition-colors ${
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
          <div className={`flex items-center justify-between p-2 rounded border transition-colors ${
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
          <div className={`flex items-center justify-between p-2 rounded border transition-colors ${
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

      {/* Tracked Consumables */}
      {player.resources.length > 0 && (
        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
          <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">
            Consumables & Feature Pools
          </div>
          <div className="flex flex-wrap gap-1.5">
            {player.resources.map((res) => (
              <div
                key={res.id}
                title={`Refreshes on ${res.refreshOn === 'turnStart' ? 'each turn' : 'long rest'}`}
                className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-xs flex items-center gap-1.5 text-slate-300"
              >
                <span>{res.name}:</span>
                <span className={`font-mono font-bold ${res.current > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                  {res.current}/{res.max}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions (Standard) */}
      <div>
        <div className="text-xs font-bold text-slate-400 mb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1 text-emerald-400">
            <Zap className="w-3.5 h-3.5" /> Standard Actions
          </span>
          <span className="text-[10px] text-slate-500">Consumes Action</span>
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
                className={`w-full text-left p-2 rounded-lg border transition-all text-xs flex items-center justify-between ${
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
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 shrink-0">
                    {act.damageFormula ? 'Select' : 'Use'}
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
            <span className="text-[10px] text-slate-500">Consumes Bonus</span>
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
                  className={`w-full text-left p-2 rounded-lg border transition-all text-xs flex items-center justify-between ${
                    disabled
                      ? 'bg-slate-950/40 border-slate-900 text-slate-600 opacity-60 cursor-not-allowed'
                      : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="pr-2">
                    <div className="font-semibold text-amber-300">{act.name}</div>
                    <div className="text-[10px] text-slate-400">{act.description}</div>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/40 text-amber-400 border border-amber-900 shrink-0">
                    Use
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Reactions Info */}
      {player.actionDeck.reactions.length > 0 && (
        <div>
          <div className="text-xs font-bold text-slate-400 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1 text-purple-400">
              <Clock className="w-3.5 h-3.5" /> Reactions (Auto-Prompted)
            </span>
            <span className="text-[10px] text-slate-500">Held</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {player.actionDeck.reactions.map((act) => (
              <div
                key={act.id}
                title={act.description}
                className="p-2 rounded-lg border bg-slate-950 border-slate-800 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-purple-300">{act.name}</span>
                  <span className={`text-[10px] font-mono ${player.budget.reactionAvailable ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {player.budget.reactionAvailable ? 'Armed' : 'Spent'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  <strong>Trigger:</strong> {act.triggerCondition}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
