// Each recipe will be constructed from separate sections AKA items,
// represented by various relations in the database.
// This file will include types that will be exposed to Front End.

import { z } from 'zod'
import { descriptionSchema } from './description'
import { categorySchema } from './category'
import { quantitySchema } from './quantity'
import { ingredientSchema } from './ingredient'

const baseItemSchema = z.object({
  id: z.string().uuid(),
})

export const descriptionItemSchema = baseItemSchema.extend({
  itemType: z.literal('description'),
  data: descriptionSchema.pick({ descriptionText: true }),
})

export const categoryItemSchema = baseItemSchema.extend({
  itemType: z.literal('categories'),
  data: z.object({
    categories: z.array(categorySchema.shape.name),
  }),
})

const ingredientListItemSchema = baseItemSchema.extend({
  itemType: z.literal('ingredientList'),
  data: z.object({
    quantityIngredientPairs: z.array(
      quantitySchema
        .pick({ quantity: true })
        .merge(ingredientSchema.pick({ name: true }))
    ),
  }),
})

export type DescriptionItem = z.infer<typeof descriptionItemSchema>
export type CategoryItem = z.infer<typeof categoryItemSchema>
export type IngredientItem = z.infer<typeof ingredientListItemSchema>
export type RecipeItem = DescriptionItem | CategoryItem | IngredientItem