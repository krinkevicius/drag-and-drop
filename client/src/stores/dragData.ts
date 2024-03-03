import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useCreateRecipeStore } from './createRecipe'

// Support for HTML Drag and Drop API differes between browsers, mainly access
// of dataTrasfer property during dragover event. Pinia store will be used instead

type DragType = 'icon' | 'item'
type DragValue<T extends DragType> = T extends 'icon' ? string : number

type DragData<T extends DragType> = {
  dragType: T
  dragValue: DragValue<T>
}

export const useDragDataStore = defineStore('dragDataStore', () => {
  const createRecipeStore = useCreateRecipeStore()
  const dragData = ref<DragData<'icon'> | DragData<'item'> | undefined>(undefined)

  const itemInsertIndex = ref<number | undefined>(undefined)

  watch(itemInsertIndex, (newValue) => {
    createRecipeStore.updatePlaceholderItem(newValue)
  })

  function resetDragData() {
    dragData.value = undefined
    itemInsertIndex.value = undefined
  }

  return { dragData, itemInsertIndex, resetDragData }
})
