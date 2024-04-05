import { test, expect } from '@playwright/test'
import { loginNewUser } from 'utils/api'
import { fakeRecipeName } from 'utils/fakeData'

test('correct items are shown after dragging icons', async ({ page, browserName }) => {
  // Login as admin user
  await loginNewUser(page, true)

  await page.goto('/dashboard/new-recipe')

  const sidebar = page.getByTestId('dashboardSidebar')
  // Only icons should be visible
  const imageIcon = sidebar.getByTestId('draggable-image-icon')
  const descriptionIcon = sidebar.getByTestId('draggable-description-icon')
  const listIcon = sidebar.getByTestId('draggable-ingredientList-icon')
  const categoriesIcon = sidebar.getByTestId('draggable-categories-icon')

  await expect(imageIcon).toBeVisible()
  await expect(descriptionIcon).toBeVisible()
  await expect(listIcon).toBeVisible()
  await expect(categoriesIcon).toBeVisible()

  // No items should be present when the page loads initially
  const imageItem = page.getByTestId('image-item')
  const descriptionItem = page.getByTestId('description-item')
  const listItem = page.getByTestId('ingredientList-item')
  const categoriesItem = page.getByTestId('categories-item')

  await expect(imageItem).toBeHidden()
  await expect(descriptionItem).toBeHidden()
  await expect(listItem).toBeHidden()
  await expect(categoriesItem).toBeHidden()

  // playwright & chromium does not perform first drag and drop action correctly
  // exit test case early
  if (browserName === 'chromium') {
    return
  }

  const dropzone = page.getByTestId('dropzone')

  // Drag each of the icons one by one and assert that corresponding item appears
  await imageIcon.dragTo(dropzone)
  await expect(imageItem).toBeVisible()
  await expect(descriptionItem).toBeHidden()
  await expect(listItem).toBeHidden()
  await expect(categoriesItem).toBeHidden()

  await descriptionIcon.dragTo(dropzone)
  await expect(imageItem).toBeVisible()
  await expect(descriptionItem).toBeVisible()
  await expect(listItem).toBeHidden()
  await expect(categoriesItem).toBeHidden()

  await listIcon.dragTo(dropzone)
  await expect(imageItem).toBeVisible()
  await expect(descriptionItem).toBeVisible()
  await expect(listItem).toBeVisible()
  await expect(categoriesItem).toBeHidden()

  await categoriesIcon.dragTo(dropzone)
  await expect(imageItem).toBeVisible()
  await expect(descriptionItem).toBeVisible()
  await expect(listItem).toBeVisible()
  await expect(categoriesItem).toBeVisible()
})

test.describe.serial('Recipe flow', () => {
  test.skip(({ browserName }) => browserName !== 'firefox', 'Only on firefox')

  const recipeName = fakeRecipeName()

  test('admin can create a recipe', async ({ page }) => {
    await loginNewUser(page, true)

    await page.goto('/dashboard/new-recipe')

    const sidebar = page.getByTestId('dashboardSidebar')
    const descriptionIcon = sidebar.getByTestId('draggable-description-icon')
    const descriptionItem = page.getByTestId('description-item')
    const recipeSuccessMessage = page.getByTestId('successMessage')

    await expect(descriptionItem).toBeHidden()

    const dropzone = page.getByTestId('dropzone')
    await descriptionIcon.dragTo(dropzone)

    await expect(descriptionItem).toBeVisible()

    await descriptionItem.locator('.ql-editor').fill('This is a description')

    await page.getByTestId('recipeNameInput').fill(recipeName)
    await page.getByRole('button', { name: 'Create Recipe' }).click()

    await page.getByRole('button', { name: 'Confirm' }).click()

    await expect(recipeSuccessMessage).toBeVisible()
  })

  test('visitor can browse recipes, but cannot leave comments', async ({ page }) => {
    await page.goto('/')

    const testRecipeCard = page.getByTestId(`singleRecipeCard-${recipeName}`)

    // Recipe Card should be found as it was created in a previous test
    await expect(testRecipeCard).toBeVisible()
    await testRecipeCard.click()

    await expect(page).toHaveURL(/\/recipe/)
    await expect(page.getByRole('heading', { name: recipeName })).toBeVisible()

    await expect(page.getByTestId('unableToComment')).toBeVisible()
  })

  test('registered user can browse recipes and leave comments', async ({ page }) => {
    await loginNewUser(page)

    await page.goto('/')

    const testRecipeCard = page.getByTestId(`singleRecipeCard-${recipeName}`)

    // Recipe Card should be found as it was created in a previous test
    await expect(testRecipeCard).toBeVisible()
    await testRecipeCard.click()

    await expect(page).toHaveURL(/\/recipe/)
    await expect(page.getByRole('heading', { name: recipeName })).toBeVisible()

    await expect(page.getByTestId('unableToComment')).toBeHidden()
  })
})
