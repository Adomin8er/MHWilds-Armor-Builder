export const EQUIPMENT_PIECE_KEYS = {
    HEAD: 'head',
    CHEST: 'chest',
    ARMS: 'arms',
    WAIST: 'waist',
    LEGS: 'legs',
    TALISMAN: 'talisman',
    WEAPON: 'weapon',
  };
  
  // Weapon type identifiers
  export const WEAPON_TYPE_KEYS = {
    GREAT_SWORD: 'great-sword',
    LONG_SWORD: 'long-sword',
    SWORD_SHIELD: 'sword-shield',
    DUAL_BLADES: 'dual-blades',
    HAMMER: 'hammer',
    HUNTING_HORN: 'hunting-horn',
    LANCE: 'lance',
    GUNLANCE: 'gunlance',
    SWITCH_AXE: 'switch-axe',
    CHARGE_BLADE: 'charge-blade',
    INSECT_GLAIVE: 'insect-glaive',
    BOW: 'bow',
    LIGHT_BOWGUN: 'light-bowgun',
    HEAVY_BOWGUN: 'heavy-bowgun',
  };
  
  // Combine armor and weapon keys if useful for mapping
  export const ALL_EQUIPMENT_KEYS = {
    ...EQUIPMENT_PIECE_KEYS,
    ...WEAPON_TYPE_KEYS,
  };
  
  // Mapping from equipment keys to API endpoints (relative path)
  // This replaces the local equipmentEndpoints object
  export const API_ENDPOINTS = {
    [EQUIPMENT_PIECE_KEYS.HEAD]: 'armor',
    [EQUIPMENT_PIECE_KEYS.CHEST]: 'armor',
    [EQUIPMENT_PIECE_KEYS.ARMS]: 'armor',
    [EQUIPMENT_PIECE_KEYS.WAIST]: 'armor',
    [EQUIPMENT_PIECE_KEYS.LEGS]: 'armor',
    [EQUIPMENT_PIECE_KEYS.TALISMAN]: 'charms',
    [WEAPON_TYPE_KEYS.GREAT_SWORD]: 'weapons',
    [WEAPON_TYPE_KEYS.LONG_SWORD]: 'weapons',
    [WEAPON_TYPE_KEYS.SWORD_SHIELD]: 'weapons',
    [WEAPON_TYPE_KEYS.DUAL_BLADES]: 'weapons',
    [WEAPON_TYPE_KEYS.HAMMER]: 'weapons',
    [WEAPON_TYPE_KEYS.HUNTING_HORN]: 'weapons',
    [WEAPON_TYPE_KEYS.LANCE]: 'weapons',
    [WEAPON_TYPE_KEYS.GUNLANCE]: 'weapons',
    [WEAPON_TYPE_KEYS.SWITCH_AXE]: 'weapons',
    [WEAPON_TYPE_KEYS.CHARGE_BLADE]: 'weapons',
    [WEAPON_TYPE_KEYS.INSECT_GLAIVE]: 'weapons',
    [WEAPON_TYPE_KEYS.BOW]: 'weapons',
    [WEAPON_TYPE_KEYS.LIGHT_BOWGUN]: 'weapons',
    [WEAPON_TYPE_KEYS.HEAVY_BOWGUN]: 'weapons',
  };
  
  // Original Equipment Pieces Array (from App.vue originally)
  // Used for iterating in App.vue, maybe useful elsewhere
  export const EQUIPMENT_PIECES_ORDERED = [
    'Head', 'Chest', 'Arms', 'Waist', 'Legs', 'Talisman', 'Weapon'
  ];
  
  // Function to format display names if needed (e.g., 'Great_Sword' -> 'Great Sword')
  export function formatDisplayName(key) {
      if (!key) return '';
      const upperCaseKey = key.toUpperCase().replace(/-/g, '_');
      return upperCaseKey
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
  }
