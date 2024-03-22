<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  name: { type: String, required: true },
  label: { type: String, required: true },
})
</script>

<template>
  <button
    :class="{ active: router.currentRoute.value.name === props.name }"
    @click="
      () => {
        router.push({ name: props.name })
      }
    "
  >
    {{ props.label }}
  </button>
</template>

<style scoped>
.active {
  border: 2px solid blue;
}
</style>
