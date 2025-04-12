<template>
  <v-app>
    <v-main>
      <v-img class="appVue-vImg-logo" :src="Logo"/>
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
    <v-footer class="text-center d-flex flex-column mt-4 py-4" color="indigo-lighten-1">
      <v-divider class="my-2" thickness="2" width="50"></v-divider>
      <div class="text-caption font-weight-regular opacity-60">
        Text
      </div>
      <v-divider></v-divider>
      <div>
        {{ new Date().getFullYear() }} — <strong>Vuetify</strong>
      </div>
    </v-footer>
  </v-app>
</template>

<script setup>
import Logo from './assets/images/Image_MHWildsArmorBuilder.svg';

import EquipmentCard from './components/EquipmentCard.vue';
import FullBuildCard from './components/FullBuildCard.vue';

import { onMounted, ref } from 'vue';

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
.appVue-vImg-logo{
  height: 15vh;
  width: auto;
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