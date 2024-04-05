<script setup lang="ts">
import { useCreateRecipeStore } from '@/stores/createRecipe'
import { useDragDataStore } from '@/stores/dragData'
import { useErrorStore } from '@/stores/errorStore'
import RecipeItem from '@/components/RecipeItem.vue'
import { recipeItemsDefault } from '@/consts'
import { withError } from '@/composables/useErrorHandling'
import { computed, ref, toRefs, watch } from 'vue'
import Popup from '@/components/Popup.vue'
import FormButton from '@/components/FormButton.vue'

const createRecipeStore = useCreateRecipeStore()
const dragDataStore = useDragDataStore()
const { globalErrorMessage } = toRefs(useErrorStore())

const confirmationMessage = ref<string>('')
const successMessage = ref<string>('')
const loading = ref<boolean>(false)

const open = computed(() => {
  return confirmationMessage.value.length || successMessage.value.length ? true : false
})

function close() {
  confirmationMessage.value = ''
  successMessage.value = ''
}

watch(globalErrorMessage, () => {
  if (!globalErrorMessage.value) return
  loading.value = false
  confirmationMessage.value = ''
})

type ClosestItem = {
  offset: number
  element: Element
}

function dragOverHandler(event: DragEvent) {
  if (!dragDataStore.dragData) {
    return
  }

  // based on https://www.youtube.com/watch?v=jfYWwQrtzzY

  const itemWrappers = [...document.querySelectorAll('.item-wrapper')]

  const closestItem = itemWrappers.reduce(
    (closest: ClosestItem, child: Element) => {
      const itemBorders = child.getBoundingClientRect()
      const offset = event.clientY - itemBorders.top - itemBorders.height / 2
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child }
      } else {
        return closest
      }
    },
    { offset: Number.NEGATIVE_INFINITY } as ClosestItem
  ).element

  const closestItemIndex = itemWrappers.findIndex((item) => item === closestItem)

  const testDataFromItem =
    dragDataStore.dragData.dragType === 'item' ? dragDataStore.dragData.dragValue : NaN

  if (closestItemIndex !== testDataFromItem && closestItemIndex !== testDataFromItem + 1) {
    dragDataStore.itemInsertIndex = closestItemIndex
  }
}

function onDropHandler() {
  if (!dragDataStore.dragData) {
    return
  }
  if (dragDataStore.dragData.dragType === 'icon') {
    const newItem = createRecipeStore.createNewItem(
      dragDataStore.dragData.dragValue as keyof typeof recipeItemsDefault
    )
    createRecipeStore.addToItems(newItem, dragDataStore.itemInsertIndex!)
  } else if (dragDataStore.dragData.dragType === 'item') {
    createRecipeStore.moveItem(dragDataStore.dragData.dragValue, dragDataStore.itemInsertIndex)
  }
}

function askForConfirmation() {
  confirmationMessage.value = 'Are you sure? You will not be able to edit the recipe afterwards.'
}

const createRecipe = withError(async () => {
  loading.value = true
  await createRecipeStore.createRecipe()
  loading.value = false
  successMessage.value = 'Recipe saved successfully!'
  confirmationMessage.value = ''
}, globalErrorMessage)
</script>

<template>
  <Popup :open="open" :close="close">
    <template #popupContent>
      <div class="pb-2 text-center" v-if="confirmationMessage">
        {{ confirmationMessage }}
      </div>

      <div class="flex justify-center pt-2">
        <FormButton
          :button-text="'Confirm'"
          :loading="loading"
          :successMessage="successMessage"
          @click="createRecipe"
        />
      </div>
    </template>
  </Popup>
  <div
    class="dropzone flex h-full flex-col gap-[1em] py-4"
    @dragover.prevent="dragOverHandler($event)"
    @drop="onDropHandler"
    data-testid="dropzone"
  >
    <div class="mb-6 flex w-full flex-row justify-center">
      <input
        data-testid="recipeNameInput"
        class="focus:shadow-outline w-3/4 appearance-none rounded-l-lg border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
        label="Recipe Name"
        type="text"
        placeholder="Enter recipe name"
        v-model="createRecipeStore.recipeName"
      />
      <button
        class="focus:shadow-outline w-1/4 rounded-r-lg bg-main-blue px-4 py-2 text-xs font-normal text-white hover:bg-secondary-blue focus:outline-none md:text-base md:font-bold"
        @click="askForConfirmation"
      >
        Create Recipe
      </button>
    </div>
    <div
      class="mt-4 text-center text-2xl font-semibold"
      v-if="!createRecipeStore.recipeItems.length"
    >
      Drag icons to create a recipe!
    </div>
    <div
      class="item-wrapper"
      v-for="item in createRecipeStore.recipeItems"
      :key="item.id"
      ref="itemRefs"
    >
      <RecipeItem :item="item" />
    </div>
  </div>
</template>
