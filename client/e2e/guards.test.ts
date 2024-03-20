import { test, expect } from '@playwright/test'
import { loginNewUser } from 'utils/api'

test('visitor is not allowed to access the favorites page', async ({ page }) => {
  await page.goto('/favorites')

  // Visitor is redirected to home page
  await page.waitForURL('/')
})

test('visitor is not allowed to access the dashboard', async ({ page }) => {
  await page.goto('/dashboard')

  // Visitor is redirected to home page
  await page.waitForURL('/')
})

test('signup', async ({ page }) => {
  await loginNewUser(page, true)
})

test('registered user is allowed to access favorites page', async ({ page }) => {
  await loginNewUser(page)

  // Sanity check, log out button should be visible for all logged in users
  const logOutButton = page.getByTestId('logoutButton')
  await expect(logOutButton).toBeVisible()

  await page.goto('/favorites')
  const favoritesHeader = page.getByTestId('favoritesHeader')
  await expect(favoritesHeader).toBeVisible()
})

test('registered user is not allowed to access dashboard', async ({ page }) => {
  await loginNewUser(page)

  // Sanity check, log out button should be visible for all logged in users
  const logOutButton = page.getByTestId('logoutButton')
  await expect(logOutButton).toBeVisible()

  await page.goto('/dashboard')

  // Regular registered user should be redirected to home page
  await page.waitForURL('/')
})

test('admin user is allowed to access the dashboard', async ({ page }) => {
  await loginNewUser(page, true)

  // Sanity check, log out button should be visible for all logged in users
  const logOutButton = page.getByTestId('logoutButton')
  await expect(logOutButton).toBeVisible()

  await page.goto('/dashboard')
  const dashboardSidebar = page.getByTestId('dashboardSidebar')
  await expect(dashboardSidebar).toBeVisible()
})
