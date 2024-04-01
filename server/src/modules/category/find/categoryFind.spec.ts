import { fakeUser } from '@server/entities/tests/fakes'
import { UserRoles } from '@server/entities/user'
import { createCallerFactory } from '@server/trpc'
import { Category } from '@server/entities'
import { createTestDatabase, dropTestDatabase } from '@tests/utils/database'
import categoryRouter from '..'

const db = await createTestDatabase()

afterAll(async () => {
  await dropTestDatabase(db)
})

await db.getRepository(Category).save([
  {
    name: 'lithuanian',
  },
  {
    name: 'latvian',
  },
  {
    name: 'greek',
  },
])

const authUser = fakeUser({ role: UserRoles.Admin })

const { find } = createCallerFactory(categoryRouter)({ db, authUser })

it('should find all categories based on search keyword', async () => {
  const foundCategories = await find('ian')

  expect(foundCategories).toHaveLength(2)
  expect(foundCategories[0]).toEqual({
    id: expect.any(Number),
    name: 'lithuanian',
  })
  expect(foundCategories[1]).toEqual({
    id: expect.any(Number),
    name: 'latvian',
  })
})

it('returns empty array if keyword is not found', async () => {
  expect(await find('lebanese')).toHaveLength(0)
})

it('finds categories when keyword is in different case and has whitespace', async () => {
  const foundCategories = await find('\t  lItHuAnIaN  \t')

  expect(foundCategories).toHaveLength(1)
  expect(foundCategories[0]).toEqual({
    id: expect.any(Number),
    name: 'lithuanian',
  })
})

it('should throw error if keyword is an empty string', async () => {
  await expect(find('')).rejects.toThrow()
})
