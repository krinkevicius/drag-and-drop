<script lang="ts" setup>
import { trpc } from '@/trpc'
import { ref, watch } from 'vue'
import RecipeCard from '@/components/RecipeCard.vue'
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
      <svg
        aria-hidden="true"
        class="h-16 w-16 animate-spin fill-main-blue text-gray-200 dark:text-gray-600 md:h-24 md:w-24"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
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
