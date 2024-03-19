import type { Ref } from 'vue'
import { TRPCClientError } from '@trpc/client'
import * as Sentry from '@sentry/vue'

export function withError<Args extends any[], Return, T extends (...args: Args) => Return>(
  fn: T,
  errorMessageRef: Ref<string>
): T {
  return ((...args: Args) => handleError(() => fn(...args), errorMessageRef)) as T
}

async function handleError(fn: Function, errorMessageRef: Ref<string>) {
  try {
    errorMessageRef.value = ''
    const result = await fn()
    return result
  } catch (error) {
    if (error instanceof TRPCClientError) {
      errorMessageRef.value = error.message
    } else if (!(error instanceof Error)) {
      errorMessageRef.value = 'Something went wrong.'
      Sentry.captureException(error)
    } else {
      errorMessageRef.value = error.message
      Sentry.captureException(error)
    }
  }
}
