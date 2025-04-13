<template>
  <v-app>
    <v-img
      height="74"
      cover
      :src="Banner_01"
    >
      <div
        class="d-flex align-center"
      >
        <v-col cols="3" class="ma-0 pa-0">
          <v-img
            height="74"
            width="110"
            cover
            :src="Logo_Dragon"
          >
          </v-img>
        </v-col>
        <v-col cols="6" class="text-h4 text-center">
          <v-img
            height="45"
            :src="Title"
          >
          </v-img>
        </v-col>
        <v-col cols="3" class="d-flex justify-end">
          <v-btn
            icon
            class="elevation-2"
            style="
              height: 50px;
              width: 50px;
              background: linear-gradient(
                30deg,
                #4a0a0a 0%,
                #730d0d 40%,
                #9e1e1e 100%
              );
            "
          >
            <Icon_ArtifactLookup
              height="36"
              width="36"
              color="white"
            />
          </v-btn>
        </v-col>
      </div>
    </v-img>
    <v-slide-x-reverse-transition>
      <v-fab
        v-if="showFab"
        class="appVue-vSlideXTransitionReverse-showFab border-sm border-opacity-100 rounded-circle"
        :icon="equipmentCardImages.icon_artifactLookup"
      ></v-fab>
    </v-slide-x-reverse-transition>
    <div
      style="
        position: relative;
        z-index: 2;
        height: 5px;
        background: linear-gradient(
          90deg,
          #8c5c07 0%,
          #b7892b 15%,
          #f7e18d 35%,
          #fff9d7 50%,
          #f7e18d 65%,
          #b7892b 85%,
          #8c5c07 100%
        );
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.8);
      "
    ></div>
    <v-img
      cover
      :src="currentBackground"
    >
      <v-container class="appVue-vContainer">
        <v-row
          class="appVue-vRow"
          v-for="equipmentPiece in equipmentPieces"
          :key="equipmentPiece"
          >
          <EquipmentCard
            class="appVue-equipmentCard bg-brown-lighten-4"
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
            class="bg-brown-lighten-4"
            :api_baseUrl="api_baseUrl"
            :allSkills="allSkills"
            >
          </FullBuildCard>
        </v-row>
      </v-container>
    </v-img>
    <div
      style="
        position: relative;
        z-index: 2;
        height: 5px;
        background: linear-gradient(
          90deg,
          #8c5c07 0%,
          #b7892b 15%,
          #f7e18d 35%,
          #fff9d7 50%,
          #f7e18d 65%,
          #b7892b 85%,
          #8c5c07 100%
        );
      "
    ></div>
    <v-img height="74" cover :src="Banner_02">
      <div class="d-flex align-center" style="height: 100%">
        <v-col cols="3" class="ma-0 pa-0">
        </v-col>
        <v-col cols="6" class="ma-0 pa-0 text-h4 text-center">
          <v-img
            class="mx-auto pt-0"
            height="74"
            width="74"
            :src="Logo_MHWildsArmorBuilder"
          >
          </v-img>
        </v-col>
        <v-col cols="3" class="ma-0 pa-0" style="display: flex; justify-content: flex-end; overflow: hidden;">
          <v-img
            height="74"
            max-width="110"
            cover
            :src="Logo_Phoenix"
          >
          </v-img>
        </v-col>
      </div>
    </v-img>
  </v-app>
</template>

<script setup>
import Bgd_01_WindwardPlains_01 from './assets/images/backgrounds/Bgd_01_WindwardPlains_01.webp';
import Bgd_01_WindwardPlains_02 from './assets/images/backgrounds/Bgd_01_WindwardPlains_02.webp';
import Bgd_01_WindwardPlains_03 from './assets/images/backgrounds/Bgd_01_WindwardPlains_03.webp';
import Bgd_02_ScarletForest_01 from './assets/images/backgrounds/Bgd_02_ScarletForest_01.webp';
import Bgd_02_ScarletForest_02 from './assets/images/backgrounds/Bgd_02_ScarletForest_02.webp';
import Bgd_02_ScarletForest_03 from './assets/images/backgrounds/Bgd_02_ScarletForest_03.webp';
import Bgd_03_OilwellBasin_01 from './assets/images/backgrounds/Bgd_03_OilwellBasin_01.webp';
import Bgd_03_OilwellBasin_02 from './assets/images/backgrounds/Bgd_03_OilwellBasin_02.webp';
import Bgd_03_OilwellBasin_03 from './assets/images/backgrounds/Bgd_03_OilwellBasin_03.webp';
import Bgd_04_IceshardCliffs_01 from './assets/images/backgrounds/Bgd_04_IceshardCliffs_01.webp';
import Bgd_05_RuinsOfWyveria_01 from './assets/images/backgrounds/Bgd_05_RuinsOfWyveria_01.webp';
import Banner_01 from './assets/images/banners/Banner_01.webp';
import Banner_02 from './assets/images/banners/Banner_02.webp';
import Icon_ArtifactLookup from '@/components/icons/Icon_ArtifactLookup.vue';
import Logo_Dragon from './assets/images/logos/Logo_Dragon.webp';
import Logo_MHWildsArmorBuilder from './assets/images/logos/Logo_MHWildsArmorBuilder.svg';
import Logo_Phoenix from './assets/images/logos/Logo_Phoenix.webp';
import Title from './assets/images/titles/Title_MHWildsArmorBuilder.svg';

import EquipmentCard from './components/EquipmentCard.vue';
import FullBuildCard from './components/FullBuildCard.vue';

import { onMounted, ref, onBeforeUnmount } from 'vue';

const backgroundImages = [
  Bgd_01_WindwardPlains_01,
  Bgd_01_WindwardPlains_02,
  Bgd_01_WindwardPlains_03,
  Bgd_02_ScarletForest_01,
  Bgd_02_ScarletForest_02,
  Bgd_02_ScarletForest_03,
  Bgd_03_OilwellBasin_01,
  Bgd_03_OilwellBasin_02,
  Bgd_03_OilwellBasin_03,
  Bgd_04_IceshardCliffs_01,
  Bgd_05_RuinsOfWyveria_01
];

const currentBackground = ref(backgroundImages[0]);

const equipmentCardImages = {
  icon_artifactLookup: Icon_ArtifactLookup
};

onMounted(() => {
  const randomIndex = Math.floor(Math.random() * backgroundImages.length);
  currentBackground.value = backgroundImages[randomIndex];

  window.addEventListener('scroll', handleScroll);
  fetchDecorations();
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll);
});

const showFab = ref(false);

const handleScroll = () => {
  showFab.value = window.scrollY > 50;
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

.appVue-vSlideXTransitionReverse-showFab :deep(.v-btn) {
  background: linear-gradient(
    30deg,
    #4a0a0a 0%,
    #730d0d 40%,
    #9e1e1e 100%
  ) !important;
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