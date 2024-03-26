import tinify from 'tinify'
import compressImage from './compress'

const fakeImageToCompress = Buffer.from('fakeImageString')
const fakeKey = 'mock_tinify_key'

describe('compressImage function', () => {
  it('should throw an error if no tinify key is provided', async () => {
    await expect(compressImage(fakeImageToCompress)).rejects.toThrow(
      'Please provide tinify key.'
    )
  })

  it('should log error and reject promise if unable to compress image', async () => {
    tinify.fromBuffer = vi.fn().mockReturnValue({
      toBuffer: vi.fn().mockImplementation((callback) => {
        callback(new Error())
      }),
    })

    await expect(compressImage(fakeImageToCompress, fakeKey)).rejects.toThrow(
      /Error compressing image/
    )
  })

  it('should return compressed buffer if image is compressed successfully', async () => {
    const compressedImage = Buffer.from('compressed')

    tinify.fromBuffer = vi.fn().mockReturnValue({
      toBuffer: vi.fn().mockImplementation((callback) => {
        callback(null, compressedImage)
      }),
    })

    const result = await compressImage(fakeImageToCompress, fakeKey)
    expect(result).toEqual(compressedImage)
  })
})
