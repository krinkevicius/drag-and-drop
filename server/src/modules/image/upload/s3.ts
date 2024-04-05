import { isDefined } from '@server/config'
import type { S3Config } from '@server/config'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import type { PutObjectCommandOutput } from '@aws-sdk/client-s3'
import { ExpectedTRPCError } from '@server/utils/expectedTRPCError'
import { v4 as uuidv4 } from 'uuid'
import { logger } from '@server/logger'

export default async function uploadToAws(
  s3config: S3Config,
  imageToUpload: Buffer | Uint8Array
) {
  if (!isDefined(s3config)) {
    throw new ExpectedTRPCError({
      code: 'METHOD_NOT_SUPPORTED',
      message: 'Server is not setup to save images.',
    })
  }
  const s3 = new S3Client({
    region: s3config.clientConfig.region!,
    credentials: {
      accessKeyId: s3config.clientConfig.credentials.accessKeyId!,
      secretAccessKey: s3config.clientConfig.credentials.secretAccessKey!,
    },
  })

  const imageName = uuidv4()

  const command = new PutObjectCommand({
    Bucket: s3config.bucket!,
    Key: imageName,
    Body: imageToUpload,
  })
  try {
    logger.info('Uploading image to aws...')
    const answer: PutObjectCommandOutput = await s3.send(command)

    if (answer.$metadata.httpStatusCode !== 200) throw new Error()
    logger.info('Image uploaded to aws!')
    return `https://${s3config.bucket}.s3.${s3config.clientConfig.region}.amazonaws.com/${imageName}`
  } catch (error) {
    logger.error(`Unable to upload image to aws: ${error}`)
    throw new Error('Unable to upload image to aws.')
  }
}
