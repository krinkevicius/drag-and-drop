import { ref } from 'vue'
import { withError } from '.'
import { TRPCClientError } from '@trpc/client'

const mocks = vi.hoisted(() => ({
  captureException: vi.fn(),
}))

vi.mock('@sentry/vue', () => ({
  captureException: mocks.captureException,
}))

beforeEach(() => {
  vi.clearAllMocks()
})

it('should call the provided function and return its result if no error occurs', async () => {
  const errorMessage = ref<string>('')
  const fn = vi.fn(async () => 'ok')

  const result = await withError(fn, errorMessage)()

  expect(result).toEqual('ok')
  expect(fn).toHaveBeenCalled()
  expect(errorMessage.value).toBe('')
})

it('should set the error message and NOT send error to Sentry when type is TRPCClientError', async () => {
  const errorMessage = ref('')

  const error = new TRPCClientError('TRPC Error')

  const fn = vi.fn(async () => {
    throw error
  })

  const wrappedFn = withError(fn, errorMessage)

  await expect(wrappedFn()).resolves.not.toThrow()
  expect(fn).toHaveBeenCalled()
  expect(mocks.captureException).not.toHaveBeenCalled()
  expect(errorMessage.value).toBe(error.message)
})

it('should set the error message and send error to Sentry when type is Error', async () => {
  const errorMessage = ref('')
  const error = new Error('Yikes!')

  const fn = vi.fn(async () => {
    throw error
  })
  const wrappedFn = withError(fn, errorMessage)

  await expect(wrappedFn()).resolves.not.toThrow()
  expect(fn).toHaveBeenCalled()
  expect(mocks.captureException).toHaveBeenCalledWith(error)
  expect(errorMessage.value).toBe(error.message)
})

it('should use the default error message if the error is not an instance of Error', async () => {
  const errorMessage = ref('')
  const fn = vi.fn(async () => {
    throw 'Yikes!'
  })
  const wrappedFn = withError(fn, errorMessage)

  await expect(wrappedFn()).resolves.not.toThrow()
  expect(fn).toHaveBeenCalled()
  expect(errorMessage.value).toBe('Something went wrong.')
})
