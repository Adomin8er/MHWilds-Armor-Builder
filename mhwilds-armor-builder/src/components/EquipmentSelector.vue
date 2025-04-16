<template>
  <v-autocomplete
    :label="componentLabel"
    :items="equipmentOptions"
    :loading="isLoading"
    :disabled="isLoading || dataStore.isLoading"
    v-model="selectedEquipmentName"
    variant="underlined"
    clearable
    hide-details="true"
    :clear-icon="Icon_Cancel"
    :menu-icon="Icon_DownArrow"
  >
    <template v-slot:no-data>
      <v-list-item>
        <v-list-item-title>
          {{ noDataMessage }}
        </v-list-item-title>
      </v-list-item>
    </template>
  </v-autocomplete>
</template>

<script setup>
// Plugin Constants
import { ref, computed, watch, onMounted } from 'vue';

// Pinia Stores
import { useDataStore } from '@/stores/data';
import { useBuildStore } from '@/stores/build';
import { ALL_EQUIPMENT_KEYS, API_ENDPOINTS, formatDisplayName } from '@/constants';

// Import images
import Icon_Cancel from '@/components/icons/Icon_Cancel.vue';
import Icon_DownArrow from '@/components/icons/Icon_DownArrow.vue';

// Props
const props = defineProps({
  equipmentPiece: {
    type: String,
    required: true
  }
});

// Pinia Stores
const dataStore = useDataStore();
const buildStore = useBuildStore();

// Local Component States
const equipmentOptions = ref([]);
const isLoading = ref(false);

// Computed Properties
const currentEquipmentKey = computed(() => {
    const piece = props.equipmentPiece;
    if (piece === 'Weapon') {
        return props.equipmentPiece.toLowerCase().replace(/_/g, '-');
    } else {
        return piece.toLowerCase();
    }
});

const componentLabel = computed(() => {
    return formatDisplayName(props.equipmentPiece);
});

const selectedEquipmentName = computed({
  get() {
    const key = currentEquipmentKey.value;
    return buildStore.selectedEquipment[key]?.name ?? null;
  },
  set(newValue) {
    const key = currentEquipmentKey.value;
    buildStore.updateSelectedEquipmentName(key, newValue);
    if (newValue === null) {
       buildStore.clearPieceData(key);
    }
  }
});

const noDataMessage = computed(() => {
  if (dataStore.isLoading) {
    return "Loading initial data...";
  }
  if (!currentEquipmentKey.value || !API_ENDPOINTS[currentEquipmentKey.value]) {
      return `Invalid equipment type: ${props.equipmentPiece}`;
  }
  if (isLoading.value) {
      return `Fetching ${componentLabel.value}...`;
  }
  if (equipmentOptions.value.length === 0) {
      const endpoint = API_ENDPOINTS[currentEquipmentKey.value];
      if (endpoint === 'armor' && dataStore.allArmorData.length === 0) return "Armor data not loaded.";
      if (endpoint === 'weapons' && dataStore.allWeaponData.length === 0) return "Weapon data not loaded.";
      if (endpoint === 'charms' && dataStore.allCharmData?.length === 0) return "Talisman data not loaded.";
      return `No ${componentLabel.value} options found.`;
  }
  return "No data available";
});

// Functions
function populateOptions() {
  const key = currentEquipmentKey.value;
  const endpoint = API_ENDPOINTS[key];

  if (!endpoint || !key) {
    console.warn(`Invalid equipment type or endpoint for key: ${key}`);
    equipmentOptions.value = [];
    return;
  }

  let options = [];
  try {
    if (dataStore.isLoading) {
        console.log(`Selector waiting for initial data load...`);
        equipmentOptions.value = [];
        return;
    }

    if (endpoint === 'armor') {
      if (!dataStore.allArmorData || dataStore.allArmorData.length === 0) {
          options = [];
      } else {
          options = dataStore.allArmorData
            .filter(item => item.kind === key)
            .map(item => item.name);
      }
    } else if (endpoint === 'weapons') {
       if (!dataStore.allWeaponData || dataStore.allWeaponData.length === 0) {
          options = [];
       } else {
         options = dataStore.allWeaponData
            .filter(item => item.kind === key)
            .map(item => item.name);
       }
    } else if (endpoint === 'charms') {
      if (!dataStore.allCharmData || dataStore.allCharmData.length === 0) {
          options = [];
      } else {
          options = dataStore.allCharmData.flatMap(item => item.ranks.map(rank => rank.name));
      }
    }

    equipmentOptions.value = options.sort();
  } catch (error) {
      console.error(`Error populating options for ${key}:`, error);
      equipmentOptions.value = [];
  } finally {
      isLoading.value = false;
  }
}

// Watchers

watch(currentEquipmentKey, (newKey, oldKey) => {
  populateOptions();
}, { immediate: false });

watch(() => dataStore.isLoading, (loading) => {
    if (!loading && equipmentOptions.value.length === 0) {
        console.log(`EquipmentSelector for ${props.equipmentPiece}: Initial data loaded. Populating options.`);
        populateOptions();
    }
});

// Lifecycle Hooks
onMounted(() => {
  if (!dataStore.isLoading) {
    populateOptions();
  } else {
      console.log(`EquipmentSelector for ${props.equipmentPiece}: Waiting for initial data on mount...`);
  }
});
</script>

<style scoped>
</style>