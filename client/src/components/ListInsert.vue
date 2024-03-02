<script setup lang="ts">
import { customRef, ref, watch } from 'vue'
import { trpc } from '@/trpc'
import type { Ingredient } from '@mono/server/src/shared/entities'

function useDebouncedRef<T>(value: T, delay = 200) {
  let timeout: NodeJS.Timeout | undefined
  return customRef((track, trigger) => {
    return {
      get() {
        track()
        return value
      },
      set(newValue) {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          value = newValue
          trigger()
        }, delay)
      },
    }
  })
}

const newQuantity = ref('')
const foundIngredients = ref<Ingredient[]>([])
const newIngredient = useDebouncedRef<string>('')

watch(newIngredient, async (newValue) => {
  if (newValue === '') return

  foundIngredients.value = await trpc.ingredient.find.query(newValue)
})

function test() {
  console.log(newIngredient.value)
}
</script>

<template>
  <div class="list-insert">
    This is a list of ingredients
    <div class="ingredient-list">
      <!-- <div class="quantities">
        <div v-for="(quantity, index) in recipeForm.quantities" :key="index">
          {{ quantity }}
        </div>
      </div>
      <div class="ingredients">
        <div v-for="(ingredient, index) in recipeForm.ingredients" :key="index">
          {{ ingredient }}
        </div>
      </div> -->
      <input
        class="quantity-input"
        v-model="newQuantity"
        label="Quantity"
        type="text"
        placeholder="Quantity"
      />
      <input
        class="ingredient-input"
        v-model="newIngredient"
        label="Ingredient"
        type="text"
        placeholder="Ingredient"
        list="films"
      />
      <datalist id="films">
        <option v-for="(ingredient, index) in foundIngredients" :key="index">
          {{ ingredient.name }}
        </option>
      </datalist>
      <button class="ingredient-button" @click="test">Add ingredient</button>
    </div>
  </div>
</template>

<style scoped>
.list-insert {
  min-width: 20px;
  min-height: 20px;
  text-align: center;
  border: 3px solid green;
}
</style>
