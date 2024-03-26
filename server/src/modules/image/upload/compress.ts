import tinify from 'tinify'
import { logger } from '@server/logger'

export default async function compressImage(buffer: Buffer, key?: string) {
  if (!key) {
    throw new Error('Please provide tinify key.')
  }
  tinify.key = key
  logger.info('asking tinify to compress an image')
  try {
    const compressedBuffer = await new Promise<Uint8Array>(
      (resolve, reject) => {
        const from = tinify.fromBuffer(buffer)
        from.toBuffer((err, result) => {
          if (err) {
            logger.error(
              'Unable to compress image via tinify, check Sentry for error'
            )
            reject(err)
          }
          if (result) {
            logger.info('Image has been compressed successfully')
            resolve(result)
          }
        })
      }
    )

    return compressedBuffer
  } catch (error) {
    throw new Error('Error compressing image.', { cause: error })
  }
}
