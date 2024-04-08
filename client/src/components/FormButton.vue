<script setup lang="ts">
import LoadingSpinner from '@/components/LoadingSpinner.vue'

defineProps<{
  loading: boolean
  successMessage: string
  buttonText: string
}>()
defineEmits(['click'])
</script>

<template>
  <div>
    <div v-if="loading">
      <LoadingSpinner :size="8" />
    </div>
    <div data-testid="successMessage" v-else-if="successMessage.length">
      {{ successMessage }}
      <div>
        <slot name="onSuccess"></slot>
      </div>
    </div>
    <div v-else>
      <button
        type="submit"
        class="focus:shadow-outline rounded bg-main-blue px-4 py-2 font-bold text-white hover:bg-secondary-blue focus:outline-none"
        @click="$emit('click')"
      >
        {{ buttonText }}
      </button>
    </div>
  </div>
</template>

<style scoped></style>
