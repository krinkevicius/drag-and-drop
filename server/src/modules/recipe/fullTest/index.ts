import { adminProcedure } from '@server/trpc/authenticatedProcedure'
import { z } from 'zod'
import addCategory from '@server/modules/category/add'
import createDescription from '@server/modules/description/create'
import { descriptionSchema } from '@server/entities/description'
import { categorySchema } from '@server/entities/category'
import createBareRecipe from '../createBare'

const baseItemSchema = z.object({
  id: z.string().uuid(),
})

const descriptionItemSchema = baseItemSchema.extend({
  itemType: z.literal('description'),
  data: descriptionSchema.pick({ descriptionText: true }),
})

const categoryItemSchema = baseItemSchema.extend({
  itemType: z.literal('category'),
  data: z.object({
    categories: z.array(categorySchema.shape.name),
  }),
})

const inputSchema = z.object({
  name: z.string(),
  items: z
    .array(z.union([descriptionItemSchema, categoryItemSchema]))
    .min(1, 'Cannot create a recipe without items'),
})

export default adminProcedure
  .input(inputSchema)
  .mutation(async ({ input: { name, items }, ctx: { db } }) => {
    const itemIds = items.map((item) => item.id)
    const descriptionItems = items.filter(
      (item) => item.itemType === 'description'
    )
    const categories = items
      .filter((item) => item.itemType === 'category')
      .map((item) => (item.data as { categories: string[] }).categories)
      .reduce((acc, val) => acc.concat(val), [])

    const transaction = await db.transaction(async (transactionalManager) => {
      const newRecipe = await createBareRecipe(
        { name, itemIds },
        transactionalManager
      )

      await addCategory(
        { names: categories, recipeId: newRecipe.id },
        transactionalManager
      )

      descriptionItems.forEach(async (item) => {
        await createDescription(
          {
            id: item.id,
            descriptionText: (item.data as { descriptionText: string })
              .descriptionText,
            recipeId: newRecipe.id,
          },
          transactionalManager
        )
        // await transactionalManager.getRepository(Description).save({
        //   id: item.id,
        //   ...item.data,
        //   recipeId: newRecipe.id,
        // })
      })

      return newRecipe
    })

    return transaction
  })

// const queryRunner = db.createQueryRunner()

// await queryRunner.connect()

// await queryRunner.startTransaction()
// try {
//   const newRecipe = await createBareRecipe(
//     { name, itemIds },
//     queryRunner.manager
//   )

//   await addCategory(categories, newRecipe.id, queryRunner.manager)

//   descriptionItems.forEach(async (item) => {
//     await queryRunner.manager.getRepository(Description).save({
//       id: item.id,
//       ...item.data,
//       recipeId: newRecipe.id,
//     })
//   })
//   await queryRunner.commitTransaction()
//   return newRecipe
// } catch (error) {
//   await queryRunner.rollbackTransaction()
//   throw error
// } finally {
//   await queryRunner.release()
// }

// const categoryRepo = transactionalManager.getRepository(Category)

// const cats = await Promise.all(
//   categories.map(async (category) => {
//     const newCategory =
//       (await categoryRepo.findOne({ where: { name: category } })) ||
//       (await categoryRepo.save({ name: category }))
//     return newCategory
//   })
// )

// await transactionalManager
//   .createQueryBuilder()
//   .relation(Recipe, 'categories')
//   .of(newRecipe.id)
//   .add(cats)

// return newRecipe
// } catch (error) {
//   if (!(error instanceof Error)) {
//     throw error
//   }
//   if (error.message.match(/duplicate key.*[\r\n]?.*name/)) {
//     throw new TRPCError({
//       code: 'BAD_REQUEST',
//       message: 'Recipe with this name already exists',
//     })
//   }
//   throw error
// }
// })

// return transaction
// })
