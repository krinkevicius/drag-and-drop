<script setup lang="ts">
import type { RecipeForCard } from '@mono/server/src/shared/entities'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps<{
  recipe: RecipeForCard
}>()

function goToRecipe() {
  router.push({ name: 'SingleRecipe', params: { id: props.recipe.id } })
}
</script>

<template>
  <div
    :data-testid="`singleRecipeCard-${$props.recipe.name}`"
    @click="goToRecipe"
    class="relative aspect-square overflow-hidden rounded-lg border-2 border-black hover:cursor-pointer"
  >
    <img
      class="max-h-64 w-full bg-white object-cover"
      :src="recipe.imageUrl || `/logo.svg`"
      :alt="recipe.name"
    />
    <div
      class="absolute bottom-0 w-full bg-gradient-to-b from-transparent to-black text-center text-white"
    >
      <div class="px-4 py-5">
        <strong class="text-xl font-bold">{{ recipe.name }}</strong>
      </div>
    </div>
  </div>
</template>
