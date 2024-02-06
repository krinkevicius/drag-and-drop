<script setup lang="ts">
import RecipeIcon from '@/components/RecipeIcon.vue'
import RecipeItem from '@/components/RecipeItem.vue'
import { useCreateRecipeStore } from '@/stores/createRecipe'
import { RecipeItems } from '@/consts'
import { ref } from 'vue'

type ClosestItem = {
  offset: number
  element: Element
}

const icons = ref<(keyof typeof RecipeItems)[]>(['image', 'description', 'list', 'categories'])

const createRecipeStore = useCreateRecipeStore()

function dragOverHandler(event: DragEvent) {
  if (
    !event.dataTransfer!.getData('dataFromIcon') &&
    !event.dataTransfer!.getData('dataFromItem')
  ) {
    return
  }
  // based on https://www.youtube.com/watch?v=jfYWwQrtzzY

  const itemWrappers = [...document.querySelectorAll('.item-wrapper')]

  const closestItem = itemWrappers.reduce(
    (closest: ClosestItem, child: Element) => {
      const itemBorders = child.getBoundingClientRect()
      const offset = event.clientY - itemBorders.top - itemBorders.height / 2
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child }
      } else {
        return closest
      }
    },
    { offset: Number.NEGATIVE_INFINITY } as ClosestItem
  ).element

  const closestItemIndex = itemWrappers.findIndex((item) => item === closestItem)
  const dataFromItem = parseInt(event.dataTransfer!.getData('dataFromItem'))
  if (closestItemIndex !== dataFromItem && closestItemIndex !== dataFromItem + 1) {
    createRecipeStore.itemInsertIndex = closestItemIndex
  }
}

function onDropHandler(event: DragEvent) {
  const dataFromIcon = event.dataTransfer!.getData('dataFromIcon') as keyof typeof RecipeItems
  const dataFromItem = event.dataTransfer!.getData('dataFromItem') as `${number}`
  if (dataFromIcon) {
    const newItem = createRecipeStore.createNewItem(dataFromIcon)
    createRecipeStore.addToItems(newItem, createRecipeStore.itemInsertIndex!)
  } else if (dataFromItem) {
    createRecipeStore.moveItem(parseInt(dataFromItem, 10), createRecipeStore.itemInsertIndex)
  }
}

function list() {
  console.log(createRecipeStore.recipeItems)
}
</script>

<template>
  <div class="admin">
    <div class="sidebar">
      000
      <div v-for="(icon, index) in icons" :key="index">
        <RecipeIcon :itemType="icon" />
      </div>
    </div>
    <div class="dropzone" @dragover.prevent="dragOverHandler($event)" @drop="onDropHandler($event)">
      <div v-if="!createRecipeStore.recipeItems.length">Drag Icons!</div>
      <div
        class="item-wrapper"
        v-for="item in createRecipeStore.recipeItems"
        :key="item.id"
        ref="itemRefs"
      >
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
  display: flex;
  flex-direction: column;
  gap: 1em;
}

.item-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1em;
}
</style>
