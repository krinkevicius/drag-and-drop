import { Recipe, User } from '@server/entities'
import { fakeRecipe, fakeUser } from '@server/entities/tests/fakes'
import { createCallerFactory } from '@server/trpc'
import { createTestDatabase, dropTestDatabase } from '@tests/utils/database'
import { random } from '@tests/utils/random'
import userRouter from '..'

const db = await createTestDatabase()

afterAll(async () => {
  dropTestDatabase(db)
})

const testRecipe = await db.getRepository(Recipe).save(fakeRecipe())

const userRepo = db.getRepository(User)
const authUser = await userRepo.save(fakeUser())

it('should add a recipe to favorites', async () => {
  const { addRemoveFavorites } = createCallerFactory(userRouter)({
    db,
    authUser,
  })
  // Sanity check that user does not have favorites:

  const userinDb = await userRepo.findOneOrFail({
    where: { id: authUser.id },
    relations: {
      favoriteRecipes: true,
    },
  })

  expect(userinDb.favoriteRecipes).toEqual([])

  await addRemoveFavorites({ id: testRecipe.id })

  const updated = await userRepo.findOneOrFail({
    where: { id: authUser.id },
    relations: {
      favoriteRecipes: true,
    },
  })

  expect(updated.favoriteRecipes).toHaveLength(1)

  expect(updated.favoriteRecipes[0]).toEqual(testRecipe)
})

it('should remove recipe from favorites if it was already there', async () => {
  const { addRemoveFavorites } = createCallerFactory(userRouter)({
    db,
    authUser,
  })
  // sanity check that recipe from previous test is still in user favorites

  const userinDb = await userRepo.findOneOrFail({
    where: { id: authUser.id },
    relations: {
      favoriteRecipes: true,
    },
  })

  expect(userinDb.favoriteRecipes).toEqual([testRecipe])

  await addRemoveFavorites({ id: testRecipe.id })

  const updated = await userRepo.findOneOrFail({
    where: { id: authUser.id },
    relations: {
      favoriteRecipes: true,
    },
  })

  expect(updated.favoriteRecipes).toEqual([])
})

it('should throw error if recipe is not in db', async () => {
  const { addRemoveFavorites } = createCallerFactory(userRouter)({
    db,
    authUser,
  })
  await expect(
    addRemoveFavorites({
      id: random.natural({ min: 1, max: 2147483647, exclude: [testRecipe.id] }),
    })
  ).rejects.toThrow(/Recipe not found!/)
})

it('should throw error if user is not in db', async () => {
  const userNotInDb = fakeUser()
  const { addRemoveFavorites } = createCallerFactory(userRouter)({
    db,
    authUser: userNotInDb,
  })

  await expect(addRemoveFavorites({ id: testRecipe.id })).rejects.toThrow(
    /User not found!/
  )
})
