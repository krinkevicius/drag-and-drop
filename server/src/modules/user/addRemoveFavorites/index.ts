import { Recipe, User } from '@server/entities'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import { ExpectedTRPCError } from '@server/utils/expectedTRPCError'
import { recipeSchema } from '@server/entities/recipe'

export default authenticatedProcedure
  .input(recipeSchema.pick({ id: true }))
  .mutation(async ({ input: { id }, ctx: { db, authUser } }) => {
    const [userInDb, recipeInDb] = await Promise.all([
      await db.getRepository(User).findOne({
        where: {
          id: authUser.id,
        },
        relations: {
          favoriteRecipes: true,
        },
      }),

      await db.getRepository(Recipe).findOne({
        where: { id },
      }),
    ])

    if (!userInDb) {
      throw new ExpectedTRPCError({
        code: 'BAD_REQUEST',
        message: 'User not found!',
      })
    }

    if (!recipeInDb) {
      throw new ExpectedTRPCError({
        code: 'BAD_REQUEST',
        message: 'Recipe not found!',
      })
    }

    const relationBuilder = db
      .createQueryBuilder()
      .relation(User, 'favoriteRecipes')
      .of(userInDb)

    const userFavorites = userInDb.favoriteRecipes
    const index = userFavorites.findIndex((r) => r.id === recipeInDb.id)

    if (index !== -1) {
      await relationBuilder.remove(recipeInDb)
    } else {
      await relationBuilder.add(recipeInDb)
    }
  })
