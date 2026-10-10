import React from 'react';
import { HelpCircle, X, Shield, Swords, Sparkles, Clock, Footprints, Target } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-5 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-amber-500" />
              Tactical Combat & Rules Guide
            </h2>
            <p className="text-xs text-slate-400">Master your 5e action economy, cover raycasting, and tactical rotations</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-3.5 py-3 pr-1 text-xs text-slate-300 leading-relaxed">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <h3 className="font-bold text-slate-100 text-sm mb-1 flex items-center gap-2">
              <Footprints className="w-4 h-4 text-cyan-400" /> Split Movement & Grid Rules
            </h3>
            <p>
              In D&D 5e, you can break up your movement. Move 10 feet, take an Action (e.g. shoot with a shortbow), and use your remaining 25 feet of movement to retreat behind a wall.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <h3 className="font-bold text-slate-100 text-sm mb-1 flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" /> Dynamic Raycast Cover Engine
            </h3>
            <p className="mb-2">
              The engine automatically casts 4 line-of-sight sightlines from your token corners to the target token corners:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li><strong className="text-amber-300">Half Cover (+2 AC):</strong> Blocked by low walls, crates, or intervening creatures.</li>
              <li><strong className="text-orange-300">Three-Quarters Cover (+5 AC):</strong> Blocked by heavy arrow slits or substantial cover.</li>
              <li><strong className="text-rose-400">Total Cover:</strong> Concealed by solid walls; cannot be targeted directly.</li>
            </ul>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <h3 className="font-bold text-slate-100 text-sm mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" /> Reactive Event Interceptor
            </h3>
            <p>
              When an enemy attacks, the simulator pauses to evaluate triggers. If an incoming roll beats your AC by 1-5, you will be prompted to cast <span className="text-purple-300 font-semibold">Shield</span> or trigger <span className="text-purple-300 font-semibold">Uncanny Dodge</span> to halve damage!
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <h3 className="font-bold text-slate-100 text-sm mb-1 flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" /> Sneak Attack & Party Anchors
            </h3>
            <p>
              Rogues deal Sneak Attack damage if they have <strong>Advantage</strong> (e.g. from Hiding or Steady Aim) OR if an <strong>Ally is within 5 feet</strong> of the target. Use the Companion Tank in Scenario 3 to test party positioning!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
