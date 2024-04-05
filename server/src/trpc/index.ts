import { initTRPC } from '@trpc/server'
import type { Request, Response } from 'express'
import type { Database } from '@server/database'
import type { AuthUser } from '@server/entities/user'
import SuperJSON from 'superjson'
import * as Sentry from '@sentry/node'
import { ExpectedTRPCError } from '@server/utils/expectedTRPCError'
import { ZodError } from 'zod'

export type Context = {
  db: Database
  authUser?: AuthUser
  req?: Request
  res?: Response
}

export type ContextMinimal = Pick<Context, 'db'>

const t = initTRPC.context<Context>().create({
  transformer: SuperJSON,
  errorFormatter(opts) {
    const { error, shape } = opts
    // if Zod Error is about to be sent to Frontend, it means user provided incorrect input
    // Update the message before sending
    if (error.cause instanceof ZodError) {
      return {
        ...shape,
        code: 400,
        message: `Input error! ${error.cause.issues[0].message}`,
      }
    }
    // If message was not expected it will be logged to Sentry
    // User will receive a generic message
    if (!(error instanceof ExpectedTRPCError)) {
      Sentry.captureException(error)
      return {
        ...shape,
        code: 500,
        message: 'Something went wrong',
      }
    }
    return shape
  },
})

export const { router, createCallerFactory } = t
export const publicProcedure = t.procedure
