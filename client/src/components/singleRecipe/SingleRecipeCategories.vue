<script setup lang="ts">
import type { CategoryItem } from '@mono/server/src/shared/entities'
import capitalizeFirstLetter from '@/composables/useCapitalizeFirstLetter'
import type { PropType } from 'vue'

const props = defineProps({
  data: { type: Object as any as PropType<CategoryItem['data']>, required: true },
})

const categories = props.data.categories
  .map((category) => {
    return capitalizeFirstLetter(category)
  })
  .join(', ')
</script>

<template>Categories: {{ categories }}</template>
