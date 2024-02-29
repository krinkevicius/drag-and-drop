import { createTestDatabase } from '@tests/utils/database'
import { fakeDescription, fakeRecipe } from '@server/entities/tests/fakes'
import { Description, Recipe } from '@server/entities'
import createDescription from '.'

const db = await createTestDatabase()
const testRecipe = await db.getRepository(Recipe).save(fakeRecipe())
const testDescription = fakeDescription({ recipeId: testRecipe.id })

it('should save description in the database', async () => {
  const newDescription = await createDescription(testDescription, db)

  expect(newDescription).toEqual(testDescription)

  // Check in db:
  const descriptionInDb = await db
    .getRepository(Description)
    .findOneOrFail({ where: { id: newDescription.id } })

  expect(descriptionInDb).toEqual(newDescription)
})

it('should throw an error if user passes empty text', async () => {
  await expect(
    createDescription(
      fakeDescription({ descriptionText: '', recipeId: testRecipe.id }),
      db
    )
  ).rejects.toThrow(/Cannot add a description with no text/)
})
