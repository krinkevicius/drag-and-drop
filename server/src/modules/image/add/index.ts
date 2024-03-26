import { Image, ImageBare, imageSchema } from '@server/entities/image'
import { DataSource, EntityManager } from 'typeorm'
import { z } from 'zod'

export default async function addImages(
  imagesToAdd: ImageBare[],
  dbOrManager: DataSource | EntityManager
) {
  const parsedImages = z.array(imageSchema).parse(imagesToAdd)
  const addedImages = await dbOrManager.getRepository(Image).save(parsedImages)
  return addedImages
}
