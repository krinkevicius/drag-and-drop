<script setup lang="ts">
import { ref, computed, toRefs, watch } from 'vue'
import type { PropType } from 'vue'
import type { User } from '@mono/server/src/shared/entities'
import { trpc } from '@/trpc'
import { withError } from '@/composables/useErrorHandling'
import { useErrorStore } from '@/stores/errorStore'

const props = defineProps({
  user: { type: Object as PropType<User>, required: true },
})

const { globalErrorMessage } = toRefs(useErrorStore())
const loading = ref<boolean>(false)
const role = ref<string>(props.user.role)

watch(globalErrorMessage, () => {
  if (!globalErrorMessage.value) return
  loading.value = false
})

const checked = computed(() => {
  if (role.value === 'admin') return true
  return false
})

const updateRights = withError(async () => {
  if (loading.value === true) return

  loading.value = true
  role.value = await trpc.user.updateAccessRights.mutate({ id: props.user.id })
  loading.value = false
}, globalErrorMessage)
</script>

<template>
  <div
    class="border-1 flex flex-row justify-between rounded-xl border-2 border-main-blue px-2 py-1 shadow-md"
  >
    <div class="pt-1.5 md:pt-0.5">{{ props.user.username }}</div>
    <div class="pt-0.5" v-if="loading">
      <svg
        aria-hidden="true"
        class="h-6 w-6 animate-spin fill-main-blue text-gray-200 dark:text-gray-600"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
    </div>
    <div class="flex flex-row gap-x-1">
      <div class="pt-1.5 md:pt-0.5">Registered user</div>
      <div class="pt-0.5">
        <label class="inline-flex cursor-pointer items-center">
          <input
            @change.stop
            @click.prevent="updateRights"
            type="checkbox"
            v-model="checked"
            class="peer sr-only"
          />
          <div
            class="peer relative h-6 w-11 rounded-full bg-disabled-blue after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-main-blue peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rtl:peer-checked:after:-translate-x-full dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"
          ></div>
        </label>
      </div>
      <div class="pt-1.5 md:pt-0.5">Admin</div>
    </div>
  </div>
</template>
