import { Ingredient } from '@server/entities'
import { fakeUser } from '@server/entities/tests/fakes'
import { UserRoles } from '@server/entities/user'
import { createCallerFactory } from '@server/trpc'
import { createTestDatabase } from '@tests/utils/database'
import ingredientRouter from '..'

const db = await createTestDatabase()
const authUser = fakeUser({ role: UserRoles.Admin })

await db.getRepository(Ingredient).save([
  {
    name: 'chicken thighs',
  },
  {
    name: 'chicken breast',
  },
  {
    name: 'pork belly',
  },
])

const { find } = createCallerFactory(ingredientRouter)({ db, authUser })

it('should find all ingredients based on search keyword', async () => {
  const foundIngredients = await find('chicken')

  expect(foundIngredients).toHaveLength(2)
  expect(foundIngredients[0]).toEqual({
    id: expect.any(Number),
    name: 'chicken thighs',
  })
  expect(foundIngredients[1]).toEqual({
    id: expect.any(Number),
    name: 'chicken breast',
  })
})

it('returns empty array if keyword is not found', async () => {
  expect(await find('milk')).toHaveLength(0)
})

it('finds ingredients when keyword is in different case and has whitespace', async () => {
  const foundIngredients = await find('\t  pOrK bElLy  \t')

  expect(foundIngredients).toHaveLength(1)
  expect(foundIngredients[0]).toEqual({
    id: expect.any(Number),
    name: 'pork belly',
  })
})
