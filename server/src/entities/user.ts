import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  // OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm'
import { validates } from '@server/utils/validation'
import { z } from 'zod'
import { Recipe } from './recipe'
// import { Comment } from './comment'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number

  @Unique('unique-email', ['email'])
  @Column('text')
  email: string

  @Unique('unique-username', ['username'])
  @Column('text')
  username: string

  @Column('text', { select: false })
  password: string

  @Column('text', { select: false })
  role: string

  @ManyToMany(() => Recipe)
  @JoinTable()
  favoriteRecipes: Recipe[]

  // @OneToMany(() => Comment, (comment) => comment.author, {
  //   cascade: ['insert', 'update'],
  // })
  // comments: Comment[]
}

export type UserBare = Omit<User, 'favoriteRecipes' | 'comments'>

export const userSchema = validates<UserBare>().with({
  id: z.number().int().positive(),
  email: z.string().trim().toLowerCase().email(),
  username: z
    .string()
    .min(5)
    .trim()
    .regex(/^[a-zA-Z0-9]+$/),
  password: z.string().min(8).max(64),
  role: z.union([z.literal('admin'), z.literal('registeredUser')]),
})

export const userInsertSchema = userSchema.omit({ id: true, role: true })

export type AuthUser = Pick<
  User,
  'id' | 'username' | 'role' | 'favoriteRecipes'
>

export enum UserRoles {
  Admin = 'admin',
  RegistererUser = 'registeredUser',
}

export const authUserSchema = validates<AuthUser>().with({
  id: z.number().int().positive(),
  username: z
    .string()
    .min(5)
    .trim()
    .regex(/^[a-zA-Z0-9]+$/),
  role: z.nativeEnum(UserRoles),
  // role: z.union([z.literal('admin'), z.literal('registeredUser')]),
  favoriteRecipes: z.array(z.any()),
})

export const adminUserSchema = validates<AuthUser>().with({
  id: z.number().int().positive(),
  username: z
    .string()
    .min(5)
    .trim()
    .regex(/^[a-zA-Z0-9]+$/),
  role: z.literal('admin'),
  favoriteRecipes: z.array(z.any()),
})
