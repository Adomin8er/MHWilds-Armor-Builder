<template>
  <v-card
    variant="outlined"
    class="equipmentCard-vCard"
  >
    <v-row class="align-center">
      <v-col cols="2" md="1" class="d-flex justify-center align-center pa-4">
        <v-img
          v-if="armorImg"
          class="equipmentCard-vImg-armorIcon"
          :src="armorImg"
          contain
          height="40"
          width="40"
        />
        <div v-else-if="props.equipmentPiece === 'Weapon'">
          <v-btn
            class="equipmentCard-weaponBtn elevation-2"
            variant="outlined"
            @click="showWeaponSelector = true"
          >
            <v-img
              class="equipmentCard-vImg-weaponIcon"
              :src="selectedWeaponImage"
              height="45"
              width="45"
            />
          </v-btn>
          <v-dialog
            v-model="showWeaponSelector"
            width="auto"
            max-width="500px"
          >
            <v-card class="pa-4">
              <v-card-title class="text-center text-h6 mb-3">Choose Your Weapon</v-card-title>
              <v-row dense>
                <v-col
                  v-for="weaponKey in weaponKeys"
                  :key="weaponKey"
                  cols="4" sm="3"
                  class="d-flex justify-center"
                >
                  <v-btn
                    class="equipmentCard-weaponBtnDialog"
                    variant="outlined"
                    @click="selectWeaponType(weaponKey)"
                  >
                    <v-tooltip activator="parent" location="top">{{ formatDisplayName(weaponKey) }}</v-tooltip>
                    <v-img
                      class="equipmentCard-vImg-weaponIcon"
                      :src="weaponImages[weaponKey]"
                      height="40"
                      width="40"
                    />
                  </v-btn>
                </v-col>
              </v-row>
              <v-card-actions class="justify-end mt-4">
                <v-btn @click="showWeaponSelector = false" color="grey">Cancel</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </div>
      </v-col>

      <v-col cols="10" md="3" class="pa-4">
        <EquipmentSelector
          class="equipmentCard-equipmentSelector"
          :equipmentPiece="currentEquipmentKey"
          :key="equipmentSelectorKey"
          />
      </v-col>

      <v-col cols="12" md="8" class="pa-4">
        <EquipmentSlots
          class="equipmentCard-equipmentSlots"
          :equipmentKey="currentEquipmentKey"
          :key="`slots-${currentEquipmentKey}`"
          />
      </v-col>
    </v-row>

    <v-row class="mt-2">
      <v-divider></v-divider>
      <v-col cols="12" class="pa-4">
        <EquipmentSkills
          :equipmentKey="currentEquipmentKey"
           :key="`skills-${currentEquipmentKey}`"
         />
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
// Plugin Constants
import { computed, ref, watch } from 'vue';

// Pinia Stores
import { useBuildStore } from '@/stores/build';
import { WEAPON_TYPE_KEYS, formatDisplayName } from '@/constants';

// Child Components
import EquipmentSelector from './EquipmentSelector.vue';
import EquipmentSlots from './EquipmentSlots.vue';
import EquipmentSkills from './EquipmentSkills.vue';

// Import images
import Image_ArmorHead from '@/assets/images/equipment/Armor_Head.png';
import Image_ArmorChest from '@/assets/images/equipment/Armor_Chest.png';
import Image_ArmorArms from '@/assets/images/equipment/Armor_Arms.png';
import Image_ArmorWaist from '@/assets/images/equipment/Armor_Waist.png';
import Image_ArmorLegs from '@/assets/images/equipment/Armor_Legs.png';
import Image_ArmorTalisman from '@/assets/images/equipment/Armor_Talisman.png';
import Image_WeaponGreatSword from '@/assets/images/equipment/Weapon_GreatSword.png';
import Image_WeaponLongSword from '@/assets/images/equipment/Weapon_LongSword.png';
import Image_WeaponSwordShield from '@/assets/images/equipment/Weapon_SwordShield.png';
import Image_WeaponDualBlades from '@/assets/images/equipment/Weapon_DualBlades.png';
import Image_WeaponHammer from '@/assets/images/equipment/Weapon_Hammer.png';
import Image_WeaponHuntingHorn from '@/assets/images/equipment/Weapon_HuntingHorn.png';
import Image_WeaponLance from '@/assets/images/equipment/Weapon_Lance.png';
import Image_WeaponGunlance from '@/assets/images/equipment/Weapon_Gunlance.png';
import Image_WeaponSwitchAxe from '@/assets/images/equipment/Weapon_SwitchAxe.png';
import Image_WeaponChargeBlade from '@/assets/images/equipment/Weapon_ChargeBlade.png';
import Image_WeaponInsectGlaive from '@/assets/images/equipment/Weapon_InsectGlaive.png';
import Image_WeaponBow from '@/assets/images/equipment/Weapon_Bow.png';
import Image_WeaponLightBowgun from '@/assets/images/equipment/Weapon_LightBowgun.png';
import Image_WeaponHeavyBowgun from '@/assets/images/equipment/Weapon_HeavyBowgun.png';

// Props
const props = defineProps({
  equipmentPiece: {
      type: String,
      required: true
  }
});

// Pinia Stores
const buildStore = useBuildStore();

// Weapon Selection
const equipmentSelectorKey = ref(0);
const showWeaponSelector = ref(false);
const selectedWeaponTypeKey = ref(WEAPON_TYPE_KEYS.GREAT_SWORD);

// Local Data / Mappings
const armorImageMap = {
  Head: Image_ArmorHead,
  Chest: Image_ArmorChest,
  Arms: Image_ArmorArms,
  Waist: Image_ArmorWaist,
  Legs: Image_ArmorLegs,
  Talisman: Image_ArmorTalisman,
};

const weaponImages = {
  [WEAPON_TYPE_KEYS.GREAT_SWORD]: Image_WeaponGreatSword,
  [WEAPON_TYPE_KEYS.LONG_SWORD]: Image_WeaponLongSword,
  [WEAPON_TYPE_KEYS.SWORD_SHIELD]: Image_WeaponSwordShield,
  [WEAPON_TYPE_KEYS.DUAL_BLADES]: Image_WeaponDualBlades,
  [WEAPON_TYPE_KEYS.HAMMER]: Image_WeaponHammer,
  [WEAPON_TYPE_KEYS.HUNTING_HORN]: Image_WeaponHuntingHorn,
  [WEAPON_TYPE_KEYS.LANCE]: Image_WeaponLance,
  [WEAPON_TYPE_KEYS.GUNLANCE]: Image_WeaponGunlance,
  [WEAPON_TYPE_KEYS.SWITCH_AXE]: Image_WeaponSwitchAxe,
  [WEAPON_TYPE_KEYS.CHARGE_BLADE]: Image_WeaponChargeBlade,
  [WEAPON_TYPE_KEYS.INSECT_GLAIVE]: Image_WeaponInsectGlaive,
  [WEAPON_TYPE_KEYS.BOW]: Image_WeaponBow,
  [WEAPON_TYPE_KEYS.LIGHT_BOWGUN]: Image_WeaponLightBowgun,
  [WEAPON_TYPE_KEYS.HEAVY_BOWGUN]: Image_WeaponHeavyBowgun,
};

const weaponKeys = Object.values(WEAPON_TYPE_KEYS);

// Computed Properties
const armorImg = computed(() => {
  return armorImageMap[props.equipmentPiece] || null;
});
const selectedWeaponImage = computed(() => {
  return weaponImages[selectedWeaponTypeKey.value] || weaponImages[WEAPON_TYPE_KEYS.GREAT_SWORD];
});

// *** CRITICAL: Determine the specific key ('head', 'chest', 'great-sword', etc.) ***
const currentEquipmentKey = computed(() => {
  if (props.equipmentPiece === 'Weapon') {
    return selectedWeaponTypeKey.value;
  } else {
    return props.equipmentPiece.toLowerCase();
  }
});

// Methods
const selectWeaponType = (weaponKey) => {
  console.log(`Selected weapon type: ${weaponKey}`);
  if (selectedWeaponTypeKey.value !== weaponKey) {
    selectedWeaponTypeKey.value = weaponKey;
    buildStore.clearPieceData(weaponKey);
    equipmentSelectorKey.value++;
  }
  showWeaponSelector.value = false;
};

// Watchers
watch(() => props.equipmentPiece, (newPiece) => {
    console.log(`EquipmentCard received new piece prop: ${newPiece}`);
    if (newPiece !== 'Weapon') {
        showWeaponSelector.value = false;
    }
});
</script>

<style scoped>
.equipmentCard-vCard {
  width: 100%;
}

.equipmentCard-weaponBtn {
  padding: 0 !important;
  min-width: 0 !important;
  min-height: 0 !important;
  height: auto !important;
  width: auto;
}

.equipmentCard-weaponBtnDialog {
  padding: 0 !important;
  min-width: 0 !important;
  min-height: 0 !important;
  height: auto !important;
  width: auto;
}


.equipmentCard-vImg-weaponIcon {
  display: block;
}

.equipmentCard-equipmentSelector :deep(.v-autocomplete__selection-text),
.equipmentCard-equipmentSelector :deep(.v-field__input) {
  line-height: 1.2;
}

.equipmentCard-equipmentSlots :deep(.v-field__field) {
  align-items: center;
}
</style>