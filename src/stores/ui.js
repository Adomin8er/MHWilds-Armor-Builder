import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUiStore = defineStore('ui', () => {
  // State
  const isDatabaseViewerVisible = ref(false);

  // Getters

  // Actions
  function showDatabaseViewer() {
    isDatabaseViewerVisible.value = true;
  }

  function hideDatabaseViewer() {
    isDatabaseViewerVisible.value = false;
  }

  function toggleDatabaseViewer() {
    isDatabaseViewerVisible.value = !isDatabaseViewerVisible.value;
  }

  return {
    // State
    isDatabaseViewerVisible,
    // Getters
    // Actions
    showDatabaseViewer,
    hideDatabaseViewer,
    toggleDatabaseViewer,
  };
});