import { defineStore } from 'pinia'
import { ref } from 'vue'
import { RecipeItems } from '@/consts'

export type ItemRecord = {
  componentType: keyof typeof RecipeItems
}

export const useCreateRecipeStore = defineStore('createRecipeStore', () => {
  const recipeItems = ref<ItemRecord[]>([{ componentType: 'image' }])

  const canDrop = ref(true)

  function toggleCanDrop() {
    canDrop.value = !canDrop.value
  }

  return { recipeItems, canDrop, toggleCanDrop }
})
