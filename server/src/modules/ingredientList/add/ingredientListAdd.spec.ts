import { createTestDatabase, dropTestDatabase } from '@tests/utils/database'
import {
  fakeIngredientList,
  fakeRecipe,
  getRandomUUID,
} from '@server/entities/tests/fakes'
import { Ingredient, IngredientList, Quantity, Recipe } from '@server/entities'
import addIngredientLists from '.'

const db = await createTestDatabase()

afterAll(async () => {
  dropTestDatabase(db)
})

const testRecipe = await db.getRepository(Recipe).save(fakeRecipe())

it('should save a single ingredient list', async () => {
  const ingredientList = fakeIngredientList()

  await addIngredientLists(
    { recipeId: testRecipe.id, lists: [ingredientList] },
    db
  )

  // Check that list is saved in db
  const listInDb = await db
    .getRepository(IngredientList)
    .findOneOrFail({ where: { id: ingredientList.id } })

  expect(listInDb).toEqual({
    id: ingredientList.id,
    recipeId: testRecipe.id,
  })

  // Should also save ingredients and quantities
  const ingredients = await db.getRepository(Ingredient).find()
  expect(ingredients).toHaveLength(
    ingredientList.quantityIngredientPairs.length
  )
  const quantities = await db.getRepository(Quantity).find()
  expect(quantities).toHaveLength(ingredientList.quantityIngredientPairs.length)
})

it('should save multiple lists', async () => {
  const [ingredientList1, ingredientList2] = [
    fakeIngredientList(),
    fakeIngredientList(),
  ]

  await addIngredientLists(
    { recipeId: testRecipe.id, lists: [ingredientList1, ingredientList2] },
    db
  )

  const savedLists = await db.getRepository(IngredientList).find({
    where: [{ id: ingredientList1.id }, { id: ingredientList2.id }],
  })

  expect(savedLists).toHaveLength(2)
  expect(savedLists[0]).toEqual({
    id: ingredientList1.id,
    recipeId: testRecipe.id,
  })
  expect(savedLists[1]).toEqual({
    id: ingredientList2.id,
    recipeId: testRecipe.id,
  })
})

it('throws an error if lists have the same id', async () => {
  const randomUUID = getRandomUUID()

  await expect(
    addIngredientLists(
      {
        recipeId: testRecipe.id,
        lists: [
          fakeIngredientList({ id: randomUUID }),
          fakeIngredientList({ id: randomUUID }),
        ],
      },
      db
    )
  ).rejects.toThrow(/Ingredient list already exists/)
})

it('throws an error if quantityIngredientArray is empty', async () => {
  await expect(
    addIngredientLists(
      {
        recipeId: testRecipe.id,
        lists: [{ id: getRandomUUID(), quantityIngredientPairs: [] }],
      },
      db
    )
  ).rejects.toThrow(/Cannot add a list without quantities or ingredients!/)
})

it('throws an error if ingredient name is empty string', async () => {
  await expect(
    addIngredientLists(
      {
        recipeId: testRecipe.id,
        lists: [
          {
            id: getRandomUUID(),
            quantityIngredientPairs: [{ name: '', quantity: '100g' }],
          },
        ],
      },
      db
    )
  ).rejects.toThrow(/Ingredient name cannot be empty!/)
})

it('throws an error if quantity is empty string', async () => {
  await expect(
    addIngredientLists(
      {
        recipeId: testRecipe.id,
        lists: [
          {
            id: getRandomUUID(),
            quantityIngredientPairs: [
              { name: 'fake ingredient', quantity: '' },
            ],
          },
        ],
      },
      db
    )
  ).rejects.toThrow(/Quantity cannot be empty!/)
})

it('should work as part of transaction', async () => {
  const testIngredientList = fakeIngredientList()

  await db.transaction(async (transactionalManager) => {
    await addIngredientLists(
      { recipeId: testRecipe.id, lists: [testIngredientList] },
      transactionalManager
    )
  })

  const savedList = await db
    .getRepository(IngredientList)
    .findOneOrFail({ where: { id: testIngredientList.id } })

  expect(savedList).toEqual({
    id: testIngredientList.id,
    recipeId: testRecipe.id,
  })
})
