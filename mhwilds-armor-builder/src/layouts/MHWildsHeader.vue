<template>
  <div>
    <v-img :height="MHWildsHeader.height" cover :src="Banner">
      <div class="d-flex align-center fill-height">
        <v-col cols="3" class="d-flex justify-start h-100 ma-0 pa-0">
          <div> <!-- This is used to enable justify-start to work on the image.-->
            <v-img :width="(169/116)*MHWildsHeader.height" :src="Logo_Dragon"></v-img>
          </div>
        </v-col>
        <v-col cols="6" class="h-100 ma-0 pa-0">
          <v-img :src="Title"></v-img>
        </v-col>
        <v-col cols="3" class="d-flex justify-end h-100 pr-4">
          <v-btn
            icon
            class="elevation-2 header-button"
            @click="uiStore.showDatabaseViewer()"
          >
            <Icon_ArtifactLookup height="36" width="36" color="white" />
          </v-btn>
        </v-col>
      </div>
    </v-img>
    <div class="decorative-divider"></div>
  </div>
</template>

<script setup>
  // Pinia Stores
  import { useUiStore } from '@/stores/ui.js'

  // Icons
  import Banner from '@/assets/images/banners/Banner.jpg';
  import Logo_Dragon from '@/assets/images/logos/Logo_Dragon.webp';
  import Title from '@/assets/images/titles/Title_MHWildsArmorBuilder.svg';
  import Icon_ArtifactLookup from '@/components/icons/Icon_ArtifactLookup.vue';

  // Local Stores
  const uiStore = useUiStore();

  const MHWildsHeader = {
    height: 74,
    width: null
  }
</script>

<style scoped>
.header-button {
  height: 50px;
  width: 50px;
  background: linear-gradient(
    30deg, 
    #4a0a0a 0%,
    #730d0d 40%,
    #9e1e1e 100%
  );
}

.decorative-divider {
  position: relative; /* Keep z-index relative to this component */
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
}
</style>
