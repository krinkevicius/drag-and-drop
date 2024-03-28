import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { validates } from '@server/utils/validation'
import { z } from 'zod'
import { Ingredient, IngredientList } from '.'

@Entity()
export class Quantity {
  @PrimaryGeneratedColumn('increment')
  id: number

  @Column('text')
  quantity: string

  @Column('integer')
  ingredientId: number

  @Column('uuid')
  ingredientListId: string

  @ManyToOne(() => Ingredient, (ingredient) => ingredient.quantities)
  ingredient: Ingredient

  @ManyToOne(
    () => IngredientList,
    (ingredientList) => ingredientList.quantities
  )
  ingredientList: IngredientList
}

type QuantityBare = Omit<Quantity, 'ingredient' | 'ingredientList'>

export const quantitySchema = validates<QuantityBare>().with({
  id: z.number().int().positive(),
  ingredientId: z.number().int().positive(),
  quantity: z
    .string()
    .trim()
    .min(1, 'Quantity cannot be empty!')
    .max(100, 'Quantity is too long!'),
  ingredientListId: z.string().uuid(),
})
