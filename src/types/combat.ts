// Unified 5e Tactical Combat Engine Types

export type ActionCost = 'action' | 'bonus' | 'reaction' | 'movement' | 'free';

export interface ActionItem {
  id: string;
  name: string;
  cost: ActionCost;
  type: 'melee_weapon' | 'ranged_weapon' | 'spell_attack' | 'saving_throw_spell' | 'class_feature' | 'utility';
  toHitMod?: number;
  damageFormula?: string;
  damageType?: string;
  rangeFt?: number;
  longRangeFt?: number;
  reachFt?: number;
  saveType?: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
  saveDC?: number;
  description: string;
  resourceCost?: {
    resourceId: string;
    amount: number;
  };
  triggerCondition?: string; // For reactions
  riders?: string[]; // IDs for optional riders e.g. 'sneak_attack', 'divine_smite'
}

export interface ResourcePool {
  id: string;
  name: string;
  current: number;
  max: number;
  refreshOn: 'shortRest' | 'longRest' | 'turnStart';
}

export interface TurnBudget {
  movementTotalFt: number;
  movementRemainingFt: number;
  actionAvailable: boolean;
  bonusActionAvailable: boolean;
  reactionAvailable: boolean;
  freeInteractionAvailable: boolean;
}

export interface Combatant {
  id: string;
  name: string;
  archetype?: string;
  race?: string;
  isPlayer: boolean;
  isFriendly: boolean;
  aiType?: 'none' | 'static_dummy' | 'melee_bruiser' | 'ranged_skirmisher' | 'companion_tank';
  
  vitals: {
    maxHp: number;
    currentHp: number;
    tempHp: number;
    baseAc: number;
    speedFt: number;
    initiativeMod: number;
    currentInitiative?: number;
  };

  attributes: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };

  saves: Array<'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha'>;
  skills: Record<string, number>;

  budget: TurnBudget;
  resources: ResourcePool[];
  
  actionDeck: {
    actions: ActionItem[];
    bonusActions: ActionItem[];
    reactions: ActionItem[];
    passives: Array<{ id: string; name: string; description: string }>;
  };

  spatial: {
    x: number; // 0-indexed column
    y: number; // 0-indexed row
    elevationFt: number;
    isHiding: boolean;
    hasCover: 'none' | 'half' | 'three-quarters' | 'total';
  };

  conditions: Array<'blinded' | 'dodging' | 'hidden' | 'prone' | 'stunned' | 'unconscious'>;
  concentration?: {
    spellName: string;
    roundStarted: number;
  };
}

export type CellType = 'floor' | 'wall' | 'half_cover' | 'difficult_terrain';

export interface GridCell {
  x: number;
  y: number;
  type: CellType;
  label?: string;
}

export interface CoverEvaluation {
  cover: 'none' | 'half' | 'three-quarters' | 'total';
  acBonus: number;
  dexSaveBonus: number;
  blockedRays: number;
  totalRays: number;
}

export interface CombatLogEntry {
  id: string;
  timestamp: string;
  round: number;
  actorId?: string;
  actorName: string;
  type: 'action' | 'attack' | 'damage' | 'reaction' | 'rule' | 'turn' | 'heal';
  message: string;
  details?: {
    d20Roll?: number;
    modifier?: number;
    totalToHit?: number;
    targetAc?: number;
    isHit?: boolean;
    isCrit?: boolean;
    damageRolls?: string;
    damageTotal?: number;
    damageType?: string;
    coverBonusApplied?: number;
    ruleNotes?: string;
  };
}

export interface ReactionPrompt {
  id: string;
  title: string;
  description: string;
  combatantId: string;
  actionItem: ActionItem;
  options: Array<{
    label: string;
    primary?: boolean;
    onExecute: () => void;
  }>;
  onCancel: () => void;
}

export interface TelemetryRoundRecord {
  round: number;
  unusedBonusAction: boolean;
  unusedReaction: boolean;
  unspentMovementFt: number;
  endedInOpenLoS: boolean;
  resourcesSpent: number;
  damageDealt: number;
  damageTaken: number;
  overkillDamage: number;
}
