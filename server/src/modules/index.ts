import { router } from '../trpc'
import user from './user'
import recipe from './recipe'

export const appRouter = router({
  user,
  recipe,
})

export type AppRouter = typeof appRouter
