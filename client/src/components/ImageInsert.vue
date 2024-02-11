<script setup lang="ts">
import { ref } from 'vue'
import { useCreateRecipeStore } from '../stores/createRecipe'

const store = useCreateRecipeStore()

const props = defineProps({
  id: { type: String, required: true },
})
const item = store.recipeItems.find((item) => item.id === props.id)

const imageInput = ref<HTMLInputElement | null>(null)
const image = ref<File | null>(null)
const imageUrl = ref<string | null>(null)

function addImage() {
  image.value =
    imageInput.value && imageInput.value.files?.length ? imageInput.value.files[0] : null

  imageUrl.value = image.value ? URL.createObjectURL(image.value) : null

  item!.data.image = image.value
  item!.data.imageName = image.value ? image.value.name : ''
}
</script>

<template>
  <div class="image-insert">
    This is an image
    <div v-if="image">
      Image is added!
      <img :src="imageUrl!" />
    </div>
    <input type="file" @change="addImage" ref="imageInput" accept="image/*" />
  </div>
</template>

<style scoped>
.image-insert {
  min-width: 20px;
  min-height: 20px;
  text-align: center;
  border: 3px solid red;
}
</style>
