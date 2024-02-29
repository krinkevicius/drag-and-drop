import { Category } from '@server/entities'
import { adminProcedure } from '@server/trpc/authenticatedProcedure'
import { ILike } from 'typeorm'
import { z } from 'zod'

const categoryFind = z.string().trim().min(1)

export default adminProcedure
  .input(categoryFind)
  .query(async ({ input, ctx: { db } }) => {
    const foundCategories = await db
      .getRepository(Category)
      .findBy({ name: ILike(`%${input}%`) })
    return foundCategories
  })
