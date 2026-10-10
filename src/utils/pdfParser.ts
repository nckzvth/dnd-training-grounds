import { PDFDocument } from 'pdf-lib';
import { ActionItem, Combatant, ResourcePool } from '../types/combat';

export async function parseCharacterPdf(arrayBuffer: ArrayBuffer): Promise<Combatant> {
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const form = pdfDoc.getForm();
  const fields = form.getFields();

  // Create lookup dictionary of field values
  const map: Record<string, string> = {};
  for (const f of fields) {
    try {
      const name = f.getName();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const textVal = (f as any).getText?.();
      if (textVal !== undefined && textVal !== null) {
        map[name] = textVal.trim();
      }
    } catch {
      // Ignore non-text fields
    }
  }

  // Helper to query multiple possible field aliases
  const getVal = (...keys: string[]): string => {
    for (const k of keys) {
      if (map[k] !== undefined && map[k] !== '') {
        return map[k];
      }
    }
    return '';
  };

  const getNum = (defaultVal: number, ...keys: string[]): number => {
    const raw = getVal(...keys);
    const parsed = parseInt(raw.replace(/[^\d-]/g, ''), 10);
    return isNaN(parsed) ? defaultVal : parsed;
  };

  const name = getVal('Front_Character Name', 'CharacterName', 'Character Name') || 'Imported Hero';
  const archetype = getVal('Front_Archetype', 'ClassLevel', 'Class & Level') || 'Adventurer 3';
  const race = getVal('Front_Race', 'Race') || 'Humanoid';

  const maxHp = getNum(20, 'Front_Max HP', 'HPMax', 'Max HP', 'Front_Current HP', 'HPCurrent');
  const ac = getNum(15, 'Front_AC', 'AC', 'Armor Class');
  const speed = getNum(30, 'Front_Speed', 'Speed');
  const initiative = getNum(2, 'Front_Initiative', 'Initiative');

  const str = getNum(10, 'Front_Str Score', 'STR', 'Str Score');
  const dex = getNum(14, 'Front_Dex Score', 'DEX', 'Dex Score');
  const con = getNum(14, 'Front_Con Score', 'CON', 'Con Score');
  const int = getNum(10, 'Front_Int Score', 'INT', 'Int Score');
  const wis = getNum(12, 'Front_Wis Score', 'WIS', 'Wis Score');
  const cha = getNum(10, 'Front_Cha Score', 'CHA', 'Cha Score');

  const actions: ActionItem[] = [];
  const bonusActions: ActionItem[] = [];
  const reactions: ActionItem[] = [];
  const passives: Array<{ id: string; name: string; description: string }> = [];
  const resources: ResourcePool[] = [];

  // Parse Weapons from front table
  for (let i = 1; i <= 5; i++) {
    const wepName = getVal(`Front_Weapon Name ${i}`, `Wep Name ${i}`, `Weapon Name ${i}`, `Wep ${i}`);
    if (wepName) {
      const atkBonusStr = getVal(`Front_Weapon Atk Bonus ${i}`, `Wep Atk ${i}`, `Weapon Atk Bonus ${i}`);
      const dmgStr = getVal(`Front_Weapon Damage ${i}`, `Wep Dmg ${i}`, `Weapon Damage ${i}`);

      const toHitMod = parseInt(atkBonusStr.replace(/[^\d-]/g, ''), 10) || 4;
      
      // Determine range
      let isRanged = /bow|sling|crossbow|dart|thrown/i.test(wepName) || /range/i.test(dmgStr);
      let rangeFt = 5;
      let reachFt = 5;
      let longRangeFt = 5;

      const rangeMatch = dmgStr.match(/(\d+)\/(\d+)/);
      if (rangeMatch) {
        isRanged = true;
        rangeFt = parseInt(rangeMatch[1], 10);
        longRangeFt = parseInt(rangeMatch[2], 10);
      } else if (/sling/i.test(wepName)) {
        rangeFt = 30;
        longRangeFt = 120;
      } else if (/dagger/i.test(wepName)) {
        rangeFt = 20;
        longRangeFt = 60;
      } else if (/shortbow/i.test(wepName)) {
        rangeFt = 80;
        longRangeFt = 320;
      }

      // Clean formula: e.g. "1d8 + 4"
      const formulaMatch = dmgStr.match(/(\d+d\d+(?:\s*[+-]\s*\d+)?)/i);
      const damageFormula = formulaMatch ? formulaMatch[1].replace(/\s+/g, '') : '1d6+3';
      
      let damageType = 'piercing';
      if (/slashing/i.test(dmgStr)) damageType = 'slashing';
      if (/bludgeoning/i.test(dmgStr)) damageType = 'bludgeoning';
      if (/fire/i.test(dmgStr)) damageType = 'fire';
      if (/radiant/i.test(dmgStr)) damageType = 'radiant';

      actions.push({
        id: `wep-${i}-${Date.now()}`,
        name: wepName,
        cost: 'action',
        type: isRanged ? 'ranged_weapon' : 'melee_weapon',
        toHitMod,
        damageFormula,
        damageType,
        rangeFt: isRanged ? rangeFt : undefined,
        longRangeFt: isRanged ? longRangeFt : undefined,
        reachFt: isRanged ? undefined : reachFt,
        description: `${atkBonusStr ? atkBonusStr + ' to hit. ' : ''}${dmgStr}`,
        riders: /rogue/i.test(archetype) ? ['sneak_attack'] : [],
      });
    }
  }

  // Check for Rogue features
  const hasRogue = /rogue/i.test(archetype) || getVal('Front_Sneak Attack') !== '';
  if (hasRogue) {
    // Cunning Action
    bonusActions.push({
      id: 'cunning-action-dash',
      name: 'Cunning Action: Dash',
      cost: 'bonus',
      type: 'class_feature',
      description: 'Gain extra movement equal to your speed for the current turn.',
    });
    bonusActions.push({
      id: 'cunning-action-disengage',
      name: 'Cunning Action: Disengage',
      cost: 'bonus',
      type: 'class_feature',
      description: 'Your movement does not provoke opportunity attacks for the rest of the turn.',
    });
    bonusActions.push({
      id: 'cunning-action-hide',
      name: 'Cunning Action: Hide',
      cost: 'bonus',
      type: 'class_feature',
      description: 'Attempt to hide if you have cover or are obscured from enemy line of sight.',
    });

    // Steady Aim
    bonusActions.push({
      id: 'steady-aim',
      name: 'Steady Aim',
      cost: 'bonus',
      type: 'class_feature',
      description: 'Gain advantage on your next attack roll this turn. Reduces remaining movement to 0 ft.',
    });

    // Sneak Attack resource tracker
    resources.push({
      id: 'sneak_attack',
      name: 'Sneak Attack (Once/Turn)',
      current: 1,
      max: 1,
      refreshOn: 'turnStart',
    });

    // Uncanny Dodge
    reactions.push({
      id: 'uncanny-dodge',
      name: 'Uncanny Dodge',
      cost: 'reaction',
      type: 'class_feature',
      triggerCondition: 'Hit by an attacker you can see',
      description: 'Halve the damage that you take from an attack.',
    });

    // Wails from the Grave (Phantom Rogue)
    if (/phantom/i.test(archetype) || /wails from the grave/i.test(getVal('Front_Roguish Archetype 3'))) {
      resources.push({
        id: 'wails_grave',
        name: 'Wails from the Grave',
        current: 2,
        max: 2,
        refreshOn: 'longRest',
      });
    }
  }

  // Base generic actions available to everyone
  actions.push({
    id: 'base-dash',
    name: 'Dash',
    cost: 'action',
    type: 'utility',
    description: 'Double your movement speed for the current turn.',
  });
  actions.push({
    id: 'base-dodge',
    name: 'Dodge',
    cost: 'action',
    type: 'utility',
    description: 'Attack rolls against you have disadvantage until the start of your next turn.',
  });

  // Base Opportunity Attack reaction
  reactions.push({
    id: 'base-opportunity-attack',
    name: 'Opportunity Attack',
    cost: 'reaction',
    type: 'melee_weapon',
    triggerCondition: 'Hostile creature moves out of your reach',
    description: 'Spend your reaction to make one melee weapon attack against the fleeing creature.',
  });

  // Extract racial and archetype passives
  const traits = getVal('Front_Racial Traits', 'Features and Traits');
  if (traits) {
    passives.push({
      id: 'racial-traits',
      name: 'Racial Traits',
      description: traits.slice(0, 300),
    });
  }

  return {
    id: `pc-${Date.now()}`,
    name,
    archetype,
    race,
    isPlayer: true,
    isFriendly: true,
    aiType: 'none',
    vitals: {
      maxHp,
      currentHp: maxHp,
      tempHp: 0,
      baseAc: ac,
      speedFt: speed,
      initiativeMod: initiative,
    },
    attributes: { str, dex, con, int, wis, cha },
    saves: ['dex', 'int'],
    skills: { stealth: 8, perception: 3, acrobatics: 6 },
    budget: {
      movementTotalFt: speed,
      movementRemainingFt: speed,
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
      x: 2,
      y: 6,
      elevationFt: 0,
      isHiding: false,
      hasCover: 'none',
    },
    conditions: [],
  };
}
