import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RecipeItem } from '@mono/server/src/shared/entities'
import { recipeItemsDefault } from '@/consts'
import { v4 as uuidv4 } from 'uuid'
import { trpc } from '@/trpc'

export type ItemRecord = {
  id: string
  itemType: keyof typeof recipeItemsDefault
  data: { [key: string]: any }
}

export const useCreateRecipeStore = defineStore('createRecipeStore', () => {
  const recipeItems = ref<ItemRecord[]>([])

  function createNewItem(itemType: keyof typeof recipeItemsDefault): ItemRecord {
    const id = uuidv4()
    // need to create a deep copy of data from recipeItems
    const data = JSON.parse(JSON.stringify(recipeItemsDefault[itemType].data))
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

  function removeItem(item: ItemRecord) {
    recipeItems.value.splice(recipeItems.value.indexOf(item), 1)
  }

  const recipeName = ref('')

  async function createRecipe() {
    if (recipeName.value === '') throw new Error('Cannot create a recipe without a name!')

    const filteredItems = recipeItems.value.filter(
      (item) => item.itemType !== 'help'
    ) as RecipeItem[]

    if (!recipeItems.value.length) throw new Error('Cannot create recipe without items')

    await trpc.recipe.create.mutate({ name: recipeName.value, items: filteredItems })

    //Reser recipeItems and recipeName
    recipeName.value = ''
    recipeItems.value = []
  }

  return {
    recipeItems,
    createNewItem,
    addToItems,
    moveItem,
    updatePlaceholderItem,
    removeItem,
    recipeName,
    createRecipe,
  }
})
