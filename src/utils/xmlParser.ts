import { Combatant, ActionItem, ResourcePool } from '../types/combat';

export function parseFightClubXml(xmlString: string): Combatant {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

  // Check for parse errors
  const parseError = xmlDoc.querySelector('parsererror');
  if (parseError) {
    throw new Error('Invalid XML document. Please ensure this is a valid Fight Club 5e XML file.');
  }

  // Find character node
  const charNode = xmlDoc.querySelector('character');
  if (!charNode) {
    // If user dropped a monster XML instead of a character
    const monsterNode = xmlDoc.querySelector('monster');
    if (monsterNode) {
      return parseMonsterNode(monsterNode);
    }
    throw new Error('Could not find a <character> or <monster> tag in this XML file.');
  }

  const getText = (selector: string, fallback = ''): string => {
    return charNode.querySelector(selector)?.textContent?.trim() || fallback;
  };

  const getNum = (selector: string, fallback = 10): number => {
    const raw = getText(selector);
    const num = parseInt(raw.replace(/[^\d-]/g, ''), 10);
    return isNaN(num) ? fallback : num;
  };

  const name = getText('name', 'Fight Club Hero');
  const race = getText('race', 'Humanoid');
  const className = getText('class > name', getText('class', 'Adventurer'));
  const classLevel = getNum('class > level', 3);
  const archetype = `${className} ${classLevel}`;

  const maxHp = getNum('hp', 24);
  const baseAc = getNum('ac', 15);
  const speedFt = getNum('speed', 30);

  const str = getNum('ability > str', getNum('str', 10));
  const dex = getNum('ability > dex', getNum('dex', 14));
  const con = getNum('ability > con', getNum('con', 14));
  const int = getNum('ability > int', getNum('int', 10));
  const wis = getNum('ability > wis', getNum('wis', 12));
  const cha = getNum('ability > cha', getNum('cha', 10));

  const dexMod = Math.floor((dex - 10) / 2);
  const proficiency = Math.floor((classLevel - 1) / 4) + 2;

  const actions: ActionItem[] = [];
  const bonusActions: ActionItem[] = [];
  const reactions: ActionItem[] = [];
  const passives: Array<{ id: string; name: string; description: string }> = [];
  const resources: ResourcePool[] = [];

  // Parse items/weapons
  const items = Array.from(charNode.querySelectorAll('item'));
  items.forEach((item, idx) => {
    const itemName = item.querySelector('name')?.textContent?.trim() || `Item ${idx}`;
    const damage = item.querySelector('dmg1, damage')?.textContent?.trim();
    const type = item.querySelector('type')?.textContent?.trim() || 'M';
    const text = item.querySelector('text')?.textContent?.trim() || '';

    if (damage || type === 'M' || type === 'R') {
      const isRanged = type === 'R' || /bow|sling|crossbow|thrown/i.test(itemName);
      const isFinesse = /finesse/i.test(text) || /rapier|dagger|shortsword|scimitar/i.test(itemName);
      const atkMod = isFinesse ? Math.max(dexMod, Math.floor((str - 10) / 2)) + proficiency : (isRanged ? dexMod : Math.floor((str - 10) / 2)) + proficiency;

      actions.push({
        id: `fc-item-${idx}-${Date.now()}`,
        name: itemName,
        cost: 'action',
        type: isRanged ? 'ranged_weapon' : 'melee_weapon',
        toHitMod: atkMod,
        damageFormula: damage ? `${damage} + ${isFinesse ? Math.max(dexMod, Math.floor((str - 10) / 2)) : (isRanged ? dexMod : Math.floor((str - 10) / 2))}` : `1d6 + ${dexMod}`,
        damageType: /piercing/i.test(text) ? 'piercing' : /slashing/i.test(text) ? 'slashing' : 'bludgeoning',
        rangeFt: isRanged ? 60 : undefined,
        reachFt: isRanged ? undefined : 5,
        description: text || `${itemName} attack.`,
        riders: /rogue/i.test(className) ? ['sneak_attack'] : [],
      });
    }
  });

  // If no weapons were parsed, add standard unarmed strike
  if (actions.length === 0) {
    actions.push({
      id: 'fc-default-strike',
      name: 'Unarmed Strike',
      cost: 'action',
      type: 'melee_weapon',
      toHitMod: Math.floor((str - 10) / 2) + proficiency,
      damageFormula: `1 + ${Math.floor((str - 10) / 2)}`,
      damageType: 'bludgeoning',
      reachFt: 5,
      description: 'Standard melee attack.',
    });
  }

  // Standard utility actions
  actions.push({
    id: 'base-dash',
    name: 'Dash',
    cost: 'action',
    type: 'utility',
    description: 'Double movement speed for the current turn.',
  });
  actions.push({
    id: 'base-dodge',
    name: 'Dodge',
    cost: 'action',
    type: 'utility',
    description: 'Attack rolls against you have disadvantage until next turn.',
  });

  // Parse spells
  const spells = Array.from(charNode.querySelectorAll('spell'));
  spells.forEach((sp, idx) => {
    const spName = sp.querySelector('name')?.textContent?.trim() || `Spell ${idx}`;
    const level = parseInt(sp.querySelector('level')?.textContent?.trim() || '1', 10);
    const castingTime = sp.querySelector('time')?.textContent?.trim() || '1 Action';
    const range = sp.querySelector('range')?.textContent?.trim() || '30 ft';
    const text = sp.querySelector('text')?.textContent?.trim() || '';

    const isBonus = /bonus/i.test(castingTime);
    const isReaction = /reaction/i.test(castingTime);

    const actionObj: ActionItem = {
      id: `fc-spell-${idx}-${Date.now()}`,
      name: spName,
      cost: isReaction ? 'reaction' : isBonus ? 'bonus' : 'action',
      type: /attack/i.test(text) ? 'spell_attack' : 'class_feature',
      toHitMod: dexMod + proficiency, // Generic spell mod
      damageFormula: text.match(/(\d+d\d+)/)?.[1],
      description: text || `${spName} (Level ${level})`,
    };

    if (isReaction) {
      reactions.push(actionObj);
    } else if (isBonus) {
      bonusActions.push(actionObj);
    } else {
      actions.push(actionObj);
    }
  });

  // Detect Rogue features
  if (/rogue/i.test(className)) {
    bonusActions.push(
      { id: 'fc-cunning-dash', name: 'Cunning Action: Dash', cost: 'bonus', type: 'class_feature', description: 'Double movement speed as a bonus action.' },
      { id: 'fc-cunning-disengage', name: 'Cunning Action: Disengage', cost: 'bonus', type: 'class_feature', description: 'Avoid opportunity attacks.' },
      { id: 'fc-cunning-hide', name: 'Cunning Action: Hide', cost: 'bonus', type: 'class_feature', description: 'Hide if you have cover or are obscured.' },
      { id: 'fc-steady-aim', name: 'Steady Aim', cost: 'bonus', type: 'class_feature', description: 'Gain advantage on next attack, reduce speed to 0.' }
    );
    reactions.push({
      id: 'fc-uncanny-dodge',
      name: 'Uncanny Dodge',
      cost: 'reaction',
      type: 'class_feature',
      triggerCondition: 'Hit by an attacker you can see',
      description: 'Halve the damage taken from an attack.',
    });
    resources.push({ id: 'sneak_attack', name: 'Sneak Attack (+2d6)', current: 1, max: 1, refreshOn: 'turnStart' });
  }

  // Base Opportunity Attack
  reactions.push({
    id: 'base-oa',
    name: 'Opportunity Attack',
    cost: 'reaction',
    type: 'melee_weapon',
    triggerCondition: 'Enemy leaves your 5ft reach',
    description: 'Spend reaction to make a melee weapon attack.',
  });

  return {
    id: `fc-${Date.now()}`,
    name,
    race,
    archetype,
    isPlayer: true,
    isFriendly: true,
    aiType: 'none',
    vitals: {
      maxHp,
      currentHp: maxHp,
      tempHp: 0,
      baseAc,
      speedFt,
      initiativeMod: dexMod,
    },
    attributes: { str, dex, con, int, wis, cha },
    saves: ['dex', 'int'],
    skills: { stealth: dexMod + proficiency, acrobatics: dexMod + proficiency, perception: Math.floor((wis - 10) / 2) + proficiency },
    budget: {
      movementTotalFt: speedFt,
      movementRemainingFt: speedFt,
      actionAvailable: true,
      bonusActionAvailable: true,
      reactionAvailable: true,
      freeInteractionAvailable: true,
    },
    resources,
    actionDeck: {
      actions,
      bonusActions,
      reactions,
      passives,
    },
    spatial: {
      x: 1,
      y: 3,
      elevationFt: 0,
      isHiding: false,
      hasCover: 'none',
    },
    conditions: [],
  };
}

function parseMonsterNode(monsterNode: Element): Combatant {
  const getText = (selector: string, fallback = '') => monsterNode.querySelector(selector)?.textContent?.trim() || fallback;
  const getNum = (selector: string, fallback = 10) => {
    const raw = getText(selector);
    const num = parseInt(raw.replace(/[^\d-]/g, ''), 10);
    return isNaN(num) ? fallback : num;
  };

  const name = getText('name', 'Custom Monster');
  const maxHp = getNum('hp', 20);
  const baseAc = getNum('ac', 13);
  const speedFt = getNum('speed', 30);

  return {
    id: `monster-${Date.now()}`,
    name,
    race: getText('type', 'Monstrosity'),
    archetype: `CR ${getText('cr', '1')}`,
    isPlayer: false,
    isFriendly: false,
    aiType: 'melee_bruiser',
    vitals: {
      maxHp,
      currentHp: maxHp,
      tempHp: 0,
      baseAc,
      speedFt,
      initiativeMod: 1,
    },
    attributes: { str: 14, dex: 12, con: 14, int: 8, wis: 10, cha: 8 },
    saves: ['str'],
    skills: {},
    budget: {
      movementTotalFt: speedFt,
      movementRemainingFt: speedFt,
      actionAvailable: true,
      bonusActionAvailable: true,
      reactionAvailable: true,
      freeInteractionAvailable: true,
    },
    resources: [],
    actionDeck: {
      actions: [
        {
          id: 'mon-slam',
          name: 'Slam',
          cost: 'action',
          type: 'melee_weapon',
          toHitMod: 4,
          damageFormula: '1d8 + 2',
          damageType: 'bludgeoning',
          reachFt: 5,
          description: '+4 to hit, 1d8+2 bludgeoning.',
        },
      ],
      bonusActions: [],
      reactions: [],
      passives: [],
    },
    spatial: { x: 5, y: 3, elevationFt: 0, isHiding: false, hasCover: 'none' },
    conditions: [],
  };
}
