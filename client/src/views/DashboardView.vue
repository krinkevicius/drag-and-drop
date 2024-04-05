<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import { ref, onBeforeMount } from 'vue'
import { recipeItemsDefault } from '@/consts'
import SidebarButton from '@/components/dashboard/SidebarButton.vue'
import RecipeIcon from '@/components/dashboard/RecipeIcon.vue'

const router = useRouter()

onBeforeMount(() => {
  if (router.currentRoute.value.name === 'CreateRecipe') {
    router.push({ name: 'NewRecipe' })
  }
})

const icons = ref<(keyof typeof recipeItemsDefault)[]>([
  'image',
  'description',
  'ingredientList',
  'categories',
])
</script>

<template>
  <div class="dashboard flex w-full flex-col bg-main-blue text-xs md:mx-0 md:flex-row md:text-base">
    <div class="w-full md:mx-0 md:w-1/4">
      <div
        class="sidebar flex flex-row justify-around gap-y-2 bg-main-blue pb-1 text-xs text-white md:h-screen md:flex-col md:items-center md:justify-start md:px-2 md:text-base"
        data-testid="dashboardSidebar"
      >
        <div>
          <SidebarButton :name="'NewRecipe'" :label="'Create New Recipe'" />
          <Transition>
            <div
              class="hidden md:flex md:flex-col"
              v-if="router.currentRoute.value.name === 'NewRecipe'"
            >
              <div class="p-5" v-for="(icon, index) in icons" :key="index">
                <RecipeIcon :itemType="icon" />
              </div>
            </div>
          </Transition>
        </div>
        <div>
          <SidebarButton :name="'AccessRights'" :label="'Access Rights'" />
        </div>
      </div>
      <Transition>
        <div
          class="mx-8 flex flex-row md:hidden"
          v-if="router.currentRoute.value.name === 'NewRecipe'"
        >
          <div class="p-5" v-for="(icon, index) in icons" :key="index">
            <RecipeIcon :itemType="icon" />
          </div>
        </div>
      </Transition>
    </div>
    <div class="w-full bg-gray-100 px-8">
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: all 0.3s ease;
}

.v-enter-from,
.v-leave-to {
  height: 0;
  opacity: 0;
}

.icon-wrapper {
  padding: 20px;
}
</style>
