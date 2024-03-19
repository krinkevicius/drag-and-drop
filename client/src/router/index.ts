import { createRouter, createWebHistory } from 'vue-router'
import { authenticate, authenticateAdmin } from './guards'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/dashboard',
      name: 'CreateRecipe',
      component: () => import('../views/CreateRecipeView.vue'),
      beforeEnter: [authenticateAdmin],
    },
    {
      path: '/favorites',
      name: 'FavoriteRecipes',
      component: () => import('../views/FavoriteRecipes.vue'),
      beforeEnter: [authenticate],
    },
  ],
})

export default router
