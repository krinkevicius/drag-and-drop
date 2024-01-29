<script setup lang="ts">
import RecipeIcon from '@/components/RecipeIcon.vue'
</script>

<template>
  <div class="admin">
    <div class="sidebar">
      <RecipeIcon itemType="image" />
      <RecipeIcon itemType="description" />
    </div>
    <div class="dropzone"></div>
  </div>
</template>

<style scoped>
.admin {
  display: grid;
  grid-gap: 10px;
  grid-template-columns: 300px 300px;
  grid-template-areas: 'sidebar drop-zone';
}

.sidebar {
  grid-area: sidebar;
  height: 100vh;
  border: 2px solid red;
  padding: 20px;
}

.dropzone {
  grid-area: drop-zone;
  height: 100vh;
  column-gap: 10px;
}
</style>
