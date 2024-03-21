import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { fakeUser } from '@server/entities/tests/fakes'
import { User, UserRoles } from '@server/entities/user'
import userRouter from '..'

const db = await createTestDatabase()
const authUser = fakeUser({ role: UserRoles.Admin })

const { findAll } = createCallerFactory(userRouter)({ db, authUser })

it('should return empty array if there are no users in db', async () => {
  const allUsers = await findAll()

  expect(allUsers).toEqual([])
})

it('should return all users', async () => {
  const [user1, user2] = await db
    .getRepository(User)
    .save([fakeUser(), fakeUser({ role: UserRoles.Admin })])

  const allUsers = await findAll()

  expect(allUsers).toHaveLength(2)
  expect(allUsers[0]).toEqual({
    id: expect.any(Number),
    username: user1.username,
    role: 'registeredUser',
    // Checking that email and password were not returned
    email: undefined,
    password: undefined,
  })
  expect(allUsers[1]).toEqual({
    id: expect.any(Number),
    username: user2.username,
    role: 'admin',
    // Checking that email and password were not returned
    email: undefined,
    password: undefined,
  })
})
