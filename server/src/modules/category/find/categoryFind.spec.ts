import { fakeUser } from '@server/entities/tests/fakes'
import { UserRoles } from '@server/entities/user'
import { createCallerFactory } from '@server/trpc'
import { Category } from '@server/entities'
import categoryRouter from '..'

// Mocking the database
const db = {
  categories: [
    {
      id: 1,
      name: 'lithuanian',
    },
    {
      id: 2,
      name: 'latvian',
    },
    {
      id: 3,
      name: 'greek',
    },
  ] as Category[],
  getRepository: () => ({
    findBy: ({ name }: any) =>
      db.categories.filter((obj) =>
        obj.name
          .toLowerCase()
          // eslint-disable-next-line no-underscore-dangle
          .includes(name._value.replace(/%/g, '').toLowerCase())
      ),
  }),
}

const authUser = fakeUser({ role: UserRoles.Admin })

const { find } = createCallerFactory(categoryRouter)({ db, authUser } as any)

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
