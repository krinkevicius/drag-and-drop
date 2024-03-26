import { defineStore } from 'pinia'
import { ref } from 'vue'
import { RecipeItems } from '@/consts'
import { v4 as uuidv4 } from 'uuid'
// import { trpc } from '@/trpc'

export type ItemRecord = {
  id: string
  itemType: keyof typeof RecipeItems
  data: { [key: string]: any }
}

export const useCreateRecipeStore = defineStore('createRecipeStore', () => {
  const recipeItems = ref<ItemRecord[]>([])

  function createNewItem(itemType: keyof typeof RecipeItems): ItemRecord {
    const id = uuidv4()
    // need to create a deep copy of data from recipeItems
    const data = JSON.parse(JSON.stringify(RecipeItems[itemType].data))
    return { id, itemType, data }
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
    const itemToMove = recipeItems.value.filter((item) => item.itemType !== 'help')[fromIndex]

    // ItemRecord with componentType "help" will be present thus the fromIndex needs to be recalculated:

    const adjustedFromIndex = recipeItems.value.findIndex((item) => item.id === itemToMove.id)

    recipeItems.value.splice(toIndex, 0, recipeItems.value.splice(adjustedFromIndex, 1)[0])
  }

  function updatePlaceholderItem(index: number | undefined) {
    recipeItems.value = recipeItems.value.filter((item) => item.itemType !== 'help')

    if (index !== undefined) {
      addToItems(createNewItem('help'), index)
    }
  }

  const recipeName = ref('')

  function createRecipe() {
    const filteredItems = recipeItems.value.filter((item) => Object.keys(item.data).length > 0)

    if (!filteredItems.length || recipeName.value === '') {
      console.log('no data in items')
      return
    }
    console.log('recipe should be created')
    // const itemIds = filteredItems.map((item) => item.id)
  }

  return {
    recipeItems,
    createNewItem,
    addToItems,
    moveItem,
    updatePlaceholderItem,
    // itemInsertIndex,
    // resetInsertIndex,
    recipeName,
    createRecipe,
  }
})
