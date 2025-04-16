<template>
  <div>
    <div class="decorative-divider"></div>
    <v-img :height="MHWildsFooter.height" cover :src="Banner">
      <div class="d-flex align-center fill-height">
        <v-col cols="3" class="h-100 ma-0 pa-0">
        </v-col>
        <v-col cols="6" class="h-100 ma-0 pa-0">
          <v-img :src="Logo_MHWildsArmorBuilder"></v-img>
        </v-col>
        <v-col cols="3" class="d-flex justify-end h-100 ma-0 pa-0">
          <div>
            <v-img :width="(175/116)*MHWildsFooter.height" cover :src="Logo_Phoenix"></v-img>
          </div>
        </v-col>
      </div>
    </v-img>
  </div>
</template>

<script setup>
// Icons
  import Banner from '@/assets/images/banners/Banner.jpg';
  import Logo_MHWildsArmorBuilder from '@/assets/images/logos/Logo_MHWildsArmorBuilder.svg';
  import Logo_Phoenix from '@/assets/images/logos/Logo_Phoenix.webp';

  const MHWildsFooter = {
    height: 74,
    width: null
  }
</script>

<style scoped>
.decorative-divider {
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
}
</style>