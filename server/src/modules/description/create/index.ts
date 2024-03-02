import { Description, descriptionSchema } from '@server/entities/description'
import type { DescriptionBare } from '@server/entities/description'
import { DataSource, EntityManager } from 'typeorm'

export default async function createDescription(
  descriptionData: DescriptionBare,
  dbOrManager: DataSource | EntityManager
) {
  const parsedDescriptionData = descriptionSchema.parse(descriptionData)
  return dbOrManager.getRepository(Description).save(parsedDescriptionData)
}
