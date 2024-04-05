import { Comment, commentSchema } from '@server/entities/comment'
import type { CommentWithAuthor } from '@server/entities/comment'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'

export default authenticatedProcedure
  .input(
    commentSchema.pick({
      commentText: true,
      recipeId: true,
    })
  )
  .mutation(
    async ({ input: { commentText, recipeId }, ctx: { db, authUser } }) => {
      const newComment = await db.getRepository(Comment).save({
        commentText,
        userId: authUser.id,
        recipeId,
      })

      return {
        id: newComment.id,
        commentText: newComment.commentText,
        createdAt: newComment.createdAt,
        username: authUser.username,
      } as CommentWithAuthor
    }
  )
