import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { EQUIPMENT_PIECES_ORDERED } from '@/constants';

function getInitialPieceState() {
    return {
        name: null,
        decorations: [], 
        skills: {},
    };
}

export const useBuildStore = defineStore('build', () => {
  // State
  const selectedEquipment = ref(
    EQUIPMENT_PIECES_ORDERED.reduce((acc, pieceName) => {
      acc[pieceName.toLowerCase()] = getInitialPieceState();
      return acc;
    }, {})
  );

  function ensurePieceExists(pieceKey) {
    const lowerCaseKey = pieceKey.toLowerCase();
    if (!selectedEquipment.value[lowerCaseKey]) {
      selectedEquipment.value[lowerCaseKey] = getInitialPieceState();
    }
    return lowerCaseKey;
  }

  // Getters
  const totalSkills = computed(() => {
    // console.log("Recalculating total skills...");
    const combined = {};
  
     for (const pieceType in selectedEquipment.value) {
       const pieceData = selectedEquipment.value[pieceType];
       const pieceSkills = pieceData?.skills;
  
       if (pieceSkills && typeof pieceSkills === 'object' && Object.keys(pieceSkills).length > 0) {
 
          for (const skillGroupKey in pieceSkills) {
            const skillGroup = pieceSkills[skillGroupKey];
            if (skillGroup && typeof skillGroup === 'object') {
                for (const skillKey in skillGroup) {
                    const skillValue = skillGroup[skillKey];
  
                    if (skillValue && skillValue !== '-') {
                        let skillName = skillValue;
                        let skillSourceType = 'unknown';
  
                        const prefixMatch = skillValue.match(/^\((E|S|G|D)\)(\d*)\s*-\s*(.*)/);

                        if (prefixMatch && prefixMatch[3]) {
                            const prefix = prefixMatch[1];
                            const prefixNumber = prefixMatch[2];  // might be '' or '1' or '2' etc.
                            skillName = prefixMatch[3].trim();
                            
                            if (prefix === 'E') skillSourceType = 'equipment';
                            else if (prefix === 'S') skillSourceType = 'set';
                            else if (prefix === 'G') skillSourceType = 'group';
                            else if (prefix === 'D') skillSourceType = 'decoration';
                            else skillSourceType = 'unknown'; // fallback, just in case
                        } else {
                            console.warn(`Could not parse prefix/name from: '${skillValue}'. Treating as 'unknown'.`);
                            skillName = null;
                            skillSourceType = 'unknown';
                        }
                                                
                        if (skillName && skillName.length > 0) {
                           if (!combined[skillName]) {
                            combined[skillName] = {
                                level: 0,
                                sources: [],
                                sourceTypes: new Set(),
                                contributingPieces: new Set()
                            };
                           } else {
                            //  console.log(`Incrementing level for '${skillName}'. Current level: ${combined[skillName].level}`);
                           }
                           combined[skillName].level++; // Increment level
                           combined[skillName].sources.push(`${pieceType}:${skillKey} -> "${skillValue}"`);
                           combined[skillName].sourceTypes.add(skillSourceType); // Add the parsed type
                           combined[skillName].contributingPieces.add(pieceType);
                        } else {
                            // console.warn(`Skipping aggregation because skillName was invalid after parsing: '${skillValue}'`);
                        }
                    } else {
                        // console.log(`Skipping skillValue: '${skillValue}' (is falsy or '-')`);
                    }
                }
            } else {
              //  console.warn(`Skipping skillGroupKey '${skillGroupKey}' because skillGroup is not an object:`, skillGroup);
            }
          }
       } else {
          //  console.log(`totalSkills: Skipping piece '${pieceType}' because pieceSkills is falsy, not an object, or empty.`);
       }
     }

      for (const skillName in combined) {
        if (combined[skillName].contributingPieces instanceof Set) {
            combined[skillName].pieceCount = combined[skillName].contributingPieces.size;
            combined[skillName].sourceTypes = Array.from(combined[skillName].sourceTypes);
            combined[skillName].contributingPieces = Array.from(combined[skillName].contributingPieces);
        } else {
            combined[skillName].pieceCount = 0;
        }
      } 
  //  console.log("Finished recalculating total skills.");
  //  console.log("Finished recalculating total skills. Final combined:", JSON.stringify(combined));
     return combined;
  });
    
  

  // Actions
  function updateSelectedEquipmentName(pieceKey, name) {
    const lowerCaseKey = ensurePieceExists(pieceKey);
    if (selectedEquipment.value[lowerCaseKey].name !== name) {
      selectedEquipment.value[lowerCaseKey].name = name;
  
      if (name === null) {
         clearPieceData(lowerCaseKey);
      }
    }
  }

  // Action to update skills
  function updatePieceSkills(pieceKey, skills) {
    const lowerCaseKey = ensurePieceExists(pieceKey);  
    if (selectedEquipment.value[lowerCaseKey]) {
      selectedEquipment.value[lowerCaseKey].skills = skills;
    } else {
      console.warn(`BuildStore: updatePieceSkills -- FAILED FIND -- key: "${lowerCaseKey}"`);
    }
  }
  
  // Action to update decorations
  function updatePieceDecorations(pieceKey, decorationsArray) {
    const lowerCaseKey = ensurePieceExists(pieceKey);
    const currentDecorations = selectedEquipment.value[lowerCaseKey].decorations;
    const currentLength = Array.isArray(currentDecorations) ? currentDecorations.length : 0;
    const newLength = Array.isArray(decorationsArray) ? decorationsArray.length : 0;

    let changed = newLength !== currentLength;
    if (!changed && newLength > 0 && Array.isArray(currentDecorations)) {
      for(let i = 0; i < newLength; i++) {
        if (currentDecorations[i] !== decorationsArray[i]) {
          changed = true;
          break;
        }
      }
    } else if (!Array.isArray(currentDecorations) && newLength > 0) {
        changed = true;
    }

    if(changed) {
      selectedEquipment.value[lowerCaseKey].decorations = Array.isArray(decorationsArray) ? [...decorationsArray] : [];
    }
  }

  function clearPieceData(pieceKey) {
    const lowerCaseKey = pieceKey.toLowerCase();
    if (selectedEquipment.value[lowerCaseKey]) {
        selectedEquipment.value[lowerCaseKey].decorations = [];
        selectedEquipment.value[lowerCaseKey].skills = {};
    }
}

  return {
    // State
    selectedEquipment,
    // Getters
    totalSkills,
    // Actions
    updateSelectedEquipmentName,
    updatePieceSkills,
    updatePieceDecorations,
    clearPieceData,
    // Constants
  };
});