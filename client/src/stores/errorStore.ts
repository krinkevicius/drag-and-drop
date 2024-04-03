import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useErrorStore = defineStore('errorStore', () => {
  const globalErrorMessage = ref<string>('')

  const isError = computed(() => (globalErrorMessage.value.length ? true : false))

  const resetError = () => {
    globalErrorMessage.value = ''
  }

  return { globalErrorMessage, isError, resetError }
})
