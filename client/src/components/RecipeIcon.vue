<script setup lang="ts">
import type { PropType } from 'vue'
import { RecipeItems } from '@/consts'

const props = defineProps({
  // NOT A TEST!!!!!
  itemType: { type: String as PropType<keyof typeof RecipeItems>, required: true },
})

const pathToIcon = `src/assets/${props.itemType}.svg`
</script>

<template>
  <div class="item-icon" draggable="true" :style="{ backgroundImage: `url(${pathToIcon})` }"></div>
</template>

<style scoped>
.item-icon {
  height: 50px;
  width: 50px;
  border: 1px solid black;
  background-position: center;
  background-repeat: no-repeat;
}
</style>
