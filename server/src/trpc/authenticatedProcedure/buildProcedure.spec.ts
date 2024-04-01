import { requestContext } from '@tests/utils/context'
import { fakeUser } from '@server/entities/tests/fakes'
import { UserRoles } from '@server/entities/user'
import { createCallerFactory, router } from '..'
import { authenticatedProcedure, adminProcedure } from '.'

const routes = router({
  testRegisteredCall: authenticatedProcedure.query(() => 'passed'),
  testAdminCall: adminProcedure.query(() => 'passed'),
})

const createCaller = createCallerFactory(routes)

const VALID_USER_TOKEN = 'valid-token'
const VALID_ADMIN_TOKEN = 'valid-admin-token'

vi.mock('jsonwebtoken', () => ({
  default: {
    verify: (token: string) => {
      if (token !== VALID_USER_TOKEN && token !== VALID_ADMIN_TOKEN)
        throw new Error('Invalid token')

      return {
        user: {
          id: 2,
          username: 'TestUser69',
          role: token === VALID_USER_TOKEN ? 'registeredUser' : 'admin',
        },
      }
    },
  },
}))

const db = {} as any

it('should only pass registered call from previously authenticated regular user', async () => {
  const prevAuthenticatedUser = createCaller({
    db,
    authUser: fakeUser(),
  })

  const registeredResponse = await prevAuthenticatedUser.testRegisteredCall()

  expect(registeredResponse).toEqual('passed')

  await expect(prevAuthenticatedUser.testAdminCall()).rejects.toThrow(
    /Invalid token. Please login with admin user!/
  )
})

it('should pass both calls from previously authenticated admin', async () => {
  const prevAuthenticatedAdmin = createCaller({
    db,
    authUser: fakeUser({ role: UserRoles.Admin }),
  })

  const registeredResponse = await prevAuthenticatedAdmin.testRegisteredCall()
  expect(registeredResponse).toEqual('passed')

  const adminResponse = await prevAuthenticatedAdmin.testAdminCall()
  expect(adminResponse).toEqual('passed')
})

it('should only pass registered call when a valid user token is provided', async () => {
  const usingValidUserToken = createCaller({
    db,
    req: {
      header: () => `Bearer ${VALID_USER_TOKEN}`,
    } as any,
  })

  const registeredResponse = await usingValidUserToken.testRegisteredCall()

  expect(registeredResponse).toEqual('passed')

  await expect(usingValidUserToken.testAdminCall()).rejects.toThrow(
    /Invalid token. Please login with admin user!/
  )
})

it('should pass both calls when a valid admin token is provided', async () => {
  const usingValidAdminToken = createCaller({
    db,
    req: {
      header: () => `Bearer ${VALID_ADMIN_TOKEN}`,
    } as any,
  })

  const registeredResponse = await usingValidAdminToken.testRegisteredCall()
  expect(registeredResponse).toEqual('passed')

  const adminResponse = await usingValidAdminToken.testAdminCall()
  expect(adminResponse).toEqual('passed')
})

it('should throw an error if user is not logged in', async () => {
  const unauthenticated = createCaller(requestContext({ db }))

  await expect(unauthenticated.testRegisteredCall()).rejects.toThrow(
    // any authentication-like error
    /login|log in|logged in|authenticate|unauthorized/i
  )
})

it('should throw an error if it is run without access to headers', async () => {
  const invalidToken = createCaller(
    requestContext({
      db,
      req: undefined as any,
    })
  )

  await expect(invalidToken.testRegisteredCall()).rejects.toThrow(/Express/i)
  await expect(invalidToken.testAdminCall()).rejects.toThrow(/Express/i)
})

it('should throw an error if user provides invalid token', async () => {
  const invalidToken = createCaller(
    requestContext({
      db,
      req: {
        header: () => 'Bearer invalid-token',
      } as any,
    })
  )

  await expect(invalidToken.testRegisteredCall()).rejects.toThrow(/token/i)
  await expect(invalidToken.testAdminCall()).rejects.toThrow(/token/i)
})
