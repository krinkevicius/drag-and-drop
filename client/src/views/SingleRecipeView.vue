<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref, onBeforeMount, computed, toRefs } from 'vue'
import type { RecipeItem, CommentWithAuthor } from '@mono/server/src/shared/entities'
import { recipeItemsDefault } from '@/consts'
import { trpc } from '@/trpc'
import { useUserStore } from '@/stores/users'
import AuthenticatedContent from '@/components/AuthenticatedContent.vue'
import SingleComment from '@/components/singleRecipe/SingleComment.vue'
import FormButton from '@/components/FormButton.vue'
import { withError } from '@/composables/useErrorHandling'
import { useErrorStore } from '@/stores/errorStore'

const { globalErrorMessage } = toRefs(useErrorStore())

const userStore = useUserStore()

type SingleRecipe = {
  id: number
  name: string
  items: RecipeItem[]
}

const route = useRoute()
const recipeId = Number(route.params.id)
const foundRecipe = ref<SingleRecipe | null>(null)
const loading = ref<boolean>(false)
const comments = ref<CommentWithAuthor[]>([])

const isFavorite = computed(() => {
  return userStore.userFavorites.some((favorite) => foundRecipe.value && favorite.id === recipeId)
})

onBeforeMount(async () => {
  loading.value = true

  const [recipeInDb, commentsInDb] = await Promise.all([
    await trpc.recipe.findOne.query({ id: recipeId }),
    await trpc.comment.findAll.query({ recipeId }),
  ])

  foundRecipe.value = recipeInDb
  comments.value = commentsInDb
  loading.value = false
})

const commentText = ref<string>('')

const submitComment = withError(async () => {
  const newComment = await trpc.comment.add.mutate({ recipeId, commentText: commentText.value })
  comments.value.push(newComment)
  commentText.value = ''
}, globalErrorMessage)
</script>

<template>
  <div class="container mx-auto flex max-w-xs flex-col gap-4 pb-4 pt-2 sm:max-w-md md:max-w-3xl">
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
    <div class="text-xs font-normal md:text-base" v-else-if="foundRecipe">
      <div class="relative">
        <h1 class="mx-auto text-center text-2xl font-semibold">
          {{ foundRecipe.name }}
        </h1>
        <div>
          <AuthenticatedContent>
            <template #authContent>
              <button
                data-testid="favoritesButton"
                class="absolute bottom-0 right-0 z-[1] cursor-pointer border-[none] bg-transparent p-2 text-xl transition-[opacity,filter] duration-[0.3s] ease-[ease]"
                :class="[isFavorite ? 'opacity-100 saturate-100' : 'opacity-60 saturate-0']"
                @click="userStore.addRemoveFavorites(recipeId)"
                :title="`${isFavorite ? 'Remove' : 'Add'} from favorites`"
              >
                💙
              </button>
            </template>
          </AuthenticatedContent>
        </div>
      </div>

      <div class="py-2" v-for="(item, index) in foundRecipe.items" :key="index">
        <component
          :is="recipeItemsDefault[item.itemType].singleRecipeComponent"
          :data="item.data"
        ></component>
      </div>
      <div class="mb-4">
        <div class="comments" v-if="comments.length">
          <div
            data-testid="singleComment"
            class="my-2"
            v-for="(comment, index) in comments"
            :key="index"
          >
            <SingleComment :comment="comment" />
          </div>
        </div>
        <div class="mt-4 text-center text-xl font-semibold" v-else>No comments yet!</div>
      </div>
      <div>
        <AuthenticatedContent>
          <template #authContent>
            <form @submit.prevent>
              <div class="mb-4">
                <label
                  for="comment"
                  class="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                  >Share your thoughts!</label
                >
                <textarea
                  data-testid="commentArea"
                  id="comment"
                  rows="4"
                  class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Add your comment here!"
                  :required="true"
                  v-model="commentText"
                />
              </div>
              <div class="flex justify-center">
                <FormButton
                  :button-text="'Post'"
                  :loading="loading"
                  :successMessage="''"
                  @click="submitComment"
                />
              </div>
            </form>
          </template>
          <template #default>
            <div data-testid="unableToComment" class="mt-4 text-center text-xl font-semibold">
              Login to leave a comment
            </div>
          </template>
        </AuthenticatedContent>
      </div>
    </div>
    <div class="mt-4 self-center text-center text-2xl font-semibold" v-else>No recipe found</div>
  </div>
</template>

<style scoped></style>
