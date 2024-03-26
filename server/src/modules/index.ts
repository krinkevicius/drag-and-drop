import { router } from '../trpc'
import user from './user'
import recipe from './recipe'
import image from './image'
import category from './category'
import ingredient from './ingredient'

export const appRouter = router({
  user,
  recipe,
  image,
  category,
  ingredient,
})

export type AppRouter = typeof appRouter
