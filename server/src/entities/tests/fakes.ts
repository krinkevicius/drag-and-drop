import { Chance } from 'chance'
import { User, Recipe } from '..'

const chance = Chance()

export const fakeUser = <T extends Partial<User>>(overrides: T = {} as T) => ({
  id: chance.integer({ min: 1, max: 2147483647 }),
  email: chance.email(),
  username: chance.string({ alpha: true, numeric: true, length: 5 }),
  role: 'registeredUser',
  password: chance.string({ length: 8 }),
  favoriteRecipes: [],
  ...overrides,
})

export const fakeRecipe = <T extends Partial<Recipe>>(
  overrides: T = {} as T
) => ({
  id: chance.integer({ min: 1, max: 2147483647 }),
  name: chance.word(),
  itemIds: Array.from({ length: 2 }, () =>
    chance.date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '')
  ),
  ...overrides,
})
