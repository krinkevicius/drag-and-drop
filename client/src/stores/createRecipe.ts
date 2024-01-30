import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCreateRecipeStore = defineStore('createRecipeStore', () => {
  const recipeItems = ref([1, 2, 3, 5, 8])

  const canDrop = ref(true)

  return { recipeItems, canDrop }
})
