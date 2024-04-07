<script setup lang="ts">
import type { ImageItem } from '@mono/server/src/shared/entities'
import type { PropType } from 'vue'

defineProps({
  data: { type: Object as any as PropType<ImageItem['data']>, required: true },
})
</script>

<template>
  <div class="flex justify-center">
    <img class="max-h-96" :src="data.imageUrl" :alt="data.imageName" />
  </div>
</template>

<style scoped></style>
