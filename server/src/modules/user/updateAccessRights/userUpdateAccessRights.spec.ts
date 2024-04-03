import { createTestDatabase, dropTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { fakeUser } from '@server/entities/tests/fakes'
import { User, UserRoles } from '@server/entities/user'
import userRouter from '..'

const db = await createTestDatabase()
const userRepo = db.getRepository(User)
const authUser = await userRepo.save(fakeUser({ role: UserRoles.Admin }))

const { updateAccessRights } = createCallerFactory(userRouter)({ db, authUser })

afterAll(async () => {
  await dropTestDatabase(db)
})

it('should throw error is authUser is trying to update own role', async () => {
  await expect(updateAccessRights({ id: authUser.id })).rejects.toThrow(
    /You cannot change your own access rights!/
  )
})

it('should throw error if passed id is not found in db', async () => {
  await expect(updateAccessRights({ id: 2147483647 })).rejects.toThrow(
    /Cannot find user with ID 2147483647!/
  )
})

it('should update registered users role to admin', async () => {
  const regularUser = await userRepo.save(fakeUser())

  const result = await updateAccessRights({ id: regularUser.id })

  // Check that there were no errors
  expect(result).toEqual(UserRoles.Admin)

  // Check in db
  const updatedUser = await userRepo.findOne({
    where: { id: regularUser.id },
  })

  expect(updatedUser!.role).toEqual(UserRoles.Admin)
})

it('should update admin role to registered user', async () => {
  const differentAdmin = await userRepo.save(
    fakeUser({ role: UserRoles.Admin })
  )

  const result = await updateAccessRights({ id: differentAdmin.id })

  // Check that there were no errors
  expect(result).toEqual(UserRoles.RegistererUser)

  // Check in db
  const updatedUser = await userRepo.findOne({
    where: { id: differentAdmin.id },
  })

  expect(updatedUser!.role).toEqual(UserRoles.RegistererUser)
})
