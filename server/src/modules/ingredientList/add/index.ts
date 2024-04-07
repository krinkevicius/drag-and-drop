import { Ingredient, ingredientSchema } from '@server/entities/ingredient'
import {
  IngredientList,
  ingredientListSchema,
} from '@server/entities/ingredientList'
import { Quantity, quantitySchema } from '@server/entities/quantity'
import { DataSource, EntityManager } from 'typeorm'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

const inputSchema = z.object({
  recipeId: z.number().int().positive(),
  lists: z.array(
    ingredientListSchema.pick({ id: true }).extend({
      quantityIngredientPairs: z
        .array(
          quantitySchema
            .pick({ quantity: true })
            .merge(ingredientSchema.pick({ name: true }))
        )
        .min(1, 'Cannot add a list without quantities or ingredients!'),
    })
  ),
})

type InputType = z.infer<typeof inputSchema>

export default async function addIngredientLists(
  input: InputType,
  dbOrManager: DataSource | EntityManager
) {
  const { recipeId, lists } = inputSchema.parse(input)

  await Promise.all(
    lists.map(async (list) => {
      try {
        await dbOrManager
          .getRepository(IngredientList)
          .save({ id: list.id, recipeId })
      } catch (error) {
        if (!(error instanceof Error)) {
          throw error
        }
        if (error.message.match(/duplicate key/)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Ingredient list already exists',
          })
        }
        throw error
      }

      await Promise.all(
        list.quantityIngredientPairs.map(async (pair) => {
          /*
          The below fails test 'should allow to save multiple lists with same ingredient in each of them'
          It seems that map / async doesn't wait for findOne?
          const ingredient =
            (await dbOrManager
              .getRepository(Ingredient)
              .findOne({ where: { name: pair.name } })) ||
            (await dbOrManager
              .getRepository(Ingredient)
              .save({ name: pair.name }))
          */
          let ingredient
          try {
            ingredient = await dbOrManager
              .getRepository(Ingredient)
              .save({ name: pair.name })
          } catch (error) {
            ingredient = await dbOrManager
              .getRepository(Ingredient)
              .findOne({ where: { name: pair.name } })
          }

          await dbOrManager.getRepository(Quantity).save({
            quantity: pair.quantity,
            ingredientId: ingredient?.id,
            ingredientListId: list.id,
          })
        })
      )
    })
  )
}
