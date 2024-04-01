import { random } from '@tests/utils/random'
import {
  User,
  Recipe,
  Description,
  Image,
  Ingredient,
  Category,
  IngredientList,
  Comment,
} from '..'
import { UserRoles } from '../user'

const randomInteger = random.integer({ min: 1, max: 2147483647 })

export const getRandomUUID = () => random.guid({ version: 4 })

export const fakeUser = <T extends Partial<User>>(overrides: T = {} as T) => ({
  id: randomInteger,
  email: random.email(),
  username: random.string({ alpha: true, numeric: true, length: 5 }),
  role: UserRoles.RegistererUser,
  password: random.string({ length: 8 }),
  favoriteRecipes: [],
  ...overrides,
})

export const fakeRecipe = <T extends Partial<Recipe>>(
  overrides: T = {} as T
) => ({
  id: randomInteger,
  name: random.word(),
  itemIds: Array.from({ length: 2 }, () => getRandomUUID()),
  ...overrides,
})

export const fakeDescription = <T extends Partial<Description>>(
  overrides: T = {} as T
) => ({
  id: getRandomUUID(),
  descriptionText: `<p>${random.word()}</p>`,
  recipeId: randomInteger,
  ...overrides,
})

export const fakeImage = <T extends Partial<Image>>(
  overrides: T = {} as T
) => ({
  id: getRandomUUID(),
  imageName: random.word(),
  recipeId: randomInteger,
  imageUrl: `amazonaws.com/${getRandomUUID()}`,
  ...overrides,
})

export const fakeIngredient = <T extends Partial<Ingredient>>(
  overrides: T = {} as T
) => ({
  id: randomInteger,
  name: random.word(),
  ...overrides,
})

export const fakeCategory = <T extends Partial<Category>>(
  overrides: T = {} as T
) => ({
  id: randomInteger,
  name: random.word(),
  ...overrides,
})

export const fakeIngredientList = <T extends Partial<IngredientList>>(
  overrides: T = {} as T
) => ({
  id: getRandomUUID(),
  recipeId: randomInteger,
  quantityIngredientPairs: Array.from({ length: 2 }, () => ({
    name: random.word(),
    quantity: random.word(),
  })),
  ...overrides,
})

export const fakeComment = <T extends Partial<Comment>>(
  overrides: T = {} as T
) => ({
  id: randomInteger,
  commentText: random.word(),
  recipeId: randomInteger,
  userId: randomInteger,
  ...overrides,
})
