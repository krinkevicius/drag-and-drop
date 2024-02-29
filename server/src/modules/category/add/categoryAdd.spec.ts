import { fakeCategory, fakeRecipe } from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { Category, Recipe } from '@server/entities'

import addCategory from '.'

const db = await createTestDatabase()

const testRecipe = fakeRecipe()

await db.getRepository(Recipe).save(testRecipe)
const testCategory = await db.getRepository(Category).save(fakeCategory())

it('should add a pre-existing category to a recipe', async () => {
  await addCategory({ recipeId: testRecipe.id, names: [testCategory.name] }, db)

  const recipeWithCategories = await db.getRepository(Recipe).findOneOrFail({
    where: { id: testRecipe.id },
    relations: { categories: true },
  })

  expect(recipeWithCategories.categories).toHaveLength(1)
  expect(recipeWithCategories.categories[0]).toEqual(testCategory)
})

it('should add category to database if it did not exist already', async () => {
  const categoryNotInDb = fakeCategory()

  await addCategory(
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

  await addCategory(
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
    addCategory({ recipeId: testRecipe.id, names: [testCategory.name] }, db)
  ).rejects.toThrow(/Recipe already has this category!/)
})

it('should throw error of category name is empty string', async () => {
  await expect(
    addCategory({ recipeId: testRecipe.id, names: [''] }, db)
  ).rejects.toThrow(/Category cannot be empty!/)
})
