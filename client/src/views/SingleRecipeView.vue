<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref, onBeforeMount, computed, toRefs } from 'vue'
import type { RecipeItem, CommentWithAuthor } from '@mono/server/src/shared/entities'
import { recipeItemsDefault } from '@/consts'
import { trpc } from '@/trpc'
import { useUserStore } from '@/stores/users'
import AuthenticatedContent from '@/components/AuthenticatedContent.vue'
import SingleComment from '@/components/singleRecipe/SingleComment.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
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
      <LoadingSpinner :size="16" />
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
