import { test, expect } from '@playwright/test'
import { loginNewUser, createRecipe } from 'utils/api'
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

test('admin can create a new recipe via the front end', async ({ page, browserName }) => {
  test.skip(browserName !== 'firefox', 'Not supported on chromium')
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

  await page.getByTestId('recipeNameInput').fill(fakeRecipeName())
  await page.getByRole('button', { name: 'Create Recipe' }).click()

  await page.getByRole('button', { name: 'Confirm' }).click()

  await expect(recipeSuccessMessage).toBeVisible()
})

test('visitor can browse recipes, but cannot comment or add to favorites', async ({ page }) => {
  // instead of going through Front End, create recipe via API
  const testRecipe = await createRecipe()

  await page.goto('/')

  // Sanity check, visitor should see Signup button
  await expect(page.getByRole('button', { name: 'Sign Up' })).toBeVisible()

  // If recipe was created, it's card should be visible on home page
  const testRecipeCard = page.getByTestId(`singleRecipeCard-${testRecipe.name}`)
  await expect(testRecipeCard).toBeVisible()

  // Visitor should be able to click on the card and get redirected to recipe's page:
  await testRecipeCard.click()

  await expect(page).toHaveURL(/\/recipe/)
  await expect(page.getByRole('heading', { name: testRecipe.name })).toBeVisible()

  // Visitor will not see Add to favorites button or be able to post comments
  await expect(page.getByTestId('favoritesButton')).toBeHidden()
  await expect(page.getByTestId('unableToComment')).toBeVisible()
})

test('registered user should be able to add recipe into their favorites', async ({ page }) => {
  const testRecipe = await createRecipe()
  await loginNewUser(page)

  await page.goto('/')

  const testRecipeCard = page.getByTestId(`singleRecipeCard-${testRecipe.name}`)
  await expect(testRecipeCard).toBeVisible()
  await testRecipeCard.click()
  await expect(page).toHaveURL(/\/recipe/)
  await expect(page.getByRole('heading', { name: testRecipe.name })).toBeVisible()

  // Registered user should be able to see add to favorites button and click it
  const favoritesButton = page.getByTestId('favoritesButton')
  await expect(favoritesButton).toBeVisible()
  await favoritesButton.click()

  // After going to favorites page, user should find a card for it
  await page.goto('/favorites')

  const favoriteRecipeCard = page.getByTestId(`singleRecipeCard-${testRecipe.name}`)
  await expect(favoriteRecipeCard).toBeVisible()
})

test('registered user can browse recipes and leave comments', async ({ page }) => {
  const testRecipe = await createRecipe()
  await loginNewUser(page)

  await page.goto('/')

  const testRecipeCard = page.getByTestId(`singleRecipeCard-${testRecipe.name}`)

  await expect(testRecipeCard).toBeVisible()
  await testRecipeCard.click()

  await expect(page).toHaveURL(/\/recipe/)
  await expect(page.getByRole('heading', { name: testRecipe.name })).toBeVisible()

  await expect(page.getByTestId('unableToComment')).toBeHidden()

  // No comments can be seen before posting
  const singleComment = page.getByTestId('singleComment')
  await expect(singleComment).toBeHidden()

  await page.getByTestId('commentArea').fill('Yummy!')
  await page.getByRole('button', { name: 'Post' }).click()

  await expect(singleComment).toBeVisible()
})
