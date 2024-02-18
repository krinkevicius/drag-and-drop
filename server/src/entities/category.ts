import { validates } from '@server/utils/validation'
import {
  Column,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm'
import { z } from 'zod'
import { Recipe } from '.'

@Entity()
export class Category {
  @PrimaryGeneratedColumn('increment')
  id: number

  @Unique(['name'])
  @Column('text')
  name: string

  @ManyToMany(() => Recipe, (recipe) => recipe.categories)
  recipes: Recipe[]
}

export type CategoryBare = Omit<Category, 'recipes'>

export const categorySchema = validates<CategoryBare>().with({
  id: z.number().int().positive(),
  name: z.string().trim().toLowerCase().min(1).max(100),
})

export const categoryInsertSchema = categorySchema.omit({ id: true })
