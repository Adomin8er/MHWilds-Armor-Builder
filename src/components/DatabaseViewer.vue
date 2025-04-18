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
          <v-btn>Weapons</v-btn>
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

        <v-autocomplete
          v-if="selectedDataTypeIndex === 1"
          v-model="selectedWeapon"
          label="Weapon Type"
          :items="weaponNames"
          variant="underlined"
          width="200">
        </v-autocomplete>

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
          <template v-slot:item.skills="{ item }">
            <span v-html="item.skills"></span>
          </template>
          <template v-slot:item.sharpness="{ item }">
            <div
              class="sharpness-bar-container"
              style=" display: flex; align-items: center; justify-content: center; height: 10px; width: 100px; overflow: hidden; background-color: #000000;"
            >
              <div
                class="sharpness-bar"
                :style="{height: '50%', width: '90%', overflow: 'hidden', background: `linear-gradient(to right, ${item.sharpness})`
                }"
              >
              </div>
            </div>
          </template>
          <template
            v-if="selectedWeapon === 'Hunting-horn'"
            v-slot:item.notes="{ item }">
              <span class="d-inline-flex align-center bg-black rounded-pill pa-1">
                <template v-for="(color, index) in item.notes.notes" :key="index">
                  <v-icon
                    icon="mdi-music-note"
                    :color=color
                  >
                  </v-icon>
                </template>
              </span>
            <v-tooltip location="top">
              <template v-slot:activator="{ props }">
                <span v-bind="props" class="d-inline-flex align-center ml-1">
                  <v-icon
                    icon="mdi-information-slab-circle-outline"
                  >
                  </v-icon>
                </span>
              </template>
              <div v-for="song in item.notes.songs" :key="song">
                <span>{{ song.split(': ')[1] }}: </span>
                <div class="d-inline-flex align-center bg-black rounded-lg mt-1 mb-1 pl-1 pr-1">
                  <span v-for="color in song.split(': ')[0].split(',')">
                    <v-icon
                      icon="mdi-music-note"
                      :color=color
                      >
                    </v-icon>
                  </span>
                </div>
              </div>
              <v-divider class="ma-2" thickness="3" opacity="100"/>
              <div> Echo Bubble: {{ item.notes.echoBubble }}</div>
              <div> Echo Wave: {{ item.notes.echoWave }}</div>
            </v-tooltip>
          </template>
          <template v-slot:item.shells="{ item }">
            <span v-html="item.shells"></span>
          </template>
          <template
            v-if="selectedWeapon === 'Bow'"
            v-slot:item.coatings="{ item }"
          >
            <div class="d-flex align-center justify-center">
              <div class="align-center bg-black rounded-lg ml-5 pa-1">
                <div>
                  <template v-for="(color, coatingName, index) in item.coatings" :key="`${coatingName}-1`">
                    <v-icon
                      v-if="index <= 3"
                      icon="mdi-bottle-tonic"
                      :color="color"
                      >
                    </v-icon>
                  </template>
                </div>
                <div>
                  <template v-for="(color, coatingName, index) in item.coatings">
                    <v-icon
                      v-if="index >= 4"
                      icon="mdi-bottle-tonic"
                      :color="color"
                      >
                    </v-icon>
                  </template>
                </div>
              </div>

              <v-tooltip location="top">
                <template v-slot:activator="{ props }">
                  <span v-bind="props" class="d-inline-flex align-center ml-1">
                    <v-icon
                      icon="mdi-information-slab-circle-outline"
                      >
                    </v-icon>
                  </span>
                </template>
                <span>
                  {{
                    Object.entries(item.coatings)
                      .filter(([_, color]) => color !== '#ffffff')
                      .map(([name, _]) => name)
                      .join(', ') || 'No Coatings Available'
                  }}
                </span>
              </v-tooltip>

            </div>
          </template>
          <template
            v-if="selectedWeapon === 'Light-bowgun'"
            v-slot:item.lbgRapid="{ item }"
          >
            <div class="d-flex align-center justify-center">
              <div class="bg-black rounded-lg ml-5 pa-1" style="line-height: 0.8;">
                <div class="justify-start">
                  <template v-for="(ammoInfo, ammoName, index) in item.lbgRapid">
                    <v-icon
                      v-if="index <= 8"
                      :key="`${item.key}-ammo1-${ammoName}`"
                      icon="mdi-bullet"
                      :color="ammoInfo.color"
                      class="mx-n1"
                    >
                    </v-icon>
                  </template>
                </div>
                <div class="d-flex justify-start">
                  <template v-for="(ammoInfo, ammoName, index) in item.lbgRapid">
                     <v-icon
                       v-if="index >= 9 && index <= 17"
                       :key="`${item.key}-ammo2-${ammoName}`"
                       icon="mdi-bullet"
                       :color="ammoInfo.color"
                        class="mx-n1"
                     >
                     </v-icon>
                   </template>
                 </div>
                 <div class="d-flex justify-start">
                  <template v-for="(ammoInfo, ammoName, index) in item.lbgRapid">
                     <v-icon
                       v-if="index >= 20"
                       :key="`${item.key}-ammo2-${ammoName}`"
                       icon="mdi-bullet"
                       :color="ammoInfo.color"
                        class="mx-n1"
                     >
                     </v-icon>
                   </template>
                 </div>
              </div>

              <v-tooltip location="top">
                <template v-slot:activator="{ props }">
                  <span v-bind="props" class="d-inline-flex align-center ml-1">
                    <v-icon
                      icon="mdi-information-slab-circle-outline"
                      >
                    </v-icon>
                  </span>
                </template>
                <div>
                  <div v-for="(rapidInfo, rapidName) in item.lbgRapid" :key="`${item.key}-tt-${rapidName}`">
                    <template v-if="rapidInfo.details">
                      <span :style="{ color: rapidInfo.color !== '#ffffff' ? rapidInfo.color : 'inherit' }">
                        {{ rapidName }}
                      </span>
                    </template>
                  </div>
                </div>
              </v-tooltip>

            </div>
          </template>
          <template
            v-if="selectedWeapon === 'Light-bowgun'"
            v-slot:item.lbgMagazine="{ item }"
          >
            <div class="d-flex align-center justify-center">
              <div class="bg-black rounded-lg ml-5 pa-1" style="line-height: 0.8;">
                <div class="justify-start">
                  <template v-for="(ammoInfo, ammoName, index) in item.lbgMagazine">
                    <v-icon
                      v-if="index <= 8"
                      :key="`${item.key}-ammo1-${ammoName}`"
                      icon="mdi-bullet"
                      :color="ammoInfo.color"
                      class="mx-n1"
                    >
                    </v-icon>
                  </template>
                </div>
                <div class="d-flex justify-start">
                  <template v-for="(ammoInfo, ammoName, index) in item.lbgMagazine">
                     <v-icon
                       v-if="index >= 9 && index <= 17"
                       :key="`${item.key}-ammo2-${ammoName}`"
                       icon="mdi-bullet"
                       :color="ammoInfo.color"
                        class="mx-n1"
                     >
                     </v-icon>
                   </template>
                 </div>
                 <div class="d-flex justify-start">
                  <template v-for="(ammoInfo, ammoName, index) in item.lbgMagazine">
                     <v-icon
                       v-if="index >= 20"
                       :key="`${item.key}-ammo2-${ammoName}`"
                       icon="mdi-bullet"
                       :color="ammoInfo.color"
                        class="mx-n1"
                     >
                     </v-icon>
                   </template>
                 </div>
              </div>

              <v-tooltip location="top">
                <template v-slot:activator="{ props }">
                  <span v-bind="props" class="d-inline-flex align-center ml-1">
                    <v-icon
                      icon="mdi-information-slab-circle-outline"
                      >
                    </v-icon>
                  </span>
                </template>
                <div>
                  <div v-for="(ammoInfo, ammoName) in item.lbgMagazine" :key="`${item.key}-tt-${ammoName}`">
                    <template v-if="ammoInfo.details">
                      <span :style="{ color: ammoInfo.color !== '#ffffff' ? ammoInfo.color : 'inherit' }">
                        {{ ammoName }} Lvl {{ ammoInfo.details.level }} 
                      </span>
                      <span>
                        ({{ ammoInfo.details.capacity }})
                      </span>
                    </template>
                  </div>
                </div>
              </v-tooltip>

            </div>
          </template>
          <template
            v-if="selectedWeapon === 'Heavy-bowgun'"
            v-slot:item.hbgMagazine="{ item }"
          >
            <div class="d-flex align-center justify-center">
              <div class="bg-black rounded-lg ml-5 pa-1" style="line-height: 0.8;">
                <div class="justify-start">
                  <template v-for="(ammoInfo, ammoName, index) in item.hbgMagazine">
                    <v-icon
                      v-if="index <= 8"
                      :key="`${item.key}-ammo1-${ammoName}`"
                      icon="mdi-bullet"
                      :color="ammoInfo.color"
                      class="mx-n1"
                    >
                    </v-icon>
                  </template>
                </div>
                <div class="d-flex justify-start">
                  <template v-for="(ammoInfo, ammoName, index) in item.hbgMagazine">
                     <v-icon
                       v-if="index >= 9 && index <= 17"
                       :key="`${item.key}-ammo2-${ammoName}`"
                       icon="mdi-bullet"
                       :color="ammoInfo.color"
                        class="mx-n1"
                     >
                     </v-icon>
                   </template>
                 </div>
                 <div class="d-flex justify-start">
                  <template v-for="(ammoInfo, ammoName, index) in item.hbgMagazine">
                     <v-icon
                       v-if="index >= 20"
                       :key="`${item.key}-ammo2-${ammoName}`"
                       icon="mdi-bullet"
                       :color="ammoInfo.color"
                        class="mx-n1"
                     >
                     </v-icon>
                   </template>
                 </div>
              </div>

              <v-tooltip location="top">
                <template v-slot:activator="{ props }">
                  <span v-bind="props" class="d-inline-flex align-center ml-1">
                    <v-icon
                      icon="mdi-information-slab-circle-outline"
                      >
                    </v-icon>
                  </span>
                </template>
                <div>
                  <div v-for="(ammoInfo, ammoName) in item.hbgMagazine" :key="`${item.key}-tt-${ammoName}`">
                    <template v-if="ammoInfo.details">
                      <span :style="{ color: ammoInfo.color !== '#ffffff' ? ammoInfo.color : 'inherit' }">
                        {{ ammoName }} Lvl {{ ammoInfo.details.level }} 
                      </span>
                      <span>
                        ({{ ammoInfo.details.capacity }})
                      </span>
                    </template>
                  </div>
                </div>
              </v-tooltip>

            </div>
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
  
  // Import Images

  // Local Stores
  const uiStore = useUiStore();
  const dataStore = useDataStore();
  
  // Local Data / Mappings
  const search = ref('');

  const selectedDataTypeIndex = ref(0); // 0: Armors, 1:Weapons, 2: Decorations, 3: Skills 
  const dataTypes = ['Armors', 'Weapons', 'Decorations', 'Skills'];
  const selectedDatatable = computed(() => dataTypes[selectedDataTypeIndex.value]);
  const weaponNames = Object.values(WEAPON_TYPE_KEYS).map(name => {
    return name.charAt(0).toUpperCase()+name.slice(1).toLowerCase();
  });
  const selectedWeapon = ref(weaponNames[0])
    
  const headersConfig = {
    Armors: [
      { key: "name", title: "Name", align: 'start', sortable: true, width: '250px' },
      { key: "armorSet", title: "Set", align: 'start', sortable: true, width: '200px' },
      { key: "kind", title: "Type", align: 'start', sortable: true, width: '100px' },
      { key: "slots", title: "Slots", align: 'center', sortable: false, width: '100px' },
      { key: "skills", title: "Skills", align: 'start', sortable: false, width: '350px' },
    ],
    Weapons: [
      { key: "name", title: "Name", align: 'start', sortable: true, width: '175px' },
      { key: "attack", title: "Attack", align: 'start', sortable: true, width: '100px' },
      { key: "affinity", title: "Affinity", align: 'start', sortable: true, width: '100px' },
      { key: "specials", title: "Special", align: 'start', sortable: true, width: '100px' },
      { key: "defense", title: "Defense", align: 'start', sortable: true, width: '125px' },
      { key: "slots", title: "Slots", align: 'start', sortable: false, width: '100px' },
      { key: "sharpness", title: "Sharpness", align: 'center', sortable: true, width: '125px' },
      { key: "skills", title: "Skills", align: 'start', sortable: false, width: '240px' },
    ],
    Decorations: [
      { key: "name", title: "Name", align: 'start', sortable: true, width: '250px' },
      { key: "kind", title: "Kind", align: 'start', sortable: true, width: '200px' },
      { key: "slot", title: "Size", align: 'start', sortable: true, width: '100px' },
      { key: "skills", title: "Skills", align: 'start', sortable: false, width: '340px' },
    ],
    Skills: [
      { key: "name", title: "Name", align: 'start', sortable: true, width: '250px' },
      { key: "level", title: "Lvl", align: 'start', sortable: false, width: '60px' },
      { key: "levelDescription", title: "Level Description", align: 'start', sortable: false, width: '350px' },
      { key: "abilityDescription", title: "Ability Description", align: 'start', sortable: false, width: '350px' },
    ],
  };

  const baseWeaponHeaders = [
    { key: "name", title: "Name", align: 'start', sortable: true, width: '175px' },
    { key: "attack", title: "Attack", align: 'start', sortable: true, width: '100px' },
    { key: "affinity", title: "Affinity", align: 'start', sortable: true, width: '100px' },
    { key: "specials", title: "Special", align: 'start', sortable: true, width: '110px' },
    { key: "defense", title: "Defense", align: 'start', sortable: true, width: '110px' },
    { key: "slots", title: "Slots", align: 'start', sortable: false, width: '75px' },
  ];

  const sharpnessHeader = { key: "sharpness", title: "Sharpness", align: 'center', sortable: true, width: '125px' };
  const notesHeader = { key: "notes", title: "Notes", align: 'center', sortable: false, width: '150px' };
  const shellHeader = { key: "shells", title: "Shells", align: 'center', sortable: false, width: '100px' };
  const saPhialHeader = { key: "saPhials", title: "Phials", align: 'center', sortable: false, width: '100px' };
  const cbPhialHeader = { key: "cbPhials", title: "Phials", align: 'center', sortable: false, width: '100px' };
  const kinsectLvlHeader = { key: "kinsectLvl", title: "Kinsect Lvl", align: 'center', sortable: false, width: '100px' };
  const coatingsHeader = { key: "coatings", title: "Coatings", align: 'center', sortable: false, width: '150px' };
  const lbgRapidHeader = { key: "lbgRapid", title: "Rapid", align: 'center', sortable: false, width: '150px' };
  const lbgMagazineHeader = { key: "lbgMagazine", title: "Magazine", align: 'center', sortable: false, width: '150px' };
  const hbgMagazineHeader = { key: "hbgMagazine", title: "Magazine", align: 'center', sortable: false, width: '200px' };
  const skillsHeader = { key: "skills", title: "Skills", align: 'start', sortable: false, width: '200px' };


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
          skills: armor.skills?.map(s => `${s.skill.name} Lvl ${s.level}`).join('<br>') || '-',
          armorSet: armor.armorSet?.name || 'N/A'
       }));
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
            attack: weapon.damage.display || '-',
            affinity: `${weapon.affinity}%` || '-',
            specials: weapon.specials && weapon.specials.length > 0
                ? weapon.specials.map(spec => {
                      const type = spec.status || spec.element;
                      const dmg = spec.damage?.display ? ` ${spec.damage.display}` : '';
                      return `${type.replace('blastblight','blast')}${dmg}`;
                  }).join(', ')
                : '-',
            defense: weapon.defense?.base || '-',
            slots: weapon.slots?.join('-') || '-',
            notes: weapon.melody
              ? {
                  notes: weapon.melody.notes,
                  songs: weapon.melody.songs.map(song => {
                      const sequenceString = song.sequence.join(','); 
                      return `${sequenceString}: ${song.name}`; 
                  }),
                  echoBubble: weapon.echoBubble?.name, 
                  echoWave: weapon.echoWave ? weapon.echoWave.kind.charAt(0).toUpperCase() + weapon.echoWave.kind.slice(1) : '-'
                }
              : '-',
            shells: weapon.shell
              ? `${weapon.shell.charAt(0).toUpperCase() + weapon.shell.slice(1)} <br> Lvl ${weapon.shellLevel || '?'}`
              : '-',
            saPhials:
              weapon.phial?.kind
              ? weapon.phial.kind.charAt(0).toUpperCase() + weapon.phial.kind.slice(1)
              : '-',
            cbPhials:
              weapon.phial
              ? weapon.phial.charAt(0).toUpperCase() + weapon.phial.slice(1)
              : '-',
            kinsectLvl: weapon.kinsectLevel || '-',
            skills: weapon.skills?.map(s => `${s.skill.name} Lvl ${s.level}`).join('<br>') || '-',
          };
          if (selectedWeapon.value === 'Bow') {
            const baseCoatingClrs = {
              'Power': '#b22222',
              'Pierce': '#1e90ff',
              'Close-Range': '#c0c0c0',
              'Poison': '#800080',
              'Paralysis': '#ffd700',
              'Sleep': '#afeeee',
              'Exhaust': '#00ffff',
              'Blast': '#ffa500',
            };
            const availableCoatings = weapon.coatings || [];
            const processedCoatingClrs = Object.fromEntries(
              Object.keys(baseCoatingClrs).map(coatingType => {
                const hasCoating = availableCoatings.includes(coatingType.toLowerCase());
                const color = hasCoating ? baseCoatingClrs[coatingType] : '#ffffff';
                return [coatingType, color];
              })
            );
            return {
              ...baseWeaponData,
              coatings: processedCoatingClrs,
            }
          } else if (selectedWeapon.value === 'Light-bowgun') {
            const baseShotClrs = {
              'Normal': '#808080',
              'Pierce': '#1e90ff',
              'Spread': '#228b22',
              'Blank0': '#000000',
              'Flaming': '#ff0000',
              'Water': '#0000ff',
              'Freeze': '#b0e0e6',
              'Thunder': '#ffff00',
              'Dragon': '#f08080',
              'Poison': '#800080',
              'Paralysis': '#ffd700',
              'Sleep': '#afeeee',
              'Exhaust': '#00ffff',
              'Blank2': '#000000',
              'Slicing': '#696969',
              'Sticky': '#ff8c00',
              'Cluster': '#8b0000',
              'Wyvern': '#b8860b',
              'Blank3': '#000000',
              'Demon': '#8b0000',
              'Armor': '#f4a460',
              'Recover': '#2e8b57',
              'Tranq': '#fa8072',
              'Blank5': '#000000',
            };

            const availableRapidMap = new Map();
            if (weapon.ammo && Array.isArray(weapon.ammo)) {
              weapon.ammo.forEach(ammo => {
                if (ammo && ammo.kind && ammo.rapid === true) {
                  availableRapidMap.set(ammo.kind.toLowerCase(), ammo);
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

            const availableAmmoMap = new Map();
            if (weapon.ammo && Array.isArray(weapon.ammo)) {
              weapon.ammo.forEach(ammo => {
                if (ammo && ammo.kind) {
                  availableAmmoMap.set(ammo.kind.toLowerCase(), ammo);
                }
              });
            }

            const processedAmmoInfo = {};
            Object.keys(baseShotClrs).forEach(shotTypeKey => {
              const lowerCaseShotTypeKey = shotTypeKey.toLowerCase();
              const isBlankType = shotTypeKey.startsWith('Blank');
              const ammoDetails = availableAmmoMap.get(lowerCaseShotTypeKey);
              const hasAmmo = !!ammoDetails;
              const color = (hasAmmo || isBlankType)
                            ? baseShotClrs[shotTypeKey]
                            : '#ffffff';
              processedAmmoInfo[shotTypeKey] = {
                details: ammoDetails || null,
                color: color
              };
            });

            return {
              ...baseWeaponData,
              lbgRapid: processedRapidInfo,
              lbgMagazine: processedAmmoInfo
            }
          } else if (selectedWeapon.value === 'Heavy-bowgun') {
            const baseShotClrs = {
              'Normal': '#808080',
              'Pierce': '#1e90ff',
              'Spread': '#228b22',
              'Blank0': '#000000',
              'Flaming': '#ff0000',
              'Water': '#0000ff',
              'Freeze': '#b0e0e6',
              'Thunder': '#ffff00',
              'Dragon': '#f08080',
              'Poison': '#800080',
              'Paralysis': '#ffd700',
              'Sleep': '#afeeee',
              'Exhaust': '#00ffff',
              'Blank2': '#000000',
              'Slicing': '#696969',
              'Sticky': '#ff8c00',
              'Cluster': '#8b0000',
              'Wyvern': '#b8860b',
              'Blank3': '#000000',
              'Demon': '#8b0000',
              'Armor': '#f4a460',
              'Recover': '#2e8b57',
              'Tranq': '#fa8072',
              'Blank5': '#000000',
            };

            const availableAmmoMap = new Map();
            if (weapon.ammo && Array.isArray(weapon.ammo)) {
              weapon.ammo.forEach(ammo => {
                if (ammo && ammo.kind) {
                  availableAmmoMap.set(ammo.kind.toLowerCase(), ammo);
                }
              });
            }

            const processedAmmoInfo = {};
            Object.keys(baseShotClrs).forEach(shotTypeKey => {
              const lowerCaseShotTypeKey = shotTypeKey.toLowerCase();
              const isBlankType = shotTypeKey.startsWith('Blank');
              const ammoDetails = availableAmmoMap.get(lowerCaseShotTypeKey);
              const hasAmmo = !!ammoDetails;
              const color = (hasAmmo || isBlankType)
                            ? baseShotClrs[shotTypeKey]
                            : '#ffffff';
              processedAmmoInfo[shotTypeKey] = {
                details: ammoDetails || null,
                color: color
              };
            });

            return {
              ...baseWeaponData,
              hbgMagazine: processedAmmoInfo
            }
          } else {
            let sharpnessString = '-';
            const sharpnessData = weapon.sharpness;
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
            if (gradientParts.length > 0) {
                sharpnessString = gradientParts.join(', ');
            } else {
                sharpnessString = 'black 0%, black 100%';
            }
            return {
                ...baseWeaponData,
                sharpness: sharpnessString,
            };
          }
      });
    }),
    Decorations: computed(() => {
      if (!dataStore.allDecorationData) return [];
      let keyCounter = 0;
      return dataStore.allDecorationData.map(deco => ({
          key: `deco-${deco.id || keyCounter++}`,
          name: deco.name.slice(0,-4),
          slot: deco.slot,
          skills: deco.skills?.map(s => `${s.skill.name} Lvl ${s.level}`).join('<br>') || '-',
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

  const currentHeaders = computed(() => {
    const selectedTable = selectedDatatable.value;

    if (selectedTable === 'Weapons') {
      if (selectedWeapon.value === 'Hunting-horn') {
        return [...baseWeaponHeaders, sharpnessHeader, notesHeader, skillsHeader];
      } else if (selectedWeapon.value === 'Gunlance') {
        return [...baseWeaponHeaders, sharpnessHeader, shellHeader, skillsHeader];
      } else if (selectedWeapon.value === 'Switch-axe') {
        return [...baseWeaponHeaders, sharpnessHeader, saPhialHeader, skillsHeader];
      } else if (selectedWeapon.value === 'Charge-blade') {
        return [...baseWeaponHeaders, sharpnessHeader, cbPhialHeader, skillsHeader];
      } else if (selectedWeapon.value === 'Insect-glaive') {
        return [...baseWeaponHeaders, sharpnessHeader, kinsectLvlHeader, skillsHeader];
      } else if (selectedWeapon.value === 'Bow') {
        return [...baseWeaponHeaders, coatingsHeader, skillsHeader];
      } else if (selectedWeapon.value === 'Light-bowgun') {
        return [...baseWeaponHeaders, lbgRapidHeader, lbgMagazineHeader, skillsHeader];
      } else if (selectedWeapon.value === 'Heavy-bowgun') {
        return [...baseWeaponHeaders, hbgMagazineHeader, skillsHeader];
      } else {
        return [...baseWeaponHeaders, sharpnessHeader, skillsHeader];
      }
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