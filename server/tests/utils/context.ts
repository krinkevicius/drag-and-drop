import type { Context, ContextMinimal } from '@server/trpc'

/**
 * Creates a mock Express context object for testing purposes.
 * @param context - The context object to be partially overridden.
 * @returns A new context object with the provided properties and default mock values.
 */
export const requestContext = (
  context: Partial<Context> & ContextMinimal
): Context => ({
  req: {
    header: () => undefined,
    get: () => undefined,
  } as any,
  res: {
    cookie: () => undefined,
  } as any,
  ...context,
})
