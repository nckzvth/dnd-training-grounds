import battlemapImg from '../assets/art/battlemap.jpg';
import tokenRogueImg from '../assets/art/token_rogue.jpg';
import tokenGoblinImg from '../assets/art/token_goblin.jpg';
import tokenDwarfImg from '../assets/art/token_dwarf.jpg';
import tokenDummyImg from '../assets/art/token_dummy.jpg';
import diceTrayImg from '../assets/art/dice_tray.jpg';
import parchmentImg from '../assets/art/parchment.jpg';
import darkWoodImg from '../assets/art/dark_wood.jpg';
import crestEmblemImg from '../assets/art/crest_emblem.jpg';

export const ART_ASSETS = {
  battlemap: battlemapImg,
  tokenRogue: tokenRogueImg,
  tokenGoblin: tokenGoblinImg,
  tokenDwarf: tokenDwarfImg,
  tokenDummy: tokenDummyImg,
  diceTray: diceTrayImg,
  parchment: parchmentImg,
  darkWood: darkWoodImg,
  crestEmblem: crestEmblemImg,
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

/**
 * Dark antiqued vellum / leather parchment style helper.
 * Blends real parchment texture under a rich warm espresso tone,
 * eliminating harsh white glare while preserving authentic parchment grain.
 */
export const getDarkVellumStyle = (opacity = 0.88): React.CSSProperties => ({
  backgroundImage: `linear-gradient(rgba(34, 25, 18, ${opacity}), rgba(24, 17, 12, ${opacity + 0.05})), url(${ART_ASSETS.parchment})`,
  backgroundSize: 'cover',
  color: '#eeddbb',
});

/**
 * Warm antiqued parchment style for cards, modals, and highlighted elements
 */
export const getWarmParchmentStyle = (opacity = 0.85): React.CSSProperties => ({
  backgroundImage: `linear-gradient(rgba(42, 31, 22, ${opacity}), rgba(30, 21, 14, ${opacity + 0.05})), url(${ART_ASSETS.parchment})`,
  backgroundSize: 'cover',
  color: '#f3e5c8',
});
