<template>
  <v-container class="equipmentSkills-vContainer pa-0">
    <v-row
      v-for="(skillGroupObject, groupKey) in displayedSkills"
      :key="groupKey"
      class="equipmentSkills-vRow"
      dense
    >
      <v-col
        v-for="(skillName, skillKey) in skillGroupObject"
        :key="`${groupKey}-${skillKey}`"
        class="equipmentSkills-vCol pa-1 text-center"
        cols="4"
        md="2"
      >
        <v-tooltip activator="parent" location="top" :disabled="!skillName || skillName === '-'">
          {{ skillName }}
        </v-tooltip>

        <div :class="getSkillClass(skillName)" class="skill-chip">
          {{ formatSkillDisplay(skillName) }}
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
// Plugin Constants
import { ref, computed, watch } from 'vue';

// Pinia Stores
import { useDataStore } from '@/stores/data';
import { useBuildStore } from '@/stores/build';
import { API_ENDPOINTS } from '@/constants';

// Props
const props = defineProps({
  equipmentKey: {
    type: String,
    required: true
  }
});

// Stores
const dataStore = useDataStore();
const buildStore = useBuildStore();

// Computed Properties

const selectedItemName = computed(() => {
    return buildStore.selectedEquipment[props.equipmentKey]?.name ?? null;
});

const selectedDecorations = computed(() => {
    const key = props.equipmentKey;
    if (!key) {
        console.error(`EquipmentSkills: Received invalid equipmentKey: ${key}`);
        return [];
    }
    const pieceData = buildStore.selectedEquipment[key];
    const decorationsFromStore = pieceData?.decorations;

    if (decorationsFromStore && !Array.isArray(decorationsFromStore)) {
        console.error(`EquipmentSkills (${key}): Store returned a NON-ARRAY for decorations! Value:`, JSON.stringify(decorationsFromStore), `Type: ${typeof decorationsFromStore}. FORCING to empty array.`);
        return [];
    }
    return decorationsFromStore || [];
});

const selectedItemData = computed(() => {
    const name = selectedItemName.value;
    if (!name || dataStore.isLoading) return null;

    const key = props.equipmentKey;
    const endpoint = API_ENDPOINTS[key];

    try {
        if (endpoint === 'armor') {
            return dataStore.allArmorData.find(item => item.name === name);
        } else if (endpoint === 'weapons') {
            return dataStore.allWeaponData.find(item => item.name === name);
        } else if (endpoint === 'charms') {
             return dataStore.allCharmData
                 .flatMap(charm => charm.ranks)
                 .find(rank => rank.name === name);
        }
    } catch (error) {
        console.error(`Error finding item data for ${name} (${key}):`, error);
    }
    return null;
});

const armorSetData = computed(() => {
    if (API_ENDPOINTS[props.equipmentKey] !== 'armor' || !selectedItemData.value?.armorSet?.id || dataStore.isLoading) {
        return null;
    }
    return dataStore.allArmorSetData.find(set => set.id === selectedItemData.value.armorSet.id);
});

const selectedDecorationsData = computed(() => {
    if (dataStore.isLoading || !dataStore.allDecorationData) return [];

    const decoMap = new Map(dataStore.allDecorationData.map(d => [d.name.slice(0, -4), d]));
    const currentSelectedDecorations = selectedDecorations.value;
    if (!Array.isArray(currentSelectedDecorations)) {
        console.error(`EquipmentSkills (${props.equipmentKey}): selectedDecorationsData computed - Input is not an array! Aborting.`);
        return [];
    }

    return currentSelectedDecorations
        .filter(name => name !== null)
        .map(name => decoMap.get(name))
        .filter(deco => deco !== undefined);
});

const calculatedSkills = computed(() => {
    const skills = getInitialSkillStructure();
    let currentSkillIndex = 0;

    const addSkill = (name, level, sourcePrefix, slotIndex = null) => {
      let skillDisplayName = sourcePrefix;
      if (sourcePrefix === '(D)' && slotIndex !== null) {
          skillDisplayName += `${slotIndex + 1}`;
      }
      skillDisplayName += ` - ${name}`;

      if (sourcePrefix === '(G)') {
          if (skills.equipmentSkillGroup_3) {
              skills.equipmentSkillGroup_3.groupSkill = skillDisplayName;
          }
          return;
      }

      if (sourcePrefix === '(S)') {
          if (skills.equipmentSkillGroup_3) {
              skills.equipmentSkillGroup_3.setSkill = skillDisplayName;
          }
          return;
      }

      if (sourcePrefix === '(E)' || sourcePrefix.startsWith('(D')) {
          for (let i = 0; i < level; i++) {
              let placed = false;
              while (currentSkillIndex < 16) {
                  const groupNum = Math.floor(currentSkillIndex / 6) + 1;
                  const skillNumInGroup = (currentSkillIndex % 6) + 1;
                  const groupKey = `equipmentSkillGroup_${groupNum}`;
                  const skillKey = `equipmentSkill_${currentSkillIndex + 1}`;

                  if (skills[groupKey] && skills[groupKey].hasOwnProperty(skillKey) && skills[groupKey][skillKey] === '-') {
                      skills[groupKey][skillKey] = skillDisplayName;
                      placed = true;
                      currentSkillIndex++;
                      break;
                  }
                  currentSkillIndex++;
              }

              if (!placed) {
                  break;              }
          }
      }
    };

    if (selectedItemData.value?.skills) {
        selectedItemData.value.skills.forEach(skillInfo => {
            if (skillInfo.skill?.name) {
                addSkill(skillInfo.skill.name, skillInfo.level, '(E)');
            }
        });
    }

    const setBonusData = armorSetData.value?.bonus;
    if (setBonusData) {
        if (Array.isArray(setBonusData)) {
            setBonusData.forEach(bonusInfo => {
                if (bonusInfo?.skill?.name) {
                    addSkill(bonusInfo.skill.name, 1, '(S)');
                }
            });
        } else if (typeof setBonusData === 'object' && setBonusData !== null && setBonusData.skill?.name) {
            addSkill(setBonusData.skill.name, 1, '(S)');
        } else {
             // console.warn(...) // Keep warning if needed
        }
    }

     const groupBonusData = armorSetData.value?.groupBonus;
    if (groupBonusData) {
        if (Array.isArray(groupBonusData)) {
            groupBonusData.forEach(bonusInfo => {
                if (bonusInfo?.skill?.name) {
                    addSkill(bonusInfo.skill.name, 1, '(G)');
                }
            });
        } else if (typeof groupBonusData === 'object' && groupBonusData !== null && groupBonusData.skill?.name) {
            addSkill(groupBonusData.skill.name, 1, '(G)');
        } else {
            // console.warn(...) // Keep warning if needed
        }
    }

    const validDecoNames = selectedDecorations.value.filter(name => name !== null);
    const currentSelectedDecorationsData = selectedDecorationsData.value;
    const decoDataMap = new Map(currentSelectedDecorationsData.map(d => [d.name.slice(0, -4), d]));

    validDecoNames.forEach((name, index) => {
         const originalSlotIndex = selectedDecorations.value.findIndex((n, i) => n === name && i >= index);
         const decoData = decoDataMap.get(name);
         if (decoData && decoData.skills) {
             decoData.skills.forEach(skillInfo => {
                 if (skillInfo.skill?.name) {
                     addSkill(skillInfo.skill.name, skillInfo.level, '(D)', originalSlotIndex);
                 }
             });
         } else if (name) {
            // console.warn(...) // Keep warning if needed
         }
    });

    return skills;
});

function getInitialSkillStructure() {
  return {
    equipmentSkillGroup_1: { equipmentSkill_1: "-", equipmentSkill_2: "-", equipmentSkill_3: "-", equipmentSkill_4: "-", equipmentSkill_5: "-", equipmentSkill_6: "-" }, // Slots 1-6
    equipmentSkillGroup_2: { equipmentSkill_7: "-", equipmentSkill_8: "-", equipmentSkill_9: "-", equipmentSkill_10: "-", equipmentSkill_11: "-", equipmentSkill_12: "-" }, // Slots 7-12
    equipmentSkillGroup_3: { equipmentSkill_13: "-", equipmentSkill_14: "-", equipmentSkill_15: "-", equipmentSkill_16: "-", groupSkill: "-", setSkill: "-" } // Slots 13-16, Group(17), Set(18)
  };
}

const displayedSkills = computed(() => {
    return calculatedSkills.value;
});


// Watchers
watch(calculatedSkills, (newSkills, oldSkills) => {
    if (JSON.stringify(newSkills) !== JSON.stringify(oldSkills)) {
        buildStore.updatePieceSkills(props.equipmentKey, newSkills);
    }
}, { deep: true, immediate: false });


// Methods
function formatSkillDisplay(skillName) {
  if (!skillName || skillName === '-') return '-';
  const match = skillName.match(/\)\s*-\s*(.*)/);
  return match ? match[1].trim() : skillName;
}

// Helper method for dynamic class binding based on skill source
function getSkillClass(skillName) {
  if (!skillName || skillName === '-') return 'skill-empty';
  if (skillName.startsWith('(E)')) return 'skill-equipment';
  if (skillName.startsWith('(S)')) return 'skill-set';
  if (skillName.startsWith('(G)')) return 'skill-group';
  if (skillName.startsWith('(D')) return 'skill-decoration';
  return '';
}
</script>

<style scoped>
.equipmentSkills-vRow {
   margin-bottom: 2px;
}

.equipmentSkills-vCol {
    font-size: 0.7rem;
    font-weight: bold;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    border-radius: 4px;
    padding: 2px 4px !important;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 20px;
    box-shadow: inset 0 0 2px rgba(0,0,0,0.2);
}

.skill-chip {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.skill-empty {
  background-color: #e0e0e0;
  color: #757575;
}

.skill-equipment {
  background: linear-gradient(to bottom, #ffccbc, #ff8a65);
  color: #4e342e;
}

.skill-set {
  background: linear-gradient(to bottom, #b2ebf2, #4dd0e1);
  color: #006064;
}

.skill-group {
  background: linear-gradient(to bottom, #d1c4e9, #9575cd);
  color: #311b92;
}

.skill-decoration {
  background: linear-gradient(to bottom, #c8e6c9, #81c784);
  color: #1b5e20;
}

.skill-background {
  border-radius: 3px;
  overflow: hidden;
}
.skill-text {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  font-size: 10px;
  font-weight: bold;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
}
.skill-placeholder {
   display: flex;
   align-items: center;
   justify-content: center;
   height: 18px;
   color: #999;
   font-size: 12px;
}
</style>