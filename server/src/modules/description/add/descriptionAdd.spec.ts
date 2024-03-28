import { createTestDatabase, dropTestDatabase } from '@tests/utils/database'
import {
  fakeDescription,
  fakeRecipe,
  getRandomUUID,
} from '@server/entities/tests/fakes'
import { Description, Recipe } from '@server/entities'
import addDescriptions from '.'

const db = await createTestDatabase()
const descriptionRepo = db.getRepository(Description)
const testRecipe = await db.getRepository(Recipe).save(fakeRecipe())

afterAll(async () => {
  await dropTestDatabase(db)
})

it('should add single description', async () => {
  const [newDescription] = await addDescriptions(
    [fakeDescription({ recipeId: testRecipe.id })],
    db
  )

  const descriptionInDb = await descriptionRepo.findOneOrFail({
    where: { id: newDescription.id },
  })

  expect(descriptionInDb).toEqual(newDescription)
})

it('should save multiple descriptions', async () => {
  const [firstDescription, secondDescription] = await addDescriptions(
    [
      fakeDescription({ recipeId: testRecipe.id }),
      fakeDescription({ recipeId: testRecipe.id }),
    ],
    db
  )

  const descriptions = await descriptionRepo.find({
    where: [{ id: firstDescription.id }, { id: secondDescription.id }],
  })

  expect(descriptions).toHaveLength(2)
  expect(descriptions[0]).toEqual(firstDescription)
  expect(descriptions[1]).toEqual(secondDescription)
})

it('should throw error if id is not uuid', async () => {
  await expect(
    addDescriptions(
      [
        fakeDescription({
          id: 'not uuid',
          recipeId: testRecipe.id,
        }),
      ],
      db
    )
  ).rejects.toThrow(/uuid/)
})

it('should not allow to save descriptions with same id', async () => {
  const uuid = getRandomUUID()
  await expect(
    addDescriptions(
      [
        fakeDescription({ id: uuid, recipeId: testRecipe.id }),
        fakeDescription({ id: uuid, recipeId: testRecipe.id }),
      ],
      db
    )
  ).rejects.toThrow(/duplicate key/)
})

it('should fail if descriptionText is empty string', async () => {
  await expect(
    addDescriptions(
      [fakeDescription({ descriptionText: '', recipeId: testRecipe.id })],
      db
    )
  ).rejects.toThrow(/Cannot add a description with no text!/)
})

it('should work with transactions', async () => {
  const newDescription = fakeDescription({ recipeId: testRecipe.id })
  await db.transaction(async (transactionalManager) => {
    await addDescriptions([newDescription], transactionalManager)
  })

  const descriptionInDb = await descriptionRepo.findOneOrFail({
    where: { id: newDescription.id },
  })

  expect(descriptionInDb).toEqual(newDescription)
})
