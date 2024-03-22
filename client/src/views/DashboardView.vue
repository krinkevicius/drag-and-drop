<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import { ref, onBeforeMount } from 'vue'
import { RecipeItems } from '@/consts'
import SidebarButton from '@/components/dashboard/SidebarButton.vue'
import RecipeIcon from '@/components/RecipeIcon.vue'

const router = useRouter()

onBeforeMount(() => {
  if (router.currentRoute.value.name === 'CreateRecipe') {
    router.push({ name: 'NewRecipe' })
  }
})

const icons = ref<(keyof typeof RecipeItems)[]>(['image', 'description', 'list', 'categories'])
</script>

<template>
  <div class="dashboard">
    <div class="sidebar" data-testid="dashboardSidebar">
      This is sidebar
      <SidebarButton :name="'NewRecipe'" :label="'Create New Recipe'" />
      <Transition name="iconWrapperTransition">
        <div v-if="router.currentRoute.value.name === 'NewRecipe'">
          <div class="icon-wrapper" v-for="(icon, index) in icons" :key="index">
            <RecipeIcon :itemType="icon" />
          </div>
          <div class="dropdown-content">This is icons div</div>
        </div>
      </Transition>
      <SidebarButton :name="'AccessRights'" :label="'Access Rights'" />
    </div>
    <RouterView class="router" />
  </div>
</template>

<style scoped>
.dashboard {
  display: grid;
  grid-gap: 10px;
  grid-template-columns: 300px auto;
  grid-template-areas: 'sidebar router';
}

.sidebar {
  grid-area: sidebar;
  height: 100vh;
  border: 2px solid red;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.router {
  grid-area: router;
}

.iconWrapperTransition-enter-active,
.iconWrapperTransition-leave-active {
  transition: height opacity 0.75s ease;
}

.iconWrapperTransition-enter-from,
.iconWrapperTransition-leave-to {
  height: 0;
  opacity: 0;
}

.icon-wrapper {
  padding: 20px;
}
</style>
