import { config } from '@server/config'
import { publicProcedure } from '@server/trpc'
import { User, userSchema } from '@server/entities/user'
import { ExpectedTRPCError } from '@server/utils/expectedTRPCError'
import bcrypt from 'bcrypt'
import jsonwebtoken from 'jsonwebtoken'
import { prepareTokenPayload } from '../tokenPayload'

const { expiresIn, tokenKey } = config.auth

export default publicProcedure
  .input(
    userSchema.pick({
      email: true,
      password: true,
    })
  )
  .mutation(async ({ input: { email, password }, ctx: { db } }) => {
    const user = await db.getRepository(User).findOne({
      select: {
        id: true,
        username: true,
        role: true,
        password: true,
        favoriteRecipes: true,
      },
      where: {
        email,
      },
      relations: {
        favoriteRecipes: true,
      },
    })

    if (!user) {
      throw new ExpectedTRPCError({
        code: 'UNAUTHORIZED',
        message: 'User with this email could not be found!',
      })
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password)

    if (!isPasswordCorrect) {
      throw new ExpectedTRPCError({
        code: 'UNAUTHORIZED',
        message: 'Incorrect password! Please try again.',
      })
    }

    const payload = prepareTokenPayload(user)
    const loginToken = jsonwebtoken.sign(payload, tokenKey, {
      expiresIn,
    })

    return { loginToken }
  })
