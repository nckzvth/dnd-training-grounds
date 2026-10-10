import battlemapImg from '../assets/art/battlemap.jpg';
import tokenRogueImg from '../assets/art/token_rogue.jpg';
import tokenGoblinImg from '../assets/art/token_goblin.jpg';
import tokenDwarfImg from '../assets/art/token_dwarf.jpg';
import tokenDummyImg from '../assets/art/token_dummy.jpg';
import diceTrayImg from '../assets/art/dice_tray.jpg';

export const ART_ASSETS = {
  battlemap: battlemapImg,
  tokenRogue: tokenRogueImg,
  tokenGoblin: tokenGoblinImg,
  tokenDwarf: tokenDwarfImg,
  tokenDummy: tokenDummyImg,
  diceTray: diceTrayImg,
};

export function getTokenImage(combatant: { 
  isPlayer?: boolean; 
  isFriendly?: boolean; 
  aiType?: string; 
  name?: string; 
  race?: string;
  archetype?: string;
}): string {
  if (combatant.isPlayer) {
    return ART_ASSETS.tokenRogue;
  }
  if (combatant.isFriendly) {
    return ART_ASSETS.tokenDwarf;
  }
  if (combatant.aiType === 'static_dummy' || /dummy/i.test(combatant.name || '')) {
    return ART_ASSETS.tokenDummy;
  }
  if (/goblin/i.test(combatant.name || '') || /goblin/i.test(combatant.race || '')) {
    return ART_ASSETS.tokenGoblin;
  }
  // Default to goblin for enemies, dwarf for allies
  return combatant.isFriendly ? ART_ASSETS.tokenDwarf : ART_ASSETS.tokenGoblin;
}
