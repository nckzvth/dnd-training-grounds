// Deterministic & Verifiable 5e Dice Engine

export interface RollResult {
  diceString: string;
  individualRolls: number[];
  modifier: number;
  total: number;
}

export interface AttackRollResult {
  d20: number;
  d20Second?: number; // In case of advantage/disadvantage
  advantageState: 'normal' | 'advantage' | 'disadvantage';
  modifier: number;
  total: number;
  isCrit: boolean;
  isFumble: boolean;
}

export function rollDice(formula: string): RollResult {
  // Clean formula: e.g. "1d8 + 4", "2d6", "1d4-1", "8"
  const clean = formula.replace(/\s+/g, '');
  const match = clean.match(/^(\d+)?d(\d+)([\+\-]\d+)?$/i);

  if (!match) {
    // Check if it's a static integer
    const staticNum = parseInt(clean, 10);
    if (!isNaN(staticNum)) {
      return { diceString: formula, individualRolls: [], modifier: staticNum, total: staticNum };
    }
    // Default fallback
    return { diceString: formula, individualRolls: [4], modifier: 0, total: 4 };
  }

  const count = match[1] ? parseInt(match[1], 10) : 1;
  const sides = parseInt(match[2], 10);
  const modifier = match[3] ? parseInt(match[3], 10) : 0;

  const rolls: number[] = [];
  let sum = 0;
  for (let i = 0; i < count; i++) {
    const val = Math.floor(Math.random() * sides) + 1;
    rolls.push(val);
    sum += val;
  }

  return {
    diceString: formula,
    individualRolls: rolls,
    modifier,
    total: Math.max(0, sum + modifier),
  };
}

export function rollD20(modifier: number = 0, state: 'normal' | 'advantage' | 'disadvantage' = 'normal'): AttackRollResult {
  const r1 = Math.floor(Math.random() * 20) + 1;
  if (state === 'normal') {
    return {
      d20: r1,
      advantageState: 'normal',
      modifier,
      total: r1 + modifier,
      isCrit: r1 === 20,
      isFumble: r1 === 1,
    };
  }

  const r2 = Math.floor(Math.random() * 20) + 1;
  const chosen = state === 'advantage' ? Math.max(r1, r2) : Math.min(r1, r2);

  return {
    d20: chosen,
    d20Second: chosen === r1 ? r2 : r1,
    advantageState: state,
    modifier,
    total: chosen + modifier,
    isCrit: chosen === 20,
    isFumble: chosen === 1,
  };
}

export function doubleDiceFormulaForCrit(formula: string): string {
  const clean = formula.replace(/\s+/g, '');
  const match = clean.match(/^(\d+)?d(\d+)([\+\-]\d+)?$/i);
  if (!match) return formula;

  const count = match[1] ? parseInt(match[1], 10) : 1;
  const sides = match[2];
  const mod = match[3] || '';

  return `${count * 2}d${sides}${mod}`;
}
