import { Recipe, recipeInsertSchema } from '@server/entities/recipe'
import { DataSource, EntityManager } from 'typeorm'
import { z } from 'zod'
import { ExpectedTRPCError } from '@server/utils/expectedTRPCError'

export default async function createBareRecipe(
  dataForRecipe: z.infer<typeof recipeInsertSchema>,
  dbOrManager: DataSource | EntityManager
) {
  const parsedData = recipeInsertSchema.parse(dataForRecipe)

  try {
    const newRecipe: Recipe = await dbOrManager
      .getRepository(Recipe)
      .save(parsedData)

    return newRecipe
  } catch (error) {
    if (!(error instanceof Error)) {
      throw error
    }
    if (error.message.match(/duplicate key.*[\r\n]?.*name/)) {
      throw new ExpectedTRPCError({
        code: 'BAD_REQUEST',
        message: 'Recipe with this name already exists!',
      })
    }
    throw error
  }
}
