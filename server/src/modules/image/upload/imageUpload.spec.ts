import { createCallerFactory } from '@server/trpc'
import { fakeUser } from '@server/entities/tests/fakes'
import { UserRoles } from '@server/entities/user'
import imageRouter from '..'
import compressImage from './compress'
import uploadToAws from './s3'

const db = {} as any
const authUser = fakeUser({ role: UserRoles.Admin })
const { upload } = createCallerFactory(imageRouter)({ db, authUser })

const mocks = vi.hoisted(() => ({
  compress: vi.fn(),
  s3: vi.fn(() => 'https://something.amazonaws.com/20240101T000000Z'),
}))

vi.mock('./compress', () => ({
  default: mocks.compress,
}))

vi.mock('./s3', () => ({
  default: mocks.s3,
}))

beforeEach(() => {
  vi.clearAllMocks()
})

const testS3config = {
  clientConfig: {
    region: 'testRegion',
    credentials: {
      accessKeyId: 'testAccessKeyId',
      secretAccessKey: 'testSecretAccessKey',
    },
  },
  bucket: 'testBucket',
}

it('should throw error when s3config is not provided', async () => {
  await expect(
    upload({
      imageString: ';base64,/imagestring',
      s3config: { ...testS3config, bucket: undefined },
    })
  ).rejects.toThrow(/Server is not setup to save images./)
})

it('tries to compress an image if tinify key is provided', async () => {
  await expect(
    upload({
      imageString: ';base64,/imagestring',
      s3config: testS3config,
      tinifyKey: 'testTinifyKey',
    })
  ).resolves.not.toBeUndefined()

  expect(compressImage).toHaveBeenCalledOnce()
})

it('does not try to compress image if tinyfy key is not provided', async () => {
  await expect(
    upload({
      imageString: ';base64,/imagestring',
      s3config: testS3config,
      tinifyKey: undefined,
    })
  ).resolves.not.toBeUndefined()

  expect(compressImage).not.toHaveBeenCalled()
})

it('uploads image to amazon bucket', async () => {
  const result = await upload({
    imageString: ';base64,/imagestring',
    s3config: testS3config,
    tinifyKey: undefined,
  })
  expect(uploadToAws).toHaveBeenCalledOnce()
  expect(result).toEqual('https://something.amazonaws.com/20240101T000000Z')
})
