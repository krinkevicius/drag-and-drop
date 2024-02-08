import { initTRPC } from '@trpc/server'
import type { Request, Response } from 'express'
import { Database } from '@server/database'
import type { AuthUser } from '@server/entities/user'
import SuperJSON from 'superjson'

export type Context = {
  db: Database
  authUser?: AuthUser
  req?: Request
  res?: Response
}

export type ContextMinimal = Pick<Context, 'db'>

const t = initTRPC.context<Context>().create({
  transformer: SuperJSON,
})

export const { router } = t
export const publicProcedure = t.procedure
