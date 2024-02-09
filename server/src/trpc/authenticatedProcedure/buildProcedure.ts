import type { Jwt, JwtPayload } from 'jsonwebtoken'
import { z } from 'zod'
import {
  authUserSchema,
  adminUserSchema,
  UserRoles,
} from '@server/entities/user'
import { TRPCError } from '@trpc/server'
import { publicProcedure } from '..'

type VerifyToken = (token: string) => Jwt | JwtPayload | string

const tokenSchema = z.object({
  user: authUserSchema,
})

const adminTokenSchema = z.object({
  user: adminUserSchema,
})

export function buildProcedure(userRole: UserRoles, verify: VerifyToken) {
  function getUserFromToken(token: string) {
    try {
      const tokenVerified = verify(token)
      const tokenParsed =
        userRole === UserRoles.Admin
          ? adminTokenSchema.parse(tokenVerified)
          : tokenSchema.parse(tokenVerified)

      return tokenParsed.user
    } catch (error) {
      return null
    }
  }
  return publicProcedure.use(({ ctx, next }) => {
    if (ctx.authUser) {
      // If we have an authenticated user, we can proceed.
      return next({
        ctx: {
          authUser: ctx.authUser,
        },
      })
    }

    // we depend on having an Express request object
    if (!ctx.req) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Missing Express request object',
      })
    }

    // if we do not have an authenticated user, we will try to authenticate
    const token = ctx.req.header('Authorization')?.replace('Bearer ', '')
    // if there is no token, we will throw an error
    if (!token) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Unauthenticated. Please log in.',
      })
    }

    const authUser = getUserFromToken(token)

    if (!authUser) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: `Invalid token.${
          userRole === UserRoles.Admin ? ' Please login with admin user!' : ''
        }`,
      })
    }

    return next({
      ctx: {
        authUser,
      },
    })
  })
}
