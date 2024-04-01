import { DataSource } from 'typeorm'
import {
  Category,
  Description,
  Image,
  Ingredient,
  IngredientList,
  Quantity,
  Recipe,
} from '@server/entities'
import {
  fakeCategory,
  fakeDescription,
  fakeImage,
  fakeIngredient,
  fakeIngredientList,
  fakeRecipe,
  getRandomUUID,
} from '@server/entities/tests/fakes'
import { random } from './random'

export default async function createTestRecipe(
  db: DataSource,
  {
    withCategories = true,
    recipeName = null,
    recipeIngredient = null,
    recipeCategory = null,
  }: {
    withCategories?: boolean
    recipeName?: string | null
    recipeIngredient?: string | null
    recipeCategory?: string | null
  } = {}
) {
  const testRecipe = await db.getRepository(Recipe).save(
    fakeRecipe({
      name: recipeName || random.word(),
      itemIds: [getRandomUUID(), getRandomUUID(), getRandomUUID()],
    })
  )

  if (withCategories) {
    const categories = await db
      .getRepository(Category)
      .save(
        recipeCategory ? fakeCategory({ name: recipeCategory }) : fakeCategory()
      )

    await db
      .createQueryBuilder()
      .relation(Recipe, 'categories')
      .of(testRecipe.id)
      .add(categories)
  }

  await db
    .getRepository(Image)
    .save([fakeImage({ id: testRecipe.itemIds[0], recipeId: testRecipe.id })])

  await db.getRepository(Description).save(
    fakeDescription({
      id: testRecipe.itemIds[1],
      recipeId: testRecipe.id,
    })
  )

  const testIngredientList = await db
    .getRepository(IngredientList)
    .save(
      fakeIngredientList({ id: testRecipe.itemIds[2], recipeId: testRecipe.id })
    )

  const testIngredient = await db
    .getRepository(Ingredient)
    .save(
      recipeIngredient
        ? fakeIngredient({ name: recipeIngredient })
        : fakeIngredient()
    )

  await db.getRepository(Quantity).save({
    quantity: '100g',
    ingredientId: testIngredient.id,
    ingredientListId: testIngredientList.id,
  })

  const recipe = await db.getRepository(Recipe).findOneOrFail({
    where: { id: testRecipe.id },
    relations: { images: true },
  })

  return recipe
}
