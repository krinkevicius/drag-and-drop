<script setup lang="ts">
import type { PropType } from 'vue'
import { RecipeItems } from '@/consts'

const props = defineProps({
  itemType: { type: String as PropType<keyof typeof RecipeItems>, required: true },
})

const pathToIcon = `src/assets/${props.itemType}.svg`

function dragStartHandler(event: DragEvent) {
  event.dataTransfer!.setData('text/plain', props.itemType)
  console.log(`${RecipeItems[props.itemType].dsc} icon is being dragged`)
}
</script>

<template>
  <div
    class="item-icon"
    draggable="true"
    @dragstart="dragStartHandler($event)"
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
