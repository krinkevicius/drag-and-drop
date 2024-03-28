import { validates } from '@server/utils/validation'
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm'
import { z } from 'zod'
import { Quantity } from '.'

@Entity()
export class Ingredient {
  @PrimaryGeneratedColumn('increment')
  id: number

  @Unique(['name'])
  @Column('text')
  name: string

  @OneToMany(() => Quantity, (quantity) => quantity.ingredient)
  quantities: Quantity[]
}

export type IngredientBare = Omit<Ingredient, 'quantities'>

export const ingredientSchema = validates<IngredientBare>().with({
  id: z.number().int().positive(),
  name: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Ingredient name cannot be empty!')
    .max(100, 'ingredient name is too long!'),
})

export const ingredientInsertSchema = ingredientSchema.omit({ id: true })
