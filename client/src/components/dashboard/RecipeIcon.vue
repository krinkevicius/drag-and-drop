<script setup lang="ts">
import type { PropType } from 'vue'
import { recipeItemsDefault } from '@/consts'
import { useDragDataStore } from '@/stores/dragData'

const dragDataStore = useDragDataStore()

const props = defineProps({
  itemType: { type: String as PropType<keyof typeof recipeItemsDefault>, required: true },
})

const pathToIcon = `/${props.itemType}.svg`

const title = props.itemType.replace(/[A-Z]/g, ' $&').toLowerCase()

function dragStartHandler() {
  dragDataStore.dragData = { dragType: 'icon', dragValue: props.itemType }
}

function dragEndHandler() {
  dragDataStore.resetDragData()
}
</script>

<template>
  <div
    :title="`Drag me to add ${title}!`"
    class="h-12 w-12 bg-secondary-blue bg-center bg-no-repeat"
    draggable="true"
    @dragstart="dragStartHandler"
    @dragend="dragEndHandler"
    :style="{ backgroundImage: `url(${pathToIcon})` }"
    :data-testid="`draggable-${props.itemType}-icon`"
  ></div>
</template>
