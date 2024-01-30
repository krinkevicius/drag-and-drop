import { defineStore } from 'pinia'
import { ref } from 'vue'
import { RecipeItems } from '@/consts'

export type ItemRecord = {
  id: string
  componentType: keyof typeof RecipeItems
}

export const useCreateRecipeStore = defineStore('createRecipeStore', () => {
  const recipeItems = ref<ItemRecord[]>([{ id: '20240130T130319Z', componentType: 'description' }])

  function addToItems(item: keyof typeof RecipeItems) {
    const id = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '')
    recipeItems.value.push({ id, componentType: item })
  }

  const canDrop = ref(true)

  function toggleCanDrop() {
    canDrop.value = !canDrop.value
  }

  return { recipeItems, addToItems, canDrop, toggleCanDrop }
})
