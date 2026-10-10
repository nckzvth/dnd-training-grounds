import React from 'react';
import { EncounterPreset, PRESET_ENCOUNTERS } from '../data/presetEncounters';
import { MapPin, Swords, Target, Shield, X, Check } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-5 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-500" />
              Practice Maps & Tactical Scenarios
            </h2>
            <p className="text-xs text-slate-400">Choose an encounter testbed to stress-test your character build</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Encounters List */}
        <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1">
          {PRESET_ENCOUNTERS.map((enc) => {
            const isActive = enc.id === activeEncounterId;

            return (
              <div
                key={enc.id}
                className={`p-3.5 rounded-lg border transition ${
                  isActive
                    ? 'bg-amber-950/20 border-amber-600 ring-1 ring-amber-600'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-100 text-sm">{enc.title}</h3>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        enc.difficulty === 'Easy (Practice)' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        enc.difficulty === 'Medium' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                        'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}>
                        {enc.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{enc.description}</p>
                    <div className="text-[11px] text-amber-400/90 mt-2 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5" />
                      <strong>Tactical Focus:</strong> {enc.tacticalFocus}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onSelectEncounter(enc);
                      onClose();
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1 transition ${
                      isActive
                        ? 'bg-amber-600 text-white shadow-md shadow-amber-900/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    {isActive ? <Check className="w-3.5 h-3.5" /> : null}
                    {isActive ? 'Active Map' : 'Load Scenario'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
