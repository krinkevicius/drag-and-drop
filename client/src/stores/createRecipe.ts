import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { RecipeItems } from '@/consts'

export type ItemRecord = {
  id: string
  componentType: keyof typeof RecipeItems
  data: { [key: string]: any }
}

export const useCreateRecipeStore = defineStore('createRecipeStore', () => {
  const recipeItems = ref<ItemRecord[]>([])

  function createNewItem(componentType: keyof typeof RecipeItems): ItemRecord {
    const id = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '')
    const data = { ...RecipeItems[componentType].data }
    return { id, componentType, data }
  }

  function addToItems(item: ItemRecord, index: number) {
    if (index === -1) {
      recipeItems.value.push(item)
    } else {
      recipeItems.value.splice(index, 0, item)
    }
  }

  function moveItem(fromIndex: number, toIndex: number | undefined) {
    if (toIndex === undefined) return
    console.log('moving items')
    const itemToMove = recipeItems.value.filter((item) => item.componentType !== 'help')[fromIndex]
    console.log(itemToMove)

    // ItemRecord with componentType "help" will be present thus the fromIndex needs to be recalculated:

    const adjustedFromIndex = recipeItems.value.findIndex((item) => item.id === itemToMove.id)
    console.log(`New movement should be done from ${adjustedFromIndex} to ${toIndex}`)

    recipeItems.value.splice(toIndex, 0, recipeItems.value.splice(adjustedFromIndex, 1)[0])
  }

  const itemInsertIndex = ref<number | undefined>(undefined)

  watch(itemInsertIndex, (newValue) => {
    recipeItems.value = recipeItems.value.filter((item) => item.componentType !== 'help')

    if (newValue !== undefined) {
      addToItems(createNewItem('help'), newValue)
    }
  })

  function resetInsertIndex() {
    itemInsertIndex.value = undefined
  }

  return { recipeItems, createNewItem, addToItems, moveItem, itemInsertIndex, resetInsertIndex }
})
