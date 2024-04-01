import { router } from '@server/trpc'
import create from './create'
import findOne from './findOne'
import findManyBy from './findManyBy'

export default router({
  create,
  findOne,
  findManyBy,
})
