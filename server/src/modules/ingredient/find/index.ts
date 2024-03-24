import { Ingredient } from '@server/entities'
import { publicProcedure } from '@server/trpc'
import { ILike } from 'typeorm'
import { z } from 'zod'

export default publicProcedure
  .input(z.string().trim())
  .query(async ({ input, ctx: { db } }) => {
    const foundIngredients = await db
      .getRepository(Ingredient)
      .findBy({ name: ILike(`%${input}%`) })
    return foundIngredients
  })
