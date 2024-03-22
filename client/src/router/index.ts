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
      component: () => import('../views/DashboardView.vue'),
      beforeEnter: [authenticateAdmin],
      children: [
        {
          path: 'access-rights',
          name: 'AccessRights',
          component: () => import('../views/AccessRightsView.vue'),
        },
        {
          path: 'new-recipe',
          name: 'NewRecipe',
          component: () => import('../views/NewRecipeView.vue'),
        },
      ],
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
