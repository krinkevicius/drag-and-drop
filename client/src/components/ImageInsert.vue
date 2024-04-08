<script setup lang="ts">
import { ref, toRefs, watch } from 'vue'
import type { ImageItem } from '@mono/server/src/shared/entities'
import { useCreateRecipeStore } from '@/stores/createRecipe'
import { useErrorStore } from '@/stores/errorStore'
import { withError } from '@/composables/useErrorHandling/index'
import { trpc } from '@/trpc'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const store = useCreateRecipeStore()
const props = defineProps({
  id: { type: String, required: true },
})

const { globalErrorMessage } = toRefs(useErrorStore())
const item = store.recipeItems.find((item): item is ImageItem => item.id === props.id)

const loading = ref<boolean>(false)

watch(globalErrorMessage, () => {
  if (!globalErrorMessage.value) return
  loading.value = false
})

const imageInput = ref<HTMLInputElement | null>(null)
const image = ref<File | null>(null)
const imageUrl = ref<string | null>(item!.data.imageUrl || null)
const imageName = ref<string | null>(item!.data.imageName || null)

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
  if (loading.value) return

  loading.value = true

  image.value =
    imageInput.value && imageInput.value.files?.length ? imageInput.value.files[0] : null

  if (!image.value) return

  imageName.value = image.value.name
  const imageString = await convertToBase64(image.value)

  imageUrl.value = await trpc.image.upload.mutate({ imageString })

  loading.value = false

  item!.data.imageUrl = imageUrl.value
  item!.data.imageName = imageName.value
}, globalErrorMessage)
</script>

<template>
  <div class="pb-4 pt-2">
    <div class="px-4">
      <input
        class="block w-full cursor-pointer rounded-lg border border-main-blue bg-gray-50 text-sm text-xs text-gray-900 file:bg-pink-50 focus:outline-none md:text-base"
        type="file"
        @change="uploadImage"
        ref="imageInput"
        accept="image/*"
      />
    </div>
    <div class="flex justify-center">
      <div class="pt-4" v-if="loading">
        <LoadingSpinner :size="6" />
      </div>
      <div class="pt-4" v-else-if="imageUrl">
        <img class="max-h-64" :src="imageUrl!" :alt="imageName!" />
      </div>
    </div>
  </div>
</template>
