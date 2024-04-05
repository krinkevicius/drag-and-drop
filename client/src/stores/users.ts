import {
  storeAccessToken,
  clearStoredAccessToken,
  getUserFromToken,
  getStoredAccessToken,
} from '@/utils/auth'
import { defineStore } from 'pinia'
import type { Ref } from 'vue'
import { ref, computed } from 'vue'
import { trpc } from '@/trpc'
import { useRouter } from 'vue-router'
import type { RecipeForCard, UserBare } from '@mono/server/src/shared/entities'

export type UserSignup = Pick<UserBare, 'email' | 'username' | 'password'>
export type UserLogin = Pick<UserBare, 'email' | 'password'>

export const useUserStore = defineStore('userStore', () => {
  const router = useRouter()
  const userFavorites: Ref<RecipeForCard[]> = ref([])
  const userToken = ref(getStoredAccessToken(localStorage))
  const isLoggedIn = computed(() => !!userToken.value)

  const userRole = computed(() => (userToken.value ? getUserFromToken(userToken.value).role : null))

  const username = computed(() =>
    userToken.value ? getUserFromToken(userToken.value).username : null
  )

  async function addRemoveFavorites(recipeId: number) {
    await trpc.user.addRemoveFavorites.mutate({ id: recipeId })
    userFavorites.value = await trpc.user.getFavorites.query()
  }

  async function login(loginDetails: UserLogin) {
    const { loginToken } = await trpc.user.login.mutate(loginDetails)

    userToken.value = loginToken
    storeAccessToken(localStorage, loginToken)

    //load favorite recipes:
    userFavorites.value = await trpc.user.getFavorites.query()

    // route admins to dashboard
    if (userRole.value === 'admin') {
      router.push({ name: 'NewRecipe' })
    }
  }

  async function signup(signupDetails: UserSignup) {
    await trpc.user.signup.mutate(signupDetails)
  }

  function logout() {
    userToken.value = null
    clearStoredAccessToken(localStorage)
    router.push({ name: 'Home' })
    // Remove favorites from the store:
    userFavorites.value = []
  }

  return {
    isLoggedIn,
    userFavorites,
    userRole,
    username,
    addRemoveFavorites,
    login,
    signup,
    logout,
  }
})
