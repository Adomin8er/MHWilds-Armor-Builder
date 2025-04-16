import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

const API_BASE_URL = 'https://wilds.mhdb.io/en/';

export const useDataStore = defineStore('data', () => {
  // State
  const allArmorData = ref([]);
  const allWeaponData = ref([]);
  const allDecorationData = ref([]);
  const allSkillData = ref([]);
  const allCharmData = ref([]);
  const allArmorSetData = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  // Getters
  const decorationCategories = computed(() => { 
    const categories = {};
    if (!allDecorationData.value || allDecorationData.value.length === 0) {
      console.log("No decoration data available for categories.");
      return categories;
    }
    return categories;
  });

  // Actions
  async function fetchAllInitialData() {
    isLoading.value = true;
    error.value = null;
    try {
      const [armorRes, weaponRes, decorationRes, skillRes, charmRes, armorSetRes] = await Promise.all([
        fetch(`${API_BASE_URL}armor`),
        fetch(`${API_BASE_URL}weapons`),
        fetch(`${API_BASE_URL}decorations`),
        fetch(`${API_BASE_URL}skills`),
        fetch(`${API_BASE_URL}charms`),
        fetch(`${API_BASE_URL}armor/sets`),
      ]);

      if (!armorRes.ok) throw new Error(`Armor fetch failed: ${armorRes.statusText}`);
      if (!weaponRes.ok) throw new Error(`Weapon fetch failed: ${weaponRes.statusText}`);
      if (!decorationRes.ok) throw new Error(`Decoration fetch failed: ${decorationRes.statusText}`);
      if (!skillRes.ok) throw new Error(`Skill fetch failed: ${skillRes.statusText}`);
      if (!charmRes.ok) throw new Error(`Charm fetch failed: ${charmRes.statusText}`);
      if (!armorSetRes.ok) throw new Error(`Armor Set fetch failed: ${armorSetRes.statusText}`);


      const [armorData, weaponData, decorationData, skillData, charmData, armorSetData] = await Promise.all([ 
        armorRes.json(),
        weaponRes.json(),
        decorationRes.json(),
        skillRes.json(),
        charmRes.json(),
        armorSetRes.json(),
      ]);

      allArmorData.value = armorData;
      allWeaponData.value = weaponData;
      allDecorationData.value = decorationData;
      allSkillData.value = skillData;
      allCharmData.value = charmData;
      allArmorSetData.value = armorSetData;

    } catch (err) {
      console.error("Error fetching initial data:", err);
      error.value = err.message || 'Failed to fetch data';
      allArmorData.value = [];
      allWeaponData.value = [];
      allDecorationData.value = [];
      allSkillData.value = [];
      allCharmData.value = [];
      allArmorSetData.value = [];
    } finally {
      isLoading.value = false;
    }
  }

  return {
    // State
    allArmorData,
    allWeaponData,
    allDecorationData,
    allSkillData,
    allCharmData,
    allArmorSetData,
    isLoading,
    error,
    // Getters
    decorationCategories,
    // Actions
    fetchAllInitialData,
    // API URL
    API_BASE_URL
  };
});