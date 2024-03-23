import { publicProcedure } from '@server/trpc'
import { User, userInsertSchema, UserRoles } from '@server/entities/user'
import bcrypt from 'bcrypt'
import { config } from '@server/config'
import { ExpectedTRPCError } from '@server/utils/expectedTRPCError'
import { z } from 'zod'

const inputSchema = userInsertSchema.extend({
  admin: z.boolean().optional().default(false),
})

export default publicProcedure
  .input(inputSchema)
  .mutation(
    async ({ input: { email, username, password, admin }, ctx: { db } }) => {
      const hashedPassword = await bcrypt.hash(
        password,
        config.auth.passwordCost
      )

      try {
        const newUser = await db.getRepository(User).save({
          email,
          username,
          password: hashedPassword,
          role: admin ? UserRoles.Admin : UserRoles.RegistererUser,
          favoriteRecipes: [],
        })
        return {
          id: newUser.id,
          username: newUser.username,
        }
      } catch (error) {
        if (!(error instanceof Error)) {
          throw error
        }
        if (error.message.match(/duplicate key.*[\r\n]?.*email/)) {
          throw new ExpectedTRPCError({
            code: 'BAD_REQUEST',
            message: 'User with this email already exists',
          })
        }
        if (error.message.match(/duplicate key.*[\r\n]?.*username/)) {
          throw new ExpectedTRPCError({
            code: 'BAD_REQUEST',
            message: 'User with this username already exists',
          })
        }
        throw error
      }
    }
  )
