import { createCallerFactory } from '@server/trpc'
import { createTestDatabase, dropTestDatabase } from '@tests/utils/database'
import createTestRecipe from '@tests/utils/createTestRecipe'
import recipeRouter from '..'

const db = await createTestDatabase()

afterAll(async () => {
  await dropTestDatabase(db)
})

const { findOne } = createCallerFactory(recipeRouter)({ db })

const testRecipe = await createTestRecipe(db, { withCategories: false })

it('returns null if id is not found', async () => {
  const result = await findOne({ id: testRecipe.id + 1 })

  expect(result).toBeNull()
})

it('should sort items based on order of itemsId array', async () => {
  const foundRecipe = await findOne({ id: testRecipe.id })

  expect(foundRecipe).not.toBeNull()
  expect(foundRecipe!.name).toEqual(testRecipe.name)
  expect(foundRecipe!.items[0].id).toEqual(testRecipe.itemIds[0])
  expect(foundRecipe!.items[1].id).toEqual(testRecipe.itemIds[1])
})

it('should not include categories, if recipe did not have any', async () => {
  const foundRecipe = await findOne({ id: testRecipe.id })

  expect(foundRecipe).not.toBeNull()

  const categories = foundRecipe!.items.find(
    (item) => item.itemType === 'categories'
  )
  expect(categories).toBeUndefined()
})

it('should place categories at the end of the array', async () => {
  const recipeWithCategories = await createTestRecipe(db)

  const foundRecipe = await findOne({ id: recipeWithCategories.id })

  expect(foundRecipe).not.toBeNull()

  const categoryIndex = foundRecipe!.items.findIndex(
    (item) => item.itemType === 'categories'
  )

  expect(categoryIndex).toEqual(foundRecipe!.items.length - 1)
})
