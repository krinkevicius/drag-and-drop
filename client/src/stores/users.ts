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
// import { useRouter } from 'vue-router'
import type { Recipe } from '@mono/server/src/shared/entities'
import type { UserBare } from '@mono/server/src/shared/entities'

export type UserSignup = Pick<UserBare, 'email' | 'username' | 'password'>
export type UserLogin = Pick<UserBare, 'email' | 'password'>

export const useUserStore = defineStore('userStore', () => {
  // const router = useRouter()
  const userFavorites: Ref<Recipe[]> = ref([])
  const userToken = ref(getStoredAccessToken(localStorage))
  const isLoggedIn = computed(() => !!userToken.value)

  const userRole = computed(() => (userToken.value ? getUserFromToken(userToken.value).role : null))

  /*async function addRemoveFavorites(recipe: Recipe) {
    const index = userFavorites.value.findIndex((r) => r.id === recipe.id)

    // Update the store array
    if (index !== -1) {
      userFavorites.value.splice(index, 1)
    } else {
      userFavorites.value.push(recipe)
    }

    // Update in database
    await trpc.user.addRemoveFavorites.mutate(recipe)
  }
  */

  async function login(loginDetails: UserLogin) {
    const { loginToken } = await trpc.user.login.mutate(loginDetails)

    userToken.value = loginToken
    storeAccessToken(localStorage, loginToken)

    // based on user role, route to dashboard / home page
    if (userRole.value === 'admin') {
      console.log('user is admin') // router.push({ name: 'AdminDashboard' })
    } else {
      console.log('user is regular')
      // router.push({ name: 'Home' })
    }

    //   //load favorite recipes:
    //   // userFavorites.value = await trpc.user.getFavorites.query()
    // } catch (error) {
    //   if (!(error instanceof Error)) {
    //     throw error
    //   }
    //   console.error(error.message)
    // }
  }

  async function signup(signupDetails: UserSignup) {
    await trpc.user.signup.mutate(signupDetails)
  }

  function logout() {
    userToken.value = null
    clearStoredAccessToken(localStorage)

    // Remove favorites from the store:
    //   userFavorites.value = []
  }

  return { isLoggedIn, userFavorites, userRole, /*addRemoveFavorites,*/ login, signup, logout }
})
