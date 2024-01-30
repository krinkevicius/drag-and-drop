<script setup lang="ts">
import { useCreateRecipeStore } from '@/stores/createRecipe'
import type { ItemRecord } from '@/stores/createRecipe'
import type { PropType } from 'vue'
import { RecipeItems } from '@/consts'

const createRecipeStore = useCreateRecipeStore()

const props = defineProps({
  item: { type: Object as PropType<ItemRecord>, required: true },
})
</script>

<template>
  <div class="wrapper">
    This is a single recipe item
    <div
      class="insert"
      @dragenter="createRecipeStore.toggleCanDrop"
      @dragleave="createRecipeStore.toggleCanDrop"
    >
      <component :is="RecipeItems[props.item.componentType].component"></component>
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  min-height: 100px;
  text-align: center;
  border: 5px solid black;
}

.insert {
  border: 3px dashed black;
}
</style>
