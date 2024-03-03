import { createTestDatabase } from '@tests/utils/database'
import { fakeUser } from '@server/entities/tests/fakes'
import { UserRoles } from '@server/entities/user'
import { createCallerFactory } from '@server/trpc'
import { Recipe } from '@server/entities'
import recipeRouter from '..'

const db = await createTestDatabase()
const authUser = fakeUser({ role: UserRoles.Admin })

const { fullTest } = createCallerFactory(recipeRouter)({ db, authUser })

it.skip('should save a new recipe in the database', async () => {
  const { id } = await fullTest({
    name: 'Beetroot soup',
    items: [
      {
        id: 'c71f58e3-34af-43c0-b405-2764d6947d21',
        itemType: 'description',
        data: {
          descriptionText: 'Mix ingredients',
        },
      },
      {
        id: 'c71f58e3-34af-43c0-b405-2764d6947d22',
        itemType: 'description',
        data: {
          descriptionText: 'Mix ingredients very well',
        },
      },
      {
        id: 'c71f58e3-34af-43c0-b405-2764d6947d23',
        itemType: 'category',
        data: {
          categories: ['dinner', 'lunch'],
        },
      },
      {
        id: 'c71f58e3-34af-43c0-b405-2764d6947d23',
        itemType: 'category',
        data: {
          categories: ['breakfast'],
        },
      },
    ],
  })

  expect(id).toEqual(expect.any(Number))

  const recipeInDb = await db
    .getRepository(Recipe)
    .findOneOrFail({ where: { id }, relations: { descriptions: true } })

  expect(recipeInDb.name).toEqual('Beetroot soup')
  expect(recipeInDb.descriptions).toHaveLength(2)
  expect(recipeInDb.descriptions[0]).toEqual({
    id: 'c71f58e3-34af-43c0-b405-2764d6947d21',
    descriptionText: 'Mix ingredients',
    recipeId: recipeInDb.id,
  })
})

it.skip('should throw an error when trying to save a recipe with already existing name', async () => {
  await expect(
    fullTest({
      name: 'Beetroot soup',
      items: [
        {
          id: 'c71f58e3-34af-43c0-b405-2764d6947d21',
          itemType: 'description',
          data: {
            descriptionText: 'Mix ingredients',
          },
        },
      ],
    })
  ).rejects.toThrow(/Recipe with this name already exists/)
})

it.skip('should throw an error if items array is empty', async () => {
  await expect(
    fullTest({
      name: 'Beetroot salad',
      items: [],
    })
  ).rejects.toThrow(/Cannot create a recipe without items/)
})

it.skip('should throw error if same category is passed twice', async () => {
  const name = 'Grilled chicken'

  await expect(
    fullTest({
      name,
      items: [
        {
          id: 'c71f58e3-34af-43c0-b405-2764d6947d21',
          itemType: 'category',
          data: {
            categories: ['lunch', 'lunch'],
          },
        },
      ],
    })
  ).rejects.toThrow(/Recipe already has this category!/)

  const recipeInDb = await db.getRepository(Recipe).findOne({ where: { name } })

  expect(recipeInDb).toBe(null)
})
