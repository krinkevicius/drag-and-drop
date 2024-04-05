import { fakeCategory, fakeRecipe } from '@server/entities/tests/fakes'
import { createTestDatabase, dropTestDatabase } from '@tests/utils/database'
import { Category, Recipe } from '@server/entities'

import addCategories from '.'

const db = await createTestDatabase()

afterAll(async () => {
  await dropTestDatabase(db)
})

const testRecipe = await db.getRepository(Recipe).save(fakeRecipe())
const testCategory = await db.getRepository(Category).save(fakeCategory())

it('should add multiple categories', async () => {
  const newRecipe = await db.getRepository(Recipe).save(fakeRecipe())

  const [newCategory1, newCategory2] = [fakeCategory(), fakeCategory()]
  await addCategories(
    { recipeId: newRecipe.id, names: [newCategory1.name, newCategory2.name] },
    db
  )

  const recipeInDb = await db.getRepository(Recipe).findOneOrFail({
    where: { id: newRecipe.id },
    relations: { categories: true },
  })

  expect(recipeInDb.categories).toHaveLength(2)
})

it('should add a pre-existing category to a recipe', async () => {
  await addCategories(
    { recipeId: testRecipe.id, names: [testCategory.name] },
    db
  )

  const recipeWithCategories = await db.getRepository(Recipe).findOneOrFail({
    where: { id: testRecipe.id },
    relations: { categories: true },
  })

  expect(recipeWithCategories.categories).toHaveLength(1)
  expect(recipeWithCategories.categories[0]).toEqual(testCategory)
})

it('should add category to database if it did not exist already', async () => {
  const categoryNotInDb = fakeCategory()

  await addCategories(
    { recipeId: testRecipe.id, names: [categoryNotInDb.name] },
    db
  )

  // Check that the Category table has a new entry
  const foundCategory = await db
    .getRepository(Category)
    .findOneOrFail({ where: { name: categoryNotInDb.name } })

  expect(foundCategory).toEqual({
    id: expect.any(Number),
    name: categoryNotInDb.name,
  })
})

it('should store category in lowercase letters with whitespace trimmed', async () => {
  const newCategory = fakeCategory()

  await addCategories(
    {
      recipeId: testRecipe.id,
      names: [`\t   ${newCategory.name}   \t`],
    },
    db
  )

  const foundCategory = await db
    .getRepository(Category)
    .findOneOrFail({ where: { name: newCategory.name } })

  expect(foundCategory).toEqual({
    id: expect.any(Number),
    name: newCategory.name,
  })
})

it('should throw error if the same category is being added to a recipe', async () => {
  await expect(
    addCategories({ recipeId: testRecipe.id, names: [testCategory.name] }, db)
  ).rejects.toThrow(/Recipe already has this category!/)
})

it('should throw error of category name is empty string', async () => {
  await expect(
    addCategories({ recipeId: testRecipe.id, names: [''] }, db)
  ).rejects.toThrow(/Category cannot be empty!/)
})

it('should work with transactions', async () => {
  const newCategory = fakeCategory()

  await db.transaction(async (transactionalManager) => {
    await addCategories(
      { recipeId: testRecipe.id, names: [newCategory.name] },
      transactionalManager
    )
  })

  const foundCategory = await db
    .getRepository(Category)
    .findOneOrFail({ where: { name: newCategory.name } })

  expect(foundCategory).toEqual({
    id: expect.any(Number),
    name: newCategory.name,
  })
})
