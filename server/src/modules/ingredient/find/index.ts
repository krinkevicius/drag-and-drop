import { Ingredient } from '@server/entities'
import { adminProcedure } from '@server/trpc/authenticatedProcedure'
import { ILike } from 'typeorm'
import { z } from 'zod'

export default adminProcedure
  .input(z.string().trim())
  .query(async ({ input, ctx: { db } }) => {
    const foundIngredients = await db
      .getRepository(Ingredient)
      .findBy({ name: ILike(`%${input}%`) })
    return foundIngredients
  })
