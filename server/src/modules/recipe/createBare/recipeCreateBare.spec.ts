import { createTestDatabase } from '@tests/utils/database'
import { Recipe } from '@server/entities'
import { fakeRecipe } from '@server/entities/tests/fakes'
import createBareRecipe from '.'

const db = await createTestDatabase()
const testRecipe = fakeRecipe()

it('should save a new recipe in the database', async () => {
  const newRecipe = await createBareRecipe(testRecipe, db)

  expect(newRecipe).toEqual({ ...testRecipe, id: expect.any(Number) })

  const recipeInDB = await db
    .getRepository(Recipe)
    .findOneOrFail({ where: { id: newRecipe.id } })

  expect(recipeInDB).toEqual({
    ...testRecipe,
    id: newRecipe.id,
  })
})

it.skip('does not allow to add a recipe with the same name', async () => {
  await expect(createBareRecipe(testRecipe, db)).rejects.toThrow(
    /Recipe with this name already exists/
  )
})

it('does not allow to add a recipe without items', async () => {
  await expect(
    createBareRecipe(fakeRecipe({ itemIds: [] }), db)
  ).rejects.toThrow(/Cannot create a recipe without items/)
})
