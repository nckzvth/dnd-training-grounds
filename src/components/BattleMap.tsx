import React, { useState } from 'react';
import { Combatant, GridCell, ActionItem, CoverEvaluation } from '../types/combat';
import { evaluateCover, calculateDistanceFt } from '../utils/raycastCover';
import { findPath } from '../utils/pathfinding';
import { Shield, Sparkles, Crosshair, Eye, Footprints, AlertTriangle } from 'lucide-react';

interface BattleMapProps {
  gridWidth: number;
  gridHeight: number;
  gridCells: GridCell[];
  combatants: Combatant[];
  player: Combatant;
  selectedAction: ActionItem | null;
  onMovePlayer: (newX: number, newY: number, costFt: number) => void;
  onTargetCombatant: (target: Combatant, action: ActionItem, cover: CoverEvaluation) => void;
  onHoverTargetChange?: (info: string | null) => void;
}

const CELL_SIZE = 56; // Pixels per 5ft square

export const BattleMap: React.FC<BattleMapProps> = ({
  gridWidth,
  gridHeight,
  gridCells,
  combatants,
  player,
  selectedAction,
  onMovePlayer,
  onTargetCombatant,
}) => {
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);

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
  let isInRange = false;

  if (hoveredCell) {
    const targetAtHover = combatantAtTile.get(`${hoveredCell.x},${hoveredCell.y}`);
    if (targetAtHover && targetAtHover.id !== player.id) {
      hoveredCombatant = targetAtHover;
      targetDistanceFt = calculateDistanceFt(player.spatial.x, player.spatial.y, targetAtHover.spatial.x, targetAtHover.spatial.y);
      coverResult = evaluateCover(player.spatial.x, player.spatial.y, targetAtHover.spatial.x, targetAtHover.spatial.y, gridCells);

      if (selectedAction) {
        const normalRange = selectedAction.rangeFt || selectedAction.reachFt || 5;
        const longRange = selectedAction.longRangeFt || normalRange;
        isInRange = targetDistanceFt <= longRange;
      }
    }
  }

  const handleCellClick = (x: number, y: number) => {
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
    <div className="relative flex flex-col items-center justify-center p-3 bg-slate-950 select-none overflow-hidden rounded-xl border border-slate-800 shadow-2xl">
      {/* Tactical Status Banner above map */}
      <div className="w-full mb-2 px-3 py-1.5 bg-slate-900/90 rounded-lg border border-slate-800 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2">
          {selectedAction ? (
            <span className="flex items-center gap-1.5 text-amber-400 font-semibold animate-pulse">
              <Crosshair className="w-4 h-4" />
              Targeting with: {selectedAction.name} (Range: {selectedAction.rangeFt || selectedAction.reachFt || 5} ft)
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-slate-400">
              <Footprints className="w-4 h-4 text-cyan-400" />
              Movement Mode: Click any tile to move. Remaining: <strong className="text-cyan-300">{player.budget.movementRemainingFt} ft</strong>
            </span>
          )}
        </div>

        {hoveredCombatant && (
          <div className="flex items-center gap-3">
            <span className="text-slate-200 font-bold">{hoveredCombatant.name}</span>
            <span className="text-slate-400">Distance: <strong className="text-slate-200">{targetDistanceFt} ft</strong></span>
            {coverResult && (
              <span className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold ${
                coverResult.cover === 'none' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                coverResult.cover === 'half' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                coverResult.cover === 'three-quarters' ? 'bg-orange-950 text-orange-400 border border-orange-800' :
                'bg-rose-950 text-rose-400 border border-rose-800'
              }`}>
                Cover: {coverResult.cover.toUpperCase()} ({coverResult.acBonus > 0 ? `+${coverResult.acBonus} AC` : '0 AC'})
              </span>
            )}
          </div>
        )}
      </div>

      {/* SVG Canvas Map */}
      <div className="relative overflow-auto max-w-full max-h-[70vh] border border-slate-700/60 rounded-lg shadow-inner bg-slate-900">
        <svg
          width={gridWidth * CELL_SIZE}
          height={gridHeight * CELL_SIZE}
          className="block"
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
                    stroke="#1e293b"
                    strokeWidth="1"
                    className="transition-colors"
                  />

                  {/* Half Cover Badge on cell */}
                  {isHalfCover && (
                    <text
                      x={x * CELL_SIZE + CELL_SIZE / 2}
                      y={y * CELL_SIZE + CELL_SIZE / 2 + 4}
                      fill="#f59e0b"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                      textAnchor="middle"
                      opacity="0.8"
                    >
                      +2 AC
                    </text>
                  )}

                  {/* Difficult terrain tag */}
                  {isDifficult && (
                    <text
                      x={x * CELL_SIZE + CELL_SIZE / 2}
                      y={y * CELL_SIZE + CELL_SIZE / 2 + 4}
                      fill="#ea580c"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                      textAnchor="middle"
                      opacity="0.8"
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
              fill="rgba(245, 158, 11, 0.07)"
              stroke="#f59e0b"
              strokeWidth="1.5"
              strokeDasharray="5 3"
              pointerEvents="none"
            />
          )}

          {/* Raycasting Sightlines when hovering over a target */}
          {hoveredCombatant && coverResult && (
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

              {/* 4 Corner Raycast sightlines visualization */}
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
                  strokeWidth="0.75"
                  opacity="0.4"
                />
              ))}
            </g>
          )}

          {/* Interactive Cell Hover & Click Handlers */}
          {Array.from({ length: gridHeight }).map((_, y) =>
            Array.from({ length: gridWidth }).map((_, x) => (
              <rect
                key={`interactive-${x}-${y}`}
                x={x * CELL_SIZE}
                y={y * CELL_SIZE}
                width={CELL_SIZE}
                height={CELL_SIZE}
                fill="transparent"
                className="cursor-pointer hover:stroke-cyan-500/50 hover:stroke-2"
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
                  strokeWidth="2"
                />

                {/* Initial Letter or Icon */}
                <text
                  x={cx}
                  y={cy + 4}
                  fill="#ffffff"
                  fontSize="14"
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
                  y={cy + 24}
                  fill="#94a3b8"
                  fontSize="8"
                  fontFamily="sans-serif"
                  fontWeight="600"
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

      {/* Movement & Path Cost Indicator */}
      {previewPath && (
        <div className="absolute bottom-6 left-6 px-3 py-1.5 rounded-lg bg-slate-900/95 border border-slate-700 shadow-xl text-xs flex items-center gap-2 pointer-events-none">
          <Footprints className="w-4 h-4 text-cyan-400" />
          <span>Path: <strong className={canAffordMove ? 'text-cyan-300' : 'text-rose-400'}>{totalPathCost} ft</strong></span>
          <span className="text-slate-500">|</span>
          <span>Budget: <strong className="text-slate-300">{player.budget.movementRemainingFt} ft</strong></span>
          {!canAffordMove && <span className="text-rose-400 font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Insufficient MV</span>}
        </div>
      )}
    </div>
  );
};
