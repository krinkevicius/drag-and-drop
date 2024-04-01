import { createTestDatabase, dropTestDatabase } from '@tests/utils/database'
import { fakeRecipe, fakeUser } from '@server/entities/tests/fakes'
import { UserRoles } from '@server/entities/user'
import { createCallerFactory } from '@server/trpc'
import { Recipe } from '@server/entities'
import { isInMemory } from '@server/config'
import recipeRouter from '..'

const db = await createTestDatabase()

afterAll(async () => {
  await dropTestDatabase(db)
})

const authUser = fakeUser({ role: UserRoles.Admin })

const { create } = createCallerFactory(recipeRouter)({ db, authUser })

it('should save a new recipe in the database', async () => {
  const { name } = fakeRecipe()
  const { id } = await create({
    name,
    items: [
      {
        id: 'c71f58e3-34af-43c0-b405-2764d6947d21',
        itemType: 'description',
        data: {
          descriptionText: 'Mix ingredients',
        },
      },
      {
        id: 'c71f58e3-34af-43c0-b405-2764d6947d25',
        itemType: 'image',
        data: {
          imageName: 'firstImage.jpg',
          imageUrl: 'amazonaws.com/1',
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
        id: 'c71f58e3-34af-43c0-b405-2764d6947d26',
        itemType: 'image',
        data: {
          imageName: 'secondImage.jpg',
          imageUrl: 'amazonaws.com/2',
        },
      },
      {
        id: 'c71f58e3-34af-43c0-b405-2764d6947d27',
        itemType: 'ingredientList',
        data: {
          quantityIngredientPairs: [
            {
              name: 'fakeIngredient1',
              quantity: '100g',
            },
            {
              name: 'fakeIngredient2',
              quantity: '200g',
            },
          ],
        },
      },
      {
        id: 'c71f58e3-34af-43c0-b405-2764d6947d23',
        itemType: 'categories',
        data: {
          categories: ['dinner', 'lunch'],
        },
      },
      {
        id: 'c71f58e3-34af-43c0-b405-2764d6947d24',
        itemType: 'categories',
        data: {
          categories: ['breakfast'],
        },
      },
    ],
  })

  expect(id).toEqual(expect.any(Number))

  const recipeInDb = await db.getRepository(Recipe).findOneOrFail({
    where: { id },
    relations: {
      descriptions: true,
      categories: true,
      images: true,
      ingredientLists: true,
    },
  })

  expect(recipeInDb.name).toEqual(name)

  // check items length, should be the amount of items passed in input without categories
  expect(recipeInDb.itemIds).toHaveLength(5)

  expect(recipeInDb.descriptions).toHaveLength(2)
  expect(recipeInDb.descriptions[0]).toEqual({
    id: 'c71f58e3-34af-43c0-b405-2764d6947d21',
    descriptionText: 'Mix ingredients',
    recipeId: recipeInDb.id,
  })
  expect(recipeInDb.descriptions[1]).toEqual({
    id: 'c71f58e3-34af-43c0-b405-2764d6947d22',
    descriptionText: 'Mix ingredients very well',
    recipeId: recipeInDb.id,
  })

  expect(recipeInDb.images).toHaveLength(2)
  expect(recipeInDb.images[0]).toEqual({
    id: 'c71f58e3-34af-43c0-b405-2764d6947d25',
    imageName: 'firstImage.jpg',
    imageUrl: 'amazonaws.com/1',
    recipeId: recipeInDb.id,
  })

  expect(recipeInDb.ingredientLists).toHaveLength(1)
  expect(recipeInDb.ingredientLists[0]).toEqual({
    id: 'c71f58e3-34af-43c0-b405-2764d6947d27',
    recipeId: recipeInDb.id,
  })

  expect(recipeInDb.categories).toHaveLength(3)
  expect(recipeInDb.categories[0]).toEqual({
    id: expect.any(Number),
    name: 'dinner',
  })
  expect(recipeInDb.categories[1]).toEqual({
    id: expect.any(Number),
    name: 'lunch',
  })
  expect(recipeInDb.categories[2]).toEqual({
    id: expect.any(Number),
    name: 'breakfast',
  })
})

it('should throw an error when trying to save a recipe with already existing name', async () => {
  const existingRecipe = await db.getRepository(Recipe).save(fakeRecipe())
  await expect(
    create({
      name: existingRecipe.name,
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

it('should throw an error if items array is empty', async () => {
  const { name } = fakeRecipe()
  await expect(
    create({
      name,
      items: [],
    })
  ).rejects.toThrow(/Cannot create a recipe without items/)
})

it('should not allow to save recipe if only categories item is passed', async () => {
  const name = 'Grilled chicken'

  await expect(
    create({
      name,
      items: [
        {
          id: 'c71f58e3-34af-43c0-b405-2764d6947d21',
          itemType: 'categories',
          data: {
            categories: ['lunch'],
          },
        },
      ],
    })
  ).rejects.toThrow(/Cannot create a recipe without items/)
})

it.skipIf(isInMemory)(
  'should throw error if same category is passed twice',
  async () => {
    const name = 'Grilled chicken'

    await expect(
      create({
        name,
        items: [
          {
            id: 'c71f58e3-34af-43c0-b405-2764d6947d27',
            itemType: 'description',
            data: { descriptionText: 'some text' },
          },
          {
            id: 'c71f58e3-34af-43c0-b405-2764d6947d21',
            itemType: 'categories',
            data: {
              categories: ['lunch', 'lunch'],
            },
          },
        ],
      })
    ).rejects.toThrow(/Recipe already has this category!/)

    const recipeInDb = await db
      .getRepository(Recipe)
      .findOne({ where: { name } })

    expect(recipeInDb).toBe(null)
  }
)
