<script setup lang="ts">
defineProps<{
  open: boolean
  close: Function
}>()
</script>

<template>
  <div class="popup" v-if="open">
    <div class="inner-popup">
      <button @click="close()">Close Popup</button>
      <slot name="popupContent"></slot>
    </div>
  </div>
</template>

<style scoped>
.popup {
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  inset: 0;
  z-index: 99;
  background-color: rgb(0 0 0 / 20%);
}

.inner-popup {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
  padding: 32px;
  border: 5px solid black;
  border-radius: 30px;
  max-width: 90%;
  gap: 5px;
}
</style>
