import { GridCell } from '../types/combat';

interface PathNode {
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
  parent?: PathNode;
}

export function findPath(
  startX: number,
  startY: number,
  targetX: number,
  targetY: number,
  grid: GridCell[],
  gridWidth: number,
  gridHeight: number,
  occupiedTiles: Set<string> // "x,y"
): Array<{ x: number; y: number; costFt: number }> | null {
  if (startX === targetX && startY === targetY) return [];

  const cellMap = new Map<string, GridCell>();
  grid.forEach((c) => cellMap.set(`${c.x},${c.y}`, c));

  const openList: PathNode[] = [];
  const closedSet = new Set<string>();

  const startNode: PathNode = {
    x: startX,
    y: startY,
    g: 0,
    h: Math.max(Math.abs(startX - targetX), Math.abs(startY - targetY)) * 5,
    f: 0,
  };
  startNode.f = startNode.g + startNode.h;
  openList.push(startNode);

  const neighbors = [
    { dx: 0, dy: -1 }, // North
    { dx: 1, dy: 0 },  // East
    { dx: 0, dy: 1 },  // South
    { dx: -1, dy: 0 }, // West
    { dx: 1, dy: -1 }, // NE
    { dx: 1, dy: 1 },  // SE
    { dx: -1, dy: 1 }, // SW
    { dx: -1, dy: -1 },// NW
  ];

  while (openList.length > 0) {
    // Sort by lowest f
    openList.sort((a, b) => a.f - b.f);
    const current = openList.shift()!;
    const currentKey = `${current.x},${current.y}`;

    if (current.x === targetX && current.y === targetY) {
      // Reconstruct path
      const path: Array<{ x: number; y: number; costFt: number }> = [];
      let curr: PathNode | undefined = current;
      while (curr && (curr.x !== startX || curr.y !== startY)) {
        const cell = cellMap.get(`${curr.x},${curr.y}`);
        const costFt = cell?.type === 'difficult_terrain' ? 10 : 5;
        path.unshift({ x: curr.x, y: curr.y, costFt });
        curr = curr.parent;
      }
      return path;
    }

    closedSet.add(currentKey);

    for (const offset of neighbors) {
      const nx = current.x + offset.dx;
      const ny = current.y + offset.dy;
      const nKey = `${nx},${ny}`;

      if (nx < 0 || nx >= gridWidth || ny < 0 || ny >= gridHeight) continue;
      if (closedSet.has(nKey)) continue;

      const cell = cellMap.get(nKey);
      if (cell && cell.type === 'wall') continue; // Cannot walk through walls

      // Check occupied (unless it's the target tile)
      if (occupiedTiles.has(nKey) && !(nx === targetX && ny === targetY)) continue;

      // Diagonal movement across adjacent corner walls check (no corner-cutting through solid walls)
      if (offset.dx !== 0 && offset.dy !== 0) {
        const wall1 = cellMap.get(`${current.x + offset.dx},${current.y}`);
        const wall2 = cellMap.get(`${current.x},${current.y + offset.dy}`);
        if (wall1?.type === 'wall' && wall2?.type === 'wall') {
          continue; // Blocked by two adjacent walls corner-cutting
        }
      }

      const moveCost = cell?.type === 'difficult_terrain' ? 10 : 5;
      const g = current.g + moveCost;
      const h = Math.max(Math.abs(nx - targetX), Math.abs(ny - targetY)) * 5;
      const f = g + h;

      const existingIndex = openList.findIndex((n) => n.x === nx && n.y === ny);
      if (existingIndex !== -1) {
        if (g < openList[existingIndex].g) {
          openList[existingIndex].g = g;
          openList[existingIndex].f = f;
          openList[existingIndex].parent = current;
        }
      } else {
        openList.push({ x: nx, y: ny, g, h, f, parent: current });
      }
    }
  }

  return null; // No path found
}
