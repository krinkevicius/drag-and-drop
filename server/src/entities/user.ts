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
import { Recipe, Comment } from '.'

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

  @Column('text')
  role: string

  @ManyToMany(() => Recipe)
  @JoinTable()
  favoriteRecipes: Recipe[]

  @OneToMany(() => Comment, (comment) => comment.userId, {
    cascade: ['insert', 'update'],
  })
  comments: Comment[]
}

export enum UserRoles {
  Admin = 'admin',
  RegistererUser = 'registeredUser',
}
export type UserBare = Omit<User, 'favoriteRecipes' | 'comments'>

export const userSchema = validates<UserBare>().with({
  id: z.number().int().positive(),
  email: z.string().trim().toLowerCase().email(),
  username: z
    .string()
    .min(5, 'Username is too short! (min 5)')
    .trim()
    .regex(
      /^[a-zA-Z0-9]+$/,
      'Username can only contain alphanumeric characters!'
    ),
  password: z
    .string()
    .min(8, 'Password too short! Your password should be at least 8 characters')
    .max(64, 'Password too long!'),
  role: z.union([
    z.literal(UserRoles.Admin),
    z.literal(UserRoles.RegistererUser),
  ]),
})

export const userInsertSchema = userSchema.omit({ id: true, role: true })

export type AuthUser = Pick<User, 'id' | 'username' | 'role'>

export const authUserSchema = validates<AuthUser>().with({
  id: z.number().int().positive(),
  username: z
    .string()
    .min(5)
    .trim()
    .regex(/^[a-zA-Z0-9]+$/),
  role: z.nativeEnum(UserRoles),
})

export const adminUserSchema = validates<AuthUser>().with({
  id: z.number().int().positive(),
  username: z
    .string()
    .min(5)
    .trim()
    .regex(/^[a-zA-Z0-9]+$/),
  role: z.literal('admin'),
})
