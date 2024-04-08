<script setup lang="ts">
import { trpc } from '@/trpc'
import type { RecipeForCard } from '@mono/server/src/shared/entities'
import RecipeCard from '@/components/RecipeCard.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { ref, onBeforeMount } from 'vue'

const favoriteRecipes = ref<RecipeForCard[]>([])
const loading = ref<boolean>(false)

onBeforeMount(async () => {
  loading.value = true
  favoriteRecipes.value = await trpc.user.getFavorites.query()
  loading.value = false
})
</script>

<template>
  <div class="container mx-auto flex max-w-xs flex-col gap-4 py-2 sm:max-w-md md:max-w-3xl">
    <div class="mt-4 text-center text-2xl font-semibold" data-testid="favoritesHeader">
      Check your favorite recipes here!
    </div>
    <div class="self-center" v-if="loading">
      <LoadingSpinner :size="16" />
    </div>
    <div
      class="container m-auto grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3"
      v-else-if="favoriteRecipes.length"
    >
      <div v-for="(recipe, index) in favoriteRecipes" :key="index">
        <RecipeCard :recipe="recipe" />
      </div>
    </div>
    <div class="text-center" v-else>You do not have any favorite recipes yet</div>
  </div>
</template>

<style scoped></style>
