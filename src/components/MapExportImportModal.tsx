import React, { useState, useEffect } from 'react';
import { SavedMapData } from '../types/combat';
import { Download, Upload, Copy, Check, Trash2, Map, FileJson, X, Plus, AlertCircle } from 'lucide-react';

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
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-5 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Map className="w-5 h-5 text-amber-400" />
              Battlemap Export & Import Hub
            </h2>
            <p className="text-xs text-slate-400">Save, share, download, or import painted battlemaps and combatant layouts</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex gap-2 my-3">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'export'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Download className="w-3.5 h-3.5" /> Export / Save Map
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'import'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5" /> Import / Load Map
          </button>
        </div>

        {/* TAB 1: EXPORT */}
        {activeTab === 'export' && (
          <div className="space-y-3 overflow-y-auto pr-1 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Map Title:</label>
              <input
                type="text"
                value={mapNameInput}
                onChange={(e) => setMapNameInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                placeholder="e.g. Goblin Outpost Ambush"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleDownloadJson}
                className="flex-1 py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold flex items-center justify-center gap-1.5 transition shadow"
              >
                <Download className="w-3.5 h-3.5" /> Download JSON File
              </button>
              <button
                onClick={handleCopyClipboard}
                className="flex-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold flex items-center justify-center gap-1.5 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied to Clipboard!' : 'Copy JSON'}
              </button>
              <button
                onClick={handleSaveToLocalStorage}
                className="py-2 px-3 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/40 border border-indigo-500/40 text-indigo-300 font-semibold flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" /> Save to Browser
              </button>
            </div>

            {/* Saved in Browser Section */}
            {savedMaps.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Maps Saved in Browser ({savedMaps.length})
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {savedMaps.map((m) => (
                    <div
                      key={m.id}
                      className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-slate-200">{m.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {m.gridWidth}x{m.gridHeight} · {m.combatants?.length || 0} tokens · {new Date(m.savedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => { onImportMap(m); onClose(); }}
                          className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-[11px] font-semibold"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => handleDeleteSavedMap(m.id)}
                          className="p-1 text-slate-500 hover:text-rose-400"
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
            {/* File Upload */}
            <div className="p-3 rounded-xl bg-slate-950 border border-dashed border-slate-800 hover:border-amber-500/60 transition text-center cursor-pointer relative">
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <FileJson className="w-6 h-6 text-amber-400 mx-auto mb-1" />
              <div className="font-semibold text-slate-200">Upload .json Battlemap File</div>
              <div className="text-[10px] text-slate-400">Click or drag & drop a saved map JSON file here</div>
            </div>

            {/* Paste JSON */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Or Paste JSON Data:</label>
              <textarea
                value={pastedJson}
                onChange={(e) => setPastedJson(e.target.value)}
                placeholder='Paste map JSON string here...'
                className="w-full h-28 bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-[11px] text-slate-300 focus:outline-none focus:border-amber-500"
              />
            </div>

            {parseError && (
              <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{parseError}</span>
              </div>
            )}

            <button
              onClick={() => handleImportJsonString(pastedJson)}
              disabled={!pastedJson.trim()}
              className={`w-full py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition ${
                pastedJson.trim()
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Upload className="w-3.5 h-3.5" /> Import & Load Battlemap
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
