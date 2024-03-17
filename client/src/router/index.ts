import { createRouter, createWebHistory } from 'vue-router'
import CreateRecipeView from '@/views/CreateRecipeView.vue'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: HomeView,
    },
    {
      path: '/dashboard',
      name: 'CreateRecipe',
      component: CreateRecipeView,
    },
  ],
})

export default router
