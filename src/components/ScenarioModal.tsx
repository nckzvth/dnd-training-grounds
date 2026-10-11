import React from 'react';
import { ART_ASSETS, getDarkVellumStyle } from '../utils/artAssets';
import { EncounterPreset, PRESET_ENCOUNTERS } from '../data/presetEncounters';
import { MapPin, Swords, Target, Shield, X, Check } from 'lucide-react';

import { FantasyCornerBrackets, WaxSealBadge } from './FantasyDecorations';

interface ScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeEncounterId: string;
  onSelectEncounter: (encounter: EncounterPreset) => void;
}

export const ScenarioModal: React.FC<ScenarioModalProps> = ({
  isOpen,
  onClose,
  activeEncounterId,
  onSelectEncounter,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#120c08] border-2 border-amber-900/60 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.95)] max-w-xl w-full p-5 flex flex-col relative overflow-hidden">
        <FantasyCornerBrackets className="w-6 h-6 text-amber-600/50" />
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20 mix-blend-overlay" style={{ backgroundImage: `url(${ART_ASSETS.darkWood})` }} />
        <div className="absolute top-0 right-0 opacity-15 pointer-events-none" style={{ backgroundImage: `url(${ART_ASSETS.crestEmblem})`, width: '160px', height: '160px', backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'top right', mixBlendMode: 'overlay' }} />
        <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-900/40">
          <div>
            <h2 className="text-xl font-fantasy text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 flex items-center gap-2 drop-shadow-md">
              <MapPin className="w-5 h-5 text-amber-400" />
              Practice Maps & Tactical Scenarios
            </h2>
            <p className="text-xs text-amber-200/70 font-serif-rpg text-sm">Choose an encounter testbed to stress-test your character build</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-amber-400 hover:text-amber-200 hover:bg-[#1a130e] transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Encounters List (Real Parchment Expedition Folios) */}
        <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1">
          {PRESET_ENCOUNTERS.map((enc) => {
            const isActive = enc.id === activeEncounterId;

            return (
              <div
                key={enc.id}
                className={`relative overflow-hidden p-4 rounded-xl border transition-all shadow-md ${
                  isActive
                    ? 'border-amber-500 ring-2 ring-amber-500/60 shadow-amber-950/40'
                    : 'border-amber-900/40 hover:border-amber-600/70 hover:shadow-lg'
                }`}
                style={getDarkVellumStyle(0.92)}
              >
                <FantasyCornerBrackets className="w-3.5 h-3.5 text-amber-600/50" />
                <div className="relative z-10 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-fantasy font-black text-amber-100 text-base">{enc.title}</h3>
                      <WaxSealBadge 
                        text={enc.difficulty} 
                        color={enc.difficulty.includes('Easy') ? 'green' : enc.difficulty === 'Medium' ? 'amber' : 'red'} 
                      />
                    </div>
                    <p className="font-serif-rpg text-xs text-amber-200/90 mt-1.5 leading-relaxed font-semibold">{enc.description}</p>
                    <div className="text-[11px] text-amber-200 mt-2 flex items-center gap-1.5 bg-black/40 p-1.5 rounded-lg border border-amber-900/35">
                      <Target className="w-3.5 h-3.5 text-amber-400" />
                      <strong>Tactical Focus:</strong> {enc.tacticalFocus}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onSelectEncounter(enc);
                      onClose();
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-fantasy font-black shrink-0 flex items-center gap-1.5 transition cursor-pointer shadow-md ${
                      isActive
                        ? 'bg-amber-900 text-amber-100 border border-amber-700 shadow-amber-950/60'
                        : 'btn-fantasy-gold'
                    }`}
                  >
                    {isActive ? <Check className="w-3.5 h-3.5" /> : null}
                    {isActive ? 'Active Map' : 'Deploy Map'}
                  </button>
                </div>
              </div>
            );
          })}
        </div></div>
      </div>
    </div>
  );
};
