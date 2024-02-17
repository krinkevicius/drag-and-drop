import { validates } from '@server/utils/validation'
import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm'
import { z } from 'zod'

@Entity()
export class Ingredient {
  @PrimaryGeneratedColumn('increment')
  id: number

  @Unique(['name'])
  @Column('text')
  name: string
}

export const ingredientSchema = validates<Ingredient>().with({
  id: z.number().int().positive(),
  name: z.string().trim().toLowerCase().min(1).max(100),
})

export const ingredientInsertSchema = ingredientSchema.omit({ id: true })
