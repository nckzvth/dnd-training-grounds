import React from 'react';
import { CellType } from '../types/combat';
import { Wrench, Shield, AlertTriangle, Layers, Plus, Trash2, X, Compass, Sparkles } from 'lucide-react';
import { ART_ASSETS } from '../utils/artAssets';

export type MapEditorBrush = 
  | 'floor' 
  | 'wall' 
  | 'half_cover' 
  | 'difficult_terrain' 
  | 'spawn_dummy' 
  | 'spawn_goblin' 
  | 'spawn_ally';

interface MapEditorToolbarProps {
  isEditing: boolean;
  activeBrush: MapEditorBrush;
  onSelectBrush: (brush: MapEditorBrush) => void;
  onClearCustomMap: () => void;
  onToggleEditMode: () => void;
  onOpenExportImport: () => void;
}

export const MapEditorToolbar: React.FC<MapEditorToolbarProps> = ({
  isEditing,
  activeBrush,
  onSelectBrush,
  onClearCustomMap,
  onToggleEditMode,
  onOpenExportImport,
}) => {
  if (!isEditing) return null;

  const brushes: Array<{ id: MapEditorBrush; label: string; icon: string }> = [
    { id: 'floor', label: 'Stone Floor', icon: '⚔️' },
    { id: 'wall', label: 'Stone Rampart', icon: '🧱' },
    { id: 'half_cover', label: '+2 AC Crate', icon: '📦' },
    { id: 'difficult_terrain', label: '2x Rubble', icon: '⚠️' },
    { id: 'spawn_dummy', label: 'Target Dummy', icon: '🎯' },
    { id: 'spawn_goblin', label: 'Goblin Raider', icon: '👺' },
    { id: 'spawn_ally', label: 'Thorin Ally', icon: '🛡️' },
  ];

  return (
    <div className="relative overflow-hidden w-full bg-slate-950 border-b-2 border-amber-700/60 p-2.5 flex flex-wrap items-center justify-between gap-2.5 text-xs shadow-xl">
      {/* Ambient Dark Wood Texture */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-25 pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: `url(${ART_ASSETS.darkWood})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/80 to-slate-950/90 pointer-events-none" />

      <div className="relative z-10 flex items-center gap-2">
        <span className="flex items-center gap-1.5 font-bold font-fantasy text-amber-300 bg-amber-950/70 px-3 py-1 rounded-xl border border-amber-600/60 shadow-sm">
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          Cartographer's Sandbox Palette
        </span>
        <span className="text-amber-200/70 text-[11px] font-serif-rpg hidden lg:inline">
          Click any battlemap square to paint stone ramparts, cover crates, or summon combatants.
        </span>
      </div>

      {/* Brush buttons */}
      <div className="relative z-10 flex flex-wrap items-center gap-1.5">
        {brushes.map((b) => (
          <button
            key={b.id}
            onClick={() => onSelectBrush(b.id)}
            className={`px-3 py-1 rounded-xl font-fantasy text-xs transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
              activeBrush === b.id
                ? 'bg-gradient-to-b from-amber-400 to-amber-600 text-slate-950 font-bold border border-amber-300 shadow-md shadow-amber-500/30 scale-105'
                : 'bg-slate-900/90 border border-amber-900/50 text-amber-200 hover:text-white hover:border-amber-600'
            }`}
          >
            <span>{b.icon}</span>
            <span>{b.label}</span>
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="relative z-10 flex items-center gap-2">
        <button
          onClick={onOpenExportImport}
          className="px-3 py-1 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/70 text-indigo-200 border border-indigo-700/60 font-fantasy text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          title="Export or Import custom battlemap JSON"
        >
          <Layers className="w-3.5 h-3.5 text-indigo-400" /> Archive Map
        </button>
        <button
          onClick={onClearCustomMap}
          className="px-2.5 py-1 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-800 text-xs font-fantasy flex items-center gap-1 transition cursor-pointer"
        >
          <Trash2 className="w-3 h-3" /> Reset
        </button>
        <button
          onClick={onToggleEditMode}
          className="px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-200 border border-amber-800/60 font-fantasy font-semibold text-xs flex items-center gap-1 transition cursor-pointer"
        >
          <X className="w-3.5 h-3.5" /> Close Palette
        </button>
      </div>
    </div>
  );
};
