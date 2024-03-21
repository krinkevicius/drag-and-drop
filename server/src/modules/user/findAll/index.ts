import { User } from '@server/entities'
import { adminProcedure } from '@server/trpc/authenticatedProcedure'

export default adminProcedure.query(async ({ ctx: { db } }) => {
  const allUsers = await db.getRepository(User).find({
    select: {
      id: true,
      username: true,
      role: true,
    },
  })
  return allUsers
})
