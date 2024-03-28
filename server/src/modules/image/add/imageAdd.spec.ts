import { createTestDatabase, dropTestDatabase } from '@tests/utils/database'
import {
  fakeRecipe,
  fakeImage,
  getRandomUUID,
} from '@server/entities/tests/fakes'
import { Image, Recipe } from '@server/entities'
import addImages from '.'

const db = await createTestDatabase()
const imageRepo = db.getRepository(Image)
const testRecipe = await db.getRepository(Recipe).save(fakeRecipe())

afterAll(async () => {
  await dropTestDatabase(db)
})

it('should save single image', async () => {
  const [newImage] = await addImages(
    [fakeImage({ recipeId: testRecipe.id })],
    db
  )

  const imageInDb = await imageRepo.findOneOrFail({
    where: { id: newImage.id },
  })

  expect(imageInDb).toEqual(newImage)
})

it('should save multiple images', async () => {
  const [firstImage, secondImage] = await addImages(
    [
      fakeImage({ recipeId: testRecipe.id }),
      fakeImage({ recipeId: testRecipe.id }),
    ],
    db
  )

  const images = await imageRepo.find({
    where: [{ id: firstImage.id }, { id: secondImage.id }],
  })

  expect(images).toHaveLength(2)
  expect(images[0]).toEqual(firstImage)
  expect(images[1]).toEqual(secondImage)
})

it('should throw error if id is not uuid', async () => {
  await expect(
    addImages([fakeImage({ id: 'not uuid', recipeId: testRecipe.id })], db)
  ).rejects.toThrow(/uuid/)
})

it('should not allow to images with the same id', async () => {
  const uuid = getRandomUUID()
  await expect(
    addImages(
      [
        fakeImage({ id: uuid, recipeId: testRecipe.id }),
        fakeImage({ id: uuid, recipeId: testRecipe.id }),
      ],
      db
    )
  ).rejects.toThrow(/duplicate key/)
})

it('should fail if imageUrl is empty string', async () => {
  await expect(
    addImages([fakeImage({ imageUrl: '', recipeId: testRecipe.id })], db)
  ).rejects.toThrow(/Image url cannot be empty!/)
})

it('should fail if imageName is empty string', async () => {
  await expect(
    addImages([fakeImage({ imageName: '', recipeId: testRecipe.id })], db)
  ).rejects.toThrow(/Image name cannot be empty!/)
})

it('should work with transactions', async () => {
  const newImage = fakeImage({ recipeId: testRecipe.id })

  await db.transaction(async (transactionalManager) => {
    await addImages([newImage], transactionalManager)
  })

  const imageInDb = await imageRepo.findOneOrFail({
    where: { id: newImage.id },
  })

  expect(imageInDb).toEqual(newImage)
})
