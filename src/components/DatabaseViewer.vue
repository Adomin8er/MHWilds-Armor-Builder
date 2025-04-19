<template>
  <v-dialog v-model="uiStore.isDatabaseViewerVisible" width="auto" scrollable>
    <v-sheet class="d-flex align-center flex-column pa-4" elevation="4" rounded="lg" width="90vw" height="80vh">
      <v-btn icon="mdi-close" variant="text" size="small" @click="uiStore.hideDatabaseViewer()"
        style="position: absolute; top: 8px; right: 8px; z-index: 1;"></v-btn>

      <v-btn-toggle
        v-model="selectedDataTypeIndex"
        divided
        mandatory
        rounded="xl"
        variant="text"
        color="primary"
        class="responsive-btn-toggle border mb-2"
      >
        <v-btn>Armors</v-btn>
        <v-btn>Weapons</v-btn>
        <v-btn>Talismans</v-btn>
        <v-btn>Decorations</v-btn>
        <v-btn>Skills</v-btn>
      </v-btn-toggle>

      <v-autocomplete v-if="selectedDataTypeIndex === 1" v-model="selectedWeapon" label="Weapon Type"
        :items="weaponNames" variant="underlined" width="200">
      </v-autocomplete>

      <v-text-field v-model="search" label="Search" prepend-inner-icon="mdi-magnify" variant="outlined" hide-details
        single-line clearable density="compact" class="mb-2" style="width: 100%; max-width: 400px;"></v-text-field>

      <v-progress-circular v-if="dataStore.isLoading && currentItems.length === 0" indeterminate color="primary"
        class="my-10"></v-progress-circular>
      <v-alert v-else-if="dataStore.error" type="warning" density="compact" class="my-4">
        Could not load data: {{ dataStore.error }}
      </v-alert>

      <v-data-table-virtual v-else :headers="currentHeaders" :items="currentItems" :search="search" fixed-header
        height="400" item-value="key" density="compact" class="data-table-full-width">

        <template v-slot:item.name="{ item }">
          <span class="item-column-name font-weight-medium">{{ item.name }}</span>
        </template>

         <template v-slot:item.levelDescription="{ item }">
          <span class="skill-column-level-desc" style="font-size: 0.8rem;">{{ item.levelDescription }}</span>
        </template>

        <template v-slot:item.skillData="{ item }">
           <div v-if="item.skillData" v-html="item.skillData" class="skills-column">
           </div>
           <span v-else>-</span>
         </template>

        <template v-slot:item.sharpness="{ item }">
          <div class="sharpness-bar-container "
            style=" display: flex; align-items: center; justify-content: center; height: 10px; width: 100px; overflow: hidden; background-color: #000000;">
            <div class="sharpness-bar" :style="{
              height: '50%', width: '90%', overflow: 'hidden', background: `linear-gradient(to right, ${item.sharpness})`
            }">
            </div>
          </div>
        </template>

        <template v-if="selectedWeapon === 'Hunting-horn'" v-slot:item.notes="{ item }">
           <span v-if="item.notes" class="weapon-column-notes d-inline-flex align-center bg-black rounded-pill pa-1">
            <template v-for="(color, index) in item.notes.notes" :key="index">
              <v-icon icon="mdi-music-note" :color="color"></v-icon>
            </template>
          </span>
          <span v-else>-</span>
          <v-menu v-if="item.notes && (item.notes.echoBubble !== '-' || item.notes.echoWave !== '-')" location="top" open-on-click :close-on-content-click="false">
             <template v-slot:activator="{ props }">
               <span v-bind="props" class="d-inline-flex align-center ml-1" style="cursor: pointer;">
                 <v-icon icon="mdi-information-slab-circle-outline"></v-icon>
               </span>
             </template>
             <v-sheet rounded="lg" class="pa-2" elevation="2" color="grey-lighten-2">
               <div v-for="(song, color) in item.notes.songs" :key="song.name">
                 <span>{{ song.name }}: </span>
                 <div class="d-inline-flex align-center bg-black rounded-pill mt-1 mb-1 pl-1 pr-1">
                   <span v-for="(color, idx) in song.sequence" :key="idx">
                     <v-icon icon="mdi-music-note" :color="color">
                     </v-icon>
                   </span>
                 </div>
               </div>
                <v-divider v-if="item.notes.echoBubble !== '-' || item.notes.echoWave !== '-'" class="ma-2" thickness="2" />
               <div v-if="item.notes.echoBubble !== '-'"> Echo Bubble: {{ item.notes.echoBubble }}</div>
               <div v-if="item.notes.echoWave !== '-'"> Echo Wave: {{ item.notes.echoWave }}</div>
             </v-sheet>
           </v-menu>
        </template>

        <template v-if="selectedWeapon === 'Gunlance'" v-slot:item.shellInfo="{ item }">
          <span v-if="item.shellInfo">
              {{ item.shellInfo.type }} Lvl {{ item.shellInfo.level }}
          </span>
          <span v-else>-</span>
        </template>

        <template v-if="selectedWeapon === 'Switch-axe' || selectedWeapon === 'Charge-blade'" v-slot:item.phials="{ item }">
           <span>{{ item.phials }}</span>
         </template>

         <template v-if="selectedWeapon === 'Insect-glaive'" v-slot:item.kinsectLvl="{ item }">
           <span>{{ item.kinsectLvl }}</span>
         </template>

         <template v-if="selectedWeapon === 'Bow'" v-slot:item.coatings="{ item }">
             <div v-if="item.coatings" class="weapon-column-coatings d-flex align-center justify-center">
                <div class="align-center bg-black rounded-lg ml-5 pa-1">
                  <div>
                    <template v-for="(color, coatingName, index) in item.coatings" :key="`${coatingName}-1`">
                      <v-icon v-if="index <= 3" icon="mdi-bottle-tonic" :color="color"></v-icon>
                    </template>
                  </div>
                  <div>
                    <template v-for="(color, coatingName, index) in item.coatings">
                      <v-icon v-if="index >= 4" icon="mdi-bottle-tonic" :color="color"></v-icon>
                    </template>
                  </div>
                </div>
                 <v-menu location="top" open-on-click :close-on-content-click="false">
                    <template v-slot:activator="{ props }">
                        <span v-bind="props" class="d-inline-flex align-center ml-1" style="cursor: pointer;">
                            <v-icon icon="mdi-information-slab-circle-outline"></v-icon>
                        </span>
                    </template>
                    <v-sheet rounded="lg" class="pa-2" elevation="2" color="grey-lighten-2">
                        <span>{{ Object.entries(item.coatings).filter(([_, color]) => color !== '#ffffff').map(([name, _]) => name).join(', ') || 'No Coatings Available' }}</span>
                    </v-sheet>
                 </v-menu>
             </div>
             <span v-else>-</span>
         </template>

        <template v-if="selectedWeapon === 'Light-bowgun'" v-slot:item.lbgRapid="{ item }">
           <div v-if="item.lbgRapid" class="weapon-column-lbgrapid d-flex align-center justify-center">
               <div class="bg-black rounded-lg ml-5 pa-1" style="line-height: 0.8;">
                   <div class="justify-start">
                       <template v-for="(ammoInfo, ammoName, index) in item.lbgRapid">
                           <v-icon v-if="ammoInfo.color !== '#ffffff'" :key="`${item.key}-rapid1-${ammoName}`" icon="mdi-bullet" :color="ammoInfo.color" class="mx-n1"></v-icon>
                       </template>
                   </div>
               </div>
               <v-menu location="top" open-on-click :close-on-content-click="false">
                    <template v-slot:activator="{ props }">
                        <span v-bind="props" class="d-inline-flex align-center ml-1" style="cursor: pointer;">
                            <v-icon icon="mdi-information-slab-circle-outline"></v-icon>
                        </span>
                    </template>
                    <v-sheet rounded="lg" class="pa-2" elevation="2" color="grey-lighten-2">
                       <div>
                            <div v-for="(rapidInfo, rapidName) in item.lbgRapid" :key="`${item.key}-tt-${rapidName}`">
                                <template v-if="rapidInfo.details"> <span :style="{ color: rapidInfo.color !== '#ffffff' ? rapidInfo.color : 'inherit' }">{{ rapidName }}</span> </template>
                            </div>
                            <div v-if="Object.values(item.lbgRapid).every(info => !info.details)"> No Rapid Fire Ammo </div>
                       </div>
                    </v-sheet>
                </v-menu>
            </div>
            <span v-else>-</span>
        </template>

        <template v-if="selectedWeapon === 'Light-bowgun'" v-slot:item.lbgMagazine="{ item }">
            <div v-if="item.lbgMagazine" class="weapon-column-lbgmagazine d-flex align-center justify-center">
               <div class="bg-black rounded-lg ml-5 pa-1" style="line-height: 0.8;">
                   <div class="justify-start">
                      <template v-for="(ammoInfo, ammoName, index) in item.lbgMagazine">
                          <v-icon v-if="index <= 8" :key="`${item.key}-mag1-${ammoName}`" icon="mdi-bullet" :color="ammoInfo.color" class="mx-n1"></v-icon>
                      </template>
                   </div>
                    <div class="d-flex justify-start">
                       <template v-for="(ammoInfo, ammoName, index) in item.lbgMagazine">
                           <v-icon v-if="index >= 9 && index <= 17" :key="`${item.key}-mag2-${ammoName}`" icon="mdi-bullet" :color="ammoInfo.color" class="mx-n1"></v-icon>
                       </template>
                   </div>
                   <div class="d-flex justify-start">
                       <template v-for="(ammoInfo, ammoName, index) in item.lbgMagazine">
                           <v-icon v-if="index >= 20" :key="`${item.key}-mag3-${ammoName}`" icon="mdi-bullet" :color="ammoInfo.color" class="mx-n1"></v-icon>
                       </template>
                   </div>
               </div>
                <v-menu location="top" open-on-click :close-on-content-click="false">
                    <template v-slot:activator="{ props }">
                         <span v-bind="props" class="d-inline-flex align-center ml-1" style="cursor: pointer;">
                            <v-icon icon="mdi-information-slab-circle-outline"></v-icon>
                        </span>
                    </template>
                    <v-sheet rounded="lg" class="pa-2" elevation="2" style="max-height: 250px; overflow-y: auto;" color="grey-lighten-2">
                        <div>
                            <div v-for="(ammoInfo, ammoName) in item.lbgMagazine" :key="`${item.key}-tt-${ammoName}`">
                                <template v-if="ammoInfo.details">
                                    <span :style="{ color: ammoInfo.color !== '#ffffff' ? ammoInfo.color : 'inherit' }"> {{ ammoName }} Lvl {{ ammoInfo.details.level }} </span>
                                    <span> ({{ ammoInfo.details.capacity }})</span>
                                </template>
                            </div>
                            <div v-if="Object.values(item.lbgMagazine).every(info => !info.details)"> No Ammo Data </div>
                        </div>
                    </v-sheet>
                </v-menu>
            </div>
            <span v-else>-</span>
        </template>

        <template v-if="selectedWeapon === 'Heavy-bowgun'" v-slot:item.hbgMagazine="{ item }">
           <div v-if="item.hbgMagazine" class="weapon-column-hbgmagazine d-flex align-center justify-center">
               <div class="bg-black rounded-lg ml-5 pa-1" style="line-height: 0.8;">
                    <div class="justify-start">
                      <template v-for="(ammoInfo, ammoName, index) in item.hbgMagazine">
                          <v-icon v-if="index <= 8" :key="`${item.key}-mag1-${ammoName}`" icon="mdi-bullet" :color="ammoInfo.color" class="mx-n1"></v-icon>
                      </template>
                   </div>
                    <div class="d-flex justify-start">
                       <template v-for="(ammoInfo, ammoName, index) in item.hbgMagazine">
                           <v-icon v-if="index >= 9 && index <= 17" :key="`${item.key}-mag2-${ammoName}`" icon="mdi-bullet" :color="ammoInfo.color" class="mx-n1"></v-icon>
                       </template>
                   </div>
                   <div class="d-flex justify-start">
                       <template v-for="(ammoInfo, ammoName, index) in item.hbgMagazine">
                           <v-icon v-if="index >= 20" :key="`${item.key}-mag3-${ammoName}`" icon="mdi-bullet" :color="ammoInfo.color" class="mx-n1"></v-icon>
                       </template>
                   </div>
               </div>
                <v-menu location="top" open-on-click :close-on-content-click="false">
                    <template v-slot:activator="{ props }">
                        <span v-bind="props" class="d-inline-flex align-center ml-1" style="cursor: pointer;">
                            <v-icon icon="mdi-information-slab-circle-outline"></v-icon>
                        </span>
                    </template>
                    <v-sheet rounded="lg" class="pa-2" elevation="2" style="max-height: 250px; overflow-y: auto;" color="grey-lighten-2">
                        <div>
                            <div v-for="(ammoInfo, ammoName) in item.hbgMagazine" :key="`${item.key}-tt-${ammoName}`">
                               <template v-if="ammoInfo.details">
                                   <span :style="{ color: ammoInfo.color !== '#ffffff' ? ammoInfo.color : 'inherit' }"> {{ ammoName }} Lvl {{ ammoInfo.details.level }} </span>
                                   <span>({{ ammoInfo.details.capacity }})</span>
                               </template>
                            </div>
                            <div v-if="Object.values(item.hbgMagazine).every(info => !info.details)"> No Ammo Data </div>
                        </div>
                    </v-sheet>
                </v-menu>
            </div>
            <span v-else>-</span>
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
import { WEAPON_TYPE_KEYS } from '@/constants';

// Local Stores
const uiStore = useUiStore();
const dataStore = useDataStore();

// Local Data / Mappings
const search = ref('');

const selectedDataTypeIndex = ref(0); // 0: Armors, 1:Weapons, 2:Talismans, 3: Decorations, 4: Skills
const dataTypes = ['Armors', 'Weapons', 'Talismans', 'Decorations', 'Skills'];
const selectedDatatable = computed(() => dataTypes[selectedDataTypeIndex.value]);
const weaponNames = Object.values(WEAPON_TYPE_KEYS).map(name => {
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
});
const selectedWeapon = ref(weaponNames[0])

function formatWeaponSpecials(specials) {
  if (!specials || specials.length === 0) return '-';
  return specials.map(spec => {
    const type = (spec.status || spec.element || '').replace('blastblight', 'blast');
    const dmg = spec.damage?.display ? ` ${spec.damage.display}` : '';
    const formattedType = type.charAt(0).toUpperCase() + type.slice(1);
    return `${formattedType}${dmg}`;
  }).join(', ');
}

function formatPhialDisplay(phialData) {
    if (!phialData) return '-';
    let phialKind = null;
    if (typeof phialData === 'object' && phialData !== null && phialData.hasOwnProperty('kind')) {
        phialKind = phialData.kind;
    } else if (typeof phialData === 'string' && phialData.length > 0) {
        phialKind = phialData;
    }
    if (phialKind) {
        return phialKind.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    return '-';
}

const headersConfig = {
  Armors: [
    { key: "name", title: "Name", align: 'start', sortable: true, width: "100px" },
    { key: "armorSet", title: "Set", align: 'start', sortable: true, width: "100px" },
    { key: "kind", title: "Type", align: 'start', sortable: true, width: "100px" },
    { key: "slots", title: "Slots", align: 'center', sortable: false, width: "100px" },
    { key: "skillData", title: "Skills", align: 'start', sortable: false, width: "100px" },
  ],
  Talismans: [
    { key: "name", title: "Name", align: 'start', sortable: true, width: "100px" },
    { key: "skillData", title: "Skills", align: 'start', sortable: false, width: "100px" },
    { key: "description", title: "Description", align: 'start', sortable: false, width: "200px" },
  ],
  Decorations: [
    { key: "name", title: "Name", align: 'start', sortable: true, width: "100px" },
    { key: "kind", title: "Kind", align: 'start', sortable: true, width: "100px" },
    { key: "slot", title: "Size", align: 'start', sortable: true, width: "100px" },
    { key: "skillData", title: "Skills", align: 'start', sortable: false, width: '200px' },
  ],
  Skills: [
    { key: "name", title: "Name", align: 'start', sortable: true, width: "100px"  },
    { key: "level", title: "Lvl", align: 'start', sortable: false, width: "100px"  },
    { key: "levelDescription", title: "Level Description", align: 'start', sortable: false, width: '300px' },
    { key: "abilityDescription", title: "Ability Description", align: 'start', sortable: false, width: '300px' },
  ],
};

const baseWeaponHeaders = [
  { key: "name", title: "Name", align: 'start', sortable: true, width: '200px' },
  { key: "attack", title: "Attack", align: 'center', sortable: true, width: "100px" },
  { key: "affinity", title: "Affinity", align: 'center', sortable: true, width: "100px" },
  { key: "specials", title: "Special", align: 'start', sortable: false, width: "100px" },
  { key: "defense", title: "Defense", align: 'center', sortable: true, width: "110px" },
  { key: "slots", title: "Slots", align: 'center', sortable: false, width: "75px" },
];

const sharpnessHeader = { key: "sharpness", title: "Sharpness", align: 'center', sortable: false, width: "100px" };
const notesHeader = { key: "notes", title: "Notes", align: 'center', sortable: false, width: "150px" };
const shellHeader = { key: "shellInfo", title: "Shells", align: 'center', sortable: false, width: "100px" };
const saPhialHeader = { key: "phials", title: "Phials", align: 'center', sortable: false, width: "100px" };
const cbPhialHeader = { key: "phials", title: "Phials", align: 'center', sortable: false, width: "100px" };
const kinsectLvlHeader = { key: "kinsectLvl", title: "Kinsect Lvl", align: 'center', sortable: false, width: "100px" };
const coatingsHeader = { key: "coatings", title: "Coatings", align: 'center', sortable: false, width: "150px" };
const lbgRapidHeader = { key: "lbgRapid", title: "Rapid", align: 'center', sortable: false, width: "150px" };
const lbgMagazineHeader = { key: "lbgMagazine", title: "Magazine", align: 'center', sortable: false, width: "100px" };
const hbgMagazineHeader = { key: "hbgMagazine", title: "Magazine", align: 'center', sortable: false, width: "100px" };
const skillsHeader = { key: "skillData", title: "Skills", align: 'start', sortable: false, width: '200px' };



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
      skillData: armor.skills.map(skill => `${skill.skill.name} Lvl ${skill.level}`).join('<br>') || '-',
      armorSet: armor.armorSet?.name || 'N/A'
    }));
  }),
  Talismans: computed(() => {
    return dataStore.allCharmData.flatMap(talismanType =>
      talismanType.ranks.map(rank => {
        return {
          key: `talisman-${rank.id}`,
          name: rank.name || 'Unknown Charm',
          skillData: rank.skills.map(skill => {
              const skillName = skill?.skill?.name || 'Unknown Skill';
              const skillLevel = skill?.level || '?';
              return `${skillName} Lvl ${skillLevel}`;
            }).join('<br>') || '-',
          description: rank.skills.map(skill => skill?.description || 'No description')
            .join('<br>') || '-',
        };
      }).filter(Boolean)
    );
  }),

  Weapons: computed(() => {
    if (!dataStore.allWeaponData) return [];
    let keyCounter = 0;
    return dataStore.allWeaponData
      .filter(weapon => weapon.kind.charAt(0).toUpperCase() + weapon.kind.slice(1) === selectedWeapon.value)
      .map(weapon => {

        const baseWeaponData = {
          key: `weapon-${weapon.id || keyCounter++}`,
          name: weapon.name,
          attack: weapon.damage?.display || '-',
          affinity: weapon.affinity !== null ? `${weapon.affinity}%` : '-',
          specials: formatWeaponSpecials(weapon.specials),
          defense: weapon.defense?.base || '-',
          slots: weapon.slots?.join('-') || '-',
          skillData: weapon.skills || [],
          // --- Weapon specific data ---
          notes: weapon.melody
            ? {
              notes: processNoteColors(weapon.melody.notes),
              songs: weapon.melody.songs.map(song => {
                return {
                  name: song.name,
                  sequence: processNoteColors(song.sequence)
                }
              }),
              echoBubble: weapon.echoBubble?.name,
              echoWave: weapon.echoWave ? weapon.echoWave.kind.charAt(0).toUpperCase() + weapon.echoWave.kind.slice(1) : '-'
            }
            : null,
          shellInfo: weapon.shell
            ? {
                type: weapon.shell.charAt(0).toUpperCase() + weapon.shell.slice(1),
                level: weapon.shellLevel || '?'
              }
            : null,
          phials: formatPhialDisplay(weapon.phial),
          kinsectLvl: weapon.kinsectLevel || '-',
          sharpness: weapon.sharpness ? generateSharpnessGradient(weapon.sharpness) : 'black 0%, black 100%',
          coatings: selectedWeapon.value === 'Bow' ? processBowCoatings(weapon.coatings) : null,
          lbgRapid: selectedWeapon.value === 'Light-bowgun' ? processLbgRapid(weapon.ammo) : null,
          lbgMagazine: selectedWeapon.value === 'Light-bowgun' ? processAmmoMagazine(weapon.ammo) : null,
          hbgMagazine: selectedWeapon.value === 'Heavy-bowgun' ? processAmmoMagazine(weapon.ammo) : null,
        };

        return baseWeaponData;
      });
  }),
  Decorations: computed(() => {
    if (!dataStore.allDecorationData) return [];
    let keyCounter = 0;
    return dataStore.allDecorationData.map(deco => ({
      key: `deco-${deco.id || keyCounter++}`,
      name: deco.name.slice(0, -4),
      slot: deco.slot,
      skillData: deco.skills.map(skill => `${skill.skill.name} Lvl ${skill.level}`).join('<br>') || '-',
      kind: deco.kind ? (deco.kind.charAt(0).toUpperCase() + deco.kind.slice(1)) : 'N/A',
    }));
  }),
  Skills: computed(() => {
    if (!dataStore.allSkillData) return [];
    const details = [];
    let keyCounter = 0;
    dataStore.allSkillData.forEach(skill => {
      const ranks = Array.isArray(skill.ranks) ? skill.ranks : [];
      ranks.forEach(rank => {
        details.push({
          key: `skill-${skill.id}-${rank.level || keyCounter++}`,
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

function generateSharpnessGradient(sharpnessData) {
    if (!sharpnessData) return 'black 0%, black 100%';
    const maxTotalLength = 350;
    const colorOrder = ["red", "orange", "yellow", "green", "blue", "white", "purple"];
    const gradientParts = [];
    let cumulativePercentage = 0;
    colorOrder.forEach(color => {
        const value = sharpnessData[color] || 0;
        if (value > 0) {
            const segmentPercentage = (value / maxTotalLength) * 100;
            if (cumulativePercentage > 0.001) {
                gradientParts.push(`${color} ${cumulativePercentage.toFixed(4)}%`);
            }
            cumulativePercentage += segmentPercentage;
            gradientParts.push(`${color} ${Math.min(100, cumulativePercentage.toFixed(4))}%`);
        }
    });
    if (cumulativePercentage < 99.99 && cumulativePercentage > 0) {
        gradientParts.push(`black ${Math.max(0, cumulativePercentage.toFixed(4))}%`);
        gradientParts.push(`black 100%`);
    } else if (cumulativePercentage === 0) {
        gradientParts.push('black 0%', 'black 100%');
    }
    return gradientParts.length > 0 ? gradientParts.join(', ') : 'black 0%, black 100%';
}

function processNoteColors(notesData) {
  const processedNotes = notesData.map(
    note => note.replace('white', '#ffffff').replace('red', '#ff0000').replace('yellow', '#ffff00').replace('blue', '#0000ff').replace('purple', '#800080').replace('green', '#008000').replace('orange', '#ffa500').replace('aqua', '#00ffff')
  )
  return processedNotes;
}


function processBowCoatings(coatingsData) {
    const baseCoatingClrs = {
        'Power': '#b22222',
        'Pierce': '#1e90ff',
        'Close-Range': '#c0c0c0',
        'Blast': '#ffa500',
        'Poison': '#800080',
        'Paralysis': '#ffd700',
        'Sleep': '#afeeee',
        'Exhaust': '#00ffff',
    };
    const availableCoatingsLower = Array.isArray(coatingsData)
        ? coatingsData.map(c => typeof c === 'string' ? c.toLowerCase() : '').filter(c => c) // Filter empty strings
        : [];
    const processedCoatings = {};
    Object.keys(baseCoatingClrs).forEach(coatingType => {
        const hasCoating = availableCoatingsLower.includes(coatingType.toLowerCase());
        processedCoatings[coatingType] = hasCoating ? baseCoatingClrs[coatingType] : '#ffffff';
    });
    return processedCoatings;
}

function processLbgRapid(ammo) {
   const baseShotClrs = {
        'Normal': '#808080', 'Pierce': '#1e90ff', 'Spread': '#228b22',
        'Blank0': '#000000',
        'Flaming': '#ff0000', 'Water': '#0000ff', 'Freeze': '#b0e0e6', 'Thunder': '#ffff00', 'Dragon': '#f08080',
        'Blank1': '#000000',
        'Poison': '#800080', 'Paralysis': '#ffd700', 'Sleep': '#afeeee', 'Exhaust': '#00ffff',
        'Blank2': '#000000',
        'Slicing': '#696969', 'Sticky': '#ff8c00', 'Cluster': '#8b0000', 'Wyvern': '#b8860b',
        'Blank3': '#000000',
        'Demon': '#8b0000', 'Armor': '#f4a460', 'Recover': '#2e8b57', 'Tranq': '#fa8072',
        'Blank5': '#000000',
    };

   const availableRapidMap = new Map();
   if (ammo && Array.isArray(ammo)) {
     ammo.forEach(a => {
        if (a && a.kind && a.rapid === true) {
            availableRapidMap.set(a.kind.toLowerCase(), a);
        }
     });
   }

   const processedRapidInfo = {};
    Object.keys(baseShotClrs).forEach(shotTypeKey => {
      const lowerCaseShotTypeKey = shotTypeKey.toLowerCase();
      const rapidDetails = availableRapidMap.get(lowerCaseShotTypeKey);
      if (rapidDetails) {
        processedRapidInfo[shotTypeKey] = {
          details: rapidDetails,
          color: baseShotClrs[shotTypeKey]
        };
      }
    });
   return processedRapidInfo;
}


function processAmmoMagazine(ammo) {
    const baseShotClrs = {
        'Normal': '#808080', 'Pierce': '#1e90ff', 'Spread': '#228b22',
        'Blank0': '#000000',
        'Flaming': '#ff0000', 'Water': '#0000ff', 'Freeze': '#b0e0e6', 'Thunder': '#ffff00', 'Dragon': '#f08080',
        'Blank1': '#000000',
        'Poison': '#800080', 'Paralysis': '#ffd700', 'Sleep': '#afeeee', 'Exhaust': '#00ffff',
        'Blank2': '#000000',
        'Slicing': '#696969', 'Sticky': '#ff8c00', 'Cluster': '#8b0000', 'Wyvern': '#b8860b',
        'Blank3': '#000000',
        'Demon': '#8b0000', 'Armor': '#f4a460', 'Recover': '#2e8b57', 'Tranq': '#fa8072',
        'Blank5': '#000000',
    };

    const availableAmmoMap = new Map(); // Creates map
    if (ammo && Array.isArray(ammo)) { // Populates map (using the 'ammo' argument)
        ammo.forEach(a => {
            if (a && a.kind) {
                availableAmmoMap.set(a.kind.toLowerCase(), a);
            }
        });
    }
    const processedAmmoInfo = {}; // Creates result object
    Object.keys(baseShotClrs).forEach(shotTypeKey => { // Loops through all possible types
        const lowerCaseShotTypeKey = shotTypeKey.toLowerCase();
        const isBlankType = shotTypeKey.startsWith('Blank');
        const ammoDetails = availableAmmoMap.get(lowerCaseShotTypeKey); // Looks up ammo
        const hasAmmo = !!ammoDetails;
        const color = (hasAmmo || isBlankType) ? baseShotClrs[shotTypeKey] : '#ffffff'; // Determines color
        processedAmmoInfo[shotTypeKey] = { // Assigns result for this type
            details: ammoDetails || null, // <= Stores full details if found, else null
            color: color
        };
    });
    // Returns the final object
    return processedAmmoInfo;
}

const currentHeaders = computed(() => {
  const selectedTable = selectedDatatable.value;

  if (selectedTable === 'Weapons') {
    const weaponTypeSpecificHeaders = [];
    const weapon = selectedWeapon.value;

    if (weapon !== 'Light-bowgun' && weapon !== 'Heavy-bowgun' && weapon !== 'Bow') {
        weaponTypeSpecificHeaders.push(sharpnessHeader);
    }

    if (weapon === 'Hunting-horn') weaponTypeSpecificHeaders.push(notesHeader);
    if (weapon === 'Gunlance') weaponTypeSpecificHeaders.push(shellHeader);
    if (weapon === 'Switch-axe') weaponTypeSpecificHeaders.push(saPhialHeader);
    if (weapon === 'Charge-blade') weaponTypeSpecificHeaders.push(cbPhialHeader);
    if (weapon === 'Insect-glaive') weaponTypeSpecificHeaders.push(kinsectLvlHeader);
    if (weapon === 'Bow') weaponTypeSpecificHeaders.push(coatingsHeader);
    if (weapon === 'Light-bowgun') {
        weaponTypeSpecificHeaders.push(lbgRapidHeader);
        weaponTypeSpecificHeaders.push(lbgMagazineHeader);
    }
    if (weapon === 'Heavy-bowgun') weaponTypeSpecificHeaders.push(hbgMagazineHeader);

    return [...baseWeaponHeaders, ...weaponTypeSpecificHeaders, skillsHeader];
  }

  return headersConfig[selectedTable] || [];
});

const currentItems = computed(() => itemsConfig[selectedDatatable.value]?.value || []);

// Watchers
watch(selectedDataTypeIndex, () => {
  search.value = '';
});
</script>

<style scoped>
.skills-column {
  line-height: 1.3;
  font-size: 0.85rem;
}

.item-column-name {
  word-break: break-word;
  white-space: normal;
}

@media (max-width: 1350px) {
  .responsive-btn-toggle {
    display: flex;
    flex-direction: column;
    height: 100px;
    width: 100%;
    max-width: 300px;
    align-items: stretch;
  }

  :deep(.v-btn-group) {
    min-height: 98px;
  }

  .responsive-btn-toggle .v-btn {
    width: 100%;
    margin-bottom: 4px;
    justify-content: center;
    border-radius: 24px !important;
  }
  .responsive-btn-toggle .v-btn:not(:last-child) {
     border-right-width: 1px !important;
     border-bottom-width: 0 !important;
  }
   .responsive-btn-toggle .v-btn:not(:first-child) {
     border-left-width: 1px !important;
     border-top-width: 0 !important;
  }

  :deep(.v-data-table__td) {
    min-width: 110px !important;
    max-width: 110px !important;
  }
  :deep(.v-data-table__td:has(.item-column-name)) {
    min-width: 150px !important;
    max-width: 150px !important;
  }
  :deep(.v-data-table__td:has(.skills-column)) {
    min-width: 180px !important;
    max-width: 180px !important;
  }
   :deep(.v-data-table__td:has(.skill-column-level-desc)) {
    min-width: 200px !important;
    max-width: 200px !important;
   }
    :deep(.v-data-table__td:has(.weapon-column-notes)) { min-width: 150px !important; max-width: 150px !important }
    :deep(.v-data-table__td:has(.weapon-column-coatings)) { min-width: 200px !important; max-width: 200px !important }
    :deep(.v-data-table__td:has(.weapon-column-lbgrapid)) { min-width: 150px !important; max-width: 150px !important }
    :deep(.v-data-table__td:has(.weapon-column-lbgmagazine)) { min-width: 200px !important; max-width: 200px !important }
    :deep(.v-data-table__td:has(.weapon-column-hbgmagazine)) { min-width: 200px !important; max-width: 200px !important }
}

.data-table-full-width {
  width: 100%;
}

:deep(.v-data-table__td) {
  white-space: normal !important;
  word-break: break-word;
  vertical-align: top;
  padding-top: 8px !important;
  padding-bottom: 8px !important;
}
</style>