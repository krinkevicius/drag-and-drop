import createTestRecipe from '@tests/utils/createTestRecipe'
import { createTestDatabase, dropTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { isInMemory } from '@server/config'
import recipeRouter from '..'

const db = await createTestDatabase()

afterAll(async () => {
  await dropTestDatabase(db)
})

const { findManyBy } = createCallerFactory(recipeRouter)({ db })

const testRecipeWithKnownName = await createTestRecipe(db, {
  recipeName: 'Vegan cookies',
})
const testRecipeWithKnownIngredient = await createTestRecipe(db, {
  recipeIngredient: 'vegan meat',
})
const testRecipeWithKnownCategory = await createTestRecipe(db, {
  recipeCategory: 'vegan',
})

it.skipIf(isInMemory)(
  'returns empty array if no recipes are found',
  async () => {
    const { getRecipes } = await findManyBy({
      searchKey: 'This is not in database',
      searchParams: 'all',
      pageNo: 1,
    })

    expect(getRecipes).toEqual([])
  }
)

it.skipIf(isInMemory)('finds recipes by all params', async () => {
  const firstPage = await findManyBy({
    searchKey: 'vegan',
    searchParams: 'all',
    pageNo: 1,
  })

  // As there's two recipes per page in test, first page will contain two recipes

  expect(firstPage.nextPage).toEqual(true)

  expect(firstPage.getRecipes).toHaveLength(2)

  expect(firstPage.getRecipes[0]).toEqual({
    id: expect.any(Number),
    name: testRecipeWithKnownName.name,
    imageUrl: testRecipeWithKnownName.images[0].imageUrl,
  })

  expect(firstPage.getRecipes[1]).toEqual({
    id: expect.any(Number),
    name: testRecipeWithKnownIngredient.name,
    imageUrl: testRecipeWithKnownIngredient.images[0].imageUrl,
  })

  // check second page

  const secondPage = await findManyBy({
    searchKey: 'vegan',
    searchParams: 'all',
    pageNo: 2,
  })

  expect(secondPage.nextPage).toEqual(false)

  expect(secondPage.getRecipes).toHaveLength(1)

  expect(secondPage.getRecipes[0]).toEqual({
    id: expect.any(Number),
    name: testRecipeWithKnownCategory.name,
    imageUrl: testRecipeWithKnownCategory.images[0].imageUrl,
  })
})

it.skipIf(isInMemory)('finds recipes by recipe name', async () => {
  const { getRecipes, nextPage } = await findManyBy({
    searchKey: 'vegan',
    searchParams: 'recipe',
    pageNo: 1,
  })

  expect(nextPage).toEqual(false)

  expect(getRecipes).toHaveLength(1)

  expect(getRecipes[0]).toEqual({
    id: expect.any(Number),
    name: testRecipeWithKnownName.name,
    imageUrl: testRecipeWithKnownName.images[0].imageUrl,
  })
})

it.skipIf(isInMemory)('finds recipes by category name', async () => {
  const { getRecipes, nextPage } = await findManyBy({
    searchKey: 'vegan',
    searchParams: 'categories',
    pageNo: 1,
  })

  expect(nextPage).toEqual(false)
  expect(getRecipes).toHaveLength(1)

  expect(getRecipes[0]).toEqual({
    id: expect.any(Number),
    name: testRecipeWithKnownCategory.name,
    imageUrl: testRecipeWithKnownCategory.images[0].imageUrl,
  })
})

it.skipIf(isInMemory)('finds recipes by ingredient name', async () => {
  const { getRecipes, nextPage } = await findManyBy({
    searchKey: 'vegan',
    searchParams: 'ingredient',
    pageNo: 1,
  })

  expect(nextPage).toEqual(false)
  expect(getRecipes).toHaveLength(1)

  expect(getRecipes[0]).toEqual({
    id: expect.any(Number),
    name: testRecipeWithKnownIngredient.name,
    imageUrl: testRecipeWithKnownIngredient.images[0].imageUrl,
  })
})

it.skipIf(isInMemory)(
  'returns true for next page if there are recipes left',
  async () => {
    const { nextPage } = await findManyBy({
      searchKey: '',
      searchParams: 'all',
      pageNo: 1,
    })

    expect(nextPage).toEqual(true)
  }
)

it.skipIf(isInMemory)(
  'returns false for next page if there are no recipes left',
  async () => {
    const { nextPage } = await findManyBy({
      searchKey: '',
      searchParams: 'all',
      pageNo: 2,
    })

    expect(nextPage).toEqual(false)
  }
)
