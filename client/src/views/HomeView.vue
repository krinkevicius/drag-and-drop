<script lang="ts" setup>
import { trpc } from '@/trpc'
import { ref, watch } from 'vue'
import RecipeCard from '@/components/RecipeCard.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import type { RecipeForCard } from '@mono/server/src/shared/entities'
import capitalizeFirstLetter from '@/composables/useCapitalizeFirstLetter'

const foundRecipes = ref<RecipeForCard[]>([])
const pageNo = ref<number>(1)
const nextPageAvailable = ref<boolean>(false)
const searchKey = ref<string>('')
const paramArray = ['all', 'recipe', 'ingredient', 'categories'] as const
type SearchParam = (typeof paramArray)[number]
const searchParam = ref<SearchParam>('all')
const loading = ref<boolean>(false)

watch([searchKey, searchParam], async () => {
  if (pageNo.value !== 1) {
    pageNo.value = 1
  } else {
    await searchRecipes()
  }
})

watch(
  pageNo,
  async () => {
    await searchRecipes()
  },
  { immediate: true, deep: true }
)

function goToPrevPage() {
  if (pageNo.value > 1) pageNo.value--
}

function goToNextPage() {
  if (nextPageAvailable.value) pageNo.value++
}

async function searchRecipes() {
  loading.value = true
  const { getRecipes, nextPage } = await trpc.recipe.findManyBy.query({
    searchKey: searchKey.value,
    searchParams: searchParam.value,
    pageNo: pageNo.value,
  })
  loading.value = false
  foundRecipes.value = getRecipes
  nextPageAvailable.value = nextPage
}
</script>

<template>
  <div class="container mx-auto flex max-w-xs flex-col gap-4 py-2 sm:max-w-md md:max-w-3xl">
    <div class="flex flex-row">
      <input
        class="block basis-7/12 rounded-l-xl text-xs md:basis-3/4 md:text-base"
        label="searchKey"
        type="text"
        placeholder="Search for recipes!"
        v-model="searchKey"
      />
      <select
        class="block basis-5/12 rounded-r-xl text-xs md:basis-1/4 md:text-base"
        v-model="searchParam"
      >
        <option v-for="param in paramArray" :key="param" :value="param">
          {{ capitalizeFirstLetter(param) }}
        </option>
      </select>
    </div>
    <div class="flex justify-between">
      <button
        :class="[
          pageNo > 1
            ? 'cursor-pointer bg-main-blue hover:bg-secondary-blue'
            : 'cursor-not-allowed bg-disabled-blue',
        ]"
        class="focus:shadow-outline rounded px-4 py-2 text-xs font-normal text-white focus:outline-none md:text-base md:font-bold"
        @click="goToPrevPage"
      >
        Prev page
      </button>
      <div class="px-4 py-2 text-xs font-normal md:text-base md:font-bold">Page {{ pageNo }}</div>
      <button
        :class="[
          nextPageAvailable
            ? 'cursor-pointer bg-main-blue hover:bg-secondary-blue'
            : 'cursor-not-allowed bg-disabled-blue',
        ]"
        class="focus:shadow-outline rounded px-4 py-2 text-xs font-normal text-white focus:outline-none md:text-base md:font-bold"
        @click="goToNextPage"
      >
        Next page
      </button>
    </div>
    <div class="self-center" v-if="loading">
      <LoadingSpinner :size="16" />
    </div>
    <div
      v-else-if="foundRecipes.length"
      class="container m-auto grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3"
    >
      <div v-for="(recipe, index) in foundRecipes" :key="index">
        <RecipeCard :recipe="recipe" />
      </div>
    </div>
    <div class="mt-4 self-center text-center text-2xl font-semibold" v-else>No recipes found</div>
  </div>
</template>
