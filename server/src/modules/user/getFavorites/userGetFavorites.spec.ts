import { createCallerFactory } from '@server/trpc'
import { createTestDatabase, dropTestDatabase } from '@tests/utils/database'
import createTestRecipe from '@tests/utils/createTestRecipe'
import { User } from '@server/entities'
import { fakeUser } from '@server/entities/tests/fakes'
import userRouter from '..'

const db = await createTestDatabase()
const userRepo = db.getRepository(User)

afterAll(async () => {
  await dropTestDatabase(db)
})

const [testRecipe1, testRecipe2] = await Promise.all([
  await createTestRecipe(db),
  await createTestRecipe(db),
])

const [firstUser, secondUser] = await userRepo.save([fakeUser(), fakeUser()])

// Add some favorites for the first user
await db
  .createQueryBuilder()
  .relation(User, 'favoriteRecipes')
  .of(firstUser)
  .add([testRecipe1, testRecipe2])

it('should get user favorites', async () => {
  const { getFavorites } = createCallerFactory(userRouter)({
    db,
    authUser: firstUser,
  })
  const favorites = await getFavorites()
  expect(favorites).toHaveLength(2)
  expect(favorites[0]).toEqual({
    id: testRecipe1.id,
    name: testRecipe1.name,
    imageUrl: testRecipe1.images[0].imageUrl,
  })

  expect(favorites[1]).toEqual({
    id: testRecipe2.id,
    name: testRecipe2.name,
    imageUrl: testRecipe2.images[0].imageUrl,
  })
})

it('should return empty array if user has no favorites', async () => {
  const { getFavorites } = createCallerFactory(userRouter)({
    db,
    authUser: secondUser,
  })

  const favorites = await getFavorites()
  expect(favorites).toEqual([])
})
