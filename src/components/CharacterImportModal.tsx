import React, { useState } from 'react';
import { Combatant } from '../types/combat';
import { PRESET_CHARACTERS } from '../data/presetEncounters';
import { parseCharacterPdf } from '../utils/pdfParser';
import { UploadCloud, FileText, UserPlus, Check, X, Shield, Heart, Footprints } from 'lucide-react';

interface CharacterImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadCharacter: (char: Combatant) => void;
  activeCharacterId: string;
}

export const CharacterImportModal: React.FC<CharacterImportModalProps> = ({
  isOpen,
  onClose,
  onLoadCharacter,
  activeCharacterId,
}) => {
  const [tab, setTab] = useState<'presets' | 'pdf' | 'manual'>('presets');
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // Manual creator form state
  const [customName, setCustomName] = useState('Homebrew Champion');
  const [customHp, setCustomHp] = useState(25);
  const [customAc, setCustomAc] = useState(16);
  const [customSpeed, setCustomSpeed] = useState(30);
  const [customWepName, setCustomWepName] = useState('Longsword');
  const [customToHit, setCustomToHit] = useState(5);
  const [customDamage, setCustomDamage] = useState('1d8+3');

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setParseError(null);
    try {
      const buffer = await file.arrayBuffer();
      const parsed = await parseCharacterPdf(buffer);
      onLoadCharacter(parsed);
      onClose();
    } catch (err: any) {
      setParseError(`Failed to parse PDF: ${err?.message || 'Unsupported PDF format'}`);
    } finally {
      setIsParsing(false);
    }
  };

  const handleCreateManual = () => {
    const newChar: Combatant = {
      id: `pc-custom-${Date.now()}`,
      name: customName,
      archetype: 'Custom Hero',
      race: 'Adventurer',
      isPlayer: true,
      isFriendly: true,
      aiType: 'none',
      vitals: {
        maxHp: customHp,
        currentHp: customHp,
        tempHp: 0,
        baseAc: customAc,
        speedFt: customSpeed,
        initiativeMod: 2,
      },
      attributes: { str: 16, dex: 14, con: 14, int: 10, wis: 10, cha: 10 },
      saves: ['str', 'con'],
      skills: { athletics: 5 },
      budget: {
        movementTotalFt: customSpeed,
        movementRemainingFt: customSpeed,
        actionAvailable: true,
        bonusActionAvailable: true,
        reactionAvailable: true,
        freeInteractionAvailable: true,
      },
      resources: [],
      actionDeck: {
        actions: [
          {
            id: 'custom-wep',
            name: customWepName,
            cost: 'action',
            type: 'melee_weapon',
            toHitMod: customToHit,
            damageFormula: customDamage,
            damageType: 'slashing',
            reachFt: 5,
            description: `+${customToHit} to hit. Hit: ${customDamage}.`,
          },
          {
            id: 'base-dash',
            name: 'Dash',
            cost: 'action',
            type: 'utility',
            description: 'Double movement speed.',
          },
          {
            id: 'base-dodge',
            name: 'Dodge',
            cost: 'action',
            type: 'utility',
            description: 'Attacks against you have disadvantage.',
          },
        ],
        bonusActions: [],
        reactions: [
          {
            id: 'custom-oa',
            name: 'Opportunity Attack',
            cost: 'reaction',
            type: 'melee_weapon',
            triggerCondition: 'Enemy leaves reach',
            description: 'Make a melee attack.',
          },
        ],
        passives: [],
      },
      spatial: { x: 1, y: 3, elevationFt: 0, isHiding: false, hasCover: 'none' },
      conditions: [],
    };

    onLoadCharacter(newChar);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-5 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-sky-400" />
              Character Ingestion Hub
            </h2>
            <p className="text-xs text-slate-400">Import sheets, select preset builds, or create a combatant</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 my-3 border-b border-slate-800 pb-2">
          <button
            onClick={() => setTab('presets')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              tab === 'presets' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Preset Builds
          </button>
          <button
            onClick={() => setTab('pdf')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              tab === 'pdf' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" /> Upload PDF Sheet
          </button>
          <button
            onClick={() => setTab('manual')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              tab === 'manual' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" /> Combat-First Builder
          </button>
        </div>

        {/* Tab 1: Presets */}
        {tab === 'presets' && (
          <div className="flex-1 overflow-y-auto space-y-2 py-1 pr-1">
            {Object.values(PRESET_CHARACTERS).map((preset) => {
              const isActive = preset.id === activeCharacterId;

              return (
                <div
                  key={preset.id}
                  className={`p-3 rounded-lg border flex items-center justify-between transition ${
                    isActive ? 'bg-sky-950/40 border-sky-600 ring-1 ring-sky-600' : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100 text-sm">{preset.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {preset.archetype}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-rose-400" /> {preset.vitals.maxHp} HP</span>
                      <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-sky-400" /> {preset.vitals.baseAc} AC</span>
                      <span className="flex items-center gap-1"><Footprints className="w-3 h-3 text-amber-400" /> {preset.vitals.speedFt} ft</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Weapons: {preset.actionDeck.actions.filter(a => a.damageFormula).map(a => a.name).join(', ')}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onLoadCharacter(preset);
                      onClose();
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                      isActive
                        ? 'bg-sky-600 text-white shadow-md shadow-sky-900/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    {isActive ? <Check className="w-3.5 h-3.5" /> : null}
                    {isActive ? 'Loaded' : 'Select'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Upload PDF */}
        {tab === 'pdf' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-800 rounded-lg bg-slate-950/40">
            <UploadCloud className="w-12 h-12 text-amber-500/80 mb-2" />
            <h3 className="text-sm font-bold text-slate-200 mb-1">Upload 5e Fillable PDF Character Sheet</h3>
            <p className="text-xs text-slate-400 text-center max-w-sm mb-4">
              Supports official WotC fillable AcroForms and standard community formats (such as Arty the Rogue).
              Parsed completely client-side in your browser via <code className="text-amber-400">pdf-lib</code>.
            </p>

            <label className="cursor-pointer px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-lg shadow-amber-900/20 transition flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>{isParsing ? 'Parsing PDF Fields...' : 'Choose PDF File'}</span>
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                disabled={isParsing}
                onChange={handleFileUpload}
              />
            </label>

            {parseError && (
              <div className="mt-3 text-xs text-rose-400 bg-rose-950/50 p-2 rounded border border-rose-900">
                {parseError}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Combat-First Builder */}
        {tab === 'manual' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Character Name</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Speed (ft)</label>
                <input
                  type="number"
                  value={customSpeed}
                  onChange={(e) => setCustomSpeed(parseInt(e.target.value, 10) || 30)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Max HP</label>
                <input
                  type="number"
                  value={customHp}
                  onChange={(e) => setCustomHp(parseInt(e.target.value, 10) || 20)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Armor Class (AC)</label>
                <input
                  type="number"
                  value={customAc}
                  onChange={(e) => setCustomAc(parseInt(e.target.value, 10) || 15)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200"
                />
              </div>
            </div>

            <div className="p-3 rounded bg-slate-950 border border-slate-800">
              <div className="font-semibold text-slate-300 mb-2">Primary Weapon</div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-500 mb-0.5">Weapon Name</label>
                  <input
                    type="text"
                    value={customWepName}
                    onChange={(e) => setCustomWepName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-0.5">To-Hit Mod (+X)</label>
                  <input
                    type="number"
                    value={customToHit}
                    onChange={(e) => setCustomToHit(parseInt(e.target.value, 10) || 5)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-0.5">Damage Formula</label>
                  <input
                    type="text"
                    value={customDamage}
                    onChange={(e) => setCustomDamage(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-slate-200"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleCreateManual}
              className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition"
            >
              Deploy Custom Combatant
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
