import { createTestDatabase } from '@tests/utils/database'
import { Ingredient, IngredientList, Quantity, Recipe } from '@server/entities'
import { fakeIngredient, fakeRecipe } from '@server/entities/tests/fakes'
import addQuantity from '.'

const db = await createTestDatabase()

const testRecipe = await db.getRepository(Recipe).save(fakeRecipe())
const testIngredientList = await db
  .getRepository(IngredientList)
  .save({ id: testRecipe.itemIds[0], recipeId: testRecipe.id })
const [firstTestIngredient, secondTestIngredient] = await db
  .getRepository(Ingredient)
  .save([fakeIngredient(), fakeIngredient()])

it('should add quantity ingredient pair', async () => {
  const [newQuantity] = await addQuantity(
    {
      ingredientListId: testIngredientList.id,
      quantityIngredientPairs: [
        {
          quantity: '100g',
          name: firstTestIngredient.name,
        },
      ],
    },
    db
  )

  expect(newQuantity).toEqual({
    id: expect.any(Number),
    ingredientListId: testIngredientList.id,
    quantity: '100g',
    ingredientId: firstTestIngredient.id,
  })

  const quantityInDb = await db
    .getRepository(Quantity)
    .findOneOrFail({ where: { id: newQuantity.id } })

  expect(quantityInDb).toEqual(newQuantity)
})

it('should store multiple quantities', async () => {
  const quantities = await addQuantity(
    {
      ingredientListId: testIngredientList.id,
      quantityIngredientPairs: [
        {
          quantity: '250g',
          name: firstTestIngredient.name,
        },
        {
          quantity: '1 teaspoon',
          name: secondTestIngredient.name,
        },
      ],
    },
    db
  )

  expect(quantities).toHaveLength(2)
  expect(quantities[0]).toEqual({
    id: expect.any(Number),
    ingredientListId: testIngredientList.id,
    quantity: '250g',
    ingredientId: firstTestIngredient.id,
  })
  expect(quantities[1]).toEqual({
    id: expect.any(Number),
    ingredientListId: testIngredientList.id,
    quantity: '1 teaspoon',
    ingredientId: secondTestIngredient.id,
  })
})

it('should not allow to pass empty array', async () => {
  await expect(
    addQuantity(
      {
        ingredientListId: testIngredientList.id,
        quantityIngredientPairs: [],
      },
      db
    )
  ).rejects.toThrow(/Please provide quantity and ingredient!/)
})

it('should also add ingredient to db if it is not there', async () => {
  const newIngredient = fakeIngredient()

  const [newQuantity] = await addQuantity(
    {
      ingredientListId: testIngredientList.id,
      quantityIngredientPairs: [
        {
          quantity: '100g',
          name: newIngredient.name,
        },
      ],
    },
    db
  )

  expect(newQuantity).toEqual({
    id: expect.any(Number),
    ingredientListId: testIngredientList.id,
    quantity: '100g',
    ingredientId: expect.any(Number),
  })

  // Check that new ingredient is added to db
  const ingredientInDb = await db
    .getRepository(Ingredient)
    .findOneOrFail({ where: { id: newQuantity.ingredientId } })

  expect(ingredientInDb).toEqual({
    id: newQuantity.ingredientId,
    name: newIngredient.name,
  })
})

it('stores quantity without whitespace', async () => {
  const [newQuantity] = await addQuantity(
    {
      ingredientListId: testIngredientList.id,
      quantityIngredientPairs: [
        {
          quantity: '\t   100g   \t',
          name: firstTestIngredient.name,
        },
      ],
    },
    db
  )

  expect(newQuantity).toEqual({
    id: expect.any(Number),
    ingredientListId: testIngredientList.id,
    quantity: '100g',
    ingredientId: firstTestIngredient.id,
  })
})
