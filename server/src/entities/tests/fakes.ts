import { Chance } from 'chance'
import { User, Recipe, Description, Image, Ingredient, Category } from '..'
import { UserRoles } from '../user'

const chance = Chance()

const randomInteger = chance.integer({ min: 1, max: 2147483647 })

export const fakeUser = <T extends Partial<User>>(overrides: T = {} as T) => ({
  id: randomInteger,
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
  id: randomInteger,
  name: chance.word(),
  itemIds: Array.from({ length: 2 }, () => chance.guid({ version: 4 })),
  ...overrides,
})

export const fakeRecipeInput = <T extends Partial<Recipe>>(
  overrides: T = {} as T
) => ({
  name: chance.word(),
  items: Array.from({ length: 2 }, () => ({
    id: chance.guid({ version: 4 }),
  })),
  ...overrides,
})

export const fakeDescription = <T extends Partial<Description>>(
  overrides: T = {} as T
) => ({
  id: chance.guid({ version: 4 }),
  descriptionText: `<p>${chance.word()}</p>`,
  recipeId: randomInteger,
  ...overrides,
})

export const fakeImage = <T extends Partial<Image>>(
  overrides: T = {} as T
) => ({
  id: chance.guid({ version: 4 }),
  imageName: chance.word(),
  recipeId: randomInteger,
  imageUrl: `amazonaws.com/${chance.guid({ version: 4 })}`,
  ...overrides,
})

export const fakeIngredient = <T extends Partial<Ingredient>>(
  overrides: T = {} as T
) => ({
  id: randomInteger,
  name: chance.word(),
  ...overrides,
})

export const fakeCategory = <T extends Partial<Category>>(
  overrides: T = {} as T
) => ({
  id: randomInteger,
  name: chance.word(),
  ...overrides,
})
