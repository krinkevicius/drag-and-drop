<script lang="ts" setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/users'
import type { UserLogin, UserSignup } from '@/stores/users'
import { withError } from '@/composables/useErrorHandling'

import { useRouter } from 'vue-router'
import AuthenticatedContent from '@/components/AuthenticatedContent.vue'
import AdminContent from '@/components/AdminContent.vue'

const router = useRouter()
const userStore = useUserStore()

// function routeToSignup() {
//   router.push({ name: 'SignUp' })
// }

// function routeToLogin() {
//   router.push({ name: 'Login' })
// }

const errorMessage = ref<string>('')

const loginForm = ref<UserLogin>({
  email: '',
  password: '',
})

const submitLogin = withError(async () => {
  await userStore.login(loginForm.value)

  togglePopup()
  if (userStore.userRole === 'admin') {
    router.push({ name: 'CreateRecipe' })
  }
}, errorMessage)

const signupSuccess = ref<boolean>(false)

const signupForm = ref<UserSignup>({
  email: '',
  username: '',
  password: '',
})

const submitSignup = withError(async () => {
  await userStore.signup(signupForm.value)
  signupSuccess.value = true
}, errorMessage)

const popup = ref<boolean>(false)
const loginVisible = ref<boolean>(false)
const signupVisible = ref<boolean>(false)

function togglePopup(open?: boolean) {
  errorMessage.value = ''
  popup.value = !popup.value
  if (open === undefined) {
    loginVisible.value = false
    signupVisible.value = false
  }
}
</script>

<template>
  <div>Welcome to Blue Kitchen!</div>
  <AuthenticatedContent>
    <template #authContent>
      <div>
        User is logged in
        <AdminContent>
          <template #adminContent>
            <button
              @click="
                () => {
                  router.push({ name: 'CreateRecipe' })
                }
              "
            >
              Dashboard
            </button>
          </template>
        </AdminContent>
        <button
          @click="
            () => {
              router.push({ name: 'FavoriteRecipes' })
            }
          "
        >
          My favorites
        </button>
        <button @click="userStore.logout" data-testid="logoutButton">Log Out</button>
      </div>
    </template>
    <template #default>
      <button
        @click="
          () => {
            loginVisible = true
            togglePopup(true)
          }
        "
      >
        Login
      </button>
      |
      <button
        @click="
          () => {
            signupVisible = true
            togglePopup(true)
          }
        "
      >
        Sign Up
      </button>
    </template>
  </AuthenticatedContent>
  <div class="popup" v-if="popup">
    <div class="inner-popup">
      <button @click="togglePopup()">Close popup</button>
      <div v-if="loginVisible">
        <form @submit.prevent="submitLogin">
          <input type="email" v-model="loginForm.email" placeholder="Email" :required="true" />
          <input
            type="password"
            v-model="loginForm.password"
            placeholder="Password"
            :required="true"
          />
          <button type="submit">Login</button>
        </form>
      </div>
      <div v-if="signupVisible">
        <form @submit.prevent="submitSignup">
          <input type="email" v-model="signupForm.email" placeholder="Email" :required="true" />
          <input
            type="text"
            v-model="signupForm.username"
            placeholder="Username"
            :required="true"
          />
          <input
            type="password"
            v-model="signupForm.password"
            placeholder="Password"
            :required="true"
          />
          <button type="submit">Signup</button>
        </form>
        <div v-if="signupSuccess">
          Success! You can login now.
          <button
            @click="
              () => {
                signupVisible = false
                signupSuccess = false
                loginVisible = true
              }
            "
          >
            Go to login
          </button>
        </div>
      </div>
      <div v-if="errorMessage">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.popup {
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  inset: 0;
  z-index: 99;
  background-color: rgb(0 0 0 / 20%);
}

.inner-popup {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
  padding: 32px;
  border: 5px solid black;
  border-radius: 30px;
  max-width: 90%;
  gap: 5px;
}
</style>
