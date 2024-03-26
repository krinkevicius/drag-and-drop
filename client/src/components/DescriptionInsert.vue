<script setup lang="ts">
import { useCreateRecipeStore } from '../stores/createRecipe'
import type { DescriptionItem } from '@mono/server/src/shared/entities'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const store = useCreateRecipeStore()

const props = defineProps({
  id: { type: String, required: true },
})

const item = store.recipeItems.find((item): item is DescriptionItem => item.id === props.id)

// Possible to add other toolbar options https://quilljs.com/docs/modules/toolbar/
const toolbarOptions = [
  ['bold', 'italic', 'underline'],

  [{ list: 'ordered' }],

  [{ header: [1, 2, 3, false] }],
]
</script>

<template>
  <div class="description-insert">
    <QuillEditor
      theme="snow"
      :toolbar="toolbarOptions"
      v-model:content="item!.data.descriptionText"
      contentType="html"
    />
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
