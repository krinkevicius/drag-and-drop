import { Recipe } from '@server/entities'
import { recipeSchema } from '@server/entities/recipe'
import type { RecipeItem } from '@server/entities/recipeItems'
import { publicProcedure } from '@server/trpc'
import { v4 as uuidv4 } from 'uuid'

export default publicProcedure
  .input(recipeSchema.pick({ id: true }))
  .query(async ({ input: { id }, ctx: { db } }) => {
    const recipe = await db.getRepository(Recipe).findOne({
      where: { id },
      relations: {
        images: true,
        categories: true,
        ingredientLists: { quantities: { ingredient: true } },
        descriptions: true,
      },
    })

    if (!recipe) {
      return null
    }

    const ingredientListItems: RecipeItem[] = recipe.ingredientLists.map(
      (ingredientList) => {
        const quantityIngredientPairs = ingredientList.quantities.map(
          (quantity) => ({
            quantity: quantity.quantity,
            name: quantity.ingredient.name,
          })
        )

        return {
          id: ingredientList.id,
          itemType: 'ingredientList',
          data: {
            quantityIngredientPairs,
          },
        }
      }
    )

    const imageItems: RecipeItem[] = recipe.images.map((image) => ({
      id: image.id,
      itemType: 'image',
      data: { imageUrl: image.imageUrl, imageName: image.imageName },
    }))

    const descriptionItems: RecipeItem[] = recipe.descriptions.map(
      (description) => ({
        id: description.id,
        itemType: 'description',
        data: { descriptionText: description.descriptionText },
      })
    )

    const items: RecipeItem[] = ingredientListItems
      .concat(imageItems, descriptionItems)
      .filter((item) => recipe.itemIds.includes(item.id))
      .sort(
        (a, b) => recipe.itemIds.indexOf(a.id) - recipe.itemIds.indexOf(b.id)
      )

    // Add categories to the end of array, to show at the bottom of the recipe

    const categories: string[] = recipe.categories.map(
      (category) => category.name
    )

    if (categories.length) {
      items.push({ id: uuidv4(), itemType: 'categories', data: { categories } })
    }

    return {
      id,
      name: recipe.name,
      items,
    }
  })
