<template>
  <v-autocomplete
    :label="props.equipmentPiece.replace('_',' ')"
    :items="equipmentOptions"
    v-model="selectedEquipment[formattedEquipmentPiece]"
    variant="underlined"
    clearable
    hide-details="true"
    :clear-icon="equipmentCardImages.icon_cancel"
    :menu-icon="equipmentCardImages.icon_downArrow"
  >
  </v-autocomplete>
</template>

<script setup>
import Icon_Cancel from '@/components/icons/Icon_Cancel.vue';
import Icon_DownArrow from '@/components/icons/Icon_DownArrow.vue';

import { onMounted, ref, watch } from 'vue';

const props = defineProps({
  api_baseUrl: String,
  equipmentPiece: String
})

const emit = defineEmits(['equipment-selected']);

const equipmentCardImages = {
  icon_cancel: Icon_Cancel,
  icon_downArrow: Icon_DownArrow
};

const equipmentEndpoints = {
  "head": 'armor',
  "chest": 'armor',
  "arms": 'armor',
  "waist": 'armor',
  "legs": 'armor',
  "talisman": 'charms',
  "great-sword": 'weapons',
  "long-sword": 'weapons',
  "sword-shield": 'weapons',
  "dual-blades": 'weapons',
  "hammer": 'weapons',
  "hunting-horn": 'weapons',
  "lance": 'weapons',
  "gunlance": 'weapons',
  "switch-axe": 'weapons',
  "charge-blade": 'weapons',
  "insect-glaive": 'weapons',
  "bow": 'weapons',
  "light-bowgun": 'weapons',
  "heavy-bowgun": 'weapons',  
};

const formattedEquipmentPiece = ref('');
const equipmentOptions = ref([]);
const selectedEquipment = ref({});

onMounted(() => {
  initializeComponent();
});

watch(() => props.equipmentPiece, () => {
  initializeComponent();
});

async function initializeComponent() {
  const equipmentType = props.equipmentPiece.toLowerCase().replace("_","-");
  formattedEquipmentPiece.value = equipmentType;
  await fetchEquipment(equipmentType);
}

async function fetchEquipment(equipmentType) {
  let endpoint = equipmentEndpoints[equipmentType];

  if (!endpoint) {
    console.warn(`Unknown equipment type: ${equipmentType}`);
    return;
  }

  try {
    const response = await fetch(`${props.api_baseUrl}${endpoint}`);
    const data = await response.json();
    let options = [];

    if (['head', 'chest', 'arms', 'waist', 'legs'].includes(equipmentType)) {
      options = data
        .filter(item => item.kind === equipmentType)
        .map(item => item.name);
    } else if (equipmentType === 'talisman') {
      options = data.flatMap(item => item.ranks.map(rank => rank.name));
    } else {
      options = data
        .filter(item => item.kind === equipmentType)
        .map(item => item.name);
    }

    equipmentOptions.value = options.sort();
  } catch (error) {
    console.error('Error fetching equipment pieces:', error);
  }


  watch(selectedEquipment, (newEquipment) => {
    const correctedWeapon = {}
    const equipmentType = Object.keys(newEquipment)[0];
    const equipmentName = newEquipment[equipmentType];

    if ([
      'great-sword', 'long-sword', 'sword-shield', 'dual-blades', 'dual-blades',
      'hammer', 'hunting-horn', 'lance', 'gunlance', 'switch-axe', 'charge-blade',
      'insect-glaive', 'bow', 'light-bowgun', 'heavy-bowgun'
    ].includes(equipmentType)) {
      correctedWeapon['weapon'] = equipmentName
    }

    const head = newEquipment['head'] || null;
    const chest = newEquipment['chest'] || null;
    const arms = newEquipment['arms'] || null;
    const waist = newEquipment['waist'] || null;
    const legs = newEquipment['legs'] || null;
    const talisman = newEquipment['talisman'] || null;
    const weapon = correctedWeapon['weapon'] || null;
    
    emit(
      'equipment-selected',
      head,
      chest,
      arms,
      waist,
      legs,
      talisman,
      weapon
    );
  }, { deep: true }
);

}
</script>

<style scoped>
</style>