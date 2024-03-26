<script setup lang="ts">
import { ref } from 'vue'
import type { ImageItem } from '@mono/server/src/shared/entities'
import { useCreateRecipeStore } from '@/stores/createRecipe'
import { withError } from '@/composables/useErrorHandling/index'
import { trpc } from '@/trpc'

const store = useCreateRecipeStore()
const props = defineProps({
  id: { type: String, required: true },
})
const item = store.recipeItems.find((item): item is ImageItem => item.id === props.id)

const errorMessage = ref<string>('')
const imageInput = ref<HTMLInputElement | null>(null)
const image = ref<File | null>(null)
const imageUrl = ref<string | null>(null)
const imageName = ref<string | null>(null)

async function convertToBase64(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Could not send image to server.'))
      }
    }
    reader.onerror = () => {
      reject(new Error('Could not send image to server.'))
    }
    reader.readAsDataURL(file)
  })
}

const uploadImage = withError(async () => {
  image.value =
    imageInput.value && imageInput.value.files?.length ? imageInput.value.files[0] : null

  if (!image.value) return

  imageName.value = image.value.name
  const imageString = await convertToBase64(image.value)

  imageUrl.value = await trpc.image.upload.mutate({ imageString })

  item!.data.imageUrl = imageUrl.value
  item!.data.imageName = imageName.value
}, errorMessage)
</script>

<template>
  <div class="image-insert">
    This is an image
    <div v-if="imageUrl">
      Image is added!
      <img :src="imageUrl!" :alt="imageName!" />
    </div>
    <input type="file" @change="uploadImage" ref="imageInput" accept="image/*" />
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
