<script setup lang="ts">
import { ref, toRefs, watch } from 'vue'
import type { ImageItem } from '@mono/server/src/shared/entities'
import { useCreateRecipeStore } from '@/stores/createRecipe'
import { useErrorStore } from '@/stores/errorStore'
import { withError } from '@/composables/useErrorHandling/index'
import { trpc } from '@/trpc'

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
        <svg
          aria-hidden="true"
          class="h-6 w-6 animate-spin fill-main-blue text-gray-200 dark:text-gray-600"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="currentColor"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="currentFill"
          />
        </svg>
      </div>
      <div class="pt-4" v-else-if="imageUrl">
        <img class="max-h-64" :src="imageUrl!" :alt="imageName!" />
      </div>
    </div>
  </div>
</template>
