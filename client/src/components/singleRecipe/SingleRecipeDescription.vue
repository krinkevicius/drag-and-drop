<script setup lang="ts">
import type { DescriptionItem } from '@mono/server/src/shared/entities'
import type { PropType } from 'vue'

defineProps({
  data: { type: Object as any as PropType<DescriptionItem['data']>, required: true },
})
</script>

<template>
  <div
    class="content text-xs font-normal leading-relaxed md:text-base"
    v-html="data.descriptionText"
  ></div>
</template>

<style scoped>
/* Using deep selector to affect html elements inside v-html directive */
.content :deep(ol) {
  list-style-type: decimal;
  list-style-position: inside;
}

.content :deep(li) {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.content :deep(h3) {
  font-size: 1.17em;
}

.content :deep(h2) {
  font-size: 1.5em;
}

.content :deep(h1) {
  font-size: 2em;
}
</style>
