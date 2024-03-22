<script setup lang="ts">
import { useCreateRecipeStore } from '@/stores/createRecipe'
import { useDragDataStore } from '@/stores/dragData'
import RecipeItem from '@/components/RecipeItem.vue'
import { RecipeItems } from '@/consts'

const createRecipeStore = useCreateRecipeStore()
const dragDataStore = useDragDataStore()

type ClosestItem = {
  offset: number
  element: Element
}

function dragOverHandler(event: DragEvent) {
  if (!dragDataStore.dragData) {
    return
  }

  console.log(`dragover sees dragValue as ${dragDataStore.dragData.dragValue}`)

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

  const testDataFromItem =
    dragDataStore.dragData.dragType === 'item' ? dragDataStore.dragData.dragValue : NaN

  if (closestItemIndex !== testDataFromItem && closestItemIndex !== testDataFromItem + 1) {
    dragDataStore.itemInsertIndex = closestItemIndex
  }
}

function onDropHandler() {
  if (!dragDataStore.dragData) {
    return
  }
  console.log('drop!')
  console.log(`dragValue = ${dragDataStore.dragData.dragValue}`)

  if (dragDataStore.dragData.dragType === 'icon') {
    const newItem = createRecipeStore.createNewItem(
      dragDataStore.dragData.dragValue as keyof typeof RecipeItems
    )
    createRecipeStore.addToItems(newItem, dragDataStore.itemInsertIndex!)
  } else if (dragDataStore.dragData.dragType === 'item') {
    createRecipeStore.moveItem(dragDataStore.dragData.dragValue, dragDataStore.itemInsertIndex)
  }
}
</script>

<template>
  <div
    class="dropzone"
    @dragover.prevent="dragOverHandler($event)"
    @drop="onDropHandler"
    data-testid="dropzone"
  >
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
</template>

<style scoped>
.dropzone {
  height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 1em;
}
</style>
