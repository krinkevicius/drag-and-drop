<script setup lang="ts">
import RecipeIcon from '@/components/RecipeIcon.vue'
import RecipeItem from '@/components/RecipeItem.vue'
import { useCreateRecipeStore } from '../stores/createRecipe'

const createRecipeStore = useCreateRecipeStore()

function dragOverHandler(event: DragEvent) {
  if (createRecipeStore.canDrop) {
    event.preventDefault()
  }
}

function onDropHandler(event: DragEvent) {
  const data = event.dataTransfer?.getData('text/plain')
  console.log(`${data} was dropped`)
}
</script>

<template>
  <div class="admin">
    <div class="sidebar">
      <RecipeIcon itemType="image" />
      <RecipeIcon itemType="description" />
    </div>
    <div class="dropzone" @dragover="dragOverHandler($event)" @drop="onDropHandler($event)">
      <div v-for="(item, index) in createRecipeStore.recipeItems" :key="index">
        {{ item }}
        <RecipeItem :item="item" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin {
  display: grid;
  grid-gap: 10px;
  grid-template-columns: 300px auto;
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
