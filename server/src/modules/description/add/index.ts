import {
  Description,
  DescriptionBare,
  descriptionSchema,
} from '@server/entities/description'
import { DataSource, EntityManager } from 'typeorm'
import { z } from 'zod'

export default async function addDescriptions(
  descriptionsToAdd: DescriptionBare[],
  dbOrManager: DataSource | EntityManager
) {
  const parsedDescriptions = z.array(descriptionSchema).parse(descriptionsToAdd)
  const addedDescriptoins = await dbOrManager
    .getRepository(Description)
    .save(parsedDescriptions)
  return addedDescriptoins
}
