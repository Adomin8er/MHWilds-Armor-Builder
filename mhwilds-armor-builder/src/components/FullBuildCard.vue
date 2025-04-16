<template>
  <v-card variant="outlined" class="full-build-card">
    <v-card-title class="text-center text-h6 bg-brown-darken-1">
      Build Skill Summary
    </v-card-title>
    <v-divider></v-divider>

    <v-card-text>
      <v-row v-if="isLoading" justify="center" class="py-4">
         <v-progress-circular indeterminate color="primary"></v-progress-circular>
         <span class="ml-3">Loading skill definitions...</span>
      </v-row>

      <v-list v-else-if="skillDetailsList.length > 0" lines="two" density="compact">
        <v-list-item
          v-for="skill in skillDetailsList"
          :key="skill.name"
          class="skill-list-item"
        >
          <v-list-item-title class="font-weight-bold">
            {{ skill.name }}

            <span v-if="skill.type === 'normal'" :class="[
                'level-display',
                { 'max-level': skill.isMaxLevel },
                { 'over-level': skill.isOverLevel }
            ]">
              Lv {{ skill.rawLevel }} / {{ skill.maxLevel }}
            </span>

            <span v-else-if="skill.type === 'set' || skill.type === 'group'" :class="[
                'level-display',
                'set-group-level-display',
                { 'inactive-set-group': skill.activeLevel === 0 },
                { 'active-set-group': skill.activeLevel > 0 && !skill.isFullyActive },
                { 'max-set-group': skill.isFullyActive }
            ]">
              Lv {{ skill.activeLevel }} / {{ skill.maxLevel }}
            </span>

             <span v-else-if="skill.type === 'unknown'" class="level-display unknown-level">
               Lv {{ skill.rawLevel }} / ?
             </span>

            <template v-if="skill.type === 'normal'">
              <v-icon v-if="skill.isMaxLevel" color="amber" size="small" class="ml-1" title="Max Level">
                mdi-star
              </v-icon>
              <v-icon v-else-if="skill.isOverLevel" color="error" size="small" class="ml-1" title="Over Maximum Level">
                mdi-alert-circle-outline
              </v-icon>
            </template>

            <template v-else-if="skill.type === 'set' || skill.type === 'group'">
               <v-icon v-if="skill.activeLevel > 0"
                 :color="skill.type === 'set' ? 'cyan-darken-1' : 'deep-purple-lighten-1'"
                 size="small"
                 class="ml-1"
                 :title="skill.type === 'set' ? 'Set Bonus Active' : 'Group Bonus Active'"
               >
                 {{ skill.type === 'set' ? 'mdi-shield-star-outline' : 'mdi-account-group-outline' }}
               </v-icon>
                <v-icon v-if="skill.isFullyActive" color="amber" size="x-small" class="ml-1" title="Bonus Fully Active">
                  mdi-star
               </v-icon>
            </template>
          </v-list-item-title>

          <v-list-item-subtitle class="skill-description">
            {{ (skill.type === 'set' || skill.type === 'group')
                ? (skill.definition?.ranks?.find(r => r.level === skill.activeLevel)?.description || skill.overallDescription || 'Description unavailable.')
                : (skill.currentLevelDescription || skill.overallDescription || 'No description available.')
            }}
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>

      <v-row v-else justify="center" class="py-4 text-grey">
        <v-icon left>mdi-information-outline</v-icon>
        <span class="ml-2">No skills active in the current build.</span>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
// Plugin Constants
import { computed } from 'vue';

// Pinia Stores
import { useBuildStore } from '@/stores/build';
import { useDataStore } from '@/stores/data';

// Stores
const buildStore = useBuildStore();
const dataStore = useDataStore();

// Computed Properties
const aggregatedSkills = computed(() => {
  return (buildStore.totalSkills && typeof buildStore.totalSkills === 'object') ? buildStore.totalSkills : {};
});

const isLoading = computed(() => dataStore.isLoading);

const skillDetailsList = computed(() => {
  if (dataStore.isLoading || !dataStore.allSkillData || !aggregatedSkills.value) {
    return [];
  }

  const skillDefinitionMap = new Map(
    (dataStore.allSkillData || []).map(skill => [skill.name, skill])
  );

  const details = [];

  for (const skillName in aggregatedSkills.value) {
    const aggregate = aggregatedSkills.value[skillName];
    const definition = skillDefinitionMap.get(skillName);

    const sourceTypesArray = aggregate?.sourceTypes || [];
    const pieceCount = aggregate?.pieceCount ?? 0;

    const isSetSkill = Array.isArray(sourceTypesArray) && sourceTypesArray.includes('set');
    const isGroupSkill = Array.isArray(sourceTypesArray) && sourceTypesArray.includes('group');

    // Logic for pushing Set/Group skills (no change here)
    if (isSetSkill || isGroupSkill) {
      let calculatedActiveLevel = 0;
      let calculatedMaxLevel = 0;
      let isFullyActive = false;

      if (isGroupSkill) {
        calculatedMaxLevel = 1;
        if (pieceCount >= 3) {
          calculatedActiveLevel = 1;
          isFullyActive = true;
        }
      } else { // isSetSkill
        calculatedMaxLevel = 2; // Assuming max 2 levels for set skills, adjust if needed
        if (pieceCount >= 4) { // Threshold for level 2
          calculatedActiveLevel = 2;
          isFullyActive = true;
        } else if (pieceCount >= 2) { // Threshold for level 1
          calculatedActiveLevel = 1;
        }
      }

      details.push({
        name: skillName,
        type: isSetSkill ? 'set' : 'group',
        activeLevel: calculatedActiveLevel,
        maxLevel: calculatedMaxLevel,
        isFullyActive: isFullyActive,
        overallDescription: definition?.description || 'Description unavailable.',
        sources: aggregate.sources || [],
        pieceCount: pieceCount,
        definition: definition
      });

    // Logic for pushing Normal skills (no change here)
    } else if (definition && definition.ranks && definition.ranks.length > 0) {
      const maxLevel = definition.ranks.length;
      const rawLevel = aggregate.level || 0;
      const isOverLevel = rawLevel > maxLevel;
      const isMaxLevel = rawLevel === maxLevel;
      const cappedLevel = Math.min(rawLevel, maxLevel);
      const currentLevelDescription = definition.ranks.find(rank => rank.level === cappedLevel)?.description;

      details.push({
        name: skillName,
        type: 'normal', // Assign type explicitly
        rawLevel: rawLevel,
        currentLevel: cappedLevel,
        maxLevel: maxLevel,
        isMaxLevel: isMaxLevel,
        isOverLevel: isOverLevel,
        overallDescription: definition.description,
        currentLevelDescription: currentLevelDescription,
        sources: aggregate.sources || [],
        pieceCount: pieceCount,
        definition: definition
      });

    // Logic for pushing Unknown skills (no change here)
    } else {
      details.push({
        name: `${skillName} ${definition ? '' : '(Unknown)'}`,
        type: 'unknown', // Assign type explicitly
        rawLevel: aggregate.level || 0,
        currentLevel: aggregate.level || 0,
        maxLevel: '?',
        isMaxLevel: false,
        isOverLevel: false,
        overallDescription: definition?.description || 'Definition not found.',
        currentLevelDescription: 'Level details unavailable.',
        sources: aggregate.sources || [],
        pieceCount: pieceCount,
        definition: definition
      });
    }
  }

  details.sort((a, b) => {
    const typeOrder = {
      normal: 0,
      unknown: 0,
      group: 1,
      set: 2,
    };

    const typeA = typeOrder[a.type];
    const typeB = typeOrder[b.type];

    if (typeA !== typeB) {
      return typeA - typeB;
    }

    return a.name.localeCompare(b.name);
  });
  
  return details;
});
</script>

<style scoped>
.full-build-card {
  width: 100%;
}

.skill-list-item {
  border-bottom: 1px solid rgba(128, 128, 128, 0.1);
  padding-top: 8px;
  padding-bottom: 8px;
}

.skill-list-item:last-child {
  border-bottom: none;
}

.level-display {
  display: inline-block; 
  font-size: 0.85em;
  font-weight: normal;
  color: #616161; 
  margin-left: 8px;
  background-color: #f5f5f5; 
  padding: 1px 6px;
  border-radius: 10px; 
  vertical-align: middle; 
  transition: background-color 0.3s, color 0.3s;
  line-height: 1.4; 
}

.level-display.inactive-set-group {
    color: #9e9e9e; 
    background-color: #eeeeee; 
    font-style: italic;
}

.level-display.active-set-group {
    color: #424242;
    background-color: #e0e0e0;
    font-weight: bold;
}

.level-display.max-set-group {
    color: #c28f0a; 
    background-color: #fff8e1; 
    font-weight: bold;
}

.level-display.max-level {
  color: #c28f0a;
  background-color: #fff8e1;
  font-weight: bold;
}

.level-display.over-level {
  color: #ffffff; 
  background-color: #e53935; 
  font-weight: bold;
}

.level-display.unknown-level {
    color: #757575;
    background-color: #f5f5f5;
    font-style: italic;
}

.skill-description {
  font-size: 0.8rem;
  color: #424242;
  white-space: normal;
  padding-top: 2px;
  line-height: 1.3;
}

.source-list {
    list-style: none;
    padding-left: 0;
    font-size: 0.75rem;
    color: #eeeeee; 
}
.source-list li {
    margin-bottom: 2px;
}

</style>