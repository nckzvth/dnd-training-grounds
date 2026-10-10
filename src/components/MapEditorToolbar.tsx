import React from 'react';
import { CellType } from '../types/combat';
import { Wrench, Shield, AlertTriangle, Layers, Plus, Trash2, X } from 'lucide-react';

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
}

export const MapEditorToolbar: React.FC<MapEditorToolbarProps> = ({
  isEditing,
  activeBrush,
  onSelectBrush,
  onClearCustomMap,
  onToggleEditMode,
}) => {
  if (!isEditing) return null;

  const brushes: Array<{ id: MapEditorBrush; label: string; icon: string }> = [
    { id: 'floor', label: 'Clear Floor', icon: '🟢' },
    { id: 'wall', label: 'Solid Wall', icon: '🧱' },
    { id: 'half_cover', label: '+2 AC Crate', icon: '📦' },
    { id: 'difficult_terrain', label: '2x Rubble', icon: '⚠️' },
    { id: 'spawn_dummy', label: '+ Target Dummy', icon: '🎯' },
    { id: 'spawn_goblin', label: '+ Goblin Enemy', icon: '👺' },
    { id: 'spawn_ally', label: '+ Companion Ally', icon: '🛡️' },
  ];

  return (
    <div className="w-full bg-slate-900 border-b border-amber-500/40 p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30">
          <Wrench className="w-3.5 h-3.5" />
          Map Sandbox Editor Active
        </span>
        <span className="text-slate-400 text-[11px] hidden md:inline">
          Click any grid cell to paint terrain or drop test combatants!
        </span>
      </div>

      {/* Brush buttons */}
      <div className="flex flex-wrap items-center gap-1.5">
        {brushes.map((b) => (
          <button
            key={b.id}
            onClick={() => onSelectBrush(b.id)}
            className={`px-2.5 py-1 rounded-lg font-medium text-xs transition flex items-center gap-1 ${
              activeBrush === b.id
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>{b.icon}</span>
            <span>{b.label}</span>
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onClearCustomMap}
          className="px-2.5 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800 text-xs flex items-center gap-1"
        >
          <Trash2 className="w-3 h-3" /> Reset
        </button>
        <button
          onClick={onToggleEditMode}
          className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center gap-1"
        >
          <X className="w-3.5 h-3.5" /> Close Editor
        </button>
      </div>
    </div>
  );
};
