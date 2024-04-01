import { router } from '@server/trpc'
import add from './add'
import findAll from './findAll'

export default router({
  add,
  findAll,
})
