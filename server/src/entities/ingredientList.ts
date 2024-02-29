import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm'
import { validates } from '@server/utils/validation'
import { z } from 'zod'
import { Quantity, Recipe } from '.'

@Entity()
export class IngredientList {
  // Using PrimaryColumn instead of PrimaryGeneratedColumn
  // as id will be passed from the FrontEnd
  @PrimaryColumn('uuid')
  id: string

  @Column('integer')
  recipeId: number

  @ManyToOne(() => Recipe, (recipe) => recipe.ingredientLists)
  recipe: Recipe

  @OneToMany(() => Quantity, (quantity) => quantity.ingredientList)
  quantities: Quantity[]
}

export type IngredientListBare = Omit<IngredientList, 'recipe' | 'quantities'>

export const ingredientListSchema = validates<IngredientListBare>().with({
  id: z.string().uuid(),
  recipeId: z.number().int().positive(),
})
