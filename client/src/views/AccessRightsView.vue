<script setup lang="ts">
import { ref, onBeforeMount } from 'vue'
import SingleUserAccess from '@/components/SingleUserAccess.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { trpc } from '@/trpc'
import type { User } from '@mono/server/src/shared/entities'

const allUsers = ref<User[]>([])
const loading = ref<boolean>(false)

onBeforeMount(async () => {
  loading.value = true
  allUsers.value = await trpc.user.findAll.query()
  loading.value = false
})
</script>

<template>
  <div class="flex flex-col items-center">
    <div class="mt-4 text-center text-2xl font-semibold">
      You can update user access rights here
    </div>
    <div v-if="loading" class="pt-16">
      <LoadingSpinner :size="16" />
    </div>
    <div v-else-if="allUsers.length" class="w-full">
      <div v-for="user in allUsers" :key="user.id" class="py-4">
        <SingleUserAccess :user="user" />
      </div>
    </div>
    <div v-else class="mt-4 text-center text-2xl font-semibold">No users found!</div>
  </div>
</template>

<style scoped></style>
