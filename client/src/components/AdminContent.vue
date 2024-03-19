<script setup lang="ts">
import { useUserStore } from '@/stores/users'

const userStore = useUserStore()
</script>

<template>
  <div v-if="userStore.userRole === 'admin'">
    <slot name="adminContent"></slot>
  </div>
</template>

<style scoped></style>
