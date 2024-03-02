import { test, expect } from '@playwright/test'

test('open up the createRecipe page', async ({ page }) => {
  await page.goto('/')

  const imageIcon = page.getByTestId('draggable-image-icon')
  const descriptionIcon = page.getByTestId('draggable-description-icon')
  const listIcon = page.getByTestId('draggable-list-icon')
  const categoriesIcon = page.getByTestId('draggable-categories-icon')

  await expect(imageIcon).toBeVisible()
  await expect(descriptionIcon).toBeVisible()
  await expect(listIcon).toBeVisible()
  await expect(categoriesIcon).toBeVisible()

  const dropzone = page.getByTestId('dropzone')
  await expect(dropzone).toBeVisible()
})
