<template>
  <v-card
    variant="outlined"
    class="equipmentCard-vCard"
  >
    <v-row>
      <v-col cols="2" md="1" class="pb-0">
        <v-img
          v-if="armorImg"
          class="equipmentCard-vImg-armorIcon"
          :src="armorImg"
        />
        <v-btn
          v-else-if="selectedWpn"
          class="equipmentCard-weaponBtn elevation-2"
          variant="outlined"
          @click="showWeaponSelector = true"
        >
          <v-img
            class="equipmentCard-vImg-weaponIcon"
            :src="selectedWpn"
          />
        </v-btn>
        <v-dialog
          v-model="showWeaponSelector"
          width="auto"
        >
        <v-card class="pa-6">
            <v-row v-for="row in 5" :key="'row-' + row">
              <template v-if="row === 1">
                <v-col cols="12" class="text-center border-lg rounded-lg">
                  CHOOSE YOUR WEAPON
                </v-col>
              </template>
              <template v-else>
                <v-col v-for="col in 4" :key="'col-' + row + '-' + col">
                  <v-btn
                    v-if="weaponKeys[(row - 2) * 4 + col - 1]"
                    class="equipmentCard-weaponBtn"
                    variant="outlined"
                    @click="selectWeapon(weaponKeys[(row - 2) * 4 + col - 1])"
                  >
                    <v-img
                      class="equipmentCard-vImg-weaponIcon"
                      :src="weaponImages[weaponKeys[(row - 2) * 4 + col - 1]]"
                    />
                  </v-btn>
                  <v-col cols="12" v-else-if="row === 5 && col === 3">
                    <v-btn @click="showWeaponSelector = false">
                      CANCEL
                    </v-btn>
                  </v-col>
                </v-col>
              </template>
            </v-row>
          </v-card>
        </v-dialog>
      </v-col>
      <v-col cols="9" md="3" class="pb-0">
        <EquipmentSelector
          class="equipmentCard-equipmentSelector"
          :api_baseUrl="props.api_baseUrl"
          :equipmentPiece="equipmentPieceForSelector"
          :key="equipmentSelectorKey"
          @equipment-selected="handleSelectedEquipment"
        />
      </v-col>
      <v-col cols="12" md="8" class="pb-0 pt-0">
        <EquipmentSlots
          class="equipmentCard-equipmentSlots"
          :api_baseUrl="props.api_baseUrl"
          :selectedEquipmentType="props.equipmentPiece.toLowerCase()"
          :selectedEquipmentName="selectedEquipment[props.equipmentPiece.toLowerCase()]"
          :decorationCategories="decorationCategories"
          @decorations-selected="handleSelectedDecorations"
          >
        </EquipmentSlots>
      </v-col>
    </v-row>
    <v-row class="mt-8 mt-md-2">
      <v-divider></v-divider>
      <v-col cols="12" class="pt-0">
        <EquipmentSkills
          :api_baseUrl="props.api_baseUrl"
          :selectedEquipmentType="props.equipmentPiece.toLowerCase()"
          :selectedEquipmentName="selectedEquipment[props.equipmentPiece.toLowerCase()]"
          :selectedDecorations="selectedDecorations[props.equipmentPiece.toLowerCase()]"
          @all-skills="handleAllSkills"
          >
        </EquipmentSkills>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
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

import EquipmentSelector from './EquipmentSelector.vue';
import EquipmentSlots from './EquipmentSlots.vue';
import EquipmentSkills from './EquipmentSkills.vue';

import { computed, ref } from 'vue';

const props = defineProps({
  api_baseUrl: String,
  equipmentPiece: String,
  decorationCategories: Object
})

const emit = defineEmits(['all-skills']);

const equipmentSelectorKey = ref(0);

const armorImage = {
  Head: Image_ArmorHead,
  Chest: Image_ArmorChest,
  Arms: Image_ArmorArms,
  Waist: Image_ArmorWaist,
  Legs: Image_ArmorLegs,
  Talisman: Image_ArmorTalisman,
}

const armorImg = computed(() => {
	if(armorImage.hasOwnProperty(props.equipmentPiece)) {
		return armorImage[props.equipmentPiece]
	} else {
		return;
	}
})

const weaponImages = {
  Great_Sword: Image_WeaponGreatSword,
  Long_Sword: Image_WeaponLongSword,
  Sword_Shield: Image_WeaponSwordShield,
  Dual_Blades: Image_WeaponDualBlades,
  Hammer: Image_WeaponHammer,
  Hunting_Horn: Image_WeaponHuntingHorn,
  Lance: Image_WeaponLance,
  Gunlance: Image_WeaponGunlance,
  Switch_Axe: Image_WeaponSwitchAxe,
  Charge_Blade: Image_WeaponChargeBlade,
  Insect_Glaive: Image_WeaponInsectGlaive,
  Bow: Image_WeaponBow,
  Light_Bowgun: Image_WeaponLightBowgun,
  Heavy_Bowgun: Image_WeaponHeavyBowgun,
}

const weaponKeys = Object.keys(weaponImages);

const selectedWeapon = ref({
  Weapon: Image_WeaponGreatSword,
})

const selectedWpn = computed(() => {
  if(selectedWeapon.value.hasOwnProperty(props.equipmentPiece)) {
    return selectedWeapon.value[props.equipmentPiece]
  } else {
    return;
  }
})

const showWeaponSelector = ref(false);

const selectWeapon = (weaponKey) => {
  selectedWeapon.value = {
    [props.equipmentPiece]: weaponImages[weaponKey]
  };
  showWeaponSelector.value = false;
  equipmentSelectorKey.value++;
  selectedEquipment.value = {
    weapon: null
  }
};

const equipmentPieceForSelector = computed(() => {
  if (props.equipmentPiece === 'Weapon') {
    const weaponType = Object.keys(selectedWeapon.value)[0];
    for (const key in weaponImages) {
      if (weaponImages[key] === selectedWeapon.value[weaponType]) {
        return key;
      }
    }
    return '';
  } else {
    return props.equipmentPiece;
  }
});

const selectedEquipment = ref({});

const handleSelectedEquipment = (headEmitted, chestEmitted, armsEmitted, waistEmitted, legsEmitted, talismanEmitted, weaponEmitted) => {
  selectedEquipment.value = {
      head: headEmitted,
      chest: chestEmitted,
      arms: armsEmitted,
      waist: waistEmitted,
      legs: legsEmitted,
      talisman: talismanEmitted,
      weapon: weaponEmitted
  }
};

const selectedDecorations = ref({});

const handleSelectedDecorations = (headEmitted, chestEmitted, armsEmitted, waistEmitted, legsEmitted, talismanEmitted, weaponEmitted) => {
  selectedDecorations.value = {
      head: headEmitted.head,
      chest: chestEmitted.chest,
      arms: armsEmitted.arms,
      waist: waistEmitted.waist,
      legs: legsEmitted.legs,
      talisman: talismanEmitted.talisman,
      weapon: weaponEmitted.weapon
  }
};

const handleAllSkills = (allSkillsEmitted) => {
  emit('all-skills', allSkillsEmitted);
};



</script>

<style scoped>
.equipmentCard-vCard {
  width: 100vw;
}

.equipmentCard-vImg-armorIcon {
  height: 40px;
  width: 40px;
  margin: 10px;
}

.equipmentCard-weaponBtn {
  min-width: 50px;
  min-height: 50px;
  padding: 0;
  margin: 5px;
}

.equipmentCard-vImg-weaponIcon {
  height: 45px;
  width: 45px;
  margin: 0;
}
.equipmentCard-equipmentSelector :deep(.v-field__clearable){
  margin: auto 0;
  padding: auto 0;
}

.equipmentCard-equipmentSelector :deep(.v-autocomplete__selection-text),
.equipmentCard-equipmentSelector :deep(.v-field__input){
  font-size: 20px;
  margin: auto 0;
  padding: auto 0;
}

.equipmentCard-equipmentSlots :deep(.v-field__field__prepend-inner),
.equipmentCard-equipmentSlots :deep(.v-field__clearable){
  margin: auto 0;
  padding: auto 0;
}

.equipmentCard-equipmentSlots :deep(.v-autocomplete__selection-text),
.equipmentCard-equipmentSlots :deep(.v-field__input) {
  font-size: 11px;
  margin: auto 0;
  padding: auto 0;
}
</style>