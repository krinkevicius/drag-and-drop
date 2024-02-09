import { adminProcedure } from '@server/trpc/authenticatedProcedure'
import { Recipe, recipeInsertSchema } from '@server/entities/recipe'
import { UserRoles } from '@server/entities/user'
import { TRPCError } from '@trpc/server'

export default adminProcedure
  .input(recipeInsertSchema)
  .mutation(async ({ input: dataForRecipe, ctx: { db, authUser } }) => {
    if (authUser.role !== UserRoles.Admin) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You do not have authorization to create a new recipe!',
      })
    }
    try {
      const newRecipe: Recipe = await db
        .getRepository(Recipe)
        .save(dataForRecipe)

      return newRecipe
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error
      }
      if (error.message.match(/duplicate key.*[\r\n]?.*name/)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Recipe with this name already exists',
        })
      }
      throw error
    }
  })
