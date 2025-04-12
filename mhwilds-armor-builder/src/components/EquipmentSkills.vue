<template>
  <v-container class="equipmentSkills-vContainer">
    <v-row
      v-for="(skillGroupObject, groupIndex) in equipmentSkills"
      class="equipmentSkills-vRow"
    >
      <v-col
        v-for="(skillName, skillIndex) in skillGroupObject"
        class="equipmentSkills-vCol pa-0 text-center"
        cols="4"
        md="2"
      >
        <v-img
          v-if="skillIndex.startsWith('equipmentSkill')"
          cover
          height="16"
          >
          <div
            class="equipmentSkills-vImg-div-equipmentSkill"
          >
            {{ skillName }}
          </div>
        </v-img>
        <v-img
          v-if="skillIndex.startsWith('setSkill')"
          cover
          height="16"
          >
          <div
            class="equipmentSkills-vImg-div-setSkill"
          >
            {{ skillName }}
          </div>
        </v-img>
        <v-img
          v-if="skillIndex.startsWith('groupSkill')"
          cover
          height="16"
          >
          <div
            class="equipmentSkills-vImg-div-groupSkill"
          >
            {{ skillName }}
          </div>
        </v-img>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  api_baseUrl: String,
  selectedEquipmentType: String,
  selectedEquipmentName: String,
  selectedDecorations: Object
});

const emit = defineEmits(['all-skills']);

const equipmentEndpoints = {
  "head": 'armor',
  "chest": 'armor',
  "arms": 'armor',
  "waist": 'armor',
  "legs": 'armor',
  "talisman": 'charms',
  "weapon": 'weapons',  
};

const getInitialEquipmentSkills = () => ({
  equipmentSkillGroup_1: {
    equipmentSkill_1: "-",
    equipmentSkill_2: "-",
    equipmentSkill_3: "-",
    equipmentSkill_4: "-",
    equipmentSkill_5: "-",
    equipmentSkill_6: "-"
  },
  equipmentSkillGroup_2: {
    equipmentSkill_7: "-",
    equipmentSkill_8: "-",
    equipmentSkill_9: "-",
    equipmentSkill_10: "-",
    equipmentSkill_11: "-",
    equipmentSkill_12: "-"
  },
  equipmentSkillGroup_3: {
    equipmentSkill_13: "-",
    equipmentSkill_14: "-",
    equipmentSkill_15: "-",
    equipmentSkill_16: "-",
    setSkill: "-",
    groupSkill: "-",
  }
});

const equipmentSkills = ref(getInitialEquipmentSkills());
const equipmentSkillsEmitted = ref({})
let fetchingEquipmentSkills = false

watch(
  [() => props.selectedEquipmentType, () => props.selectedEquipmentName],  (newEquipmentObject) => {
    return fetchEquipmentSkills(newEquipmentObject[0], newEquipmentObject[1]);
  }
);

async function fetchEquipmentSkills(equipmentType, equipmentName) {
  fetchingEquipmentSkills = true
  equipmentSkills.value = getInitialEquipmentSkills();
  let endpoint = equipmentEndpoints[equipmentType];

  if (!endpoint) {
    console.warn(`Unknown equipment type: ${equipmentType}`);
    return;
  }
  
  try {
    const equipmentSkillsResponse = await fetch(`${props.api_baseUrl}${endpoint}`);
    const equipmentSkillsData = await equipmentSkillsResponse.json();
    let queryArmorSkills = [];
    let queryArmorSet = "";

    const setResponse = await fetch(`${props.api_baseUrl}armor/sets`);
    const setData = await setResponse.json();
    let querySetSkills = [];
    let queryGroupSkills = [];

    if (['head', 'chest', 'arms', 'waist', 'legs'].includes(equipmentType)) {
        queryArmorSkills = equipmentSkillsData
            .filter(item => item.name === equipmentName)
            .flatMap(item => item.skills)
            .flatMap(skillInfo => Array(skillInfo.level).fill(`(E) - ${skillInfo.skill.name}`));
        queryArmorSet = equipmentSkillsData
            .filter(item => item.name === equipmentName)
            .map(item => item.armorSet).flat()
            .map(item => item.name)[0]
        try{
            querySetSkills = setData
                .filter(item => item.name === queryArmorSet)
                .map(item => item.bonus).flat()
                .map(item => item.skill).flat()
                .map(item => `(E) - ${item.name}`).flat()
        } catch (error) {
            console.log('Armor has no Set Skills.');
        }
        try{
            queryGroupSkills = setData
                .filter(item => item.name === queryArmorSet)
                .map(item => item.groupBonus).flat()
                .map(item => item.skill).flat()
                .map(item => `(E) - ${item.name}`).flat()
        } catch (error) {
            console.log('Armor has no Group Skills.');
        }
    };
    queryArmorSkills.forEach((armorSkillValue, armorIndex) => {
        if (armorSkillValue !== null && armorSkillValue !== undefined) {
            const skillNum = armorIndex + 1;
            const groupNum = Math.ceil(skillNum / 6);
            const groupKey = `equipmentSkillGroup_${groupNum}`;
            const skillKey = `equipmentSkill_${skillNum}`;

            if (equipmentSkills.value[groupKey] && equipmentSkills.value[groupKey].hasOwnProperty(skillKey)) {
                equipmentSkills.value[groupKey][skillKey] = armorSkillValue;
            }
        }
    });
    
    querySetSkills.forEach((setSkillValue, setIndex) => {
      if (setSkillValue !== null && setSkillValue !== undefined) {
        equipmentSkills.value["equipmentSkillGroup_3"]["setSkill"] = setSkillValue;
      }
    });

    queryGroupSkills.forEach((groupSkillValue, groupIndex) => {
      if (groupSkillValue !== null && groupSkillValue !== undefined) {
        equipmentSkills.value["equipmentSkillGroup_3"]["groupSkill"] = groupSkillValue;
      }
    });

    let queryTalismanSkills = [];

    if (['talisman'].includes(equipmentType)) {
        queryTalismanSkills = equipmentSkillsData
            .flatMap(item => item.ranks)
            .filter(item => item.name === equipmentName)
            .flatMap(item => item.skills)
            .flatMap(skillInfo => Array(skillInfo.level).fill(`(E) - ${skillInfo.skill.name}`));
    };

    queryTalismanSkills.forEach((talismanSkillValue, talismanIndex) => {
        if (talismanSkillValue !== null && talismanSkillValue !== undefined) {
            const skillNum = talismanIndex + 1;
            const groupNum = Math.ceil(skillNum / 3);
            const groupKey = `equipmentSkillGroup_${groupNum}`;
            const skillKey = `equipmentSkill_${skillNum}`;

            if (equipmentSkills.value[groupKey] && equipmentSkills.value[groupKey].hasOwnProperty(skillKey)) {
                equipmentSkills.value[groupKey][skillKey] = talismanSkillValue;
            }
        }
    });
    
    let queryWeaponSkills = [];

    if (['weapon'].includes(equipmentType)) {
        queryWeaponSkills = equipmentSkillsData
            .filter(item => item.name === equipmentName)
            .flatMap(item => item.skills)
            .flatMap(skillInfo => Array(skillInfo.level).fill(`(E) - ${skillInfo.skill.name}`));
    };

    queryWeaponSkills.forEach((weaponSkillValue, weaponIndex) => {
        if (weaponSkillValue !== null && weaponSkillValue !== undefined) {
            const skillNum = weaponIndex + 1;
            const groupNum = Math.ceil(skillNum / 3);
            const groupKey = `equipmentSkillGroup_${groupNum}`;
            const skillKey = `equipmentSkill_${skillNum}`;

            if (equipmentSkills.value[groupKey] && equipmentSkills.value[groupKey].hasOwnProperty(skillKey)) {
                equipmentSkills.value[groupKey][skillKey] = weaponSkillValue;
            }
        }
    });

    fetchingEquipmentSkills = false
    equipmentSkillsEmitted.value = {
      [props.selectedEquipmentType]: equipmentSkills.value
    };
  } catch (error) {
    console.error('Error fetching equipment pieces:', error);
  }
}

watch(
  () => props.selectedDecorations,  (newDecorations) => {
    return fetchDecorationSkills(newDecorations, props.selectedEquipmentType, props.selectedEquipmentName);
  }
);

async function fetchDecorationSkills(selectedDecorations, selectedEquipmentType, selectedEquipmentName) {
  for (const groupKey in equipmentSkills.value) {
    for (const skillKey in equipmentSkills.value[groupKey]) {
      if (typeof equipmentSkills.value[groupKey][skillKey] === 'string' && equipmentSkills.value[groupKey][skillKey].startsWith("(D")) {
        equipmentSkills.value[groupKey][skillKey] = "-";
      }
    }
  }

  try {
    const decorationSkillsResponse = await fetch(`${props.api_baseUrl}decorations`);
    const decorationSkillsData = await decorationSkillsResponse.json();
    let queryDecorationSkills = [];

    queryDecorationSkills = decorationSkillsData
      .flatMap(item => {
        let skills = [];
        for (const slot in selectedDecorations) {
          if (selectedDecorations[slot] === item.name.slice(0, -4)) {
            const slotNumber = slot.split('_')[1];
            const slotDisplay = `(D${slotNumber})`;
            skills = skills.concat(item.skills.flatMap(skillInfo => Array(skillInfo.level).fill(`${slotDisplay} - ${skillInfo.skill.name}`))); // concat to add all to the same array
          }
        }
        return skills;
      });

    queryDecorationSkills.sort().forEach((decorationSkillValue) => {
      for (const groupKey in equipmentSkills.value) {
        for (const skillKey in equipmentSkills.value[groupKey]) {
          if (equipmentSkills.value[groupKey][skillKey] === "-") {
            equipmentSkills.value[groupKey][skillKey] = decorationSkillValue;
            equipmentSkills.value = { ...equipmentSkills.value };
            return;
          }
        }
      }
    });
  
    equipmentSkillsEmitted.value = {
      [props.selectedEquipmentType]: equipmentSkills.value
    };
  } catch (error) {
    console.log('Decoration skills not found.');
  }
}

watch(
  () => equipmentSkillsEmitted.value,  () => {
    if (fetchingEquipmentSkills === false ) {
      emit(
        'all-skills',
        equipmentSkillsEmitted.value
      )
    }
  }
);

</script>

<style scope>
.equipmentSkills-vCol {
    font-size: 11px;
    font-weight: 1000;
}

/* .equipmentSkills-vImg-div-equipmentSkill {
  background: radial-gradient(ellipse at center, rgba(240, 140, 130, 0.50) 60%, rgba(200, 60, 60, 0.75) 100%);
}

.equipmentSkills-vImg-div-setSkill {
  background: radial-gradient(ellipse at center, rgba(80, 150, 150, 0.50) 60%, rgba(25, 100, 100, 0.75) 100%);
}

.equipmentSkills-vImg-div-groupSkill {
  background: radial-gradient(ellipse at center, rgba(80, 70, 120, 0.50) 60%, rgba(50, 30, 70, 0.75) 100%);
} */
</style>