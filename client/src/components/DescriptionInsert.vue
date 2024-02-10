<script setup lang="ts">
import { useCreateRecipeStore } from '../stores/createRecipe'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const store = useCreateRecipeStore()

const props = defineProps({
  id: { type: String, required: true },
})

const item = store.recipeItems.find((item) => item.id === props.id)
</script>

<template>
  <div class="description-insert">
    <QuillEditor theme="snow" v-model:content="item!.data.description" contentType="html" />
  </div>
</template>

<style scoped>
.description-insert {
  min-width: 20px;
  min-height: 20px;
  text-align: center;
  border: 3px solid blue;
}
</style>
