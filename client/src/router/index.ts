import { createRouter, createWebHistory } from 'vue-router'
import CreateRecipeView from '../views/CreateRecipeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'CreateRecipe',
      component: CreateRecipeView,
    },
  ],
})

export default router
