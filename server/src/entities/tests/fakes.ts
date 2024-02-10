import { Chance } from 'chance'
import { User, Recipe, Description } from '..'
import { UserRoles } from '../user'

const chance = Chance()

export const fakeUser = <T extends Partial<User>>(overrides: T = {} as T) => ({
  id: chance.integer({ min: 1, max: 2147483647 }),
  email: chance.email(),
  username: chance.string({ alpha: true, numeric: true, length: 5 }),
  role: UserRoles.RegistererUser,
  password: chance.string({ length: 8 }),
  favoriteRecipes: [],
  ...overrides,
})

export const fakeRecipe = <T extends Partial<Recipe>>(
  overrides: T = {} as T
) => ({
  id: chance.integer({ min: 1, max: 2147483647 }),
  name: chance.word(),
  itemIds: Array.from({ length: 2 }, () => chance.guid({ version: 4 })),
  ...overrides,
})

export const fakeDescription = <T extends Partial<Description>>(
  overrides: T = {} as T
) => ({
  id: chance.guid({ version: 4 }),
  descriptionText: `<p>${chance.word()}</p>`,
  recipeId: chance.integer({ min: 1, max: 2147483647 }),
  ...overrides,
})
