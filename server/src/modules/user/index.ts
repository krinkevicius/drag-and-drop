import { router } from '@server/trpc'
import login from './login'
import signup from './signup'
import findAll from './findAll'
import errors from './errors'

export default router({
  login,
  signup,
  findAll,
  errors,
})
