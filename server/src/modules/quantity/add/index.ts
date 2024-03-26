import { Ingredient } from '@server/entities'
import { ingredientSchema } from '@server/entities/ingredient'
import { ingredientListSchema } from '@server/entities/ingredientList'
import { Quantity, quantitySchema } from '@server/entities/quantity'
import { DataSource, EntityManager } from 'typeorm'
import { z } from 'zod'

const inputSchema = z.object({
  ingredientListId: ingredientListSchema.shape.id,
  quantityIngredientPairs: z
    .array(
      z.object({
        quantity: quantitySchema.shape.quantity,
        name: ingredientSchema.shape.name,
      })
    )
    .min(1, 'Please provide quantity and ingredient!'),
})

type Schema = z.infer<typeof inputSchema>

export default async function addQuantity(
  input: Schema,
  dbOrManager: DataSource | EntityManager
) {
  const { ingredientListId, quantityIngredientPairs } = inputSchema.parse(input)

  const ingredientRepo = dbOrManager.getRepository(Ingredient)

  const quantities: Quantity[] = await Promise.all(
    quantityIngredientPairs.map(async (pair) => {
      const { quantity, name } = pair

      const ingredient =
        (await ingredientRepo.findOne({ where: { name } })) ||
        (await ingredientRepo.save({ name }))

      const storedQuantity = await dbOrManager.getRepository(Quantity).save({
        ingredientId: ingredient.id,
        quantity,
        ingredientListId,
      })
      return storedQuantity
    })
  )
  return quantities
}
