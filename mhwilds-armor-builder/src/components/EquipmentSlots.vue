<template>
  <v-row
    class="ml-4"
  >
    <v-col
      v-for="(slot, index) in equipmentSlots"
      class="pb-0 pt-0 pt-md-6"
      cols="11"
      md=""
    >
      <v-autocomplete
        :items="renderedDecorations[`decorations_${slot}`].decorationName"
        :key="`${slot}-${props.selectedEquipmentType}-${props.selectedEquipmentName}`"
        :placeholder="slot === 0 ? '' : `    Decoration Size ${slot}`"
        variant="underlined"
        :prepend-inner-icon="equipmentCardImages[`icon_decoration_size${slot}`]"
        clearable
        hide-details="true"
        :clear-icon="equipmentCardImages.icon_cancel"
        :menu-icon="equipmentCardImages.icon_downArrow"
        v-model="selectedDecorations[index]"
      >
      </v-autocomplete>
    </v-col>
    <v-col
      v-if="$vuetify.display.mdAndUp"
      cols="0"
      md="1"
    >
    </v-col>
  </v-row>
</template>


<script setup>
import Icon_Cancel from '@/components/icons/Icon_Cancel.vue';
import Icon_DownArrow from '@/components/icons/Icon_DownArrow.vue';
import Icon_Decoration_Size0 from '@/components/icons/Icon_Decoration_Size0.vue';
import Icon_Decoration_Size1 from '@/components/icons/Icon_Decoration_Size1.vue';
import Icon_Decoration_Size2 from '@/components/icons/Icon_Decoration_Size2.vue';
import Icon_Decoration_Size3 from '@/components/icons/Icon_Decoration_Size3.vue';
import Icon_Decoration_Size4 from '@/components/icons/Icon_Decoration_Size4.vue';

import { ref, watch } from 'vue';

const props = defineProps({
  api_baseUrl: String,
  selectedEquipmentType: String,
  selectedEquipmentName: String,
  decorationCategories: Object
});

const emit = defineEmits(['decorations-selected']);

const equipmentCardImages = {
  icon_cancel: Icon_Cancel,
  icon_downArrow: Icon_DownArrow,
  icon_decoration_size0: Icon_Decoration_Size0,
  icon_decoration_size1: Icon_Decoration_Size1,
  icon_decoration_size2: Icon_Decoration_Size2,
  icon_decoration_size3: Icon_Decoration_Size3,
  icon_decoration_size4: Icon_Decoration_Size4
};

const equipmentEndpoints = {
  "head": 'armor',
  "chest": 'armor',
  "arms": 'armor',
  "waist": 'armor',
  "legs": 'armor',
  "talisman": 'charms',
  "weapon": 'weapons',  
};

const equipmentSlots = ref([0, 0, 0]);
const selectedDecorations = ref([]);

// When the chosen weapon changes, this runs to reset decoration slots an update the equipment
// list associated with that weapon. Afterwards runs fetchSlots again since it will have to send
// a call for the new list of weapons.

watch(
  [() => props.selectedEquipmentType, () => props.selectedEquipmentName],  (newEquipmentObject) => {
    selectedDecorations.value = [];
    return fetchSlots(newEquipmentObject[0], newEquipmentObject[1]);
  }
);

async function fetchSlots(equipmentType, equipmentName) {
  let endpoint = equipmentEndpoints[equipmentType];

  if (!endpoint) {
    console.warn(`Unknown equipment type: ${equipmentType}`);
    return;
  }
  
  try {
    const response = await fetch(`${props.api_baseUrl}${endpoint}`);
    const data = await response.json();
    let slots = [];

    if (['head', 'chest', 'arms', 'waist', 'legs', 'weapon'].includes(equipmentType)) {
      slots = data
        .filter(item => item.name === equipmentName)
        .map(item => item.slots)
        .flat()
    };

    const sortedSlots = slots.sort();
    for (let i = 0; i < equipmentSlots.value.length; i++) {
      equipmentSlots.value[i] = sortedSlots[i] !== undefined ? sortedSlots[i] : 0;
    }

  } catch (error) {
    console.error('Error fetching equipment pieces:', error);
  }
}

// Since decorations are rendered in the app.vue but the component renders first,
// this has to watch for when the render finishes and will update the component accordingly.

const renderedDecorations = ref({
  decorations_0: {
    decorationName: [],
  },
  decorations_1: {
    decorationName: [],
  },
  decorations_2: {
    decorationName: [],
  },
  decorations_3: {
    decorationName: [],
  },
  decorations_4: {
    decorationName: [],
  }
})

watch(
  () => props.decorationCategories,
  (newDecorations) => {
    if (['head', 'chest', 'arms', 'waist', 'legs'].includes(props.selectedEquipmentType)) {
      Object.keys(renderedDecorations.value).forEach(categoryKey => {
        const category = newDecorations[categoryKey];
        if (category && category.decorationData) {
          const armorDecorationNames = Object.entries(category.decorationData)
            .filter(([name, kind]) => kind === 'armor')
            .map(([name, kind]) => name);
          renderedDecorations.value[categoryKey].decorationName = armorDecorationNames.sort();
        } else {
          renderedDecorations.value[categoryKey].decorationName = [];
        }
      });
    } else if (['weapon'].includes(props.selectedEquipmentType)) {
      Object.keys(renderedDecorations.value).forEach(categoryKey => {
        const category = newDecorations[categoryKey];
        if (category && category.decorationData) {
          const weaponDecorationNames = Object.entries(category.decorationData)
            .filter(([name, kind]) => kind === 'weapon')
            .map(([name, kind]) => name);
          renderedDecorations.value[categoryKey].decorationName = weaponDecorationNames.sort();
        } else {
          renderedDecorations.value[categoryKey].decorationName = [];
        }
      });
    } else {
      Object.keys(renderedDecorations.value).forEach(categoryKey => {
        renderedDecorations.value[categoryKey].decorationName = [];
      });
    }
  },
  { deep: true }
);

// This is used to emit the updated decoration.

watch(selectedDecorations, (newSelections) => {
  const actualSelections = {};

  newSelections.forEach((selection, index) => {
    actualSelections[`decorationSlot_${index + 1}`] = selection || "";
  });
  
  const head = (props.selectedEquipmentType == "head") ? {head: actualSelections} : {head: []};
  const chest = (props.selectedEquipmentType == "chest") ? {chest: actualSelections} : {chest: []};
  const arms = (props.selectedEquipmentType == "arms") ? {arms: actualSelections} : {arms: []};
  const waist = (props.selectedEquipmentType == "waist") ? {waist: actualSelections} : {waist: []};
  const legs = (props.selectedEquipmentType == "legs") ? {legs: actualSelections} : {legs: []};
  const talisman = (props.selectedEquipmentType == "talisman") ? {talisman: actualSelections} : {talisman: []};
  const weapon = (props.selectedEquipmentType == "weapon") ? {weapon: actualSelections} : {weapon: []};
  
  emit(
    'decorations-selected',
    head,
    chest,
    arms,
    waist,
    legs,
    talisman,
    weapon
  );
}, { deep: true });


</script>

<style scoped>
</style>