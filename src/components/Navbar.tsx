import React from 'react';
import { 
  RotateCcw, 
  Play, 
  BarChart3, 
  UserCheck, 
  MapPin,
  HelpCircle,
  Wrench,
  Compass
} from 'lucide-react';
import { EncounterPreset } from '../data/presetEncounters';
import { ART_ASSETS } from '../utils/artAssets';

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
  onToggleMapEditor: () => void;
  isMapEditing: boolean;
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
  onToggleMapEditor,
  isMapEditing,
}) => {
  return (
    <header className="relative bg-slate-950/95 border-b-2 border-amber-700/70 shadow-2xl px-3 sm:px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-40 overflow-hidden">
      {/* Ambient tavern oak wood texture */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-25 pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: `url(${ART_ASSETS.darkWood})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/80 to-slate-950/90 pointer-events-none" />

      {/* Brand & Active Scenario */}
      <div className="relative z-10 flex items-center gap-3">
        {/* Royal Sealing Wax Crest */}
        <div className="relative group cursor-pointer" onClick={onSelectEncounter} title="Change Map / Encounter">
          <img 
            src={ART_ASSETS.crestEmblem} 
            alt="D&D 5e Crest" 
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full shadow-lg shadow-amber-950/60 border border-amber-400/80 object-cover transform group-hover:scale-105 transition-transform" 
          />
          <div className="absolute -inset-0.5 rounded-full bg-amber-500/20 blur group-hover:bg-amber-500/40 transition-colors pointer-events-none" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-fantasy text-base sm:text-lg font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 drop-shadow-sm flex items-center gap-2">
              D&D 5e Training Grounds
              <span className="hidden md:inline-block text-[9px] uppercase font-mono tracking-widest px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Combat Dojo
              </span>
            </h1>
          </div>
          <button
            onClick={onSelectEncounter}
            className="text-xs text-amber-200/80 hover:text-amber-300 flex items-center gap-1.5 transition-colors group text-left mt-0.5"
          >
            <Compass className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-45 transition-transform" />
            <span className="font-medium">Arena: <strong className="text-amber-100 font-semibold">{activeEncounter.title}</strong></span>
            <span className="text-[10px] text-amber-400/80 bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-800/60 font-mono">
              {activeEncounter.difficulty}
            </span>
          </button>
        </div>
      </div>

      {/* Round & Turn Status Indicator (Ornate Tabletop Chronometer) */}
      <div className="relative z-10 flex items-center gap-2 bg-slate-900/90 px-3.5 py-1.5 rounded-xl border border-amber-700/60 shadow-inner">
        <div className="text-center px-2.5 border-r border-amber-900/60">
          <div className="text-[9px] font-fantasy uppercase tracking-widest text-amber-400/80 font-bold">Round</div>
          <div className="text-lg font-black text-amber-300 font-mono leading-none drop-shadow">{currentRound}</div>
        </div>

        <div className="px-2 flex items-center gap-2.5">
          <div className={`w-3 h-3 rounded-full ${isPlayerTurn ? 'bg-emerald-400 emerald-glow animate-pulse' : 'bg-rose-500 ruby-glow'}`} />
          <div>
            <div className="text-[9px] font-fantasy uppercase tracking-widest text-slate-400 font-semibold">Initiative Phase</div>
            <div className={`text-xs font-bold font-fantasy ${isPlayerTurn ? 'text-emerald-300' : 'text-rose-400'}`}>
              {isPlayerTurn ? 'Player Phase' : 'Opponent Turn'}
            </div>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="relative z-10 flex items-center gap-2">
        {/* Rewind Turn Button */}
        <button
          onClick={onRewindTurn}
          disabled={!canRewind}
          title="Rewind to start of previous turn (Decision Forking)"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 text-amber-200 border border-amber-800/60 transition shadow-sm"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline font-fantasy text-[11px]">Rewind</span>
        </button>

        {/* End Turn (High-Fantasy Burnished Gold Button) */}
        <button
          onClick={onEndTurn}
          disabled={!isPlayerTurn}
          className="btn-fantasy-gold flex items-center gap-1.5 px-4 py-1.5 text-xs font-extrabold font-fantasy rounded-xl shadow-lg transition active:scale-95 disabled:opacity-50 disabled:grayscale cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>End Turn</span>
        </button>

        <div className="h-5 w-px bg-amber-900/60 mx-1 hidden sm:block" />

        {/* Map Cartographer Editor */}
        <button
          onClick={onToggleMapEditor}
          title="Paint custom walls, crates, or spawn practice dummies"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl border transition ${
            isMapEditing
              ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md shadow-amber-500/30'
              : 'bg-slate-900/90 hover:bg-slate-800 text-amber-200 border-amber-800/60'
          }`}
        >
          <Wrench className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline font-fantasy text-[11px]">Cartography</span>
        </button>

        {/* Character Sheet Hub */}
        <button
          onClick={onOpenCharacterModal}
          title="Manage character sheet, upload Fight Club XML, or switch preset"
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl bg-slate-900/90 hover:bg-slate-800 text-amber-200 border border-amber-800/60 transition shadow-sm"
        >
          <UserCheck className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden md:inline font-fantasy text-[11px]">Character Hub</span>
        </button>

        {/* Telemetry Modal */}
        <button
          onClick={onOpenTelemetryModal}
          title="View Action Economy Leakage & Diagnostic Telemetry"
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl bg-slate-900/90 hover:bg-slate-800 text-amber-200 border border-amber-800/60 transition shadow-sm"
        >
          <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden md:inline font-fantasy text-[11px]">Audit</span>
        </button>

        {/* Rules Codex Help */}
        <button
          onClick={onOpenHelpModal}
          title="Tactical Guide & Rules Reference"
          className="p-2 rounded-xl text-amber-400 hover:text-amber-200 hover:bg-slate-800 border border-amber-800/50 transition"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
