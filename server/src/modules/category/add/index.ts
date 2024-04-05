import { Category, Recipe } from '@server/entities'
import { categorySchema } from '@server/entities/category'
import { ExpectedTRPCError } from '@server/utils/expectedTRPCError'
import { DataSource, EntityManager } from 'typeorm'
import { z } from 'zod'

const inputSchema = z.object({
  recipeId: z.number().int().positive(),
  names: z.array(categorySchema.shape.name),
})

export default async function addCategories(
  dataForCategories: z.infer<typeof inputSchema>,
  dbOrManager: DataSource | EntityManager
) {
  const categoryRepo = dbOrManager.getRepository(Category)

  const { names, recipeId } = inputSchema.parse(dataForCategories)

  try {
    const categories: Category[] = await Promise.all(
      names.map(async (name) => {
        const category =
          (await categoryRepo.findOne({ where: { name } })) ||
          (await categoryRepo.save({ name }))
        return category
      })
    )

    await dbOrManager
      .createQueryBuilder()
      .relation(Recipe, 'categories')
      .of(recipeId)
      .add(categories)
  } catch (error) {
    if (!(error instanceof Error)) {
      throw error
    }
    if (error.message.match(/duplicate key/)) {
      throw new ExpectedTRPCError({
        code: 'BAD_REQUEST',
        message: 'Recipe already has this category!',
      })
    }
    throw error
  }
}
