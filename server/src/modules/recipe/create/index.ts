import { adminProcedure } from '@server/trpc/authenticatedProcedure'
import { z } from 'zod'
import type { DescriptionBare } from '@server/entities/description'
import type {
  DescriptionItem,
  CategoryItem,
  IngredientListItem,
  ImageItem,
} from '@server/entities/recipeItems'
import {
  descriptionItemSchema,
  categoryItemSchema,
  ingredientListItemSchema,
  imageItemSchema,
} from '@server/entities/recipeItems'
import addCategories from '@server/modules/category/add'
import addDescriptions from '@server/modules/description/add'
import { ImageBare } from '@server/entities/image'
import addImages from '@server/modules/image/add'
import addIngredientLists from '@server/modules/ingredientList/add'
import createBareRecipe from '../createBare'

const inputSchema = z.object({
  name: z.string(),
  items: z
    .array(
      z.union([
        descriptionItemSchema,
        categoryItemSchema,
        ingredientListItemSchema,
        imageItemSchema,
      ])
    )
    .min(1, 'Cannot create a recipe without items'),
})

export default adminProcedure
  .input(inputSchema)
  .mutation(async ({ input: { name, items }, ctx: { db } }) => {
    // As recipe will be created from modular sections (items),
    // database needs to store the order of their representation.
    // Categories will not be included in this list as they will always be shown at the bottom
    // of the recipe
    const itemIds = items
      .filter((item) => item.itemType !== 'categories')
      .map((item) => item.id)

    const transaction = await db.transaction(async (transactionalManager) => {
      const newRecipe = await createBareRecipe(
        { name, itemIds },
        transactionalManager
      )

      // Split & transform passed-in items into objects used for recipe relations

      const categories = items
        .filter((item): item is CategoryItem => item.itemType === 'categories')
        .map((item) => (item.data as { categories: string[] }).categories)
        .reduce((acc, val) => acc.concat(val), [])

      const descriptions: DescriptionBare[] = items
        .filter(
          (item): item is DescriptionItem => item.itemType === 'description'
        )
        .map((item) => ({
          id: item.id,
          descriptionText: item.data.descriptionText,
          recipeId: newRecipe.id,
        }))

      const ingredientLists = items
        .filter(
          (item): item is IngredientListItem =>
            item.itemType === 'ingredientList'
        )
        .map((item) => ({
          id: item.id,
          quantityIngredientPairs: item.data.quantityIngredientPairs,
        }))

      const images: ImageBare[] = items
        .filter((item): item is ImageItem => item.itemType === 'image')
        .map((item) => ({
          id: item.id,
          imageUrl: item.data.imageUrl,
          imageName: item.data.imageName,
          recipeId: newRecipe.id,
        }))

      await Promise.all([
        await addCategories(
          { names: categories, recipeId: newRecipe.id },
          transactionalManager
        ),

        await addDescriptions(descriptions, transactionalManager),

        await addImages(images, transactionalManager),

        await addIngredientLists(
          { recipeId: newRecipe.id, lists: ingredientLists },
          transactionalManager
        ),
      ])
      return newRecipe
    })

    return transaction
  })
