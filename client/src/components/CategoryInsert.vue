<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Category, CategoryItem } from '@mono/server/src/shared/entities'
import { useCreateRecipeStore } from '@/stores/createRecipe'
import useDelayedRef from '@/composables/useDelayedRef'
import capitalizeFirstLetter from '@/composables/useCapitalizeFirstLetter'
import { trpc } from '@/trpc'

const store = useCreateRecipeStore()
const props = defineProps({
  id: { type: String, required: true },
})
const item = store.recipeItems.find((item): item is CategoryItem => item.id === props.id)

const newCategory = useDelayedRef<string>('')
const foundCategories = ref<Category[]>([])

watch(newCategory, async (newValue) => {
  if (
    newValue === '' ||
    foundCategories.value.some((category) => category.name === newValue.toLowerCase().trim())
  )
    return

  foundCategories.value = await trpc.category.find.query(newValue)
})

function add() {
  if (!newCategory.value || item!.data.categories.includes(newCategory.value.toLowerCase().trim()))
    return
  item!.data.categories.push(newCategory.value.toLowerCase().trim())
  newCategory.value = ''
}

function removeCategory(index: number) {
  item!.data.categories.splice(index, 1)
}
</script>

<template>
  <div class="pt-2">
    <div class="pb-2" v-for="(category, index) in item!.data.categories" :key="index">
      {{ capitalizeFirstLetter(category) }}
      <button class="hover:underline" @click="removeCategory(index)" title="Remove category">
        Remove
      </button>
    </div>
    <div class="flex flex-row px-4 pb-4">
      <input
        class="category-input focus:shadow-outline w-full appearance-none rounded-l-lg border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
        v-model="newCategory"
        label="New Category"
        type="text"
        placeholder="Type category you want to add"
        list="categoriesInDb"
      />
      <datalist id="categoriesInDb">
        <option v-for="(category, index) in foundCategories" :key="index">
          {{ capitalizeFirstLetter(category.name) }}
        </option>
      </datalist>
      <button
        class="focus:shadow-outline rounded-r-lg bg-main-blue px-4 py-2 text-xs font-normal text-white hover:bg-secondary-blue focus:outline-none md:text-base md:font-bold"
        @click="add"
      >
        Add category
      </button>
    </div>
  </div>
</template>
