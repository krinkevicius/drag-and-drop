import { Comment, commentSchema } from '@server/entities/comment'
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

      return newComment
    }
  )
