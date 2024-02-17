import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm'
import { validates } from '@server/utils/validation'
import { z } from 'zod'
import { Recipe } from '.'

@Entity()
export class Image {
  // Using PrimaryColumn instead of PrimaryGeneratedColumn
  // as id will be passed from the FrontEnd
  @PrimaryColumn('text')
  id: string

  @Column('text')
  imageUrl: string

  @Column('text')
  imageName: string

  @Column('integer')
  recipeId: number

  @ManyToOne(() => Recipe, (recipe) => recipe.images)
  recipe: Recipe
}

export type ImageBare = Omit<Image, 'recipe'>

export const imageSchema = validates<ImageBare>().with({
  id: z.string().uuid(),
  imageUrl: z.string(),
  imageName: z.string().trim(),
  recipeId: z.number().int().positive(),
})
