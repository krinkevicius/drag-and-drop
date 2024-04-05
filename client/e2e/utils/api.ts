import { apiOrigin, apiPath } from './config'
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from '@mono/server/src/shared/trpc'
import type { Page } from '@playwright/test'
import { superjson } from './superjson/common'
import { fakeUser, fakeRecipe } from './fakeData'

// Playwright might have incorrectly typed `trpc` as `any`.
const trpc = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: `${apiOrigin}${apiPath}`,
    }),
  ],
})

function createAdminTRPC(token: string) {
  const trpc = createTRPCProxyClient<AppRouter>({
    transformer: superjson,
    links: [
      httpBatchLink({
        url: `${apiOrigin}${apiPath}`,
        headers: () => {
          return {
            Authorization: `Bearer ${token}`,
          }
        },
      }),
    ],
  })

  return trpc
}

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

export async function createRecipe() {
  const userLogin = fakeUser()

  try {
    await trpc.user.signup.mutate({ ...userLogin, admin: true })
  } catch (error) {
    // ignore cases when user already exists
  }
  const { loginToken } = await trpc.user.login.mutate(userLogin)

  const adminTrpc = createAdminTRPC(loginToken)

  const recipeData = fakeRecipe()
  try {
    await adminTrpc.recipe.create.mutate(recipeData)
  } catch (error) {
    console.log(error)
  }
  return recipeData
}
