import React, { useState, useEffect } from 'react';
import { ART_ASSETS, getDarkVellumStyle } from '../utils/artAssets';
import { SavedMapData } from '../types/combat';
import { Download, Upload, Copy, Check, Trash2, Map, FileJson, X, Plus, AlertCircle } from 'lucide-react';
import { FantasyCornerBrackets } from './FantasyDecorations';

interface MapExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMapData: SavedMapData;
  onImportMap: (imported: SavedMapData) => void;
}

const LOCAL_STORAGE_KEY = 'dnd_training_grounds_saved_maps';

export const MapExportImportModal: React.FC<MapExportImportModalProps> = ({
  isOpen,
  onClose,
  currentMapData,
  onImportMap,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [copied, setCopied] = useState(false);
  const [mapNameInput, setMapNameInput] = useState(currentMapData.name || 'Custom Battlemap');
  const [pastedJson, setPastedJson] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [savedMaps, setSavedMaps] = useState<SavedMapData[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setSavedMaps(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load saved maps from localStorage', e);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentExportJson = JSON.stringify(
    {
      ...currentMapData,
      name: mapNameInput || 'Custom Battlemap',
      savedAt: new Date().toISOString(),
    },
    null,
    2
  );

  const handleCopyClipboard = () => {
    navigator.clipboard.writeText(currentExportJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([currentExportJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(mapNameInput || 'battlemap').toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSaveToLocalStorage = () => {
    const newEntry: SavedMapData = {
      ...currentMapData,
      id: `map-${Date.now()}`,
      name: mapNameInput || 'Custom Battlemap',
      savedAt: new Date().toISOString(),
    };

    const updated = [newEntry, ...savedMaps.filter((m) => m.name !== newEntry.name)];
    setSavedMaps(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  };

  const handleDeleteSavedMap = (id: string) => {
    const updated = savedMaps.filter((m) => m.id !== id);
    setSavedMaps(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to update localStorage', e);
    }
  };

  const handleImportJsonString = (jsonStr: string) => {
    try {
      setParseError(null);
      const parsed = JSON.parse(jsonStr) as SavedMapData;
      if (!parsed.gridCells || !Array.isArray(parsed.gridCells)) {
        throw new Error('Invalid map file: missing gridCells array');
      }
      onImportMap(parsed);
      onClose();
    } catch (err: any) {
      setParseError(err.message || 'Failed to parse map JSON format.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleImportJsonString(content);
    };
    reader.readAsText(file);
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
              <Map className="w-5 h-5 text-amber-400" />
              Royal Cartographer's Archive
            </h2>
            <p className="text-xs text-amber-200/70 font-serif-rpg text-sm">Save, share, download, or import painted battlemaps and combatant layouts</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-amber-400 hover:text-amber-200 hover:bg-slate-800 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex gap-2 my-3">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-fantasy font-black flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm ${
              activeTab === 'export'
                ? 'bg-amber-600 text-white border border-amber-400 shadow-md shadow-amber-950/60'
                : 'bg-slate-900/80 text-amber-200/70 hover:text-amber-100 border border-amber-900/50'
            }`}
          >
            <Download className="w-3.5 h-3.5" /> Export / Save Map
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-fantasy font-black flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm ${
              activeTab === 'import'
                ? 'bg-amber-600 text-white border border-amber-400 shadow-md shadow-amber-950/60'
                : 'bg-slate-900/80 text-amber-200/70 hover:text-amber-100 border border-amber-900/50'
            }`}
          >
            <Upload className="w-3.5 h-3.5" /> Import / Load Map
          </button>
        </div>

        {/* TAB 1: EXPORT */}
        {activeTab === 'export' && (
          <div className="space-y-3 overflow-y-auto pr-1 text-xs">
            <div>
              <label className="block text-[11px] font-fantasy font-black text-amber-300 mb-1">Battlemap Title:</label>
              <input
                type="text"
                value={mapNameInput}
                onChange={(e) => setMapNameInput(e.target.value)}
                className="w-full bg-slate-900/90 text-amber-100 placeholder:text-amber-400/50 border-2 border-amber-800/60 font-semibold rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner"
                placeholder="e.g. Goblin Outpost Ambush"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleDownloadJson}
                className="flex-1 py-2 px-3 rounded-xl btn-fantasy-gold font-fantasy font-black flex items-center justify-center gap-1.5 transition shadow-md cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Download JSON File
              </button>
              <button
                onClick={handleCopyClipboard}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-200 border border-amber-800/60 font-fantasy font-black flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied to Clipboard!' : 'Copy JSON'}
              </button>
              <button
                onClick={handleSaveToLocalStorage}
                className="py-2 px-3 rounded-xl bg-amber-900/20 hover:bg-amber-900/30 border border-amber-700/60 text-amber-200 font-fantasy font-black flex items-center gap-1 transition cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Save to Browser
              </button>
            </div>

            {/* Saved in Browser Section */}
            {savedMaps.length > 0 && (
              <div className="mt-3 pt-3 border-t border-amber-900/50">
                <span className="text-[11px] font-fantasy font-black text-amber-300 uppercase tracking-wider block mb-2">
                  Maps Saved in Browser ({savedMaps.length})
                </span>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {savedMaps.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 rounded-xl border-2 border-amber-800/70 flex items-center justify-between shadow-md relative overflow-hidden"
                      style={getDarkVellumStyle(0.92)}
                    >
                      <div>
                        <div className="font-fantasy font-black text-amber-200 text-sm">{m.name}</div>
                        <div className="text-[10px] text-amber-400/80 font-mono font-bold">
                          {m.gridWidth}x{m.gridHeight} · {m.combatants?.length || 0} tokens · {new Date(m.savedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => { onImportMap(m); onClose(); }}
                          className="px-2.5 py-1 rounded-lg btn-fantasy-gold text-[11px] font-fantasy font-black cursor-pointer shadow"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => handleDeleteSavedMap(m.id)}
                          className="p-1.5 text-amber-600 hover:text-rose-400 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: IMPORT */}
        {activeTab === 'import' && (
          <div className="space-y-3 overflow-y-auto pr-1 text-xs">
            {/* File Upload (Dark Vellum Dropzone) */}
            <div 
              className="p-4 rounded-xl border-2 border-dashed border-amber-800/80 transition text-center cursor-pointer relative shadow-md"
              style={getDarkVellumStyle(0.92)}
            >
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <FileJson className="w-8 h-8 text-amber-400 mx-auto mb-1" />
              <div className="font-fantasy font-black text-amber-200 text-sm">Upload .json Battlemap File</div>
              <div className="text-[11px] font-serif-rpg font-semibold text-amber-300/80">Click or drag & drop a saved map JSON file here</div>
            </div>

            {/* Paste JSON */}
            <div>
              <label className="block text-[11px] font-fantasy font-black text-amber-300 mb-1">Or Paste JSON Data:</label>
              <textarea
                value={pastedJson}
                onChange={(e) => setPastedJson(e.target.value)}
                placeholder='Paste map JSON string here...'
                className="w-full h-28 bg-slate-900/90 text-amber-100 placeholder:text-amber-400/50 border-2 border-amber-800/60 rounded-xl p-2.5 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner"
              />
            </div>

            {parseError && (
              <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{parseError}</span>
              </div>
            )}

            <button
              onClick={() => handleImportJsonString(pastedJson)}
              disabled={!pastedJson.trim()}
              className={`w-full py-2.5 rounded-xl font-fantasy font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md ${
                pastedJson.trim()
                  ? 'btn-fantasy-gold'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Upload className="w-3.5 h-3.5" /> Import & Load Battlemap
            </button>
          </div>
        )}
      </div></div>
    </div>
  );
};
