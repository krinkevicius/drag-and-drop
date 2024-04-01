import { User } from '@server/entities'
import { RecipeForCard } from '@server/entities/recipe'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'

export default authenticatedProcedure.query(
  async ({ ctx: { db, authUser } }) => {
    const userInDb = await db.getRepository(User).findOneOrFail({
      where: { id: authUser.id },
      relations: {
        favoriteRecipes: {
          images: true,
        },
      },
    })

    const favorites = userInDb!.favoriteRecipes.map((favorite) => ({
      id: favorite.id,
      name: favorite.name,
      imageUrl: favorite.images[0].imageUrl,
    })) as RecipeForCard[]

    return favorites
  }
)
