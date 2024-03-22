import { createTestDatabase, dropTestDatabase } from '@tests/utils/database'
import { User } from '@server/entities'
import { fakeUser } from '@server/entities/tests/fakes'
import bcrypt from 'bcrypt'
import config from '@server/config'
import { createCallerFactory } from '@server/trpc'
import userRouter from '..'

const db = await createTestDatabase()
const userRepository = db.getRepository(User)

const { login } = createCallerFactory(userRouter)({ db })

afterAll(async () => {
  await dropTestDatabase(db)
})

const registeredUser = fakeUser()

// Save user with hashed password
await userRepository.save({
  ...registeredUser,
  password: await bcrypt.hash(
    registeredUser.password,
    config.auth.passwordCost
  ),
})

it('returns a login token if correct credentials are provided', async () => {
  const { loginToken } = await login(registeredUser)

  expect(loginToken).toEqual(expect.any(String))
  expect(loginToken).toMatch(/^eyJ/)
})

it('throws an error if email is not found', async () => {
  await expect(
    login({
      ...registeredUser,
      email: 'different@email.com',
    })
  ).rejects.toThrow(/User with this email could not be found!/)
})

it('throws an error if provided password is not correct', async () => {
  await expect(
    login({
      ...registeredUser,
      password: 'incorrect-password',
    })
  ).rejects.toThrow(/Incorrect password! Please try again./)
})

it('allows logging in with different email case', async () => {
  await expect(
    login({
      ...registeredUser,
      email: registeredUser.email.toUpperCase(),
    })
  ).resolves.toEqual(expect.anything())
})

it('allows logging when passing email with white space', async () => {
  await expect(
    login({
      ...registeredUser,
      email: `\t  ${registeredUser.email}  \t`,
    })
  ).resolves.toEqual(expect.anything())
})
