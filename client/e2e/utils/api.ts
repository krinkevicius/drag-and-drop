import { apiOrigin, apiPath } from './config'
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from '@mono/server/src/shared/trpc'
import type { Page } from '@playwright/test'
import { superjson } from './superjson/common'
import { fakeUser } from './fakeData'

// Playwright might have incorrectly typed `trpc` as `any`.
const trpc = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: `${apiOrigin}${apiPath}`,
    }),
  ],
})

export async function loginNewUser(page: Page, admin: boolean = false, userLogin = fakeUser()) {
  try {
    await trpc.user.signup.mutate({ ...userLogin, admin })
  } catch (error) {
    // ignore cases when user already exists
  }
  const { loginToken } = await trpc.user.login.mutate(userLogin)

  await page.goto('/')

  await page.evaluate(
    ({ loginToken }) => {
      localStorage.setItem('token', loginToken)
    },
    { loginToken }
  )
  await page.reload()
  return userLogin
}
