import { test, expect } from '@playwright/test'

test('correct items are shown after dragging icons', async ({ page, browserName }) => {
  await page.goto('/')

  // Only icons should be visible
  const imageIcon = page.getByTestId('draggable-image-icon')
  const descriptionIcon = page.getByTestId('draggable-description-icon')
  const listIcon = page.getByTestId('draggable-list-icon')
  const categoriesIcon = page.getByTestId('draggable-categories-icon')

  await expect(imageIcon).toBeVisible()
  await expect(descriptionIcon).toBeVisible()
  await expect(listIcon).toBeVisible()
  await expect(categoriesIcon).toBeVisible()

  // No items should be present when the page loads initially
  const imageItem = page.getByTestId('image-item')
  const descriptionItem = page.getByTestId('description-item')
  const listItem = page.getByTestId('list-item')
  const categoriesItem = page.getByTestId('categories-item')

  await expect(imageItem).toBeHidden()
  await expect(descriptionItem).toBeHidden()
  await expect(listItem).toBeHidden()
  await expect(categoriesItem).toBeHidden()

  // playwright & chromium does not perform first drag and drop action correctly
  // exit test case early
  if (browserName === 'chromium') {
    console.log('this is chrome')
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
