import { createTestDatabase } from '@tests/utils/database'
import { Recipe } from '@server/entities'
import { fakeUser, fakeRecipe } from '@server/entities/tests/fakes'
import recipeRouter from '..'

const db = await createTestDatabase()
const testRecipe = fakeRecipe()
const adminUser = fakeUser({ role: 'admin' })
const registeredUser = fakeUser()

it('should save a new recipe in the database', async () => {
  const { create } = recipeRouter.createCaller({ db, authUser: adminUser })
  const newRecipe = await create(testRecipe)

  expect(newRecipe).toEqual({ ...testRecipe, id: expect.any(Number) })

  const recipeInDB = await db
    .getRepository(Recipe)
    .findOneOrFail({ where: { id: newRecipe.id } })

  expect(recipeInDB).toEqual({
    ...testRecipe,
    id: newRecipe.id,
  })
})

it('should throw an error if non-admin user tries to create a recipe', async () => {
  const { create } = recipeRouter.createCaller({
    db,
    authUser: registeredUser,
  })

  await expect(create(fakeRecipe())).rejects.toThrow(
    /You do not have authorization to create a new recipe!/
  )
})

it('does not allow to add a recipe with the same name', async () => {
  const { create } = recipeRouter.createCaller({ db, authUser: adminUser })
  await expect(create(testRecipe)).rejects.toThrow(
    /Recipe with this name already exists/
  )
})
