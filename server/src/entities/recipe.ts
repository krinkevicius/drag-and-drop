import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm'
import { validates } from '@server/utils/validation'
import { z } from 'zod'
import { Category, Description, Image } from '.'

@Entity()
export class Recipe {
  @PrimaryGeneratedColumn('increment')
  id: number

  @Unique(['name'])
  @Column('text')
  name: string

  @Column('text', { array: true })
  itemIds: string[]

  @OneToMany(() => Description, (description) => description.recipe)
  descriptions: Description[]

  @OneToMany(() => Image, (image) => image.recipe)
  images: Image[]

  @ManyToMany(() => Category, (category) => category.recipes)
  @JoinTable()
  categories: Category[]
}

export type RecipeBare = Omit<Recipe, 'descriptions' | 'images' | 'categories'>

export const recipeSchema = validates<RecipeBare>().with({
  id: z.number().int().positive(),
  name: z.string().trim().min(1).max(100),
  itemIds: z.array(z.string()).min(1, 'Cannot create a recipe without items'),
})

export const recipeInsertSchema = recipeSchema.omit({ id: true })
