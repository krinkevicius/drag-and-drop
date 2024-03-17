<script lang="ts" setup>
import { trpc } from '@/trpc'
import { TRPCClientError } from '@trpc/client'
import { ref } from 'vue'
// import * as Sentry from '@sentry/vue'

const textToBE = ref<string>('')
const errorMessage = ref<string>('')

async function sendToBE() {
  try {
    errorMessage.value = ''
    await trpc.user.errors.query(textToBE.value)
  } catch (error) {
    if (error instanceof TRPCClientError) {
      // if (error.shape.data.report) {
      //   Sentry.captureException(error)
      // }
      errorMessage.value = error.message // error.shape.data.report ? 'Something went wrong.' : error.message
    }
  }
}
</script>

<template>
  <div>
    <input label="Error" type="text" placeholder="enter text" v-model="textToBE" />
    <button @click="sendToBE">Send to Backend</button>
  </div>
  <div v-if="errorMessage">
    {{ errorMessage }}
  </div>
</template>
