import { adminProcedure } from '@server/trpc/authenticatedProcedure'
import { Description, descriptionSchema } from '@server/entities/description'

export default adminProcedure
  .input(descriptionSchema)
  .mutation(async ({ input, ctx: { db } }) => {
    const newDescription = await db.getRepository(Description).save(input)
    return newDescription
  })
