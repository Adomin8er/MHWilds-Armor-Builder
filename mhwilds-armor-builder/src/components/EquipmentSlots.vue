<template>
    <v-row class="equipment-slots-row ml-md-4" dense>
      <v-col
        v-for="(slotSize, index) in currentSlots"
        :key="`slot-${equipmentKey}-${index}`"
        cols="12" sm="6" md="4" lg=""
        class="pb-1 pt-1 pt-md-2 d-flex"
      >
        <v-autocomplete
          :items="getAvailableDecorations(slotSize)"
          :label="slotSize > 0 ? `Slot ${index + 1} (Size ${slotSize})` : `Slot ${index + 1} (Empty)`"
          :placeholder="slotSize > 0 ? 'Select Decoration' : 'N/A'"
          :disabled="slotSize === 0 || !selectedItemName"
          :variant="slotSize > 0 ? 'underlined' : 'plain'"
          :prepend-inner-icon="decorationIcons[slotSize]"
          clearable
          hide-details="auto"
          :clear-icon="Icon_Cancel"
          :menu-icon="slotSize > 0 ? Icon_DownArrow : undefined"
          v-model="localDecorations[index]" 
          @update:modelValue="onDecorationChange" 
          class="flex-grow-1"
        >
      </v-autocomplete>
    </v-col>
    <v-col
        v-for="index in (3 - currentSlots.length)"
        :key="`placeholder-${equipmentKey}-${index}`"
        cols="12" sm="6" md="4" lg=""
        class="pb-1 pt-1 pt-md-2"
    >
          <v-sheet height="48px" color="transparent"></v-sheet>
    </v-col>
  </v-row>
</template>

<script setup>
// Plugin Constants
import { computed, watch, ref, nextTick } from 'vue';

// Pinia Stores
import { useDataStore } from '@/stores/data';
import { useBuildStore } from '@/stores/build';
import { API_ENDPOINTS, WEAPON_TYPE_KEYS } from '@/constants';

// Import images
import Icon_Cancel from '@/components/icons/Icon_Cancel.vue';
import Icon_DownArrow from '@/components/icons/Icon_DownArrow.vue';
import Icon_Decoration_Size0 from '@/components/icons/Icon_Decoration_Size0.vue';
import Icon_Decoration_Size1 from '@/components/icons/Icon_Decoration_Size1.vue';
import Icon_Decoration_Size2 from '@/components/icons/Icon_Decoration_Size2.vue';
import Icon_Decoration_Size3 from '@/components/icons/Icon_Decoration_Size3.vue';
import Icon_Decoration_Size4 from '@/components/icons/Icon_Decoration_Size4.vue';


// Props
const props = defineProps({
  equipmentKey: {
    type: String,
    required: true
  }
});

// Pinia Stores
const dataStore = useDataStore();
const buildStore = useBuildStore();

// Local Component States
const localDecorations = ref([]);

// Local Data / Mappings
const decorationIcons = {
  0: Icon_Decoration_Size0,
  1: Icon_Decoration_Size1,
  2: Icon_Decoration_Size2,
  3: Icon_Decoration_Size3,
  4: Icon_Decoration_Size4,
};

// Computed Properties
const selectedItemName = computed(() => {
    return buildStore.selectedEquipment[props.equipmentKey]?.name ?? null;
});

const itemType = computed(() => {
    const key = props.equipmentKey;
    if (API_ENDPOINTS[key] === 'armor') return 'armor';
    if (API_ENDPOINTS[key] === 'weapons') return 'weapon';
    if (API_ENDPOINTS[key] === 'charms') return 'talisman';
    return 'unknown';
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

const currentSlots = computed(() => {
    const slots = selectedItemData.value?.slots?.slice().sort((a, b) => a - b) || [];
     return slots;
});


const allDecorationsBySize = computed(() => {
    const sizeMap = { 1: [], 2: [], 3: [], 4: [] };
    if (dataStore.isLoading || !dataStore.allDecorationData) return sizeMap;

    dataStore.allDecorationData.forEach(deco => {
        if (deco.slot && deco.name && sizeMap[deco.slot]) {
            sizeMap[deco.slot].push({
                name: deco.name.slice(0, -4),
                rawName: deco.name,
                displayName: deco.name.slice(0, -4),
                kind: deco.kind,
                size: deco.slot
            });
        }
    });
    for (const size in sizeMap) {
        sizeMap[size].sort((a, b) => a.displayName.localeCompare(b.displayName));
    }
    return sizeMap;
});


function getAvailableDecorations(slotSize) {
    if (slotSize === 0 || dataStore.isLoading) return [];

    const relevantType = itemType.value;
    if (relevantType === 'unknown' || relevantType === 'talisman') return [];

    const available = [];
    for (let currentSize = 1; currentSize <= slotSize; currentSize++) {
        if (allDecorationsBySize.value[currentSize]) {
            allDecorationsBySize.value[currentSize].forEach(deco => {
                if (deco.kind === relevantType) {
                    available.push(deco.displayName);
                }
            });
        }
    }
    return [...new Set(available)].sort();
}

const flatDecorationList = computed(() => {
    return Object.values(allDecorationsBySize.value).flat();
});

function getDecorationSizeFromName(displayName) {
    const deco = flatDecorationList.value.find(d => d.displayName === displayName);
    return deco ? deco.size : 0;
}

function handleDecorationUpdate(index, newValue) {
    const currentDecorations = [...selectedDecorationsModel.value];
    currentDecorations[index] = newValue ?? null;
    buildStore.updatePieceDecorations(props.equipmentKey, currentDecorations);
}

const storeDecorations = computed(() => {
    const piece = buildStore.selectedEquipment[props.equipmentKey];
    return (piece && Array.isArray(piece.decorations)) ? piece.decorations : [];
});

// Watchers
watch([selectedItemName, () => props.equipmentKey], ([newItemName, newKey], [oldItemName, oldKey]) => {
    initializeLocalDecorations();
}, { immediate: true });

watch(storeDecorations, (newStoreDecos, oldStoreDecos) => {
    if (JSON.stringify(newStoreDecos) !== JSON.stringify(localDecorations.value)) {
        initializeLocalDecorations();
    }
}, { deep: true });

// Methods
function initializeLocalDecorations() {
    const numberOfSlots = currentSlots.value.length;
    const currentStoreDecos = storeDecorations.value;
    const newLocalDecos = Array(numberOfSlots).fill(null);

    for (let i = 0; i < numberOfSlots; i++) {
        newLocalDecos[i] = currentStoreDecos[i] || null;
    }
    localDecorations.value = newLocalDecos;
}

async function onDecorationChange() {
    await nextTick(); 
    buildStore.updatePieceDecorations(props.equipmentKey, localDecorations.value);
}
</script>

<style scoped>
.equipment-slots-row {
  min-height: 56px;
  align-items: center;
}

.v-col {
  padding-top: 4px !important;
  padding-bottom: 4px !important;
}

:deep(.v-autocomplete .v-field__input input) {
    font-size: 0.8rem;
    padding-top: 2px;
    padding-bottom: 2px;
}
:deep(.v-autocomplete .v-field__label) {
    font-size: 0.75rem;
    top: 4px !important;
}
:deep(.v-autocomplete .v-field--active .v-field__label) {
     top: 0px !important;
}

:deep(.v-autocomplete .v-field__prepend-inner .v-icon) {
    margin-right: 4px !important;
     opacity: 0.8;
}

:deep(.v-autocomplete .v-field--disabled .v-field__prepend-inner .v-icon) {
     opacity: 0.4;
}

:deep(.v-autocomplete.v-field--variant-plain .v-field__overlay) {
    background-color: transparent;
}
:deep(.v-autocomplete.v-field--variant-plain .v-field__field) {
    opacity: 0.5;
}

</style>