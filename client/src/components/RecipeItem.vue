<script setup lang="ts">
import type { ItemRecord } from '@/stores/createRecipe'
import type { PropType } from 'vue'
import { recipeItemsDefault } from '@/consts'
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
    class="max-w-32 text-wrap flex min-h-[100px] flex-col rounded-xl border-4 text-center"
    :class="[
      props.item.itemType === 'help' ? 'border-dashed border-secondary-blue' : 'border-main-blue',
      isDragged ? 'opacity-50' : 'opacity-100',
    ]"
    :draggable="isDraggable"
    @dragstart="dragStartHandler"
    @dragend="dragEndHandler"
    :data-testid="`${$props.item.itemType}-item`"
  >
    <div
      v-if="props.item.itemType !== 'help'"
      class="rounded-t-l flex justify-end self-stretch bg-main-blue px-2.5 py-1 text-white"
    >
      <button
        class="hover:underline"
        title="Delete item"
        @click="recipeStore.removeItem(props.item)"
      >
        X
      </button>
    </div>
    <div class="self-center" v-if="props.item.itemType === 'help'">Place item here</div>
    <div class="h-full self-stretch" @mouseenter="toggleDrag" @mouseleave="toggleDrag">
      <component :is="recipeItemsDefault[props.item.itemType].component" :id="item.id"></component>
    </div>
  </div>
</template>
