import { adminProcedure } from '@server/trpc/authenticatedProcedure'
import { z } from 'zod'
import { config, isDefined } from '@server/config'
import { ExpectedTRPCError } from '@server/utils/expectedTRPCError'
import compressImage from './compress'
import uploadToAws from './s3'

const base64Prefix = ';base64,'

const inputSchema = z.object({
  imageString: z.string().includes(base64Prefix),
  s3config: z
    .object({
      clientConfig: z.object({
        region: z.string().trim().min(1).optional(),
        credentials: z.object({
          accessKeyId: z.string().trim().min(1).optional(),
          secretAccessKey: z.string().trim().min(1).optional(),
        }),
      }),
      bucket: z.string().trim().min(1).optional(),
    })
    .default(config.s3config),
  tinifyKey:
    config.env === 'test'
      ? z.string().trim().min(1).optional()
      : z.string().trim().min(1).optional().default(config.tinyfyKey!),
})
export default adminProcedure
  .input(inputSchema)
  .mutation(async ({ input: { imageString, s3config, tinifyKey } }) => {
    if (!isDefined(s3config)) {
      throw new ExpectedTRPCError({
        code: 'METHOD_NOT_SUPPORTED',
        message: 'Server is not setup to save images.',
      })
    }

    const buffer = Buffer.from(imageString.split(base64Prefix).pop()!, 'base64')

    const imageToUpload = isDefined(tinifyKey!)
      ? await compressImage(buffer, tinifyKey!)
      : buffer

    const imageUrl = await uploadToAws(s3config, imageToUpload)

    return imageUrl
  })
