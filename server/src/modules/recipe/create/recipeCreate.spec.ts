import { createTestDatabase } from '@tests/utils/database'
import { Recipe } from '@server/entities'
import { fakeUser, fakeRecipe } from '@server/entities/tests/fakes'
import { UserRoles } from '@server/entities/user'
import { createCallerFactory } from '@server/trpc'
import recipeRouter from '..'

const db = await createTestDatabase()
const testRecipe = fakeRecipe()
const adminUser = fakeUser({ role: UserRoles.Admin })
const createCaller = createCallerFactory(recipeRouter)

it('should save a new recipe in the database', async () => {
  const { create } = createCaller({
    db,
    authUser: adminUser,
  })

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

it('does not allow to add a recipe with the same name', async () => {
  const { create } = createCaller({ db, authUser: adminUser })
  await expect(create(testRecipe)).rejects.toThrow(
    /Recipe with this name already exists/
  )
})

it('does not allow to add a recipe without items', async () => {
  const { create } = createCaller({ db, authUser: adminUser })
  await expect(create(fakeRecipe({ itemIds: [] }))).rejects.toThrow(
    /Cannot create a recipe without items/
  )
})
