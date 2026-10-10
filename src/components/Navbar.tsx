import React from 'react';
import { 
  ShieldAlert, 
  RotateCcw, 
  Play, 
  BarChart3, 
  UserCheck, 
  Swords, 
  MapPin,
  HelpCircle
} from 'lucide-react';
import { EncounterPreset } from '../data/presetEncounters';

interface NavbarProps {
  currentRound: number;
  activeEncounter: EncounterPreset;
  onSelectEncounter: () => void;
  onOpenCharacterModal: () => void;
  onOpenTelemetryModal: () => void;
  onOpenHelpModal: () => void;
  onEndTurn: () => void;
  onRewindTurn: () => void;
  canRewind: boolean;
  isPlayerTurn: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRound,
  activeEncounter,
  onSelectEncounter,
  onOpenCharacterModal,
  onOpenTelemetryModal,
  onOpenHelpModal,
  onEndTurn,
  onRewindTurn,
  canRewind,
  isPlayerTurn,
}) => {
  return (
    <header className="bg-slate-900/90 backdrop-blur border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-40">
      {/* Brand & Active Scenario */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white font-bold">
          <Swords className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold tracking-tight text-slate-100 flex items-center gap-1.5">
              D&D 5e Training Grounds
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Combat Dojo
              </span>
            </h1>
          </div>
          <button
            onClick={onSelectEncounter}
            className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors group text-left"
          >
            <MapPin className="w-3 h-3 text-amber-500 group-hover:scale-110 transition-transform" />
            <span>Map: <strong className="text-slate-300">{activeEncounter.title}</strong></span>
            <span className="text-[11px] text-slate-500">({activeEncounter.difficulty})</span>
          </button>
        </div>
      </div>

      {/* Round & Turn Status Indicator */}
      <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
        <div className="text-center px-2 border-r border-slate-800">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Round</div>
          <div className="text-lg font-black text-amber-400 font-mono leading-none">{currentRound}</div>
        </div>

        <div className="px-2 flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isPlayerTurn ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Turn</div>
            <div className={`text-xs font-bold ${isPlayerTurn ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isPlayerTurn ? 'Player Phase' : 'Opponent Phase'}
            </div>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onRewindTurn}
          disabled={!canRewind}
          title="Rewind to start of previous turn (Decision Forking)"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 border border-slate-700 transition"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Rewind</span>
        </button>

        <button
          onClick={onEndTurn}
          disabled={!isPlayerTurn}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-900/30 transition active:scale-95 disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>End Turn</span>
        </button>

        <div className="h-5 w-px bg-slate-800 mx-1 hidden sm:block" />

        <button
          onClick={onOpenCharacterModal}
          title="Manage character sheet, upload PDF, or switch preset"
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
        >
          <UserCheck className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden md:inline">Character Hub</span>
        </button>

        <button
          onClick={onOpenTelemetryModal}
          title="View Action Economy Leakage & Diagnostic Telemetry"
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
        >
          <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden md:inline">Telemetry</span>
        </button>

        <button
          onClick={onOpenHelpModal}
          title="Tactical Guide & Rules Reference"
          className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
