import { CoverEvaluation, GridCell } from '../types/combat';

interface Point {
  x: number;
  y: number;
}

interface Segment {
  p1: Point;
  p2: Point;
  type: 'wall' | 'half_cover';
}

function ccw(A: Point, B: Point, C: Point): boolean {
  return (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
}

// Check if line segment AB intersects with line segment CD
function lineSegmentsIntersect(A: Point, B: Point, C: Point, D: Point): boolean {
  return ccw(A, C, D) !== ccw(B, C, D) && ccw(A, B, C) !== ccw(A, B, D);
}

// Distance between two points in 5ft grid tiles
export function calculateDistanceFt(x1: number, y1: number, x2: number, y2: number, rule: 'chebyshev' | 'euclidean' = 'chebyshev'): number {
  const dx = Math.abs(x1 - x2);
  const dy = Math.abs(y1 - y2);

  if (rule === 'chebyshev') {
    // Standard 5e optional/common rule: diagonals cost 5ft (Chebyshev distance)
    return Math.max(dx, dy) * 5;
  }
  // Euclidean rounded to nearest 5 ft
  return Math.round(Math.hypot(dx, dy)) * 5;
}

export function evaluateCover(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  grid: GridCell[]
): CoverEvaluation {
  // If target is adjacent (5 ft), cover typically does not apply unless separated by a wall
  const distTiles = Math.max(Math.abs(fromX - toX), Math.abs(fromY - toY));
  if (distTiles === 0) {
    return { cover: 'none', acBonus: 0, dexSaveBonus: 0, blockedRays: 0, totalRays: 4 };
  }

  // Build obstacle line segments from grid cells
  const segments: Segment[] = [];
  grid.forEach((cell) => {
    if (cell.type === 'wall' || cell.type === 'half_cover') {
      const type = cell.type === 'wall' ? 'wall' : 'half_cover';
      const x = cell.x;
      const y = cell.y;
      
      // Add 4 perimeter edges of the cell with small margin so ray endpoints don't get falsely blocked on same tile
      const pad = 0.05;
      const left = x + pad;
      const right = x + 1 - pad;
      const top = y + pad;
      const bottom = y + 1 - pad;

      // Diagonal cross-segments inside the obstacle cell to ensure rays passing through are intercepted
      segments.push({ p1: { x: left, y: top }, p2: { x: right, y: bottom }, type });
      segments.push({ p1: { x: right, y: top }, p2: { x: left, y: bottom }, type });
      // Perimeter
      segments.push({ p1: { x: left, y: top }, p2: { x: right, y: top }, type });
      segments.push({ p1: { x: right, y: top }, p2: { x: right, y: bottom }, type });
      segments.push({ p1: { x: right, y: bottom }, p2: { x: left, y: bottom }, type });
      segments.push({ p1: { x: left, y: bottom }, p2: { x: left, y: top }, type });
    }
  });

  // Attacker points: 4 corners of tile
  const fromCorners: Point[] = [
    { x: fromX + 0.1, y: fromY + 0.1 },
    { x: fromX + 0.9, y: fromY + 0.1 },
    { x: fromX + 0.1, y: fromY + 0.9 },
    { x: fromX + 0.9, y: fromY + 0.9 },
  ];

  // Target points: 4 corners of tile
  const toCorners: Point[] = [
    { x: toX + 0.1, y: toY + 0.1 },
    { x: toX + 0.9, y: toY + 0.1 },
    { x: toX + 0.1, y: toY + 0.9 },
    { x: toX + 0.9, y: toY + 0.9 },
  ];

  // Find the single best attacker corner (the corner with cleanest line of sight, as per 5e DMG guidelines)
  let bestAttackerCorner = fromCorners[0];
  let minBlockedToCorners = 999;

  fromCorners.forEach((src) => {
    let blockedCount = 0;
    toCorners.forEach((dst) => {
      const isBlocked = segments.some((s) => s.type === 'wall' && lineSegmentsIntersect(src, dst, s.p1, s.p2));
      if (isBlocked) blockedCount++;
    });
    if (blockedCount < minBlockedToCorners) {
      minBlockedToCorners = blockedCount;
      bestAttackerCorner = src;
    }
  });

  // From that chosen best corner, cast 4 rays to each of the 4 target corners
  let fullWallBlocks = 0;
  let halfCoverBlocks = 0;

  toCorners.forEach((dst) => {
    let hitWall = false;
    let hitHalf = false;

    for (const s of segments) {
      if (lineSegmentsIntersect(bestAttackerCorner, dst, s.p1, s.p2)) {
        if (s.type === 'wall') {
          hitWall = true;
          break;
        } else if (s.type === 'half_cover') {
          hitHalf = true;
        }
      }
    }

    if (hitWall) {
      fullWallBlocks++;
    } else if (hitHalf) {
      halfCoverBlocks++;
    }
  });

  const totalBlocked = fullWallBlocks + halfCoverBlocks;

  if (fullWallBlocks === 4) {
    return { cover: 'total', acBonus: 999, dexSaveBonus: 999, blockedRays: 4, totalRays: 4 };
  }

  if (totalBlocked >= 3) {
    return { cover: 'three-quarters', acBonus: 5, dexSaveBonus: 5, blockedRays: totalBlocked, totalRays: 4 };
  }

  if (totalBlocked >= 1) {
    return { cover: 'half', acBonus: 2, dexSaveBonus: 2, blockedRays: totalBlocked, totalRays: 4 };
  }

  return { cover: 'none', acBonus: 0, dexSaveBonus: 0, blockedRays: 0, totalRays: 4 };
}
