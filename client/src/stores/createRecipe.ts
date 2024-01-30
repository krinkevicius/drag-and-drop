import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCreateRecipeStore = defineStore('createRecipeStore', () => {
  const canDrop = ref(true)

  return { canDrop }
})
