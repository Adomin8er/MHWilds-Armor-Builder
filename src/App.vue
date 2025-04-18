<template>
  <v-app :style="appBackgroundStyle">

    <MHWildsHeader />

    <v-main>
      <v-container class="app-container">
          <v-row v-if="dataStore.isLoading">
            <v-col class="text-center">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
              <p>Loading data...</p>
            </v-col>
          </v-row>
          <v-row v-else-if="dataStore.error">
            <v-col>
              <v-alert type="error" prominent>
                Failed to load application data: {{ dataStore.error }}
              </v-alert>
            </v-col>
          </v-row>
          <template v-else>
          <DatabaseViewer
          :model-value="uiStore.isDatabaseViewerVisible"
          @update:modelValue="uiStore.isDatabaseViewerVisible = $event"
          >
          </DatabaseViewer>
          <v-row
              v-for="equipmentPiece in EQUIPMENT_PIECES_ORDERED"
              :key="equipmentPiece"
              class="equipment-row"
            >
              <EquipmentCard
                class="bg-brown-lighten-4"
                :equipmentPiece="equipmentPiece"
                />
            </v-row>
            <v-row class="full-build-row">
              <FullBuildCard
                class="bg-brown-lighten-4"
              />
            </v-row>
          </template>
      </v-container>
    </v-main>

    <MHWildsFooter/>

    <v-slide-x-reverse-transition>
      <v-fab
        v-if="showFab"
        :icon="icon_artifactLookup"
        class="app-fab border-sm border-opacity-100 rounded-circle"
        @click="uiStore.showDatabaseViewer()"
      ></v-fab>
    </v-slide-x-reverse-transition>

  </v-app>
</template>

<script setup>
// Plugin Constants
import { ref, onMounted, onBeforeUnmount, markRaw, computed } from 'vue';

// Pinia Stores
import { useDataStore } from '@/stores/data';
import { useBuildStore } from '@/stores/build';
import { useUiStore } from '@/stores/ui'
import { EQUIPMENT_PIECES_ORDERED } from '@/constants';
import { useBackgrounds } from '@/composables/useBackgrounds';

// Child Components
import MHWildsHeader from '@/layouts/MHWildsHeader.vue';
import MHWildsFooter from '@/layouts/MHWildsFooter.vue';
import EquipmentCard from '@/components/EquipmentCard.vue';
import FullBuildCard from '@/components/FullBuildCard.vue';
import DatabaseViewer from '@/components/DatabaseViewer.vue';

// Icons
import Icon_ArtifactLookup from './components/icons/Icon_ArtifactLookup.vue';

// Use Pinia Stores
const dataStore = useDataStore();
const buildStore = useBuildStore();
const uiStore = useUiStore();

// Backgrounds
const { appBackgroundStyle, setupRandomBackground } = useBackgrounds()

// Icon
const icon_artifactLookup = markRaw(Icon_ArtifactLookup);

// FAB
const showFab = ref(false);
const handleScroll = () => {
  showFab.value = window.scrollY > 50;
};

// Lifecycle Hooks
onMounted(async () => {
  setupRandomBackground();
  window.addEventListener('scroll', handleScroll);
  if (dataStore.allArmorData.length === 0) { 
      await dataStore.fetchAllInitialData();
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
.app-fab {
  position: fixed !important;
  top: 20px;
  right: 16px;
  z-index: 1005;
}

.app-fab :deep(.v-btn) {
  background: linear-gradient(
    30deg,
    #4a0a0a 0%,
    #730d0d 40%,
    #9e1e1e 100%
  ) !important;
}

.app-fab :deep(.v-icon){
  transform: scale(1.4);
}

.app-container {
  padding-top: 16px;
  padding-bottom: 16px;
}

.equipment-row, .full-build-row {
  padding: 5px 0;
  margin-bottom: 10px;
}
</style>