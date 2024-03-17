import { publicProcedure } from '@server/trpc'
import { z } from 'zod'
import { ExpectedTRPCError } from '@server/utils/expectedTRPCError'
import { logger } from '@server/logger'

const inputschema = z.string()

export default publicProcedure.input(inputschema).query(async ({ input }) => {
  logger.trace('error procedure has been called')
  if (input === 'ok') {
    throw new ExpectedTRPCError({
      message: 'This error was expected',
      code: 'BAD_REQUEST',
    })
  } else {
    throw new Error('something that was not caught before')
  }
})
