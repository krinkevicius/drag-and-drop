<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Category, CategoryItem } from '@mono/server/src/shared/entities'
import { useCreateRecipeStore } from '@/stores/createRecipe'
import useDelayedRef from '@/composables/useDelayedRef/index'
import capitalizeFirstLetter from '@/composables/useCapitalizeFirstLetter/index'
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
  <div class="category-insert">
    <div v-for="(category, index) in item!.data.categories" :key="index">
      {{ capitalizeFirstLetter(category) }} <button @click="removeCategory(index)">Remove</button>
    </div>
    <input
      class="category-input"
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
    <button class="add-category" @click="add">Add category</button>
  </div>
</template>

<style scoped>
.category-insert {
  min-width: 20px;
  min-height: 20px;
  text-align: center;
  border: 3px solid yellow;
}
</style>
