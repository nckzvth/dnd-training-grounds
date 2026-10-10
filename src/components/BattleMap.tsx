import React, { useState } from 'react';
import { Combatant, GridCell, ActionItem, CoverEvaluation } from '../types/combat';
import { evaluateCover, calculateDistanceFt } from '../utils/raycastCover';
import { findPath } from '../utils/pathfinding';
import { 
  Crosshair, 
  Footprints, 
  AlertTriangle, 
  Shield, 
  EyeOff, 
  HelpCircle,
  Box,
  Layers,
  Info
} from 'lucide-react';

import { MapEditorBrush } from './MapEditorToolbar';

interface BattleMapProps {
  gridWidth: number;
  gridHeight: number;
  gridCells: GridCell[];
  combatants: Combatant[];
  player: Combatant;
  selectedAction: ActionItem | null;
  onMovePlayer: (newX: number, newY: number, costFt: number) => void;
  onTargetCombatant: (target: Combatant, action: ActionItem, cover: CoverEvaluation) => void;
  isEditingMap?: boolean;
  activeBrush?: MapEditorBrush;
  onCellPaint?: (x: number, y: number, brush: MapEditorBrush) => void;
}

const CELL_SIZE = 56; // Grid unit dimension

export const BattleMap: React.FC<BattleMapProps> = ({
  gridWidth,
  gridHeight,
  gridCells,
  combatants,
  player,
  selectedAction,
  onMovePlayer,
  onTargetCombatant,
  isEditingMap = false,
  activeBrush = 'wall',
  onCellPaint,
}) => {
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);
  const [showLegend, setShowLegend] = useState(true);

  // Map cell lookup
  const cellMap = new Map<string, GridCell>();
  gridCells.forEach((c) => cellMap.set(`${c.x},${c.y}`, c));

  // Occupied tiles
  const combatantAtTile = new Map<string, Combatant>();
  combatants.forEach((c) => {
    if (c.vitals.currentHp > 0) {
      combatantAtTile.set(`${c.spatial.x},${c.spatial.y}`, c);
    }
  });

  // Calculate preview path if hovering over a walkable tile
  let previewPath: Array<{ x: number; y: number; costFt: number }> | null = null;
  let totalPathCost = 0;
  let canAffordMove = false;

  if (hoveredCell && !selectedAction) {
    const isOccupied = combatantAtTile.has(`${hoveredCell.x},${hoveredCell.y}`);
    const cell = cellMap.get(`${hoveredCell.x},${hoveredCell.y}`);
    const isWall = cell?.type === 'wall';

    if (!isOccupied && !isWall && (hoveredCell.x !== player.spatial.x || hoveredCell.y !== player.spatial.y)) {
      const occupiedSet = new Set(Array.from(combatantAtTile.keys()));
      occupiedSet.delete(`${player.spatial.x},${player.spatial.y}`);

      previewPath = findPath(
        player.spatial.x,
        player.spatial.y,
        hoveredCell.x,
        hoveredCell.y,
        gridCells,
        gridWidth,
        gridHeight,
        occupiedSet
      );

      if (previewPath) {
        totalPathCost = previewPath.reduce((acc, step) => acc + step.costFt, 0);
        canAffordMove = totalPathCost <= player.budget.movementRemainingFt;
      }
    }
  }

  // Hovered target combatant evaluation (for targeting and raycasting)
  let hoveredCombatant: Combatant | null = null;
  let coverResult: CoverEvaluation | null = null;
  let targetDistanceFt = 0;

  if (hoveredCell) {
    const targetAtHover = combatantAtTile.get(`${hoveredCell.x},${hoveredCell.y}`);
    if (targetAtHover) {
      hoveredCombatant = targetAtHover;
      targetDistanceFt = calculateDistanceFt(player.spatial.x, player.spatial.y, targetAtHover.spatial.x, targetAtHover.spatial.y);
      if (targetAtHover.id !== player.id) {
        coverResult = evaluateCover(player.spatial.x, player.spatial.y, targetAtHover.spatial.x, targetAtHover.spatial.y, gridCells);
      }
    }
  }

  // Hovered cell info for tactical tooltip
  const currentHoveredGridCell = hoveredCell ? cellMap.get(`${hoveredCell.x},${hoveredCell.y}`) : null;

  const handleCellClick = (x: number, y: number) => {
    // If in map editor mode, paint cell
    if (isEditingMap && onCellPaint) {
      onCellPaint(x, y, activeBrush);
      return;
    }

    const occupant = combatantAtTile.get(`${x},${y}`);

    // If an action is selected, try to target occupant
    if (selectedAction) {
      if (occupant && occupant.id !== player.id && occupant.vitals.currentHp > 0) {
        const cover = evaluateCover(player.spatial.x, player.spatial.y, occupant.spatial.x, occupant.spatial.y, gridCells);
        onTargetCombatant(occupant, selectedAction, cover);
      }
      return;
    }

    // Otherwise, move player to tile if path is valid and affordable
    if (previewPath && canAffordMove) {
      onMovePlayer(x, y, totalPathCost);
    }
  };

  return (
    <div className="w-full flex flex-col bg-slate-950 select-none rounded-xl border border-slate-800 shadow-xl overflow-hidden">
      {/* Top Map Action Banner */}
      <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          {selectedAction ? (
            <span className="flex items-center gap-1.5 text-amber-400 font-semibold animate-pulse">
              <Crosshair className="w-4 h-4" />
              Targeting: <strong>{selectedAction.name}</strong> (Range: {selectedAction.rangeFt || selectedAction.reachFt || 5} ft) — Click an enemy to attack
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-slate-300">
              <Footprints className="w-4 h-4 text-cyan-400" />
              Movement Mode: Click any tile to move. Remaining: <strong className="text-cyan-300 font-mono">{player.budget.movementRemainingFt} ft</strong>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLegend(!showLegend)}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-300 border border-slate-700 transition"
          >
            <HelpCircle className="w-3 h-3 text-amber-400" />
            <span>{showLegend ? 'Hide Legend' : 'Show Legend'}</span>
          </button>
        </div>
      </div>

      {/* Visual Map Legend (Explains squares and tokens) */}
      {showLegend && (
        <div className="px-3 py-1.5 bg-slate-900/60 border-b border-slate-800/80 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
          <span className="font-semibold text-slate-300 flex items-center gap-1">
            <Info className="w-3 h-3 text-amber-400" /> Map Key:
          </span>
          <span className="flex items-center gap-1 text-slate-300">
            <span className="w-3 h-3 rounded-sm bg-slate-800 border border-slate-700 inline-block" />
            Solid Wall (Total Cover / Impassable)
          </span>
          <span className="flex items-center gap-1 text-amber-300">
            <span className="w-3 h-3 rounded-sm bg-amber-950/80 border border-amber-600 inline-block" />
            Crates (+2 AC Half Cover)
          </span>
          <span className="flex items-center gap-1 text-orange-300">
            <span className="w-3 h-3 rounded-sm bg-orange-950/80 border border-orange-600 inline-block" />
            Rubble (2x Movement Cost)
          </span>
          <span className="flex items-center gap-1 text-cyan-300">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block" />
            You ({player.name})
          </span>
          <span className="flex items-center gap-1 text-rose-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            Hostile Targets
          </span>
        </div>
      )}

      {/* SVG Canvas Map Area (Fluid Responsive Container) */}
      <div className="relative w-full flex items-center justify-center p-2 sm:p-4 bg-slate-950 overflow-x-auto min-h-[380px]">
        <div className="w-full max-w-[760px] mx-auto">
          <svg
            viewBox={`0 0 ${gridWidth * CELL_SIZE} ${gridHeight * CELL_SIZE}`}
            className="w-full h-auto max-h-[58vh] block rounded-lg border border-slate-800 shadow-inner bg-slate-900"
            onMouseLeave={() => setHoveredCell(null)}
          >
            <defs>
              {/* Wall Pattern */}
              <pattern id="wall-pattern" width="14" height="14" patternUnits="userSpaceOnUse">
                <rect width="14" height="14" fill="#1e293b" />
                <path d="M 0 7 L 14 7 M 7 0 L 7 7 M 0 14 L 14 14 M 14 7 L 14 14" stroke="#0f172a" strokeWidth="1.5" />
              </pattern>
              {/* Difficult Terrain Pattern */}
              <pattern id="diff-pattern" width="10" height="10" patternUnits="userSpaceOnUse">
                <rect width="10" height="10" fill="#3f2717" />
                <path d="M 0 10 L 10 0 M 5 15 L 15 5" stroke="#78350f" strokeWidth="1.5" />
              </pattern>
              {/* Half Cover Pattern */}
              <pattern id="half-cover-pattern" width="12" height="12" patternUnits="userSpaceOnUse">
                <rect width="12" height="12" fill="#2d2319" />
                <circle cx="6" cy="6" r="3" fill="#b45309" opacity="0.3" />
              </pattern>
            </defs>

            {/* Grid Background Cells */}
            {Array.from({ length: gridHeight }).map((_, y) =>
              Array.from({ length: gridWidth }).map((_, x) => {
                const cell = cellMap.get(`${x},${y}`);
                const isWall = cell?.type === 'wall';
                const isHalfCover = cell?.type === 'half_cover';
                const isDifficult = cell?.type === 'difficult_terrain';
                const isHovered = hoveredCell?.x === x && hoveredCell?.y === y;

                return (
                  <g key={`cell-${x}-${y}`}>
                    <rect
                      x={x * CELL_SIZE}
                      y={y * CELL_SIZE}
                      width={CELL_SIZE}
                      height={CELL_SIZE}
                      fill={
                        isWall
                          ? 'url(#wall-pattern)'
                          : isHalfCover
                          ? 'url(#half-cover-pattern)'
                          : isDifficult
                          ? 'url(#diff-pattern)'
                          : '#090d16'
                      }
                      stroke={isHovered ? '#38bdf8' : '#1e293b'}
                      strokeWidth={isHovered ? '2' : '1'}
                    />

                    {/* Half Cover Text badge on cell */}
                    {isHalfCover && (
                      <text
                        x={x * CELL_SIZE + CELL_SIZE / 2}
                        y={y * CELL_SIZE + CELL_SIZE / 2 + 4}
                        fill="#f59e0b"
                        fontSize="9"
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                        opacity="0.9"
                      >
                        +2 AC
                      </text>
                    )}

                    {/* Difficult terrain text tag */}
                    {isDifficult && (
                      <text
                        x={x * CELL_SIZE + CELL_SIZE / 2}
                        y={y * CELL_SIZE + CELL_SIZE / 2 + 4}
                        fill="#ea580c"
                        fontSize="9"
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                        opacity="0.9"
                      >
                        2x MV
                      </text>
                    )}
                  </g>
                );
              })
            )}

            {/* Movement Preview Path highlight */}
            {previewPath &&
              previewPath.map((step, idx) => (
                <rect
                  key={`path-${idx}`}
                  x={step.x * CELL_SIZE + 2}
                  y={step.y * CELL_SIZE + 2}
                  width={CELL_SIZE - 4}
                  height={CELL_SIZE - 4}
                  rx="6"
                  fill={canAffordMove ? 'rgba(6, 182, 212, 0.25)' : 'rgba(239, 68, 68, 0.25)'}
                  stroke={canAffordMove ? '#06b6d4' : '#ef4444'}
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                />
              ))}

            {/* Attack Range Circle (when action is selected) */}
            {selectedAction && (
              <circle
                cx={player.spatial.x * CELL_SIZE + CELL_SIZE / 2}
                cy={player.spatial.y * CELL_SIZE + CELL_SIZE / 2}
                r={((selectedAction.rangeFt || selectedAction.reachFt || 5) / 5) * CELL_SIZE}
                fill="rgba(245, 158, 11, 0.08)"
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="5 3"
                pointerEvents="none"
              />
            )}

            {/* Raycasting Sightlines when hovering over a target */}
            {hoveredCombatant && hoveredCombatant.id !== player.id && coverResult && (
              <g pointerEvents="none">
                {/* Central targeting line */}
                <line
                  x1={player.spatial.x * CELL_SIZE + CELL_SIZE / 2}
                  y1={player.spatial.y * CELL_SIZE + CELL_SIZE / 2}
                  x2={hoveredCombatant.spatial.x * CELL_SIZE + CELL_SIZE / 2}
                  y2={hoveredCombatant.spatial.y * CELL_SIZE + CELL_SIZE / 2}
                  stroke={
                    coverResult.cover === 'none' ? '#10b981' :
                    coverResult.cover === 'half' ? '#f59e0b' :
                    coverResult.cover === 'three-quarters' ? '#f97316' : '#ef4444'
                  }
                  strokeWidth="2"
                  strokeDasharray="6 3"
                />

                {/* 4 Corner Raycast sightlines */}
                {[
                  { dx: 0.1, dy: 0.1 },
                  { dx: 0.9, dy: 0.1 },
                  { dx: 0.1, dy: 0.9 },
                  { dx: 0.9, dy: 0.9 },
                ].map((offset, i) => (
                  <line
                    key={`ray-${i}`}
                    x1={player.spatial.x * CELL_SIZE + CELL_SIZE / 2}
                    y1={player.spatial.y * CELL_SIZE + CELL_SIZE / 2}
                    x2={hoveredCombatant!.spatial.x * CELL_SIZE + offset.dx * CELL_SIZE}
                    y2={hoveredCombatant!.spatial.y * CELL_SIZE + offset.dy * CELL_SIZE}
                    stroke={coverResult!.blockedRays > i ? '#ef4444' : '#10b981'}
                    strokeWidth="0.8"
                    opacity="0.45"
                  />
                ))}
              </g>
            )}

            {/* Interactive Cell Click & Hover overlay */}
            {Array.from({ length: gridHeight }).map((_, y) =>
              Array.from({ length: gridWidth }).map((_, x) => (
                <rect
                  key={`interactive-${x}-${y}`}
                  x={x * CELL_SIZE}
                  y={y * CELL_SIZE}
                  width={CELL_SIZE}
                  height={CELL_SIZE}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredCell({ x, y })}
                  onClick={() => handleCellClick(x, y)}
                />
              ))
            )}

            {/* Combatant Tokens */}
            {combatants.map((c) => {
              if (c.vitals.currentHp <= 0) return null; // Downed

              const isCurrentPlayer = c.id === player.id;
              const isFriendly = c.isFriendly;
              const hpRatio = Math.max(0, Math.min(1, c.vitals.currentHp / c.vitals.maxHp));

              const cx = c.spatial.x * CELL_SIZE + CELL_SIZE / 2;
              const cy = c.spatial.y * CELL_SIZE + CELL_SIZE / 2;

              return (
                <g
                  key={c.id}
                  className="cursor-pointer transition-all"
                  onClick={() => handleCellClick(c.spatial.x, c.spatial.y)}
                  onMouseEnter={() => setHoveredCell({ x: c.spatial.x, y: c.spatial.y })}
                >
                  {/* Aura for player */}
                  {isCurrentPlayer && (
                    <circle cx={cx} cy={cy} r={CELL_SIZE * 0.44} fill="none" stroke="#38bdf8" strokeWidth="2.5" className="animate-pulse" />
                  )}

                  {/* Token Outer Ring */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={CELL_SIZE * 0.38}
                    fill={
                      isCurrentPlayer ? '#0f172a' :
                      isFriendly ? '#064e3b' :
                      c.aiType === 'static_dummy' ? '#334155' : '#450a0a'
                    }
                    stroke={
                      isCurrentPlayer ? '#38bdf8' :
                      isFriendly ? '#10b981' :
                      c.aiType === 'static_dummy' ? '#64748b' : '#ef4444'
                    }
                    strokeWidth="2.5"
                  />

                  {/* Initial Letters */}
                  <text
                    x={cx}
                    y={cy + 5}
                    fill="#ffffff"
                    fontSize="13"
                    fontWeight="bold"
                    fontFamily="sans-serif"
                    textAnchor="middle"
                    pointerEvents="none"
                  >
                    {c.name.slice(0, 2).toUpperCase()}
                  </text>

                  {/* Dodging condition shield indicator */}
                  {c.conditions.includes('dodging') && (
                    <circle cx={cx + 14} cy={cy - 14} r="7" fill="#0284c7" stroke="#ffffff" strokeWidth="1" />
                  )}

                  {/* Stealth / Hiding indicator */}
                  {c.spatial.isHiding && (
                    <circle cx={cx - 14} cy={cy - 14} r="7" fill="#7e22ce" stroke="#ffffff" strokeWidth="1" />
                  )}

                  {/* Mini HP Bar above token */}
                  <rect x={cx - 18} y={cy - 24} width="36" height="4" rx="2" fill="#1e293b" />
                  <rect
                    x={cx - 18}
                    y={cy - 24}
                    width={36 * hpRatio}
                    height="4"
                    rx="2"
                    fill={hpRatio > 0.5 ? '#10b981' : hpRatio > 0.25 ? '#f59e0b' : '#ef4444'}
                  />

                  {/* Name Label */}
                  <text
                    x={cx}
                    y={cy + 25}
                    fill="#cbd5e1"
                    fontSize="9"
                    fontFamily="sans-serif"
                    fontWeight="bold"
                    textAnchor="middle"
                    pointerEvents="none"
                  >
                    {c.name.split(' ')[0]} ({c.vitals.currentHp})
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Detailed Interactive Hover Tooltip Bar */}
      <div className="px-3 py-2 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        {hoveredCell ? (
          <div className="flex flex-wrap items-center gap-3 text-slate-300">
            {/* Tile Coordinate & Type */}
            <div className="flex items-center gap-1.5 font-mono">
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[11px]">
                Tile [{hoveredCell.x}, {hoveredCell.y}]
              </span>
              <span className="font-bold text-slate-200">
                {currentHoveredGridCell?.type === 'wall' ? '🧱 Solid Wall' :
                 currentHoveredGridCell?.type === 'half_cover' ? '📦 Cargo Crates (Half Cover)' :
                 currentHoveredGridCell?.type === 'difficult_terrain' ? '⚠️ Cobblestone Rubble (Difficult Terrain)' :
                 '🟢 Stone Floor'}
              </span>
            </div>

            {/* Tactical Rule Detail for tile */}
            <span className="text-[11px] text-slate-400">
              {currentHoveredGridCell?.type === 'wall' ? 'Blocks physical movement and all line-of-sight.' :
               currentHoveredGridCell?.type === 'half_cover' ? 'Grants +2 AC and +2 Dexterity saving throws against ranged attacks through this tile.' :
               currentHoveredGridCell?.type === 'difficult_terrain' ? 'Costs 10 ft of movement per 5-ft square (2x movement cost).' :
               'Standard terrain. Costs 5 ft movement, provides no cover.'}
            </span>

            {/* If token is on tile */}
            {hoveredCombatant && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
                <span className="font-bold text-amber-300">{hoveredCombatant.name}:</span>
                <span className="font-mono text-[11px]">{hoveredCombatant.vitals.currentHp}/{hoveredCombatant.vitals.maxHp} HP</span>
                <span className="font-mono text-[11px] text-sky-300">AC {hoveredCombatant.vitals.baseAc}</span>
                {coverResult && (
                  <span className={`px-1.5 py-0.2 rounded font-mono font-bold text-[10px] ${
                    coverResult.cover === 'none' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                    coverResult.cover === 'half' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                    'bg-orange-950 text-orange-400 border border-orange-800'
                  }`}>
                    Sightline Cover: {coverResult.cover.toUpperCase()} (+{coverResult.acBonus} AC)
                  </span>
                )}
                <span className="text-slate-400 text-[11px]">({targetDistanceFt} ft away)</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-slate-400 text-[11px] flex items-center gap-1.5 italic">
            <Info className="w-3.5 h-3.5 text-slate-500" />
            Hover over any grid tile, obstacle, or creature to inspect tactical properties, cover bonuses, and movement costs.
          </div>
        )}

        {/* Path cost when moving */}
        {previewPath && (
          <div className="flex items-center gap-2 font-mono text-[11px] ml-auto">
            <Footprints className="w-3.5 h-3.5 text-cyan-400" />
            <span>Path: <strong className={canAffordMove ? 'text-cyan-300' : 'text-rose-400'}>{totalPathCost} ft</strong></span>
            <span className="text-slate-600">/</span>
            <span>Budget: <strong className="text-slate-300">{player.budget.movementRemainingFt} ft</strong></span>
            {!canAffordMove && <span className="text-rose-400 font-bold ml-1">Insufficient MV</span>}
          </div>
        )}
      </div>
    </div>
  );
};
