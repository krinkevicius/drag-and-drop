<script setup lang="ts">
import { useUserStore } from '@/stores/users'

const userStore = useUserStore()
</script>

<template>
  <div class="AuthContentTestClass">
    <div v-if="userStore.isLoggedIn">
      <slot name="authContent"></slot>
    </div>
    <div v-else>
      <slot></slot>
    </div>
  </div>
</template>
