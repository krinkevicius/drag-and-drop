import { publicProcedure } from '@server/trpc'
import { z } from 'zod'
import { ExpectedTRPCError } from '@server/utils/expectedTRPCError'

const inputschema = z.string()

export default publicProcedure.input(inputschema).query(async ({ input }) => {
  if (input === 'ok') {
    throw new ExpectedTRPCError({
      message: 'This error was expected',
      code: 'BAD_REQUEST',
    })
  } else {
    throw new Error('something that was not caught before')
  }
})
