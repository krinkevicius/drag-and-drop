import { User } from '@server/entities'
import { createTestDatabase, dropTestDatabase } from '@tests/utils/database'
import { fakeUser } from '@server/entities/tests/fakes'
import { createCallerFactory } from '@server/trpc'
import userRouter from '..'

const db = await createTestDatabase()
const userRepository = db.getRepository(User)

const { signup } = createCallerFactory(userRouter)({ db })

afterAll(async () => {
  await dropTestDatabase(db)
})

it('should allow guest to signup with provided email, username and password', async () => {
  const newUser = fakeUser()

  const response = await signup(newUser)

  const userInDb = await userRepository.findOneOrFail({
    select: {
      id: true,
      email: true,
      password: true,
      username: true,
      role: true,
    },
    where: {
      email: newUser.email,
    },
  })

  expect(userInDb).toEqual({
    id: expect.any(Number),
    email: newUser.email,
    password: expect.not.stringContaining(newUser.password),
    username: newUser.username,
    role: 'registeredUser',
  })

  expect(userInDb.password).toHaveLength(60)
  expect(userInDb.password).toMatch(/^\$2b\$/)

  expect(response).toEqual({
    id: userInDb!.id,
    username: newUser.username,
  })
})

it('throws an error for invalid email', async () => {
  await expect(signup(fakeUser({ email: 'not-an-email' }))).rejects.toThrow(
    /email/
  )
})

it('requires a username of at least 5 characters', async () => {
  await expect(signup(fakeUser({ username: 'user' }))).rejects.toThrow(
    /username/
  )
})

it('requires a username of alphanumeric characters', async () => {
  await expect(
    signup({
      email: 'user@domain.com',
      username: 'user!124',
      password: 'some-password',
    })
  ).rejects.toThrow(/username/)
})

it('stores email in lowercase', async () => {
  const newUser = fakeUser()

  await signup({ ...newUser, email: newUser.email.toUpperCase() })

  await expect(
    userRepository.findOneByOrFail({
      email: newUser.email,
    })
  ).resolves.not.toBeNull()
})

it('stores email with trimmed whitespace', async () => {
  const newUser = fakeUser()

  await signup({ ...newUser, email: `\t  ${newUser.email}  \t` })

  await expect(
    userRepository.findOneByOrFail({
      email: newUser.email,
    })
  ).resolves.not.toBeNull()
})

it('stores username with trimmed whitespace', async () => {
  const newUser = fakeUser()

  await signup({ ...newUser, username: `\t  ${newUser.username}  \t` })

  await expect(
    userRepository.findOneByOrFail({
      email: newUser.email,
    })
  ).resolves.not.toBeNull()
})

it('does not allow to signup with duplicate email', async () => {
  const newUser = fakeUser()
  await userRepository.save(newUser)

  // Changing the username as both have unique constrains in the db
  await expect(signup({ ...newUser, username: 'user69' })).rejects.toThrow(
    /User with this email already exists/
  )
})

it('does not allow to signup with duplicate username', async () => {
  const newUser = fakeUser()
  await userRepository.save(newUser)

  await expect(
    signup({ ...newUser, email: 'user69@domain.com' })
  ).rejects.toThrow(/User with this username already exists/)
})

it('allows to signup as admin, if admin boolean is passed', async () => {
  const fakeAdmin = fakeUser()

  await signup({ ...fakeAdmin, admin: true })

  const adminInDb = await userRepository.findOneOrFail({
    select: {
      role: true,
    },
    where: {
      email: fakeAdmin.email,
    },
  })

  expect(adminInDb.role).toEqual('admin')
})
