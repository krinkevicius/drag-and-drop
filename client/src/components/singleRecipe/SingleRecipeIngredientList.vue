<script setup lang="ts">
import type { IngredientListItem } from '@mono/server/src/shared/entities'
import type { PropType } from 'vue'
import capitalizeFirstLetter from '@/composables/useCapitalizeFirstLetter'

defineProps({
  data: { type: Object as PropType<IngredientListItem['data']> as any, required: true },
})
</script>

<template>
  <table>
    <thead>
      <tr>
        <th class="pl-4 pr-2 text-right">Quantity</th>
        <th class="pl-2 pr-4 text-left">Name</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(pair, index) in data.quantityIngredientPairs" :key="index">
        <td class="pl-4 pr-2 text-right">{{ capitalizeFirstLetter(pair.quantity) }}</td>
        <td class="pl-2 pr-4 text-left">{{ capitalizeFirstLetter(pair.name) }}</td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped></style>
