import { test, expect } from '@playwright/test'
import { fakeUser } from 'utils/fakeData'

const { email, username, password } = fakeUser()

test.describe.serial('signup and login sequence', () => {
  test('visitor can signup', async ({ page }) => {
    await page.goto('/')

    const signupButton = page.getByRole('button', { name: 'Sign Up' })
    const signupForm = page.getByTestId('signupForm')
    const signupSuccessMessage = page.getByTestId('successMessage')

    await expect(signupForm).toBeHidden()
    await expect(signupButton).toBeVisible()

    await signupButton.click()

    await expect(signupForm).toBeVisible()

    await signupForm.locator('input[type="email"]').fill(email)
    await signupForm.locator('input[type="text"]').fill(username)
    await signupForm.locator('input[type="password"]').fill(password)
    await signupForm.locator('button[type="submit"]').click()

    await expect(signupSuccessMessage).toBeVisible()
  })

  test('visitor can login', async ({ page }) => {
    await page.goto('/')
    const loginButton = page.getByRole('button', { name: 'Login' })
    const logoutButton = page.getByRole('button', { name: 'Log out' })
    const loginForm = page.getByTestId('loginForm')

    await expect(loginButton).toBeVisible()
    await expect(logoutButton).toBeHidden()
    await expect(loginForm).toBeHidden()

    await loginButton.click()
    await expect(logoutButton).toBeHidden()
    await expect(loginForm).toBeVisible()
    await loginForm.locator('input[type="email"]').fill(email)
    await loginForm.locator('input[type="password"]').fill(password)
    await loginForm.locator('button[type="submit"]').click()
    await expect(logoutButton).toBeVisible()
  })
})
