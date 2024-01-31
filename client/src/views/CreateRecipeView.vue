<script setup lang="ts">
import RecipeIcon from '@/components/RecipeIcon.vue'
import RecipeItem from '@/components/RecipeItem.vue'
import { useCreateRecipeStore } from '../stores/createRecipe'
import { RecipeItems } from '@/consts'
import { ref } from 'vue'

const createRecipeStore = useCreateRecipeStore()

const itemRefs = ref<HTMLElement[]>([])
const itemInsertIndex = ref<number>(-1)

function dragOverHandler(event: DragEvent) {
  if (createRecipeStore.canDrop) {
    event.preventDefault()
  }

  const testArray = [...document.querySelectorAll('.test')]

  const closestItem = testArray.reduce(
    (closest: any, child: Element) => {
      const itemBorders = child.getBoundingClientRect()
      const offset = event.clientY - itemBorders.top - itemBorders.height / 2
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child }
      } else {
        return closest
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element

  itemInsertIndex.value = testArray.findIndex((item) => item === closestItem)

  console.log(itemInsertIndex.value)
}

function onDropHandler(event: DragEvent) {
  const data = event.dataTransfer?.getData('text/plain') as string as keyof typeof RecipeItems
  createRecipeStore.addToItems(data, itemInsertIndex.value)

  itemInsertIndex.value = -1
}

function list() {
  console.log(createRecipeStore.recipeItems)
}
</script>

<template>
  <div class="admin">
    <div class="sidebar">
      <RecipeIcon itemType="image" />
      <RecipeIcon itemType="description" />
    </div>
    <div class="dropzone" @dragover="dragOverHandler($event)" @drop="onDropHandler($event)">
      <div class="test" v-for="item in createRecipeStore.recipeItems" :key="item.id" ref="itemRefs">
        {{ item }}
        <RecipeItem :item="item" />
      </div>
    </div>
    <button @click="list">List</button>
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
