<script setup lang="ts">
import Popup from '@/components/Popup.vue'
import HeaderComponent from '@/components/HeaderComponent.vue'
import { RouterView } from 'vue-router'
import { useErrorStore } from '@/stores/errorStore'

const errorStore = useErrorStore()
</script>

<template>
  <Popup :open="errorStore.isError" :close="errorStore.resetError" :zIndex="99">
    <template #popupContent>
      <div>ERROR!</div>
      <div>{{ errorStore.globalErrorMessage }}</div>
    </template>
  </Popup>
  <div>
    <HeaderComponent />
    <RouterView />
  </div>
</template>
