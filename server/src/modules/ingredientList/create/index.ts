import {
  IngredientList,
  IngredientListBare,
} from '@server/entities/ingredientList'
import { DataSource, EntityManager } from 'typeorm'

export default async function createIngredientList(
  input: IngredientListBare,
  dbOrManager: DataSource | EntityManager
) {
  const newIngredientList = await dbOrManager
    .getRepository(IngredientList)
    .insert(input)
  return newIngredientList
}
