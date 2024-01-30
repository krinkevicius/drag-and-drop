import { defineStore } from 'pinia'
import { ref } from 'vue'
import { RecipeItems } from '@/consts'

export type ItemRecord = {
  id: string
  componentType: keyof typeof RecipeItems
}

export const useCreateRecipeStore = defineStore('createRecipeStore', () => {
  const recipeItems = ref<ItemRecord[]>([{ id: '20240130T130319Z', componentType: 'description' }])

  function addToStart() {
    const id = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '')
    recipeItems.value.splice(0, 0, { id, componentType: 'description' })
  }

  const canDrop = ref(true)

  function toggleCanDrop() {
    canDrop.value = !canDrop.value
  }

  return { recipeItems, canDrop, toggleCanDrop, addToStart }
})
