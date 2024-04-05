<script setup lang="ts">
import type { ImageItem } from '@mono/server/src/shared/entities'
import type { PropType } from 'vue'

defineProps({
  data: { type: Object as any as PropType<ImageItem['data']>, required: true },
})
</script>

<template>
  <div>
    <img :src="data.imageUrl" :alt="data.imageName" />
  </div>
</template>

<style scoped></style>
