import { Recipe, Image } from '@server/entities'
import type { RecipeForCard } from '@server/entities/recipe'
import { publicProcedure } from '@server/trpc'
import { pageSize } from '@server/config'
import { z } from 'zod'

const inputSchema = z.object({
  searchKey: z.string(),
  searchParams: z.union([
    z.literal('all'),
    z.literal('recipe'),
    z.literal('categories'),
    z.literal('ingredient'),
  ]),
  pageNo: z.number().int().min(1),
})

export default publicProcedure
  .input(inputSchema)
  .query(
    async ({ input: { searchKey, searchParams, pageNo }, ctx: { db } }) => {
      const query = db
        .getRepository(Recipe)
        .createQueryBuilder('recipe')
        .leftJoin('recipe.categories', 'categories')
        .leftJoin('recipe.ingredientLists', 'ingredientList')
        .leftJoin('ingredientList.quantities', 'quantities')
        .leftJoin('quantities.ingredient', 'ingredient')
        .select(['recipe.id AS id', 'recipe.name AS name'])
        .addSelect(
          (subQuery) =>
            subQuery
              .select('image.image_url', 'imageUrl')
              .from(Image, 'image')
              .where('image.recipeId = recipe.id')
              .limit(1),
          'imageUrl'
        )
        .distinct(true)
        .limit(pageSize)
        .offset(pageSize * (pageNo - 1))

      const searchIn =
        searchParams === 'all'
          ? query
              .where('recipe.name ilike :recipeName', {
                recipeName: `%${searchKey}%`,
              })
              .orWhere('categories.name ilike :categoryName', {
                categoryName: `%${searchKey}%`,
              })
              .orWhere('ingredient.name ilike :ingredientName', {
                ingredientName: `%${searchKey}%`,
              })
          : query.where(`${searchParams}.name ilike :name`, {
              name: `%${searchKey}%`,
            })

      const nextPage = (await searchIn.getCount()) > pageSize * pageNo
      const getRecipes = (await searchIn.getRawMany()) as RecipeForCard[]

      return { getRecipes, nextPage }
    }
  )
