import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm'
import { Recipe } from '.'

@Entity()
export class Description {
  // Using PrimaryColumn instead of PrimaryGeneratedColumn
  // as id will be passed from the FrontEnd
  @PrimaryColumn('text')
  id: string

  @Column('text')
  description: string

  @Column('integer')
  recipeId: number

  @ManyToOne(() => Recipe, (recipe) => recipe.descriptions)
  recipe: Recipe
}
