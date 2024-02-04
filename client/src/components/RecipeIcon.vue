<script setup lang="ts">
import type { PropType } from 'vue'
import { RecipeItems } from '@/consts'
import { useCreateRecipeStore } from '@/stores/createRecipe'

const store = useCreateRecipeStore()

const props = defineProps({
  itemType: { type: String as PropType<keyof typeof RecipeItems>, required: true },
})

const pathToIcon = `src/assets/${props.itemType}.svg`

function dragStartHandler(event: DragEvent) {
  event.dataTransfer!.setData('dataFromIcon', props.itemType)
}

function dragEndHandler() {
  console.log('Icon is resetting the index')
  store.resetInsertIndex()
}
</script>

<template>
  <div
    class="item-icon"
    draggable="true"
    @dragstart="dragStartHandler($event)"
    @dragend="dragEndHandler"
    :style="{ backgroundImage: `url(${pathToIcon})` }"
  ></div>
</template>

<style scoped>
.item-icon {
  height: 50px;
  width: 50px;
  border: 1px solid black;
  background-position: center;
  background-repeat: no-repeat;
}
</style>
