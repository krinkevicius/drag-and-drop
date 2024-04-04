<script setup lang="ts">
defineProps({
  open: { type: Boolean, required: true },
  close: { type: Function, required: true },
  zIndex: { type: Number, default: 95 },
})
</script>

<template>
  <div
    class="fixed inset-0 flex items-center justify-center bg-[rgb(0_0_0_/_20%)]"
    :style="{ zIndex: zIndex }"
    v-if="open"
  >
    <div
      class="mb-4 max-w-xs rounded-xl border-4 border-secondary-blue bg-white pb-8 pt-0 shadow-md"
    >
      <div class="rounded-t-l flex justify-end self-stretch bg-main-blue p-2.5 text-white">
        <button class="hover:underline" title="Close popup" @click="close()">X</button>
      </div>
      <div class="px-8 py-4 text-center">
        <slot name="popupContent"></slot>
      </div>
    </div>
  </div>
</template>
