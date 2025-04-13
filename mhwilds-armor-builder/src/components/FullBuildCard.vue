<template>
  <v-card
    class="equipmentCard-vCard"
    variant="outlined">
    <v-slide-group
    >
      <v-card
        height="316"
        width="0"
      >
      </v-card>
      <v-slide-group-item
        v-for="skillData in appliedSkillsData"
      >
      <v-card
        v-if="
          (skillData.kind === 'armor' || skillData.kind === 'weapon')
          || skillData.kind == 'group' && appliedSkills[skillData.name] >= 3
          || skillData.kind == 'set' && appliedSkills[skillData.name] >= 2
        "
          class="position-relative elevation-5 ma-2"
          variant="elevated"
          width="225"
          height="300"
          :style="getCardBackgroundStyle(skillData.kind)"
        >
          <template v-slot:title>
            <span class="equipmentCard-vCard-title text-grey-lighten-1">{{ skillData.name }}</span>
          </template>
            
          <template v-slot:subtitle>
            
              <span
                v-if="skillData.kind == 'armor' || skillData.kind == 'weapon'"
                class="text-wrap text-grey-lighten-3"
              >
                {{
                  appliedSkills[skillData.name] <= skillData.ranks.length
                  ? skillData.name + ' Lvl ' + appliedSkills[skillData.name]
                  : skillData.name + ' Lvl ' + skillData.ranks.length
                }}
              </span>
              <span
                v-else-if="skillData.kind == 'group' && appliedSkills[skillData.name] >= 3"
                class="text-wrap"
              >
                {{
                  skillData.ranks[0].name + ' Lvl 1'
                }}
              </span>
              <span
                v-else-if="skillData.kind == 'set' && appliedSkills[skillData.name] >= 2"
                class="text-wrap"
              >
                {{
                  appliedSkills[skillData.name] <= 3
                  ? skillData.ranks[0].name.slice(0,-2) + ' Lvl 1'
                  : skillData.ranks[1].name.slice(0,-2) + ' Lvl 2'
                }}
              </span>
          </template>
          <template v-slot:text>
            <div
              style=
                "
                  height: 150px;
                  border-radius: 10px;
                  background-color: rgba(0, 0, 0, .6);
                  pointer-events: none;
                  padding: 10px;
                  z-index: 1;
                "
            >
              <span
                class="text-wrap text-grey-lighten-2"
              >
                <span
                >
                  {{
                    appliedSkills[skillData.name] <= skillData.ranks.length
                    ? skillData.ranks[appliedSkills[skillData.name]-1].description
                    : skillData.ranks[skillData.ranks.length-1].description
                  }}
                  <span
                    class="text-red-lighten-1"
                    v-if="
                      (skillData.kind === 'armor' || skillData.kind === 'weapon')
                      && appliedSkills[skillData.name] > skillData.ranks.length"
                    style="display: block;"
                  >
                    Limit surpassed. ({{ appliedSkills[skillData.name] }} of {{ skillData.ranks.length }})
                  </span>
                </span>
              </span>
            </div>
          </template>
          <v-card-text class="pa-4">
            {{ appliedSkills.description }}
          </v-card-text>
          <div class="position-absolute bottom-0 w-100">
            <div class="text-center text-caption text-wrap text-grey-lighten-2">Level</div>
            <v-divider></v-divider>
            <v-footer
              class="fullCardBuild-vFooter pa-2 bg-transparent"
            >
              <v-row
                v-for="skillName,index in skillData.ranks"
                no-gutters class="justify-space-evenly"
              >
                <v-chip
                  v-if="
                    (skillData.kind === 'armor' || skillData.kind === 'weapon')
                      && index == appliedSkills[skillData.name]-1
                    || (skillData.kind === 'armor' || skillData.kind === 'weapon')
                      && index == skillData.ranks.length-1
                      && appliedSkills[skillData.name] > skillData.ranks.length
                  "
                  icon
                  class="rounded-circle ms-1"
                  style=
                    "
                      width: 16px;
                      height: 16px;
                      background: linear-gradient(
                        165deg,
                        #80600c 0%,
                        #b8860b 25%,
                        #e6c45d 50%,
                        #b8860b 75%,
                        #80600c 100%
                      );
                    "
                  variant="flat"
                >
                </v-chip>
                <v-chip
                  v-else-if="
                    (skillData.kind === 'armor' || skillData.kind === 'weapon')
                    && index < appliedSkills[skillData.name]-1
                  "
                  icon
                  class="rounded-circle ms-1"
                  style= 
                    "
                      width: 16px;
                      height: 16px;
                      background: linear-gradient(
                        165deg,
                        #5a5a5a 0%,
                        #a0a0a0 25%,
                        #dcdcdc 50%,
                        #a0a0a0 75%,
                        #5a5a5a 100%
                      );
                    "
                  variant="flat"
                >
                </v-chip>
                <v-chip
                  v-else-if="(skillData.kind === 'armor' || skillData.kind === 'weapon') && index > appliedSkills[skillData.name]-1"
                  icon
                  class="rounded-circle ms-1"
                  style= 
                    "
                      width: 16px;
                      height: 16px;
                      background: linear-gradient(
                        165deg,
                        #4e2a04 0%,
                        #8a4f22 25%,
                        #b06b3b 50%,
                        #8a4f22 75%,
                        #4e2a04 100%
                      );
                    "
                  variant="flat"
                >
                </v-chip>
                <v-chip
                  v-else-if="skillData.kind === 'group'"
                  icon
                  class="rounded-circle ms-1"
                  style=
                    "
                      width: 16px;
                      height: 16px;
                      background: linear-gradient(
                        165deg,
                        #80600c 0%,
                        #b8860b 25%,
                        #e6c45d 50%,
                        #b8860b 75%,
                        #80600c 100%
                      );
                    "
                  variant="flat"
                >
                </v-chip>
                <v-chip
                  v-else-if="skillData.kind === 'set' && index < Math.floor((appliedSkills[skillData.name]/2)-1)"
                  icon
                  class="rounded-circle ms-1"
                  style= 
                    "
                      width: 16px;
                      height: 16px;
                      background: linear-gradient(
                        165deg,
                        #5a5a5a 0%,
                        #a0a0a0 25%,
                        #dcdcdc 50%,
                        #a0a0a0 75%,
                        #5a5a5a 100%
                      );
                    "
                  variant="flat"
                >
                </v-chip>
                <v-chip
                  v-else-if="skillData.kind === 'set' && index == Math.floor((appliedSkills[skillData.name]/2)-1)"
                  icon
                  class="rounded-circle ms-1"
                  style=
                    "
                      width: 16px;
                      height: 16px;
                      background: linear-gradient(
                        165deg,
                        #80600c 0%,
                        #b8860b 25%,
                        #e6c45d 50%,
                        #b8860b 75%,
                        #80600c 100%
                      );
                    "
                  variant="flat"
                >
                </v-chip>
                <v-chip
                  v-else-if="skillData.kind === 'set' && index > Math.floor((appliedSkills[skillData.name]/2)-1)"
                  icon
                  class="rounded-circle ms-1"
                  style=
                    "
                      width: 16px;
                      height: 16px;
                      background: linear-gradient(
                        165deg,
                        #80600c 0%,
                        #b8860b 25%,
                        #e6c45d 50%,
                        #b8860b 75%,
                        #80600c 100%
                      );
                    "
                  variant="flat"
                ></v-chip>
              </v-row>
            </v-footer>
          </div>
        </v-card>
      </v-slide-group-item>
    </v-slide-group>
  </v-card>
</template>


<script setup>
import Card_ArmorSkill from "@/assets/images/skills/Card_ArmorSkill.webp"
import Card_WeaponSkill from "@/assets/images/skills/Card_WeaponSkill.webp"
import Card_GroupSkill from "@/assets/images/skills/Card_GroupSkill.webp"
import Card_SetSkill from "@/assets/images/skills/Card_SetSkill.webp"


import { ref, watch } from 'vue';

const props = defineProps({
    api_baseUrl: String,
    allSkills: Object
});

const appliedSkills = ref({})
const appliedSkillsData = ref([])

watch(
  () => props.allSkills,
  (updatedSkills) => {
    const skills = Object.values(updatedSkills)
      .flatMap(equipmentPiece => Object.values(equipmentPiece))
      .flatMap(equipmentSkillGroup => Object.values(equipmentSkillGroup))
      .filter(skill => skill !== "-")
      .map(skill => skill.replace(/\(E\) -|\(D1\) -|\(D2\) -|\(D3\) -/g, "").trim());

    appliedSkills.value = skills.reduce((acc, skill) => {
      acc[skill] = (acc[skill] || 0) + 1;
      return acc;
    }, {});

  fetchSkillData(appliedSkills.value);
  },
  { deep: true }
);

async function fetchSkillData(appliedSkillsObject) {
  let temoporaryAppliedSkills = []

  await Promise.all(Object.keys(appliedSkillsObject).map(async skillName => {
    try {
      const skillResponse = await fetch(`${props.api_baseUrl}skills`);
      const skillData = await skillResponse.json();
      let querySkillsData = [];

      querySkillsData = skillData
        .filter(item => item.name === skillName)

      temoporaryAppliedSkills.push(...querySkillsData)
    } catch {
      console.log("Unable to find skill information for:", skillName)
    }
  }))
  appliedSkillsData.value = temoporaryAppliedSkills.sort((a, b) => {
    const kindOrder = { armor: 1, weapon: 1, group: 2, set: 3 };
    const kindA = kindOrder[a.kind];
    const kindB = kindOrder[b.kind];

    if (kindA !== kindB) {
      return kindA - kindB;
    }

    return a.name.localeCompare(b.name);
  });
  console.log(appliedSkillsData.value)
}

function getCardBackgroundStyle(kind) {
  switch (kind) {
    case 'armor':
      return {
        backgroundImage: `url(${Card_ArmorSkill})`,
        backgroundSize: 'cover'
      };
    case 'weapon':
      return {
        backgroundImage: `url(${Card_WeaponSkill})`,
        backgroundSize: 'cover'
      };
    case 'group':
      return {
        backgroundImage: `url(${Card_GroupSkill})`,
        backgroundSize: 'cover'
      };
    case 'set':
      return {
        backgroundImage: `url(${Card_SetSkill})`,
        backgroundSize: 'cover'
      };
    default:
      return {
        background: 'white'
      };
  }
}
</script>

<style scope>
.equipmentCard-vCard {
  width: 100vw;
}
.equipmentCard-vCard-title {
  font-size: 18px;
  font-weight: 800;
}
</style>