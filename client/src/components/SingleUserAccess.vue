<script setup lang="ts">
import { ref, computed, toRefs, watch } from 'vue'
import type { PropType } from 'vue'
import type { User } from '@mono/server/src/shared/entities'
import { trpc } from '@/trpc'
import { withError } from '@/composables/useErrorHandling'
import { useErrorStore } from '@/stores/errorStore'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

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
      <LoadingSpinner :size="6" />
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
