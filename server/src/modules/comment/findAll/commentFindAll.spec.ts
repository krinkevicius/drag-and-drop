import { createCallerFactory } from '@server/trpc'
import { createTestDatabase, dropTestDatabase } from '@tests/utils/database'
import { Comment, Recipe, User } from '@server/entities'
import { fakeComment, fakeRecipe, fakeUser } from '@server/entities/tests/fakes'
import { isInMemory } from '@server/config'
import commentRouter from '..'

const db = await createTestDatabase()

afterAll(async () => {
  await dropTestDatabase(db)
})

const testRecipe = await db.getRepository(Recipe).save(fakeRecipe())
const commentAuthor = await db.getRepository(User).save(fakeUser())

const [testComment1, testComment2] = await db.getRepository(Comment).save([
  fakeComment({ recipeId: testRecipe.id, userId: commentAuthor.id }),
  fakeComment({
    recipeId: testRecipe.id,
    userId: commentAuthor.id,
    // createdAt: new Date(1999, 1, 1),
  }),
])

const { findAll } = createCallerFactory(commentRouter)({ db })

it.skipIf(isInMemory)('should find all comments', async () => {
  const comments = await findAll({ recipeId: testRecipe.id })

  expect(comments).toHaveLength(2)

  expect(comments[0]).toEqual({
    authorName: commentAuthor.username,
    commentText: testComment1.commentText,
    createdAt: testComment1.createdAt,
  })

  expect(comments[1]).toEqual({
    authorName: commentAuthor.username,
    commentText: testComment2.commentText,
    createdAt: testComment2.createdAt,
  })
})

it.skipIf(isInMemory)(
  'orders comments based on their created at day',
  async () => {
    const oldComment = await db.getRepository(Comment).save(
      fakeComment({
        recipeId: testRecipe.id,
        userId: commentAuthor.id,
        createdAt: new Date(1999, 1, 1),
      })
    )

    const comments = await findAll({ recipeId: testRecipe.id })

    expect(comments).toHaveLength(3)

    // First array element should be oldComment
    expect(comments[0]).toEqual({
      authorName: commentAuthor.username,
      commentText: oldComment.commentText,
      createdAt: oldComment.createdAt,
    })
  }
)

it.skipIf(isInMemory)(
  'should return empty array if recipe has no comments',
  async () => {
    const recipeWithNoComments = await db
      .getRepository(Recipe)
      .save(fakeRecipe())

    const result = await findAll({ recipeId: recipeWithNoComments.id })

    expect(result).toEqual([])
  }
)
