import { fakeRecipe, randomUUID } from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { IngredientList, Recipe } from '@server/entities'
import createIngredientList from '.'

const db = await createTestDatabase()

const ingredientListId = randomUUID
const testRecipe = await db
  .getRepository(Recipe)
  .save(fakeRecipe({ itemIds: [ingredientListId] }))

it('should save ingredientList in database', async () => {
  await createIngredientList(
    { id: ingredientListId, recipeId: testRecipe.id },
    db
  )
  const listInDb = await db
    .getRepository(IngredientList)
    .findOneOrFail({ where: { id: ingredientListId } })

  expect(listInDb).toEqual({
    id: ingredientListId,
    recipeId: testRecipe.id,
  })
})

it('should not allow to create another ingredientList with the same id', async () => {
  await expect(
    createIngredientList({ id: ingredientListId, recipeId: testRecipe.id }, db)
  ).rejects.toThrow(/duplicate key/)
})

it('should not allow to create ingredientList if id is not uuid', async () => {
  await expect(
    createIngredientList({ id: 'not uuid', recipeId: testRecipe.id }, db)
  ).rejects.toThrow(/uuid/)
})
