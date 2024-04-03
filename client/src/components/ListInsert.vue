<script setup lang="ts">
import { ref, watch } from 'vue'
import { trpc } from '@/trpc'
import type { Ingredient, IngredientListItem } from '@mono/server/src/shared/entities'
import useDelayedRef from '@/composables/useDelayedRef'
import capitalizeFirstLetter from '@/composables/useCapitalizeFirstLetter'
import { useCreateRecipeStore } from '@/stores/createRecipe'

const store = useCreateRecipeStore()
const props = defineProps({
  id: { type: String, required: true },
})
const item = store.recipeItems.find((item): item is IngredientListItem => item.id === props.id)

const newQuantity = ref('')
const foundIngredients = ref<Ingredient[]>([])
const newIngredient = useDelayedRef<string>('')

watch(newIngredient, async (newValue) => {
  if (
    newValue === '' ||
    foundIngredients.value.some((ingredient) => ingredient.name === newValue.toLowerCase().trim())
  )
    return

  foundIngredients.value = await trpc.ingredient.find.query(newValue)
})

function addToList() {
  if (!newIngredient.value || !newQuantity.value) return
  item!.data.quantityIngredientPairs.push({
    quantity: newQuantity.value,
    name: newIngredient.value,
  })
  newIngredient.value = ''
  newQuantity.value = ''
}

function removeFromList(index: number) {
  item!.data.quantityIngredientPairs.splice(index, 1)
}
</script>

<template>
  <div class="pt-2">
    <div class="container mx-auto flex flex-col content-center items-center gap-2">
      <div
        class="flex w-full flex-row items-center justify-center gap-2"
        v-for="(pair, index) in item!.data.quantityIngredientPairs"
        :key="index"
      >
        <div>{{ capitalizeFirstLetter(pair.quantity) }}</div>
        <div>{{ capitalizeFirstLetter(pair.name) }}</div>
        <button class="hover:underline" title="Remove ingredient" @click="removeFromList(index)">
          Remove
        </button>
      </div>
    </div>
    <div class="flex flex-row px-4 pb-4">
      <input
        class="quantity-input focus:shadow-outline w-full appearance-none rounded-l-lg border px-3 py-2 text-xs leading-tight text-gray-700 shadow focus:outline-none md:text-base"
        v-model="newQuantity"
        label="Quantity"
        type="text"
        placeholder="Quantity"
      />
      <input
        class="ingredient-input focus:shadow-outline w-full appearance-none border px-3 py-2 text-xs leading-tight text-gray-700 shadow focus:outline-none md:text-base"
        v-model="newIngredient"
        label="Ingredient"
        type="text"
        placeholder="Ingredient"
        list="ingredientsInDb"
      />
      <datalist id="ingredientsInDb">
        <option v-for="(ingredient, index) in foundIngredients" :key="index">
          {{ capitalizeFirstLetter(ingredient.name) }}
        </option>
      </datalist>
      <button
        class="ingredient-button focus:shadow-outline rounded-r-lg bg-main-blue px-4 py-2 text-xs font-normal text-white hover:bg-secondary-blue focus:outline-none md:text-base md:font-bold"
        @click="addToList"
      >
        Add ingredient
      </button>
    </div>
  </div>
</template>
