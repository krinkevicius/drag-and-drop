import {
  Comment,
  CommentWithAuthor,
  commentSchema,
} from '@server/entities/comment'
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

      // console.log(newComment)
      return {
        id: newComment.id,
        commentText: newComment.commentText,
        createdAt: newComment.createdAt,
        username: authUser.username,
      } as CommentWithAuthor
    }
  )
