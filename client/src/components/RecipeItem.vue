<script setup lang="ts">
import type { ItemRecord } from '@/stores/createRecipe'
import type { PropType } from 'vue'
import { RecipeItems } from '@/consts'
import { ref } from 'vue'
import { useCreateRecipeStore } from '@/stores/createRecipe'
import { useDragDataStore } from '@/stores/dragData'

const props = defineProps({
  item: { type: Object as PropType<ItemRecord>, required: true },
})

const recipeStore = useCreateRecipeStore()
const dragDataStore = useDragDataStore()

const isDraggable = ref(true)
const isDragged = ref(false)

function toggleDrag() {
  isDraggable.value = !isDraggable.value
}

function dragStartHandler() {
  isDragged.value = true
  const index = recipeStore.recipeItems.findIndex((item) => item === props.item)
  dragDataStore.dragData = { dragType: 'item', dragValue: index }
}

function dragEndHandler() {
  isDragged.value = false
  dragDataStore.resetDragData()
}
</script>

<template>
  <div
    class="wrapper"
    :class="{ dragging: isDragged }"
    :draggable="isDraggable"
    @dragstart="dragStartHandler"
    @dragend="dragEndHandler"
    :data-testid="`${$props.item.componentType}-item`"
  >
    This is a single recipe item
    <div class="insert" @mouseenter="toggleDrag" @mouseleave="toggleDrag">
      <component :is="RecipeItems[props.item.componentType].component" :id="item.id"></component>
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  min-height: 100px;
  text-align: center;
  border: 5px solid black;
}

.dragging {
  opacity: 50%;
}

.insert {
  border: 3px dashed black;
}
</style>
