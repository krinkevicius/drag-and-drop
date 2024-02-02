<script setup lang="ts">
import RecipeIcon from '@/components/RecipeIcon.vue'
import RecipeItem from '@/components/RecipeItem.vue'
import { useCreateRecipeStore } from '../stores/createRecipe'
import { RecipeItems } from '@/consts'

type ClosestItem = {
  offset: number
  element: Element
}

const createRecipeStore = useCreateRecipeStore()

function dragOverHandler(event: DragEvent) {
  // based on https://www.youtube.com/watch?v=jfYWwQrtzzY

  const testArray = [...document.querySelectorAll('.item-wrapper')]

  const closestItem = testArray.reduce(
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

  createRecipeStore.itemInsertIndex = testArray.findIndex((item) => item === closestItem)

  console.log(createRecipeStore.itemInsertIndex)
}

function onDropHandler(event: DragEvent) {
  const dataFromIcon = event.dataTransfer!.getData('dataFromIcon') as keyof typeof RecipeItems

  if (dataFromIcon) {
    createRecipeStore.addToItems(dataFromIcon, createRecipeStore.itemInsertIndex!)
  }
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
    <div class="dropzone" @dragover.prevent="dragOverHandler($event)" @drop="onDropHandler($event)">
      <div v-if="!createRecipeStore.recipeItems.length">Drag Icons!</div>
      <div
        class="item-wrapper"
        v-for="(item, index) in createRecipeStore.recipeItems"
        :key="item.id"
        ref="itemRefs"
      >
        <div class="insert-line" v-if="createRecipeStore.itemInsertIndex === index">
          INSERT HERE
        </div>
        <RecipeItem :item="item" />
      </div>
      <div class="insert-line" v-if="createRecipeStore.itemInsertIndex === -1">INSERT HERE</div>
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
.insert-line {
  border: 8px solid black;
}

.item-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1em;
}
</style>
