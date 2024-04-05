import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm'
import { validates } from '@server/utils/validation'
import { z } from 'zod'
import { Recipe } from './recipe'
import { User } from './user'

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('increment')
  id: number

  @Column('text')
  commentText: string

  @Column('text')
  userId: number

  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
  user: User

  @Column('integer')
  recipeId: number

  @ManyToOne(() => Recipe, (recipe) => recipe.comments, { onDelete: 'CASCADE' })
  recipe: Recipe

  @CreateDateColumn()
  createdAt: Date
}

export type CommentBare = Omit<Comment, 'recipe' | 'user'>

export type CommentWithAuthor = Pick<
  Comment,
  'id' | 'commentText' | 'createdAt'
> &
  Pick<User, 'username'>

export const commentSchema = validates<CommentBare>().with({
  id: z.number().int().positive(),
  commentText: z.string().trim().min(1, 'Cannot add a comment with no text!'),
  userId: z.number().int().positive(),
  recipeId: z.number().int().positive(),
  createdAt: z.date(),
})
