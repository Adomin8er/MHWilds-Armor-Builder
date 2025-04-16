<template>
    <v-dialog
      v-model="uiStore.isDatabaseViewerVisible"
      width="auto"
      scrollable
    >
      <v-sheet
        class="d-flex align-center flex-column pa-4"
        elevation="4"
        rounded="lg"
        width="90vw"
        height="80vh"
      >
        <v-btn
           icon="mdi-close"
           variant="text"
           size="small"
           @click="uiStore.hideDatabaseViewer()"
           style="position: absolute; top: 8px; right: 8px; z-index: 1;"
        ></v-btn>
  
        <v-btn-toggle
          v-model="selectedDataTypeIndex"
          divided
          mandatory
          rounded="xl"
          variant="outlined"
          color="primary"
          class="mb-4"
        >
          <v-btn>Armors</v-btn>
          <v-btn>Decorations</v-btn>
          <v-btn>Skills</v-btn>
        </v-btn-toggle>
  
        <v-text-field
          v-model="search"
          label="Search"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          hide-details
          single-line
          clearable
          density="compact"
          class="mb-2"
          style="width: 100%; max-width: 400px;"
        ></v-text-field>
  
        <v-progress-circular
           v-if="dataStore.isLoading && currentItems.length === 0"
           indeterminate
           color="primary"
           class="my-10"
        ></v-progress-circular>
  
         <v-alert
           v-else-if="dataStore.error"
           type="warning"
           density="compact"
           class="my-4"
         >
           Could not load data: {{ dataStore.error }}
         </v-alert>
  
        <v-data-table-virtual
          v-else
          :headers="currentHeaders"
          :items="currentItems"
          :search="search"
          fixed-header
          height="400"
          item-value="key"
          density="compact"
          class="data-table-full-width"
        >
           <template v-slot:item.name="{ item }">
             <span class="font-weight-medium">{{ item.name }}</span>
           </template>
           <template v-slot:item.levelDescription="{ item }">
             <span style="font-size: 0.8rem;">{{ item.levelDescription }}</span>
           </template>
        </v-data-table-virtual>

      </v-sheet>
    </v-dialog>
  </template>
  
<script setup>
  // Plugin Constants
  import { ref, computed, watch } from 'vue';

  // Pinia Stores
  import { useUiStore } from '@/stores/ui';
  import { useDataStore } from '@/stores/data';
  
  // Local Stores
  const uiStore = useUiStore();
  const dataStore = useDataStore();
  
  // Local Data / Mappings
  const search = ref('');

  const selectedDataTypeIndex = ref(0); // 0: Armors, 1: Decorations, 2: Skills 
  const dataTypes = ['Armors', 'Decorations', 'Skills'];
  const selectedDatatable = computed(() => dataTypes[selectedDataTypeIndex.value]);
  
  const headersConfig = {
  Armors: [
    { key: "name", title: "Name", align: 'start', sortable: true, width: '250px' },
    { key: "kind", title: "Type", align: 'start', sortable: true, width: '100px' },
    { key: "slots", title: "Slots", align: 'center', sortable: false, width: '100px' },
    { key: "skills", title: "Skills", align: 'start', sortable: false, width: '350px' },
    { key: "armorSet", title: "Set", align: 'start', sortable: true, width: '200px' },
  ],
  Decorations: [
    { key: "name", title: "Name", align: 'start', sortable: true, width: '250px' },
    { key: "slot", title: "Size", align: 'center', sortable: true, width: '200px' },
    { key: "skills", title: "Skills", align: 'start', sortable: false, width: '340px' },
    { key: "kind", title: "Kind", align: 'start', sortable: true, width: '100px' },
  ],
  Skills: [
    { key: "name", title: "Name", align: 'start', sortable: true, width: '250px' },
    { key: "level", title: "Lvl", align: 'center', sortable: false, width: '60px' },
    { key: "levelDescription", title: "Level Description", align: 'start', sortable: false, width: '400px' },
    { key: "abilityDescription", title: "Ability Description", align: 'start', sortable: false, width: '300px' },
  ],
};

  // Computed Properties
  const itemsConfig = {
    Armors: computed(() => {
       if (!dataStore.allArmorData) return [];
       let keyCounter = 0;
       return dataStore.allArmorData.map(armor => ({
          key: `armor-${armor.id || keyCounter++}`,
          name: armor.name,
          kind: armor.kind.charAt(0).toUpperCase() + armor.kind.slice(1),
          defense: armor.defense?.base || '-',
          slots: armor.slots?.join('-') || '-',
          skills: armor.skills?.map(s => `${s.skill.name} Lvl ${s.level}`).join(', ') || '-',
          armorSet: armor.armorSet?.name || 'N/A'
       }));
    }),
    Decorations: computed(() => {
      if (!dataStore.allDecorationData) return [];
      let keyCounter = 0;
      return dataStore.allDecorationData.map(deco => ({
          key: `deco-${deco.id || keyCounter++}`,
          name: deco.name.slice(0,-4),
          slot: deco.slot,
          skills: deco.skills?.map(s => `${s.skill.name} Lvl ${s.level}`).join(', ') || '-',
          kind: deco.kind ? (deco.kind.charAt(0).toUpperCase() + deco.kind.slice(1)) : 'N/A',
      }));
    }),
    Skills: computed(() => {
      if (!dataStore.allSkillData) return [];
      const details = [];
      let keyCounter = 0;
      dataStore.allSkillData.forEach(skill => {
        skill.ranks?.forEach(rank => {
          details.push({
            key: `skill-${keyCounter++}`,
            name: skill.name,
            abilityDescription: skill.description,
            level: rank.level,
            levelDescription: rank.description
          });
        });
      });
      return details;
    }),
  };

  const currentHeaders = computed(() => headersConfig[selectedDatatable.value] || []);
  const currentItems = computed(() => itemsConfig[selectedDatatable.value]?.value || []);
  
  // Watchers
  watch(selectedDataTypeIndex, () => {
    search.value = '';
  });
</script>
  
  <style scoped>
  .data-table-full-width {
    width: 100%;
  }
  
  :deep(.v-data-table__td[aria-colindex="2"]) {
    width: 50px;
    min-width: 50px;
    text-align: center;
  }
  
  :deep(.v-data-table__td) {
    white-space: normal !important;
    word-break: break-word;
  }
  </style>