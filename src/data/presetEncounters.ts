import { Combatant, GridCell } from '../types/combat';

export interface EncounterPreset {
  id: string;
  title: string;
  difficulty: 'Easy (Practice)' | 'Medium' | 'Hard' | 'Deadly';
  description: string;
  tacticalFocus: string;
  gridWidth: number;
  gridHeight: number;
  gridCells: GridCell[];
  enemies: Combatant[];
  allies?: Combatant[];
  suggestedPlayerPosition: { x: number; y: number };
}

export const PRESET_CHARACTERS: Record<string, Combatant> = {
  arty: {
    id: 'pc-arty',
    name: 'Arty',
    archetype: 'Phantom Rogue 3',
    race: 'Dhampir',
    isPlayer: true,
    isFriendly: true,
    aiType: 'none',
    vitals: {
      maxHp: 24,
      currentHp: 24,
      tempHp: 0,
      baseAc: 15,
      speedFt: 35,
      initiativeMod: 4,
    },
    attributes: { str: 10, dex: 18, con: 15, int: 12, wis: 13, cha: 13 },
    saves: ['dex', 'int'],
    skills: { stealth: 8, acrobatics: 6, perception: 3, sleightOfHand: 8 },
    budget: {
      movementTotalFt: 35,
      movementRemainingFt: 35,
      actionAvailable: true,
      bonusActionAvailable: true,
      reactionAvailable: true,
      freeInteractionAvailable: true,
    },
    resources: [
      { id: 'sneak_attack', name: 'Sneak Attack (+2d6)', current: 1, max: 1, refreshOn: 'turnStart' },
      { id: 'wails_grave', name: 'Wails from the Grave', current: 2, max: 2, refreshOn: 'longRest' },
      { id: 'vampiric_bite', name: 'Empowered Bite', current: 2, max: 2, refreshOn: 'longRest' },
    ],
    actionDeck: {
      actions: [
        {
          id: 'arty-rapier',
          name: 'Rapier',
          cost: 'action',
          type: 'melee_weapon',
          toHitMod: 6,
          damageFormula: '1d8 + 4',
          damageType: 'piercing',
          reachFt: 5,
          description: '+6 to hit, reach 5 ft. Hit: 1d8+4 piercing.',
          riders: ['sneak_attack'],
        },
        {
          id: 'arty-dagger',
          name: 'Dagger (Melee/Thrown)',
          cost: 'action',
          type: 'ranged_weapon',
          toHitMod: 6,
          damageFormula: '1d4 + 4',
          damageType: 'piercing',
          rangeFt: 20,
          longRangeFt: 60,
          description: '+6 to hit, range 20/60 ft. Finesse, light, thrown.',
          riders: ['sneak_attack'],
        },
        {
          id: 'arty-sling',
          name: 'Sling',
          cost: 'action',
          type: 'ranged_weapon',
          toHitMod: 6,
          damageFormula: '1d4 + 4',
          damageType: 'bludgeoning',
          rangeFt: 30,
          longRangeFt: 120,
          description: '+6 to hit, range 30/120 ft.',
          riders: ['sneak_attack'],
        },
        {
          id: 'arty-bite',
          name: 'Vampiric Bite',
          cost: 'action',
          type: 'melee_weapon',
          toHitMod: 4,
          damageFormula: '1d4 + 2',
          damageType: 'piercing',
          reachFt: 5,
          description: '+4 to hit (CON). Advantage when <= 12 HP. Can empower to heal equal to damage.',
        },
        {
          id: 'base-dash',
          name: 'Dash',
          cost: 'action',
          type: 'utility',
          description: 'Double movement speed for the turn.',
        },
        {
          id: 'base-dodge',
          name: 'Dodge',
          cost: 'action',
          type: 'utility',
          description: 'Attack rolls against you have disadvantage until next turn.',
        },
      ],
      bonusActions: [
        {
          id: 'cunning-dash',
          name: 'Cunning Action: Dash',
          cost: 'bonus',
          type: 'class_feature',
          description: 'Gain extra movement equal to your speed for the turn.',
        },
        {
          id: 'cunning-disengage',
          name: 'Cunning Action: Disengage',
          cost: 'bonus',
          type: 'class_feature',
          description: 'Your movement does not provoke opportunity attacks for the rest of the turn.',
        },
        {
          id: 'cunning-hide',
          name: 'Cunning Action: Hide',
          cost: 'bonus',
          type: 'class_feature',
          description: 'Attempt to hide if you have cover or are obscured from enemy line of sight.',
        },
        {
          id: 'steady-aim',
          name: 'Steady Aim',
          cost: 'bonus',
          type: 'class_feature',
          description: 'Gain advantage on next attack roll this turn. Reduces remaining movement to 0 ft.',
        },
      ],
      reactions: [
        {
          id: 'uncanny-dodge',
          name: 'Uncanny Dodge',
          cost: 'reaction',
          type: 'class_feature',
          triggerCondition: 'Hit by an attacker you can see',
          description: 'Halve the damage taken from an incoming attack.',
        },
        {
          id: 'base-oa',
          name: 'Opportunity Attack',
          cost: 'reaction',
          type: 'melee_weapon',
          triggerCondition: 'Enemy leaves your 5-ft reach',
          description: 'Make one melee attack against a fleeing enemy.',
        },
      ],
      passives: [
        { id: 'darkvision', name: 'Darkvision', description: 'See in dim light and darkness up to 60 ft.' },
        { id: 'spider-climb', name: 'Spider Climb', description: 'Climb speed 35 ft. Move across walls and ceilings hands-free.' },
        { id: 'deathless', name: 'Deathless Nature', description: 'You do not need to breathe.' },
      ],
    },
    spatial: {
      x: 1,
      y: 6,
      elevationFt: 0,
      isHiding: false,
      hasCover: 'none',
    },
    conditions: [],
  },

  valeros: {
    id: 'pc-valeros',
    name: 'Valeros',
    archetype: 'Champion Fighter 3',
    race: 'Human',
    isPlayer: true,
    isFriendly: true,
    aiType: 'none',
    vitals: {
      maxHp: 28,
      currentHp: 28,
      tempHp: 0,
      baseAc: 17, // Chain Mail + Shield / Greatsword stance
      speedFt: 30,
      initiativeMod: 1,
    },
    attributes: { str: 16, dex: 13, con: 15, int: 10, wis: 12, cha: 8 },
    saves: ['str', 'con'],
    skills: { athletics: 5, perception: 3, intimidation: 2 },
    budget: {
      movementTotalFt: 30,
      movementRemainingFt: 30,
      actionAvailable: true,
      bonusActionAvailable: true,
      reactionAvailable: true,
      freeInteractionAvailable: true,
    },
    resources: [
      { id: 'action_surge', name: 'Action Surge', current: 1, max: 1, refreshOn: 'shortRest' },
      { id: 'second_wind', name: 'Second Wind', current: 1, max: 1, refreshOn: 'shortRest' },
    ],
    actionDeck: {
      actions: [
        {
          id: 'valeros-greatsword',
          name: 'Greatsword',
          cost: 'action',
          type: 'melee_weapon',
          toHitMod: 5,
          damageFormula: '2d6 + 3',
          damageType: 'slashing',
          reachFt: 5,
          description: '+5 to hit, reach 5 ft. Hit: 2d6+3 slashing. Crits on 19-20.',
        },
        {
          id: 'valeros-crossbow',
          name: 'Heavy Crossbow',
          cost: 'action',
          type: 'ranged_weapon',
          toHitMod: 3,
          damageFormula: '1d10 + 1',
          damageType: 'piercing',
          rangeFt: 100,
          longRangeFt: 400,
          description: '+3 to hit, range 100/400 ft.',
        },
      ],
      bonusActions: [
        {
          id: 'valeros-second-wind',
          name: 'Second Wind',
          cost: 'bonus',
          type: 'class_feature',
          description: 'Regain 1d10 + 3 hit points.',
          resourceCost: { resourceId: 'second_wind', amount: 1 },
        },
      ],
      reactions: [
        {
          id: 'valeros-oa',
          name: 'Opportunity Attack',
          cost: 'reaction',
          type: 'melee_weapon',
          triggerCondition: 'Enemy leaves your 5-ft reach',
          description: 'Make a melee weapon attack.',
        },
      ],
      passives: [
        { id: 'improved-critical', name: 'Improved Critical', description: 'Weapon attacks score a critical hit on a roll of 19 or 20.' },
      ],
    },
    spatial: {
      x: 1,
      y: 6,
      elevationFt: 0,
      isHiding: false,
      hasCover: 'none',
    },
    conditions: [],
  },

  ellywick: {
    id: 'pc-ellywick',
    name: 'Ellywick',
    archetype: 'Evocation Wizard 3',
    race: 'Gnome',
    isPlayer: true,
    isFriendly: true,
    aiType: 'none',
    vitals: {
      maxHp: 18,
      currentHp: 18,
      tempHp: 0,
      baseAc: 12, // 15 with Mage Armor
      speedFt: 25,
      initiativeMod: 2,
    },
    attributes: { str: 8, dex: 14, con: 14, int: 16, wis: 12, cha: 10 },
    saves: ['int', 'wis'],
    skills: { arcana: 5, history: 5, investigation: 5 },
    budget: {
      movementTotalFt: 25,
      movementRemainingFt: 25,
      actionAvailable: true,
      bonusActionAvailable: true,
      reactionAvailable: true,
      freeInteractionAvailable: true,
    },
    resources: [
      { id: 'spell_slot_1', name: '1st Level Spell Slots', current: 4, max: 4, refreshOn: 'longRest' },
      { id: 'spell_slot_2', name: '2nd Level Spell Slots', current: 2, max: 2, refreshOn: 'longRest' },
    ],
    actionDeck: {
      actions: [
        {
          id: 'ellywick-firebolt',
          name: 'Fire Bolt',
          cost: 'action',
          type: 'spell_attack',
          toHitMod: 5,
          damageFormula: '1d10',
          damageType: 'fire',
          rangeFt: 120,
          description: '+5 to hit, range 120 ft. Hit: 1d10 fire damage.',
        },
        {
          id: 'ellywick-magic-missile',
          name: 'Magic Missile (1st Level)',
          cost: 'action',
          type: 'spell_attack',
          damageFormula: '3d4 + 3',
          damageType: 'force',
          rangeFt: 120,
          description: 'Three darts automatically hit for 1d4+1 force damage each.',
          resourceCost: { resourceId: 'spell_slot_1', amount: 1 },
        },
      ],
      bonusActions: [
        {
          id: 'ellywick-misty-step',
          name: 'Misty Step (2nd Level)',
          cost: 'bonus',
          type: 'class_feature',
          description: 'Teleport up to 30 feet to an unoccupied space you can see.',
          resourceCost: { resourceId: 'spell_slot_2', amount: 1 },
        },
      ],
      reactions: [
        {
          id: 'ellywick-shield',
          name: 'Shield',
          cost: 'reaction',
          type: 'class_feature',
          triggerCondition: 'Hit by an attack or targeted by Magic Missile',
          description: 'Gain +5 bonus to AC until start of next turn.',
          resourceCost: { resourceId: 'spell_slot_1', amount: 1 },
        },
      ],
      passives: [
        { id: 'sculpt-spells', name: 'Sculpt Spells', description: 'Create pockets of relative safety for allies within your evocation spells.' },
      ],
    },
    spatial: {
      x: 1,
      y: 6,
      elevationFt: 0,
      isHiding: false,
      hasCover: 'none',
    },
    conditions: [],
  },
};

// Helper to construct grid
function createDefaultGrid(width: number, height: number, walls: Array<[number, number]>, halfCovers: Array<[number, number]>, difficults: Array<[number, number]>): GridCell[] {
  const cells: GridCell[] = [];
  const wallSet = new Set(walls.map(([x, y]) => `${x},${y}`));
  const halfSet = new Set(halfCovers.map(([x, y]) => `${x},${y}`));
  const diffSet = new Set(difficults.map(([x, y]) => `${x},${y}`));

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const key = `${x},${y}`;
      if (wallSet.has(key)) {
        cells.push({ x, y, type: 'wall' });
      } else if (halfSet.has(key)) {
        cells.push({ x, y, type: 'half_cover' });
      } else if (diffSet.has(key)) {
        cells.push({ x, y, type: 'difficult_terrain' });
      } else {
        cells.push({ x, y, type: 'floor' });
      }
    }
  }
  return cells;
}

export const PRESET_ENCOUNTERS: EncounterPreset[] = [
  {
    id: 'arena-duel',
    title: 'The Proving Grounds (1v1 Duel)',
    difficulty: 'Easy (Practice)',
    description: 'An open sand arena featuring two low stone pillars providing half cover. Excellent for testing martial weapon combos, movement kiting, and action economy loops.',
    tacticalFocus: 'Melee/Ranged weapon cycling, Turn budgets, Disengage vs Dash.',
    gridWidth: 10,
    gridHeight: 8,
    gridCells: createDefaultGrid(10, 8, [], [[3, 3], [3, 4], [6, 3], [6, 4]], [[4, 3], [5, 3]]),
    suggestedPlayerPosition: { x: 1, y: 3 },
    enemies: [
      {
        id: 'enemy-orc-bruiser',
        name: 'Orc Bruiser',
        race: 'Orc',
        isPlayer: false,
        isFriendly: false,
        aiType: 'melee_bruiser',
        vitals: { maxHp: 22, currentHp: 22, tempHp: 0, baseAc: 13, speedFt: 30, initiativeMod: 1 },
        attributes: { str: 16, dex: 12, con: 14, int: 7, wis: 11, cha: 10 },
        saves: ['str', 'con'],
        skills: { athletics: 5 },
        budget: { movementTotalFt: 30, movementRemainingFt: 30, actionAvailable: true, bonusActionAvailable: true, reactionAvailable: true, freeInteractionAvailable: true },
        resources: [],
        actionDeck: {
          actions: [
            {
              id: 'orc-greataxe',
              name: 'Greataxe',
              cost: 'action',
              type: 'melee_weapon',
              toHitMod: 5,
              damageFormula: '1d12 + 3',
              damageType: 'slashing',
              reachFt: 5,
              description: '+5 to hit, reach 5 ft. Hit: 1d12+3 slashing.',
            },
          ],
          bonusActions: [],
          reactions: [
            {
              id: 'orc-oa',
              name: 'Opportunity Attack',
              cost: 'reaction',
              type: 'melee_weapon',
              triggerCondition: 'Enemy leaves 5ft reach',
              description: 'Make one Greataxe attack.',
            },
          ],
          passives: [{ id: 'aggressive', name: 'Aggressive', description: 'Can move up to its speed toward a hostile creature as a bonus action.' }],
        },
        spatial: { x: 8, y: 3, elevationFt: 0, isHiding: false, hasCover: 'none' },
        conditions: [],
      },
    ],
  },

  {
    id: 'alley-ambush',
    title: 'The Alley Ambush (Cover & Ranged Kiting)',
    difficulty: 'Medium',
    description: 'A tight city alleyway flanked by solid brick buildings and waist-high cargo crates. A Goblin Sniper shoots from behind three-quarters cover while a Goblin Raider advances.',
    tacticalFocus: 'Dynamic Raycast Cover (+2 and +5 AC), Line of Sight, Cunning Action Hide.',
    gridWidth: 12,
    gridHeight: 9,
    gridCells: createDefaultGrid(
      12,
      9,
      // Solid Walls
      [[0, 0], [1, 0], [2, 0], [3, 0], [0, 8], [1, 8], [2, 8], [3, 8], [8, 0], [9, 0], [10, 0], [11, 0], [8, 8], [9, 8], [10, 8], [11, 8]],
      // Half-cover crates
      [[4, 2], [4, 6], [7, 3], [7, 4], [7, 5]],
      // Difficult terrain cobblestones
      [[5, 4], [6, 4]]
    ),
    suggestedPlayerPosition: { x: 2, y: 4 },
    enemies: [
      {
        id: 'enemy-goblin-raider',
        name: 'Goblin Raider',
        race: 'Goblin',
        isPlayer: false,
        isFriendly: false,
        aiType: 'melee_bruiser',
        vitals: { maxHp: 12, currentHp: 12, tempHp: 0, baseAc: 14, speedFt: 30, initiativeMod: 2 },
        attributes: { str: 8, dex: 14, con: 12, int: 10, wis: 8, cha: 8 },
        saves: ['dex'],
        skills: { stealth: 6 },
        budget: { movementTotalFt: 30, movementRemainingFt: 30, actionAvailable: true, bonusActionAvailable: true, reactionAvailable: true, freeInteractionAvailable: true },
        resources: [],
        actionDeck: {
          actions: [
            {
              id: 'gob-scimitar',
              name: 'Scimitar',
              cost: 'action',
              type: 'melee_weapon',
              toHitMod: 4,
              damageFormula: '1d6 + 2',
              damageType: 'slashing',
              reachFt: 5,
              description: '+4 to hit, reach 5 ft. Hit: 1d6+2 slashing.',
            },
          ],
          bonusActions: [],
          reactions: [
            {
              id: 'gob-oa',
              name: 'Opportunity Attack',
              cost: 'reaction',
              type: 'melee_weapon',
              triggerCondition: 'Enemy leaves 5ft reach',
              description: 'Make a melee attack.',
            },
          ],
          passives: [],
        },
        spatial: { x: 8, y: 2, elevationFt: 0, isHiding: false, hasCover: 'none' },
        conditions: [],
      },
      {
        id: 'enemy-goblin-sniper',
        name: 'Goblin Sniper',
        race: 'Goblin',
        isPlayer: false,
        isFriendly: false,
        aiType: 'ranged_skirmisher',
        vitals: { maxHp: 10, currentHp: 10, tempHp: 0, baseAc: 13, speedFt: 30, initiativeMod: 2 },
        attributes: { str: 8, dex: 15, con: 10, int: 10, wis: 10, cha: 8 },
        saves: ['dex'],
        skills: { stealth: 6 },
        budget: { movementTotalFt: 30, movementRemainingFt: 30, actionAvailable: true, bonusActionAvailable: true, reactionAvailable: true, freeInteractionAvailable: true },
        resources: [],
        actionDeck: {
          actions: [
            {
              id: 'gob-shortbow',
              name: 'Shortbow',
              cost: 'action',
              type: 'ranged_weapon',
              toHitMod: 4,
              damageFormula: '1d6 + 2',
              damageType: 'piercing',
              rangeFt: 80,
              longRangeFt: 320,
              description: '+4 to hit, range 80/320 ft. Hit: 1d6+2 piercing.',
            },
          ],
          bonusActions: [],
          reactions: [],
          passives: [{ id: 'nimble-escape', name: 'Nimble Escape', description: 'Can take Disengage or Hide as a bonus action.' }],
        },
        spatial: { x: 10, y: 5, elevationFt: 0, isHiding: false, hasCover: 'half' },
        conditions: [],
      },
    ],
  },

  {
    id: 'companion-anchor-skirmish',
    title: 'Party Synergy (Companion Anchor)',
    difficulty: 'Medium',
    description: 'You are fighting alongside an allied companion: Thorin the Dwarven Defender. Thorin stands on the frontline taking the Dodge action, creating an enemy threat zone that validates Sneak Attack proximity!',
    tacticalFocus: 'Sneak Attack ally-proximity triggers, flanking, front-line screen.',
    gridWidth: 10,
    gridHeight: 8,
    gridCells: createDefaultGrid(10, 8, [], [[4, 2], [4, 5]], []),
    suggestedPlayerPosition: { x: 2, y: 3 },
    allies: [
      {
        id: 'ally-thorin',
        name: 'Thorin (Dwarven Tank)',
        race: 'Dwarf',
        isPlayer: false,
        isFriendly: true,
        aiType: 'companion_tank',
        vitals: { maxHp: 35, currentHp: 35, tempHp: 0, baseAc: 18, speedFt: 25, initiativeMod: 0 },
        attributes: { str: 16, dex: 10, con: 16, int: 10, wis: 12, cha: 9 },
        saves: ['str', 'con'],
        skills: { athletics: 5 },
        budget: { movementTotalFt: 25, movementRemainingFt: 25, actionAvailable: true, bonusActionAvailable: true, reactionAvailable: true, freeInteractionAvailable: true },
        resources: [],
        actionDeck: {
          actions: [
            {
              id: 'thorin-warhammer',
              name: 'Warhammer',
              cost: 'action',
              type: 'melee_weapon',
              toHitMod: 5,
              damageFormula: '1d8 + 3',
              damageType: 'bludgeoning',
              reachFt: 5,
              description: '+5 to hit, reach 5 ft.',
            },
            {
              id: 'thorin-dodge',
              name: 'Dodge',
              cost: 'action',
              type: 'utility',
              description: 'Attacks against Thorin have disadvantage.',
            },
          ],
          bonusActions: [],
          reactions: [
            {
              id: 'thorin-oa',
              name: 'Opportunity Attack',
              cost: 'reaction',
              type: 'melee_weapon',
              triggerCondition: 'Enemy leaves reach',
              description: 'Strike with warhammer.',
            },
          ],
          passives: [{ id: 'dwarven-resilience', name: 'Dwarven Resilience', description: 'Advantage on saves vs poison.' }],
        },
        spatial: { x: 5, y: 3, elevationFt: 0, isHiding: false, hasCover: 'none' },
        conditions: ['dodging'],
      },
    ],
    enemies: [
      {
        id: 'enemy-veteran-thug',
        name: 'Veteran Thug',
        race: 'Human',
        isPlayer: false,
        isFriendly: false,
        aiType: 'melee_bruiser',
        vitals: { maxHp: 32, currentHp: 32, tempHp: 0, baseAc: 14, speedFt: 30, initiativeMod: 1 },
        attributes: { str: 16, dex: 12, con: 14, int: 10, wis: 10, cha: 11 },
        saves: ['str', 'con'],
        skills: { athletics: 5 },
        budget: { movementTotalFt: 30, movementRemainingFt: 30, actionAvailable: true, bonusActionAvailable: true, reactionAvailable: true, freeInteractionAvailable: true },
        resources: [],
        actionDeck: {
          actions: [
            {
              id: 'thug-mace',
              name: 'Heavy Mace',
              cost: 'action',
              type: 'melee_weapon',
              toHitMod: 5,
              damageFormula: '1d8 + 3',
              damageType: 'bludgeoning',
              reachFt: 5,
              description: '+5 to hit. Hit: 1d8+3 bludgeoning.',
            },
          ],
          bonusActions: [],
          reactions: [
            {
              id: 'thug-oa',
              name: 'Opportunity Attack',
              cost: 'reaction',
              type: 'melee_weapon',
              triggerCondition: 'Leaves reach',
              description: 'Make a mace strike.',
            },
          ],
          passives: [],
        },
        spatial: { x: 6, y: 3, elevationFt: 0, isHiding: false, hasCover: 'none' },
        conditions: [],
      },
    ],
  },

  {
    id: 'target-dummy-dpr',
    title: 'DPR Benchmark (Target Dummy)',
    difficulty: 'Easy (Practice)',
    description: 'A static training dummy with 100 HP and AC 15. The dummy never moves or retaliates. Use this to benchmark your multi-round damage per round (DPR), burst potential, and optimal turn rotations.',
    tacticalFocus: 'Pure DPR calculation, Burst vs Sustained rotations, Resource timing.',
    gridWidth: 8,
    gridHeight: 6,
    gridCells: createDefaultGrid(8, 6, [], [], []),
    suggestedPlayerPosition: { x: 1, y: 2 },
    enemies: [
      {
        id: 'enemy-dummy',
        name: 'Iron Training Dummy',
        isPlayer: false,
        isFriendly: false,
        aiType: 'static_dummy',
        vitals: { maxHp: 100, currentHp: 100, tempHp: 0, baseAc: 15, speedFt: 0, initiativeMod: -5 },
        attributes: { str: 10, dex: 10, con: 20, int: 1, wis: 1, cha: 1 },
        saves: [],
        skills: {},
        budget: { movementTotalFt: 0, movementRemainingFt: 0, actionAvailable: false, bonusActionAvailable: false, reactionAvailable: false, freeInteractionAvailable: false },
        resources: [],
        actionDeck: { actions: [], bonusActions: [], reactions: [], passives: [] },
        spatial: { x: 5, y: 2, elevationFt: 0, isHiding: false, hasCover: 'none' },
        conditions: [],
      },
    ],
  },
];
