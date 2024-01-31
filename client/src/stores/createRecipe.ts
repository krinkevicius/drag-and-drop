import { defineStore } from 'pinia'
import { ref } from 'vue'
import { RecipeItems } from '@/consts'

export type ItemRecord = {
  id: string
  componentType: keyof typeof RecipeItems
}

export const useCreateRecipeStore = defineStore('createRecipeStore', () => {
  const recipeItems = ref<ItemRecord[]>([])

  function addToItems(item: keyof typeof RecipeItems, index: number) {
    const id = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '')

    if (index === -1) {
      recipeItems.value.push({ id, componentType: item })
    } else {
      recipeItems.value.splice(index, 0, { id, componentType: item })
    }

    resetInsertIndex()
  }

  const itemInsertIndex = ref<number | null>(null)

  function resetInsertIndex() {
    itemInsertIndex.value = null
  }

  const canDrop = ref(true)

  function toggleCanDrop() {
    canDrop.value = !canDrop.value
  }

  return { recipeItems, addToItems, itemInsertIndex, resetInsertIndex, canDrop, toggleCanDrop }
})
