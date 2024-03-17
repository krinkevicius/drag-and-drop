import { router } from '@server/trpc'
import login from './login'
import signup from './signup'
import errors from './errors'

export default router({
  login,
  signup,
  errors,
})
