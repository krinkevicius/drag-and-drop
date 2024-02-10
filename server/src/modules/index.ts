import { router } from '../trpc'
import user from './user'
import recipe from './recipe'
import description from './description'

export const appRouter = router({
  user,
  recipe,
  description,
})

export type AppRouter = typeof appRouter
