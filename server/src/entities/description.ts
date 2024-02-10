import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm'
import { validates } from '@server/utils/validation'
import { z } from 'zod'
import { Recipe } from '.'

@Entity()
export class Description {
  // Using PrimaryColumn instead of PrimaryGeneratedColumn
  // as id will be passed from the FrontEnd
  @PrimaryColumn('text')
  id: string

  @Column('text')
  descriptionText: string

  @Column('integer')
  recipeId: number

  @ManyToOne(() => Recipe, (recipe) => recipe.descriptions)
  recipe: Recipe
}

export type DescriptionBare = Omit<Description, 'recipe'>

export const descriptionSchema = validates<DescriptionBare>().with({
  id: z.string().uuid(),
  descriptionText: z
    .string()
    .trim()
    .min(1, 'Cannot add a description with no text!'),
  recipeId: z.number().int().positive(),
})
