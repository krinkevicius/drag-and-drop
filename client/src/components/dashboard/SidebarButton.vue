<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  name: { type: String, required: true },
  label: { type: String, required: true },
})
</script>

<template>
  <div>
    <button
      class="p-2"
      :class="[
        router.currentRoute.value.name === props.name ? 'bg-secondary-blue' : 'hover:underline',
      ]"
      @click="
        () => {
          router.push({ name: props.name })
        }
      "
    >
      {{ props.label }}
    </button>
  </div>
</template>

<style scoped>
.active {
  border: 2px solid blue;
}
</style>
