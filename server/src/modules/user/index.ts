import { router } from '@server/trpc'
import login from './login'
import signup from './signup'
import findAll from './findAll'
import updateAccessRights from './updateAccessRights'
import errors from './errors'
import addRemoveFavorites from './addRemoveFavorites'
import getFavorites from './getFavorites'

export default router({
  login,
  signup,
  findAll,
  updateAccessRights,
  errors,
  addRemoveFavorites,
  getFavorites,
})
