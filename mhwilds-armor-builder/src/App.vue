<template>
  <v-app>
    <div
      class="d-flex align-center"
    >
      <v-col cols="3">
        <v-img
          class="appVue-vImg-logo ml-2"
          height="45"
          width="45"
          :src="Logo">
        </v-img>
      </v-col>
      <v-col cols="6" class="text-h4 text-center">
        <v-img
          height="45"
          :src="Title"
        >
        </v-img>
      </v-col>
      <v-col cols="3" class="text-end">
        <Icon_ArtifactLookup
          class="mr-2 mt-2"
          height="36"
          width="36"
        >
        </Icon_ArtifactLookup>
      </v-col>
    </div>
    <v-slide-x-reverse-transition>
      <v-fab
        v-if="showFab"
        class="appVue-vSlideXTransitionReverse-showFab"
        color="primary"
        :icon="equipmentCardImages.icon_artifactLookup"
      ></v-fab>
    </v-slide-x-reverse-transition>
    <v-divider :thickness="1" class="border-opacity-100"></v-divider>
    <v-main>
      <v-container class="appVue-vContainer">
        <v-row
          class="appVue-vRow"
          v-for="equipmentPiece in equipmentPieces"
          :key="equipmentPiece"
          >
          <EquipmentCard
            class="appVue-equipmentCard"
            :equipmentPiece="equipmentPiece"
            :decorationCategories="decorationCategories"
            :api_baseUrl="api_baseUrl"
            @all-skills="handleAllSkills"
          />
        </v-row>
      </v-container>
      <v-container class="appVue-vContainer">
        <v-row
          class="appVue-vRow"
          >
          <FullBuildCard
            :api_baseUrl="api_baseUrl"
            :allSkills="allSkills"
            >
          </FullBuildCard>
        </v-row>
      </v-container>
    </v-main>
    <v-footer class="text-center d-flex flex-column mt-4 py-4"/>
  </v-app>
</template>

<script setup>
import Logo from './assets/images/Logo_MHWildsArmorBuilder.svg';
import Title from './assets/images/Title_MHWildsArmorBuilder.svg';
import Icon_ArtifactLookup from '@/components/icons/Icon_ArtifactLookup.vue';

import EquipmentCard from './components/EquipmentCard.vue';
import FullBuildCard from './components/FullBuildCard.vue';

import { onMounted, ref, onBeforeUnmount } from 'vue';

const equipmentCardImages = {
  icon_artifactLookup: Icon_ArtifactLookup
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll);
});

const showFab = ref(false);

const handleScroll = () => {
  showFab.value = window.scrollY > 100;
};

const equipmentPieces = ref([
  'Head',
  'Chest',
  'Arms',
  'Waist',
  'Legs',
  'Talisman',
  'Weapon'
])

const decorationCategories = ref({
  decorations_0: {},
  decorations_1: {},
  decorations_2: {},
  decorations_3: {},
  decorations_4: {}
})

onMounted(() => {
  fetchDecorations();
});

const api_baseUrl = 'https://wilds.mhdb.io/en/';

async function fetchDecorations() {
  try {
    const response = await fetch(`${api_baseUrl}decorations`);
    const data = await response.json();

    const processDecorations = (slot) => {
      return data
        .filter(item => item.slot <= slot)
        .reduce((acc, item) => {
          const itemName = item.name.slice(0, -4);
          acc[itemName] = item.kind;
          return acc;
        }, {})
    };

    if (decorationCategories.value) {
      decorationCategories.value.decorations_1.decorationData = {};
      decorationCategories.value.decorations_1.decorationData = processDecorations(1);
      decorationCategories.value.decorations_2.decorationData = processDecorations(2);
      decorationCategories.value.decorations_3.decorationData = processDecorations(3);
      decorationCategories.value.decorations_4.decorationData = processDecorations(4);
    }
  } catch (error) {
    console.error('Error fetching decoration data:', error);
  }
}

const allSkills = ref({});

const handleAllSkills = (allSkillsEmitted) => {
  if (!allSkillsEmitted || typeof allSkillsEmitted !== 'object' || Object.keys(allSkillsEmitted).length === 0) {
    console.warn("handleAllSkills received invalid data:", allSkillsEmitted);
    return;
  }
  const emittedKey = Object.keys(allSkillsEmitted)[0];
  const emittedValue = allSkillsEmitted[emittedKey];
  allSkills.value[emittedKey] = emittedValue;
};
</script>

<style scoped>
.appVue-vSlideXTransitionReverse-showFab {
  position: fixed !important;
  top: 16px;
  right: 16px;
  z-index: 9999;
}

.appVue-vSlideXTransitionReverse-showFab :deep(.v-icon){
  transform: scale(1.4);
}

.appVue-vContainer {
  padding: auto;
}

.appVue-vRow {
  height: auto;
  width: auto;
  padding: 5px;
}
</style>