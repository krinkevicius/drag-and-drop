import { User, UserRoles, userSchema } from '@server/entities/user'
import { adminProcedure } from '@server/trpc/authenticatedProcedure'
import { ExpectedTRPCError } from '@server/utils/expectedTRPCError'

const inputSchema = userSchema.pick({ id: true })

export default adminProcedure
  .input(inputSchema)
  .mutation(async ({ input: { id }, ctx: { db, authUser } }) => {
    if (authUser.id === id) {
      throw new ExpectedTRPCError({
        code: 'FORBIDDEN',
        message: 'You cannot change your own access rights!',
      })
    }
    const userToUpdate = await db.getRepository(User).findOne({ where: { id } })

    if (!userToUpdate) {
      throw new ExpectedTRPCError({
        code: 'BAD_REQUEST',
        message: `Cannot find user with ID ${id}!`,
      })
    }

    const newRole = Object.values(UserRoles).filter(
      (role) => role !== userToUpdate.role
    )[0]

    await db
      .createQueryBuilder()
      .update(User)
      .set({ role: newRole })
      .where({ id })
      .execute()

    return newRole
  })
