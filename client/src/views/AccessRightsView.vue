<script setup lang="ts">
import { ref, onBeforeMount, computed } from 'vue'
import Popup from '@/components/Popup.vue'
import { trpc } from '@/trpc'
import type { User } from '@mono/server/src/shared/entities'
import { withError } from '@/composables/useErrorHandling'

const allUsers = ref<User[]>([])
const selectedUser = ref<User>()

onBeforeMount(async () => {
  allUsers.value = await trpc.user.findAll.query()
})

const confirmationMessage = ref<string>('')
const infoMessage = ref<string>('')
const errorMessage = ref<string>('')

const openPopup = computed(() => {
  if (confirmationMessage.value || infoMessage.value || errorMessage.value) return true
  return false
})

function closePopup() {
  confirmationMessage.value = ''
  infoMessage.value = ''
  errorMessage.value = ''
  selectedUser.value = undefined
}

function askForConfirmation(user: User) {
  selectedUser.value = user
  confirmationMessage.value = `Are you sure you want to update access right of user ${selectedUser.value.username}?`
}

const updateAccessRights = withError(async () => {
  confirmationMessage.value = ''
  infoMessage.value = 'Please wait...'
  // update the rights in BE
  await trpc.user.updateAccessRights.mutate({ id: 18 })
  // infoMessage.value = 'Success!'
}, errorMessage)

function test() {
  console.log(selectedUser.value)
}
</script>

<template>
  <div>
    <button @click="test">TEST</button>
    <div>This is a view for user access rights</div>
    <button @click="infoMessage = 'Success!'">Success</button>
    <button @click="errorMessage = 'Error!'">Error</button>
    <div v-for="user in allUsers" :key="user.id">
      {{ user.username }} {{ user.role }}
      <button @click="askForConfirmation(user)">Change Access</button>
    </div>
    <Popup :open="openPopup" :close="closePopup">
      <template #popupContent>
        <div v-if="confirmationMessage">
          {{ confirmationMessage }}
          <button @click="updateAccessRights">Yes</button> ||
          <button @click="closePopup">Cancel</button>
        </div>
        <div>{{ infoMessage }}</div>
        <div>{{ errorMessage }}</div>
      </template>
    </Popup>
  </div>
</template>

<style scoped></style>
