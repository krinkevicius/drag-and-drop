import uploadToAws from './s3'

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

const testImage = Buffer.from('testImageString')

const mocks = vi.hoisted(() => ({
  send: vi.fn(),
}))

vi.mock('@aws-sdk/client-s3', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@aws-sdk/client-s3')>()
  return {
    ...mod,
    S3Client: vi.fn(() => ({
      send: mocks.send,
      //    vi.fn(() => ({
      //     $metadata: {
      //       httpStatusCode: 200,
      //     },
      //   })),
    })),
  }
})

it('should throw an error if s3 config is undefined', async () => {
  await expect(
    uploadToAws({ ...testS3config, bucket: undefined }, testImage)
  ).rejects.toThrow(/Server is not setup to save images./)
})

it('should upload image toS3 bucket and return url', async () => {
  mocks.send.mockImplementationOnce(() => ({
    $metadata: {
      httpStatusCode: 200,
    },
  }))
  const imgUrl = await uploadToAws(testS3config, testImage)

  expect(imgUrl).toMatch(/.amazonaws.com/)
})

it('should throw an error if aws does not return code 200', async () => {
  mocks.send.mockImplementationOnce(() => ({
    $metadata: {
      httpStatusCode: 500,
    },
  }))
  await expect(uploadToAws(testS3config, testImage)).rejects.toThrow(
    /Unable to upload image to aws/
  )
})

it('should throw an error if something unnexpected happens', async () => {
  mocks.send.mockImplementationOnce(() => {
    throw new Error('error')
  })

  await expect(uploadToAws(testS3config, testImage)).rejects.toThrow(
    /Unable to upload image to aws/
  )
})
