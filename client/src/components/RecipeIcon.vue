<script setup lang="ts">
import type { PropType } from 'vue'
import { RecipeItems } from '@/consts'
import { useDragDataStore } from '@/stores/dragData'

const dragDataStore = useDragDataStore()

const props = defineProps({
  itemType: { type: String as PropType<keyof typeof RecipeItems>, required: true },
})

const pathToIcon = `src/assets/${props.itemType}.svg`

function dragStartHandler() {
  dragDataStore.dragData = { dragType: 'icon', dragValue: props.itemType }
  console.log(`dragstart sees dragValue as ${dragDataStore.dragData.dragValue}`)
}

function dragEndHandler() {
  dragDataStore.resetDragData()
}
</script>

<template>
  <div
    class="item-icon"
    draggable="true"
    @dragstart="dragStartHandler"
    @dragend="dragEndHandler"
    :style="{ backgroundImage: `url(${pathToIcon})` }"
    :data-testid="`draggable-${itemType}-icon`"
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
