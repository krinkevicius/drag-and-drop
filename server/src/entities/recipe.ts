import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm'
import { validates } from '@server/utils/validation'
import { z } from 'zod'

@Entity()
export class Recipe {
  @PrimaryGeneratedColumn('increment')
  id: number

  @Unique(['name'])
  @Column('text')
  name: string

  @Column('text', { array: true })
  itemIds: string[]
}

export const recipeSchema = validates<Recipe>().with({
  id: z.number().int().positive(),
  name: z.string().trim().min(1).max(100),
  itemIds: z.array(z.string()).min(1, 'Cannot create a recipe without items'),
})

export const recipeInsertSchema = recipeSchema.omit({ id: true })
