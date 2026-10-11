import React, { useState } from 'react';
import { Combatant } from '../types/combat';
import { PRESET_CHARACTERS } from '../data/presetEncounters';
import { parseCharacterPdf } from '../utils/pdfParser';
import { parseFightClubXml } from '../utils/xmlParser';
import { UploadCloud, FileText, UserPlus, Check, X, Shield, Heart, Footprints, Code, Sparkles } from 'lucide-react';
import { ART_ASSETS, getTokenImage } from '../utils/artAssets';
import { FantasyCornerBrackets, WaxSealBadge } from './FantasyDecorations';

interface CharacterImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadCharacter: (char: Combatant) => void;
  activeCharacterId: string;
}

const SAMPLE_FIGHT_CLUB_XML = `<?xml version="1.0" encoding="UTF-8"?>
<compendium version="5">
  <character>
    <name>Corvus Nightblade</name>
    <race>Elf (Shadar-kai)</race>
    <class>
      <name>Rogue (Assassin)</name>
      <level>3</level>
    </class>
    <hp>27</hp>
    <ac>16</ac>
    <speed>30</speed>
    <ability>
      <str>10</str>
      <dex>18</dex>
      <con>14</con>
      <int>13</int>
      <wis>12</wis>
      <cha>8</cha>
    </ability>
    <item>
      <name>Shadow Rapier</name>
      <type>M</type>
      <dmg1>1d8</dmg1>
      <text>Finesse. 1d8 piercing damage.</text>
    </item>
    <item>
      <name>Hand Crossbow</name>
      <type>R</type>
      <dmg1>1d6</dmg1>
      <text>Ranged 30/120. Light, ammunition.</text>
    </item>
    <spell>
      <name>Blessing of the Raven Queen</name>
      <level>0</level>
      <time>1 Bonus Action</time>
      <range>30 ft</range>
      <text>Teleport up to 30 ft. Gain resistance to all damage until start of next turn.</text>
    </spell>
  </character>
</compendium>`;

export const CharacterImportModal: React.FC<CharacterImportModalProps> = ({
  isOpen,
  onClose,
  onLoadCharacter,
  activeCharacterId,
}) => {
  const [tab, setTab] = useState<'presets' | 'pdf' | 'xml' | 'manual'>('presets');
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [xmlInput, setXmlInput] = useState('');

  // Manual creator form state
  const [customName, setCustomName] = useState('Homebrew Champion');
  const [customHp, setCustomHp] = useState(25);
  const [customAc, setCustomAc] = useState(16);
  const [customSpeed, setCustomSpeed] = useState(30);
  const [customWepName, setCustomWepName] = useState('Longsword');
  const [customToHit, setCustomToHit] = useState(5);
  const [customDamage, setCustomDamage] = useState('1d8+3');

  if (!isOpen) return null;

  const handleFileUploadPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleFileUploadXml = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setParseError(null);
    try {
      const text = await file.text();
      const parsed = parseFightClubXml(text);
      onLoadCharacter(parsed);
      onClose();
    } catch (err: any) {
      setParseError(`Failed to parse Fight Club XML: ${err?.message || 'Malformed XML format'}`);
    } finally {
      setIsParsing(false);
    }
  };

  const handleParsePastedXml = () => {
    if (!xmlInput.trim()) return;
    setIsParsing(true);
    setParseError(null);
    try {
      const parsed = parseFightClubXml(xmlInput);
      onLoadCharacter(parsed);
      onClose();
    } catch (err: any) {
      setParseError(`Failed to parse XML: ${err?.message || 'Malformed XML structure'}`);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative overflow-hidden bg-slate-950 border-4 border-amber-700/80 rounded-2xl max-w-xl w-full p-5 shadow-[0_20px_60px_rgba(0,0,0,0.95)] flex flex-col max-h-[90vh]">
        <FantasyCornerBrackets className="w-6 h-6 text-amber-500" />
        {/* Ambient Dark Wood Texture */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-25 pointer-events-none mix-blend-overlay"
          style={{ backgroundImage: `url(${ART_ASSETS.darkWood})` }}
        />
        <div className="absolute top-0 right-0 opacity-15 pointer-events-none" style={{ backgroundImage: `url(${ART_ASSETS.crestEmblem})`, width: '160px', height: '160px', backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'top right', mixBlendMode: 'overlay' }} />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between pb-3 border-b border-amber-900/60">
          <div>
            <h2 className="font-fantasy text-base sm:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 flex items-center gap-2 drop-shadow-sm">
              <FileText className="w-5 h-5 text-amber-400" />
              Scribe's Archive & Character Hub
            </h2>
            <p className="text-xs text-amber-200/70 font-serif-rpg text-sm">Ingest character sheets, load official archetypes, or drop Fight Club 5e XML</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-amber-400 hover:text-amber-200 hover:bg-slate-800 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="relative z-10 flex flex-wrap gap-2 my-3 border-b border-amber-900/60 pb-2">
          <button
            onClick={() => setTab('presets')}
            className={`px-3 py-1.5 rounded-xl text-xs font-fantasy font-black transition cursor-pointer ${
              tab === 'presets' ? 'bg-amber-600 text-white shadow-md shadow-amber-950/60 border border-amber-400' : 'bg-slate-900/80 text-amber-200/70 hover:text-amber-100 border border-amber-900/50'
            }`}
          >
            Presets
          </button>
          <button
            onClick={() => setTab('xml')}
            className={`px-3 py-1.5 rounded-xl text-xs font-fantasy font-black transition flex items-center gap-1.5 cursor-pointer ${
              tab === 'xml' ? 'bg-amber-600 text-white shadow-md shadow-amber-950/60 border border-amber-400' : 'bg-slate-900/80 text-amber-200/70 hover:text-amber-100 border border-amber-900/50'
            }`}
          >
            <Code className="w-3.5 h-3.5 text-amber-300" /> Fight Club XML
          </button>
          <button
            onClick={() => setTab('pdf')}
            className={`px-3 py-1.5 rounded-xl text-xs font-fantasy font-black transition flex items-center gap-1.5 cursor-pointer ${
              tab === 'pdf' ? 'bg-amber-600 text-white shadow-md shadow-amber-950/60 border border-amber-400' : 'bg-slate-900/80 text-amber-200/70 hover:text-amber-100 border border-amber-900/50'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" /> Fillable PDF
          </button>
          <button
            onClick={() => setTab('manual')}
            className={`px-3 py-1.5 rounded-xl text-xs font-fantasy font-black transition flex items-center gap-1.5 cursor-pointer ${
              tab === 'manual' ? 'bg-amber-600 text-white shadow-md shadow-amber-950/60 border border-amber-400' : 'bg-slate-900/80 text-amber-200/70 hover:text-amber-100 border border-amber-900/50'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" /> Quick Builder
          </button>
        </div>

        {/* Tab 1: Presets (Real Parchment Dossiers) */}
        {tab === 'presets' && (
          <div className="relative z-10 flex-1 overflow-y-auto space-y-3 py-1 pr-1">
            {Object.values(PRESET_CHARACTERS).map((preset) => {
              const isActive = preset.id === activeCharacterId;

              return (
                <div
                  key={preset.id}
                  className={`relative overflow-hidden p-3.5 rounded-xl border-2 flex items-center justify-between transition-all shadow-md ${
                    isActive ? 'border-amber-600 ring-2 ring-amber-500 shadow-amber-950/40' : 'border-amber-800/60 hover:border-amber-600 hover:shadow-lg'
                  }`}
                  style={{
                    backgroundImage: `linear-gradient(rgba(247, 233, 201, 0.94), rgba(235, 212, 168, 0.96)), url(${ART_ASSETS.parchment})`,
                    backgroundSize: 'cover',
                    color: '#2b170a'
                  }}
                >
                  <FantasyCornerBrackets className="w-3 h-3 text-amber-800/60" />
                  <div className="relative z-10 flex items-center gap-3">
                    <img 
                      src={getTokenImage(preset)} 
                      alt={preset.name} 
                      className="w-12 h-12 rounded-full border-2 border-amber-800 object-cover shadow-md shrink-0" 
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-fantasy font-black text-amber-950 text-base">{preset.name}</span>
                        <WaxSealBadge text={preset.archetype || 'Hero'} color="amber" />
                      </div>
                      <div className="text-xs text-amber-900 mt-1 flex items-center gap-3 font-semibold">
                        <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-rose-700" /> {preset.vitals.maxHp} HP</span>
                        <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-indigo-800" /> {preset.vitals.baseAc} AC</span>
                        <span className="flex items-center gap-1"><Footprints className="w-3.5 h-3.5 text-amber-800" /> {preset.vitals.speedFt} ft</span>
                      </div>
                      <div className="text-[11px] text-amber-900/80 mt-1 font-serif-rpg font-semibold">
                        Weapons: {preset.actionDeck.actions.filter(a => a.damageFormula).map(a => a.name).join(', ')}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onLoadCharacter(preset);
                      onClose();
                    }}
                    className={`relative z-10 px-3 py-1.5 rounded-lg text-xs font-fantasy font-black shrink-0 flex items-center gap-1.5 transition cursor-pointer shadow-md ${
                      isActive
                        ? 'bg-amber-900 text-amber-100 border border-amber-700 shadow-amber-950/60'
                        : 'btn-fantasy-gold'
                    }`}
                  >
                    {isActive ? <Check className="w-3.5 h-3.5" /> : null}
                    {isActive ? 'Active Hero' : 'Select Hero'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Fight Club 5e XML */}
        {tab === 'xml' && (
          <div className="relative z-10 flex-1 flex flex-col gap-3 py-1 overflow-y-auto">
            <div 
              className="p-3.5 rounded-xl border-2 border-amber-800/80 text-xs shadow-md"
              style={{
                backgroundImage: `linear-gradient(rgba(247, 233, 201, 0.94), rgba(235, 212, 168, 0.96)), url(${ART_ASSETS.parchment})`,
                backgroundSize: 'cover',
                color: '#2b170a'
              }}
            >
              <strong className="text-amber-950 font-fantasy text-sm block mb-1">Fight Club 5e XML Compendium Support:</strong>
              <p className="font-serif-rpg font-semibold text-amber-900 text-xs leading-relaxed">
                Upload or paste standardized Lion's Den XML. The engine automatically parses ability scores, saving throws, weapons, to-hit modifiers, and spells.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="cursor-pointer px-4 py-2 rounded-xl btn-fantasy-gold font-fantasy font-black text-xs shadow-md transition flex items-center gap-1.5">
                <Code className="w-4 h-4" />
                <span>Upload .xml File</span>
                <input
                  type="file"
                  accept=".xml"
                  className="hidden"
                  disabled={isParsing}
                  onChange={handleFileUploadXml}
                />
              </label>

              <button
                onClick={() => setXmlInput(SAMPLE_FIGHT_CLUB_XML)}
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-200 border border-amber-800/60 text-xs font-fantasy font-semibold flex items-center gap-1 transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Load Sample Assassin XML
              </button>
            </div>

            <div className="flex-1 flex flex-col">
              <label className="text-[11px] font-fantasy font-semibold text-amber-300 mb-1">Or Paste XML Code:</label>
              <textarea
                rows={6}
                value={xmlInput}
                onChange={(e) => setXmlInput(e.target.value)}
                placeholder="<compendium version='5'><character>...</character></compendium>"
                className="w-full bg-[#fdf8ee] text-[#2b170a] border-2 border-amber-900/40 rounded-xl p-3 font-mono text-xs focus:ring-2 focus:ring-amber-600 focus:outline-none shadow-inner"
              />
            </div>

            {xmlInput && (
              <button
                onClick={handleParsePastedXml}
                disabled={isParsing}
                className="w-full py-2.5 rounded-xl btn-fantasy-gold font-fantasy font-black text-xs shadow-md transition cursor-pointer"
              >
                {isParsing ? 'Parsing XML...' : 'Parse & Deploy Fight Club Character'}
              </button>
            )}

            {parseError && (
              <div className="text-xs text-rose-300 bg-rose-950/60 p-2.5 rounded-xl border border-rose-800">
                {parseError}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Upload PDF */}
        {tab === 'pdf' && (
          <div 
            className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-amber-800/80 rounded-xl shadow-md"
            style={{
              backgroundImage: `linear-gradient(rgba(247, 233, 201, 0.94), rgba(235, 212, 168, 0.96)), url(${ART_ASSETS.parchment})`,
              backgroundSize: 'cover',
              color: '#2b170a'
            }}
          >
            <UploadCloud className="w-12 h-12 text-amber-800 mb-2" />
            <h3 className="text-base font-fantasy font-black text-amber-950 mb-1">Upload 5e Fillable PDF Character Sheet</h3>
            <p className="text-xs text-amber-900 text-center max-w-sm mb-4 font-serif-rpg font-semibold">
              Supports official WotC fillable AcroForms and community sheets. Parsed 100% client-side via <code className="text-amber-950 font-bold">pdf-lib</code>.
            </p>

            <label className="cursor-pointer px-4 py-2 rounded-xl btn-fantasy-gold font-fantasy font-black text-xs shadow-lg transition flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>{isParsing ? 'Parsing PDF Fields...' : 'Choose PDF File'}</span>
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                disabled={isParsing}
                onChange={handleFileUploadPdf}
              />
            </label>

            {parseError && (
              <div className="mt-3 text-xs text-rose-300 bg-rose-950/60 p-2.5 rounded-xl border border-rose-800">
                {parseError}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Quick Builder */}
        {tab === 'manual' && (
          <div 
            className="relative z-10 flex-1 overflow-y-auto space-y-3 p-4 rounded-xl border-2 border-amber-800/80 text-xs shadow-md"
            style={{
              backgroundImage: `linear-gradient(rgba(247, 233, 201, 0.94), rgba(235, 212, 168, 0.96)), url(${ART_ASSETS.parchment})`,
              backgroundSize: 'cover',
              color: '#2b170a'
            }}
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-amber-950 font-fantasy font-black mb-1">Character Name</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-[#fdf8ee] text-[#2b170a] border-2 border-amber-900/40 font-semibold rounded-xl p-2 focus:ring-2 focus:ring-amber-600 focus:outline-none shadow-inner"
                />
              </div>
              <div>
                <label className="block text-amber-950 font-fantasy font-black mb-1">Speed (ft)</label>
                <input
                  type="number"
                  value={customSpeed}
                  onChange={(e) => setCustomSpeed(parseInt(e.target.value, 10) || 30)}
                  className="w-full bg-[#fdf8ee] text-[#2b170a] border-2 border-amber-900/40 font-mono font-semibold rounded-xl p-2 focus:ring-2 focus:ring-amber-600 focus:outline-none shadow-inner"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-amber-950 font-fantasy font-black mb-1">Max HP</label>
                <input
                  type="number"
                  value={customHp}
                  onChange={(e) => setCustomHp(parseInt(e.target.value, 10) || 20)}
                  className="w-full bg-[#fdf8ee] text-[#2b170a] border-2 border-amber-900/40 font-mono font-semibold rounded-xl p-2 focus:ring-2 focus:ring-amber-600 focus:outline-none shadow-inner"
                />
              </div>
              <div>
                <label className="block text-amber-950 font-fantasy font-black mb-1">Armor Class (AC)</label>
                <input
                  type="number"
                  value={customAc}
                  onChange={(e) => setCustomAc(parseInt(e.target.value, 10) || 15)}
                  className="w-full bg-[#fdf8ee] text-[#2b170a] border-2 border-amber-900/40 font-mono font-semibold rounded-xl p-2 focus:ring-2 focus:ring-amber-600 focus:outline-none shadow-inner"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-950/10 border-2 border-amber-900/30">
              <div className="font-fantasy font-black text-amber-950 mb-2">Primary Weapon</div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-amber-900 font-semibold mb-0.5">Weapon Name</label>
                  <input
                    type="text"
                    value={customWepName}
                    onChange={(e) => setCustomWepName(e.target.value)}
                    className="w-full bg-[#fdf8ee] text-[#2b170a] border border-amber-900/40 font-semibold rounded-lg p-1.5 focus:outline-none shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-amber-900 font-semibold mb-0.5">To-Hit Mod (+X)</label>
                  <input
                    type="number"
                    value={customToHit}
                    onChange={(e) => setCustomToHit(parseInt(e.target.value, 10) || 5)}
                    className="w-full bg-[#fdf8ee] text-[#2b170a] border border-amber-900/40 font-mono font-semibold rounded-lg p-1.5 focus:outline-none shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-amber-900 font-semibold mb-0.5">Damage Formula</label>
                  <input
                    type="text"
                    value={customDamage}
                    onChange={(e) => setCustomDamage(e.target.value)}
                    className="w-full bg-[#fdf8ee] text-[#2b170a] border border-amber-900/40 font-mono font-semibold rounded-lg p-1.5 focus:outline-none shadow-inner"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleCreateManual}
              className="w-full py-2.5 rounded-xl btn-fantasy-gold font-fantasy font-black text-xs shadow-md transition cursor-pointer"
            >
              Deploy Custom Champion
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
