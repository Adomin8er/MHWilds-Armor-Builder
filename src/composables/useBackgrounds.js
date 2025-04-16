import { ref, computed } from 'vue';

import Bgd_01_WindwardPlains_01 from '@/assets/images/backgrounds/Bgd_01_WindwardPlains_01.webp';
import Bgd_01_WindwardPlains_02 from '@/assets/images/backgrounds/Bgd_01_WindwardPlains_02.webp';
import Bgd_01_WindwardPlains_03 from '@/assets/images/backgrounds/Bgd_01_WindwardPlains_03.webp';
import Bgd_02_ScarletForest_01 from '@/assets/images/backgrounds/Bgd_02_ScarletForest_01.webp';
import Bgd_02_ScarletForest_02 from '@/assets/images/backgrounds/Bgd_02_ScarletForest_02.webp';
import Bgd_02_ScarletForest_03 from '@/assets/images/backgrounds/Bgd_02_ScarletForest_03.webp';
import Bgd_03_OilwellBasin_01 from '@/assets/images/backgrounds/Bgd_03_OilwellBasin_01.webp';
import Bgd_03_OilwellBasin_02 from '@/assets/images/backgrounds/Bgd_03_OilwellBasin_02.webp';
import Bgd_03_OilwellBasin_03 from '@/assets/images/backgrounds/Bgd_03_OilwellBasin_03.webp';
import Bgd_04_IceshardCliffs_01 from '@/assets/images/backgrounds/Bgd_04_IceshardCliffs_01.webp';
import Bgd_05_RuinsOfWyveria_01 from '@/assets/images/backgrounds/Bgd_05_RuinsOfWyveria_01.webp';

export function useBackgrounds() {
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

  const setupRandomBackground = () => {
    if (backgroundImages.length > 0) {
        const randomIndex = Math.floor(Math.random() * backgroundImages.length);
        currentBackground.value = backgroundImages[randomIndex];
    }
  };

  const appBackgroundStyle = computed(() => ({
    backgroundImage: `url(${currentBackground.value})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center center',
    backgroundAttachment: 'fixed',
    backgroundRepeat: 'no-repeat',
  }));

  return {
    currentBackground,
    appBackgroundStyle,
    setupRandomBackground
  };
}