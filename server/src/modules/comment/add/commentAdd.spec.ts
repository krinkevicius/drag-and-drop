import { createCallerFactory } from '@server/trpc'
import { createTestDatabase, dropTestDatabase } from '@tests/utils/database'
import { Comment, Recipe } from '@server/entities'
import { fakeRecipe, fakeUser } from '@server/entities/tests/fakes'
import commentRouter from '..'
import { User } from '../../../entities/user'

const db = await createTestDatabase()

afterAll(async () => {
  await dropTestDatabase(db)
})

const authUser = await db.getRepository(User).save(fakeUser())
const testRecipe = await db.getRepository(Recipe).save(fakeRecipe())

const { add } = createCallerFactory(commentRouter)({ db, authUser })

it('should add a comment', async () => {
  const newComment = await add({
    commentText: 'What a great recipe!',
    recipeId: testRecipe.id,
  })

  // Check in db
  const commentInDb = await db
    .getRepository(Comment)
    .findOneOrFail({ where: { id: newComment.id } })

  expect(commentInDb).toEqual(newComment)
})

it('should not allow to add a comment without text', async () => {
  await expect(
    add({ commentText: '', recipeId: testRecipe.id })
  ).rejects.toMatch(/Cannot add a comment with no text!/)
})
