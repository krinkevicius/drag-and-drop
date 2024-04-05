<script lang="ts" setup>
import { ref, toRefs, computed, watch } from 'vue'
import { useUserStore } from '@/stores/users'
import type { UserLogin, UserSignup } from '@/stores/users'
import { useErrorStore } from '@/stores/errorStore'
import { withError } from '@/composables/useErrorHandling'
import { useRouter } from 'vue-router'
import AuthenticatedContent from '@/components/AuthenticatedContent.vue'
import AdminContent from '@/components/AdminContent.vue'
import Popup from '@/components/Popup.vue'
import FormButton from '@/components/FormButton.vue'

const router = useRouter()
const userStore = useUserStore()
const { globalErrorMessage } = toRefs(useErrorStore())

const loading = ref<boolean>(false)
const successMessage = ref<string>('')

const loginForm = ref<UserLogin>({
  email: '',
  password: '',
})

const signupForm = ref<UserSignup>({
  email: '',
  username: '',
  password: '',
})

const loginVisible = ref<boolean>(false)
const signupVisible = ref<boolean>(false)

const login = withError(async () => {
  loading.value = true
  await userStore.login(loginForm.value)
  loginForm.value.email = ''
  loginForm.value.password = ''
  loading.value = false
  loginVisible.value = false
}, globalErrorMessage)

const signup = withError(async () => {
  loading.value = true
  await userStore.signup(signupForm.value)
  signupForm.value.email = ''
  signupForm.value.username = ''
  signupForm.value.password = ''
  successMessage.value = 'Success! you can login now.'
  loading.value = false
}, globalErrorMessage)

watch(globalErrorMessage, () => {
  if (!globalErrorMessage.value) return
  loading.value = false
})

const popupOpen = computed(() => {
  if (globalErrorMessage.value) {
    return false
  }

  if (loginVisible.value || signupVisible.value) return true

  return false
})

function closePopup() {
  if (loading.value) return
  loginVisible.value = false
  signupVisible.value = false
  successMessage.value = ''
}

function switchToLogin() {
  successMessage.value = ''
  signupVisible.value = false
  loginVisible.value = true
}
</script>

<template>
  <Popup :open="popupOpen" :close="closePopup">
    <template #popupContent>
      <div class="w-full max-w-xs">
        <div v-if="loginVisible">
          <form data-testid="loginForm">
            <div class="mb-4">
              <label class="mb-2 block text-sm font-bold text-gray-700" for="login-email">
                Email
              </label>
              <input
                class="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                id="login-email"
                type="email"
                v-model="loginForm.email"
                placeholder="Email"
                :required="true"
              />
            </div>
            <div class="mb-4">
              <label class="mb-2 block text-sm font-bold text-gray-700" for="login-password">
                Password
              </label>
              <input
                class="focus:shadow-outline mb-3 w-full appearance-none rounded border border-red-500 px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                id="login-password"
                type="password"
                v-model="loginForm.password"
                placeholder="Password"
                :required="true"
              />
            </div>
            <div class="flex justify-center">
              <FormButton
                :button-text="'Login'"
                :loading="loading"
                :successMessage="successMessage"
                @click="login"
              />
            </div>
          </form>
        </div>
        <div v-if="signupVisible">
          <form data-testid="signupForm">
            <div class="mb-4">
              <label class="mb-2 block text-sm font-bold text-gray-700" for="signup-email">
                Email
              </label>
              <input
                class="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                id="submit-email"
                type="email"
                v-model="signupForm.email"
                placeholder="Email"
                :required="true"
              />
            </div>
            <div class="mb-4">
              <label class="mb-2 block text-sm font-bold text-gray-700" for="signup-username">
                Username
              </label>
              <input
                class="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                id="signup-username"
                type="text"
                v-model="signupForm.username"
                placeholder="Username"
                :required="true"
              />
            </div>
            <div class="mb-4">
              <label class="mb-2 block text-sm font-bold text-gray-700" for="signup-password">
                Password
              </label>
              <input
                class="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                id="signup-password"
                type="password"
                v-model="signupForm.password"
                placeholder="Password"
                :required="true"
              />
            </div>
            <div class="flex justify-center">
              <FormButton
                :button-text="'Signup'"
                :loading="loading"
                :successMessage="successMessage"
                @click="signup"
              >
                <template #onSuccess>
                  <div class="flex justify-center">
                    <button
                      class="focus:shadow-outline rounded bg-main-blue px-4 py-2 font-bold text-white hover:bg-secondary-blue focus:outline-none"
                      @click="switchToLogin"
                      type="button"
                    >
                      Go to Login
                    </button>
                  </div>
                </template>
              </FormButton>
            </div>
          </form>
        </div>
      </div>
    </template>
  </Popup>
  <div class="w-full bg-main-blue px-8 py-8 text-xs text-white md:text-base">
    <div class="container mx-auto">
      <div class="flex-none justify-between md:flex">
        <div class="mb-1 md:mb-0">
          <router-link to="/" class="hover:underline">Welcome to Blue Kitchen!</router-link>
        </div>
        <AuthenticatedContent>
          <template #authContent>
            <div class="flex space-x-1">
              <div>Hello, {{ userStore.username }}!</div>
              <AdminContent>
                <template #adminContent>
                  <div class="flex space-x-1">
                    <div>|</div>
                    <button
                      class="hover:underline"
                      @click="
                        () => {
                          router.push({ name: 'NewRecipe' })
                        }
                      "
                    >
                      Dashboard
                    </button>
                  </div>
                </template>
              </AdminContent>
              <div>|</div>
              <button
                class="hover:underline"
                @click="
                  () => {
                    router.push({ name: 'FavoriteRecipes' })
                  }
                "
              >
                My favorites
              </button>
              <div>|</div>
              <button class="hover:underline" @click="userStore.logout" data-testid="logoutButton">
                Log Out
              </button>
            </div>
          </template>
          <template #default>
            <button
              class="hover:underline"
              @click="
                () => {
                  loginVisible = true
                }
              "
            >
              Login
            </button>
            |
            <button
              class="hover:underline"
              @click="
                () => {
                  signupVisible = true
                }
              "
            >
              Sign Up
            </button>
          </template>
        </AuthenticatedContent>
      </div>
    </div>
  </div>
</template>
