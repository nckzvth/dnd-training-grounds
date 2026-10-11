import React, { useState } from 'react';
import { ART_ASSETS, getDarkVellumStyle } from '../utils/artAssets';
import { ActionItem } from '../types/combat';
import { SRD_SPELLS, SrdSpell } from '../data/srdSpells';
import { Sparkles, Plus, Check, X, Search, BookOpen, Flame, Shield } from 'lucide-react';
import { FantasyCornerBrackets, WaxSealBadge } from './FantasyDecorations';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-950 border-4 border-amber-700/80 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.95)] max-w-xl w-full p-5 flex flex-col relative overflow-hidden max-h-[90vh]">
        <FantasyCornerBrackets className="w-6 h-6 text-amber-500" />
        <div className="absolute inset-0 z-0 pointer-events-none opacity-25 mix-blend-overlay" style={{ backgroundImage: `url(${ART_ASSETS.darkWood})` }} />
        <div className="absolute top-0 right-0 opacity-15 pointer-events-none" style={{ backgroundImage: `url(${ART_ASSETS.crestEmblem})`, width: '160px', height: '160px', backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'top right', mixBlendMode: 'overlay' }} />
        <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-900/60">
          <div>
            <h2 className="text-xl font-fantasy text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 flex items-center gap-2 drop-shadow-md">
              <BookOpen className="w-5 h-5 text-amber-400" />
              5e SRD Spellbook & Action Compendium
            </h2>
            <p className="text-xs text-amber-200/70 font-serif-rpg text-sm">Equip cantrips, leveled spells, and special actions to your character's action deck</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-amber-400 hover:text-amber-200 hover:bg-slate-800 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 my-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-4 h-4 text-amber-400/70 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search spells by name or school..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/90 text-amber-100 placeholder:text-amber-400/50 border-2 border-amber-800/60 rounded-xl pl-9 pr-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner"
            />
          </div>

          <div className="flex gap-1 bg-slate-900/90 p-1 rounded-xl border border-amber-900/50 text-xs font-fantasy font-black">
            {(['all', 0, 1, 2] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  selectedLevel === lvl
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-950/60'
                    : 'text-amber-200/70 hover:text-amber-100 hover:bg-amber-950/40'
                }`}
              >
                {lvl === 'all' ? 'All' : lvl === 0 ? 'Cantrips' : `${lvl}${lvl === 1 ? 'st' : 'nd'} Level`}
              </button>
            ))}
          </div>
        </div>

        {/* Spells List (Dark Antiqued Vellum Manuscript Cards) */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {filteredSpells.map((spell) => {
            const isAdded = addedIds.has(spell.id);

            return (
              <div
                key={spell.id}
                className="relative overflow-hidden p-3.5 rounded-xl border-2 border-amber-800/70 hover:border-amber-600 transition-all flex items-start justify-between gap-3 text-xs shadow-md"
                style={getDarkVellumStyle(0.92)}
              >
                <FantasyCornerBrackets className="w-3 h-3 text-amber-600/50" />
                <div className="relative z-10 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-fantasy font-black text-amber-200 text-base">{spell.name}</span>
                    <WaxSealBadge 
                      text={spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`} 
                      color={spell.level === 0 ? 'green' : 'blue'} 
                    />
                    <span className="text-[10px] text-amber-400/80 font-mono font-bold">
                      {spell.school} · {spell.castingTime} · {spell.rangeFt} ft
                    </span>
                  </div>

                  <p className="font-serif-rpg text-amber-200/90 text-xs font-semibold mt-1 leading-relaxed line-clamp-2">
                    {spell.description}
                  </p>

                  <div className="mt-2 p-2 rounded-lg bg-amber-950/40 border border-amber-700/40 text-[11px] text-amber-300 font-serif-rpg font-semibold">
                    💡 <strong className="text-amber-100">Physical Tabletop Tip:</strong> {spell.tabletopTip}
                  </div>
                </div>

                <button
                  onClick={() => handleAddSpell(spell)}
                  disabled={isAdded}
                  className={`relative z-10 px-3 py-1.5 rounded-lg text-xs font-fantasy font-black shrink-0 flex items-center gap-1 transition cursor-pointer shadow-md ${
                    isAdded
                      ? 'bg-amber-900 text-amber-100 border border-amber-700 shadow-amber-950/60'
                      : 'btn-fantasy-gold'
                  }`}
                >
                  {isAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  {isAdded ? 'Scribed' : 'Scribe Spell'}
                </button>
              </div>
            );
          })}
        </div></div>
      </div>
    </div>
  );
};
