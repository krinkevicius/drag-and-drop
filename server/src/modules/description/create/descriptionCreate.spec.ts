import { createTestDatabase } from '@tests/utils/database'
import {
  fakeDescription,
  fakeRecipe,
  fakeUser,
} from '@server/entities/tests/fakes'
import { Description, Recipe } from '@server/entities'
import descriptionRouter from '..'

const db = await createTestDatabase()
const authUser = fakeUser()
const testRecipe = await db.getRepository(Recipe).save(fakeRecipe())
const testDescription = fakeDescription({ recipeId: testRecipe.id })

const { create } = descriptionRouter.createCaller({ db, authUser })

it('should save description in the database', async () => {
  const newDescription = await create(testDescription)

  expect(newDescription).toEqual(testDescription)

  // Check in db:
  const descriptionInDb = await db
    .getRepository(Description)
    .findOneOrFail({ where: { id: newDescription.id } })

  expect(descriptionInDb).toEqual(newDescription)
})

it('should throw an error if user passes empty text', async () => {
  await expect(
    create(fakeDescription({ descriptionText: '', recipeId: testRecipe.id }))
  ).rejects.toThrow(/Cannot add a description with no text/)
})
