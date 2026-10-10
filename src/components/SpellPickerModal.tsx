import React, { useState } from 'react';
import { ART_ASSETS } from '../utils/artAssets';
import { ActionItem } from '../types/combat';
import { SRD_SPELLS, SrdSpell } from '../data/srdSpells';
import { Sparkles, Plus, Check, X, Search, BookOpen, Flame, Shield } from 'lucide-react';

interface SpellPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSpellToActionDeck: (actionItem: ActionItem) => void;
}

export const SpellPickerModal: React.FC<SpellPickerModalProps> = ({
  isOpen,
  onClose,
  onAddSpellToActionDeck,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<number | 'all'>('all');
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const filteredSpells = SRD_SPELLS.filter((spell) => {
    const matchesSearch = spell.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          spell.school.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || spell.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  const handleAddSpell = (spell: SrdSpell) => {
    const actionItem: ActionItem = {
      id: `equipped-${spell.id}-${Date.now()}`,
      name: spell.name,
      cost: spell.castingTime.includes('Bonus') ? 'bonus' : spell.castingTime.includes('Reaction') ? 'reaction' : 'action',
      type: spell.attackType === 'save'
        ? 'saving_throw_spell'
        : spell.attackType === 'ranged_spell' || spell.attackType === 'melee_spell'
        ? 'spell_attack'
        : 'class_feature',
      toHitMod: 5,
      saveType: spell.saveType,
      saveDC: 13,
      halfDamageOnSave: spell.halfDamageOnSave,
      damageFormula: spell.damageFormula,
      damageType: spell.damageType,
      rangeFt: spell.rangeFt,
      description: `${spell.castingTime} · ${spell.description}`,
    };

    onAddSpellToActionDeck(actionItem);
    setAddedIds((prev) => new Set([...prev, spell.id]));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-950 border-2 border-amber-600/70 rounded-2xl shadow-2xl  max-w-xl w-full p-5 flex flex-col ">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20 mix-blend-overlay" style={{ backgroundImage: `url(${ART_ASSETS.darkWood})` }} />
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none" style={{ backgroundImage: `url(${ART_ASSETS.crestEmblem})`, width: '150px', height: '150px', backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'top right', mixBlendMode: 'overlay' }} />
        <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-fantasy text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 flex items-center gap-2 drop-shadow-md">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              5e SRD Spellbook & Action Compendium
            </h2>
            <p className="text-xs text-slate-400">Equip cantrips, leveled spells, and special actions to your character's action deck</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 my-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search spells by name or school..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/90 border border-amber-800/60  rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 relative overflow-hidden"
                style={{ backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.9)), url(${ART_ASSETS.parchment})`, backgroundBlendMode: "overlay" }}
            />
          </div>

          <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setSelectedLevel('all')}
              className={`px-2.5 py-1 rounded transition ${selectedLevel === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedLevel(0)}
              className={`px-2.5 py-1 rounded transition ${selectedLevel === 0 ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Cantrips
            </button>
            <button
              onClick={() => setSelectedLevel(1)}
              className={`px-2.5 py-1 rounded transition ${selectedLevel === 1 ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              1st Level
            </button>
            <button
              onClick={() => setSelectedLevel(2)}
              className={`px-2.5 py-1 rounded transition ${selectedLevel === 2 ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              2nd Level
            </button>
          </div>
        </div>

        {/* Spells List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {filteredSpells.map((spell) => {
            const isAdded = addedIds.has(spell.id);

            return (
              <div
                key={spell.id}
                className="p-3 rounded-xl bg-slate-900/90 border border-amber-800/60 hover:border-amber-600/80  transition flex items-start justify-between gap-3 text-xs relative overflow-hidden"
                style={{ backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.9)), url(${ART_ASSETS.parchment})`, backgroundBlendMode: "overlay" }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-100 text-sm">{spell.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-indigo-300 border border-slate-800 font-mono">
                      {spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`} · {spell.school}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {spell.castingTime} · {spell.rangeFt} ft
                    </span>
                  </div>

                  <p className="text-slate-300 mt-1 leading-relaxed text-[11px] line-clamp-2">
                    {spell.description}
                  </p>

                  <div className="mt-1.5 p-2 rounded bg-indigo-950/20 border border-indigo-900/30 text-[10px] text-indigo-300/90 font-sans">
                    💡 <strong>Physical Tabletop Tip:</strong> {spell.tabletopTip}
                  </div>
                </div>

                <button
                  onClick={() => handleAddSpell(spell)}
                  disabled={isAdded}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1 transition ${
                    isAdded
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'btn-fantasy-gold shadow-md shadow-amber-900/20'
                  }`}
                >
                  {isAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  {isAdded ? 'Equipped' : 'Add to Deck'}
                </button>
              </div>
            );
          })}
        </div></div>
      </div>
    </div>
  );
};
