import React from 'react';
import { ART_ASSETS, getDarkVellumStyle } from '../utils/artAssets';
import { HelpCircle, X, Shield, Swords, Sparkles, Clock, Footprints, Target } from 'lucide-react';
import { FantasyCornerBrackets, ScrollRod } from './FantasyDecorations';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#120c08] border-2 border-amber-900/60 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.95)] max-w-xl w-full p-5 flex flex-col relative overflow-hidden max-h-[90vh]">
        <FantasyCornerBrackets className="w-6 h-6 text-amber-600/50" />
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20 mix-blend-overlay" style={{ backgroundImage: `url(${ART_ASSETS.darkWood})` }} />
        <div className="absolute top-0 right-0 opacity-15 pointer-events-none" style={{ backgroundImage: `url(${ART_ASSETS.crestEmblem})`, width: '160px', height: '160px', backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'top right', mixBlendMode: 'overlay' }} />
        <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-900/40">
          <div>
            <h2 className="text-xl font-fantasy text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 flex items-center gap-2 drop-shadow-md">
              <HelpCircle className="w-5 h-5 text-amber-400" />
              Tactical Combat & Rules Codex
            </h2>
            <p className="text-xs text-amber-200/70 font-serif-rpg text-sm">Master your 5e action economy, cover raycasting, and tactical rotations</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-amber-400 hover:text-amber-200 hover:bg-[#1a130e] transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content (Dark Vellum Codex Entries) */}
        <div className="flex-1 overflow-y-auto space-y-3.5 py-3 pr-1 text-xs text-amber-100 leading-relaxed">
          <div 
            className="p-4 rounded-xl border border-amber-900/40 shadow-md relative overflow-hidden"
            style={getDarkVellumStyle(0.92)}
          >
            <FantasyCornerBrackets className="w-3.5 h-3.5 text-amber-600/50" />
            <h3 className="font-fantasy font-black text-amber-100 text-sm mb-1 flex items-center gap-2">
              <Footprints className="w-4 h-4 text-sky-400" /> 1. Split Movement & Grid Rules
            </h3>
            <p className="font-serif-rpg text-xs font-semibold text-amber-200/90 leading-relaxed">
              In D&D 5e, you can break up your movement. Move 10 feet, take an Action (e.g. shoot with a shortbow), and use your remaining 25 feet of movement to retreat behind a wall.
            </p>
          </div>

          <div 
            className="p-4 rounded-xl border border-amber-900/40 shadow-md relative overflow-hidden"
            style={getDarkVellumStyle(0.92)}
          >
            <FantasyCornerBrackets className="w-3.5 h-3.5 text-amber-600/50" />
            <h3 className="font-fantasy font-black text-amber-100 text-sm mb-1 flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" /> 2. Dynamic Raycast Cover Engine
            </h3>
            <p className="font-serif-rpg text-xs font-semibold text-amber-200/90 mb-2 leading-relaxed">
              The engine automatically casts 4 line-of-sight sightlines from your token corners to the target token corners:
            </p>
            <ul className="list-disc list-inside space-y-1 font-serif-rpg text-xs font-semibold text-amber-200/80">
              <li><strong className="text-amber-100 font-bold">Half Cover (+2 AC):</strong> Blocked by low walls, crates, or intervening creatures.</li>
              <li><strong className="text-amber-100 font-bold">Three-Quarters Cover (+5 AC):</strong> Blocked by heavy arrow slits or substantial cover.</li>
              <li><strong className="text-rose-300 font-bold">Total Cover:</strong> Concealed by solid walls; cannot be targeted directly.</li>
            </ul>
          </div>

          <div 
            className="p-4 rounded-xl border border-amber-900/40 shadow-md relative overflow-hidden"
            style={getDarkVellumStyle(0.92)}
          >
            <FantasyCornerBrackets className="w-3.5 h-3.5 text-amber-600/50" />
            <h3 className="font-fantasy font-black text-amber-100 text-sm mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" /> 3. Reactive Event Interceptor
            </h3>
            <p className="font-serif-rpg text-xs font-semibold text-amber-200/90 leading-relaxed">
              When an enemy attacks, the simulator pauses to evaluate triggers. If an incoming roll beats your AC by 1-5, you will be prompted to cast <span className="text-purple-300 font-bold">Shield</span> or trigger <span className="text-purple-300 font-bold">Uncanny Dodge</span> to halve damage!
            </p>
          </div>

          <div 
            className="p-4 rounded-xl border border-amber-900/40 shadow-md relative overflow-hidden"
            style={getDarkVellumStyle(0.92)}
          >
            <FantasyCornerBrackets className="w-3.5 h-3.5 text-amber-600/50" />
            <h3 className="font-fantasy font-black text-amber-100 text-sm mb-1 flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" /> 4. Sneak Attack & Party Anchors
            </h3>
            <p className="font-serif-rpg text-xs font-semibold text-amber-200/90 leading-relaxed">
              Rogues deal Sneak Attack damage if they have <strong>Advantage</strong> (e.g. from Hiding or Steady Aim) OR if an <strong>Ally is within 5 feet</strong> of the target. Use the Companion Tank in Scenario 3 to test party positioning!
            </p>
          </div>
        </div></div>
      </div>
    </div>
  );
};
