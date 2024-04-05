import { Comment, User } from '@server/entities'
import { commentSchema } from '@server/entities/comment'
import type { CommentWithAuthor } from '@server/entities/comment'
import { publicProcedure } from '@server/trpc'

const inputSchema = commentSchema.pick({ recipeId: true })

export default publicProcedure
  .input(inputSchema)
  .query(async ({ input: { recipeId }, ctx: { db } }) => {
    const comments = (await db
      .getRepository(Comment)
      .createQueryBuilder('comment')
      .leftJoin('comment.user', 'user')
      .select([
        'comment.commentText AS "commentText"',
        'comment.createdAt AS "createdAt"',
      ])
      .addSelect(
        (subQuery) =>
          subQuery
            .select('users.username', 'authorName')
            .from(User, 'users')
            .where('users.id = comment.userId'),
        'authorName'
      )
      .where('comment.recipeId = :recipeId', { recipeId })
      .orderBy('comment.createdAt', 'ASC')
      .getRawMany()) as CommentWithAuthor[]

    return comments
  })
