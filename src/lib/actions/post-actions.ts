'use server'

import { ActionLogger } from '@/lib/error-handling'
import { postRepository } from '@/lib/repositories'
import { authActionClient, publicActionClient } from '@/lib/safe-action'
import {
  createPostSchema,
  deletePostSchema,
  getPostSchema,
  getPostsSchema,
  updatePostSchema,
} from '@/lib/validations/post'
import { revalidatePath } from 'next/cache'

/**
 * Create a new post
 */
export const createPostAction = authActionClient
  .inputSchema(createPostSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { user } = ctx
    const { title, content, excerpt, slug, published } = parsedInput

    ActionLogger.info('createPost', 'Creating new post', {
      userId: user.id,
      title,
      published,
    })

    try {
      // Check if slug is unique (if provided)
      if (slug) {
        const slugExists = await postRepository.existsBySlug(slug)
        if (slugExists) {
          throw new Error('이미 사용 중인 슬러그입니다.')
        }
      }

      const post = await postRepository.create(
        {
          title,
          content,
          excerpt: excerpt ?? null,
          slug: slug ?? null,
          published,
          author: {
            connect: { id: user.id },
          },
        },
        {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        }
      )

      // Revalidate relevant pages
      revalidatePath('/posts')
      revalidatePath('/dashboard')
      if (published) {
        revalidatePath(`/posts/${post.id}`)
      }

      ActionLogger.info('createPost', 'Post created successfully', {
        postId: post.id,
        userId: user.id,
        published,
      })

      return {
        success: true,
        post,
        message: '포스트가 성공적으로 생성되었습니다.',
      }
    } catch (error) {
      ActionLogger.error('createPost', 'Failed to create post', error, {
        userId: user.id,
        title,
      })
      throw error
    }
  })

/**
 * Update an existing post
 */
export const updatePostAction = authActionClient
  .inputSchema(updatePostSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { user } = ctx
    const { id, title, content, excerpt, slug, published } = parsedInput

    ActionLogger.info('updatePost', 'Updating post', {
      postId: id,
      userId: user.id,
    })

    try {
      // Check if post exists and belongs to user
      const existingPost = await postRepository.findFirst({
        where: {
          id,
          authorId: user.id,
        },
      })

      if (!existingPost) {
        throw new Error('포스트를 찾을 수 없거나 수정 권한이 없습니다.')
      }

      // Check if slug is unique (if provided and different from current)
      if (slug && slug !== existingPost.slug) {
        const slugExists = await postRepository.existsBySlug(slug)
        if (slugExists) {
          throw new Error('이미 사용 중인 슬러그입니다.')
        }
      }

      const updateData: any = {}
      if (title !== undefined) updateData.title = title
      if (content !== undefined) updateData.content = content
      if (excerpt !== undefined) updateData.excerpt = excerpt
      if (slug !== undefined) updateData.slug = slug
      if (published !== undefined) updateData.published = published

      const post = await postRepository.update(id, updateData, {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      })

      // Revalidate relevant pages
      revalidatePath('/posts')
      revalidatePath(`/posts/${id}`)
      revalidatePath(`/posts/${id}/edit`)
      revalidatePath('/dashboard')

      ActionLogger.info('updatePost', 'Post updated successfully', {
        postId: id,
        userId: user.id,
      })

      return {
        success: true,
        post,
        message: '포스트가 성공적으로 수정되었습니다.',
      }
    } catch (error) {
      ActionLogger.error('updatePost', 'Failed to update post', error, {
        postId: id,
        userId: user.id,
      })
      throw error
    }
  })

/**
 * Delete a post
 */
export const deletePostAction = authActionClient
  .inputSchema(deletePostSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { user } = ctx
    const { id } = parsedInput

    ActionLogger.info('deletePost', 'Deleting post', {
      postId: id,
      userId: user.id,
    })

    try {
      // Check if post exists and belongs to user
      const existingPost = await postRepository.findFirst({
        where: {
          id,
          authorId: user.id,
        },
      })

      if (!existingPost) {
        throw new Error('포스트를 찾을 수 없거나 삭제 권한이 없습니다.')
      }

      await postRepository.delete(id)

      // Revalidate relevant pages
      revalidatePath('/posts')
      revalidatePath('/dashboard')

      ActionLogger.info('deletePost', 'Post deleted successfully', {
        postId: id,
        userId: user.id,
      })

      return {
        success: true,
        message: '포스트가 성공적으로 삭제되었습니다.',
      }
    } catch (error) {
      ActionLogger.error('deletePost', 'Failed to delete post', error, {
        postId: id,
        userId: user.id,
      })
      throw error
    }
  })

/**
 * Get a single post by ID (public access for published posts)
 */
export const getPostAction = publicActionClient
  .inputSchema(getPostSchema)
  .action(async ({ parsedInput }) => {
    const { id } = parsedInput

    try {
      const post = await postRepository.findById(id, {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      })

      if (!post) {
        throw new Error('포스트를 찾을 수 없습니다.')
      }

      return {
        success: true,
        post,
      }
    } catch (error) {
      ActionLogger.error('getPost', 'Failed to get post', error, {
        postId: id,
      })
      throw error
    }
  })

/**
 * Get posts with cursor-based pagination (public access for published posts)
 */
export const getPostsAction = publicActionClient
  .inputSchema(getPostsSchema)
  .action(async ({ parsedInput }) => {
    const { cursor, limit, published, authorId } = parsedInput

    try {
      const whereClause: any = {}

      // Filter by published status if specified
      if (published !== undefined) {
        whereClause.published = published
      }

      // Filter by author if specified
      if (authorId) {
        whereClause.authorId = authorId
      }

      // Build cursor condition for pagination
      const cursorCondition = cursor
        ? {
            id: {
              lt: cursor, // Get posts with ID less than cursor (older posts)
            },
          }
        : {}

      const posts = await postRepository.findMany({
        where: {
          ...whereClause,
          ...cursorCondition,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit + 1, // Take one extra to check if there are more posts
      })

      // Check if there are more posts
      const hasMore = posts.length > limit
      const postsToReturn = hasMore ? posts.slice(0, limit) : posts

      // Get the cursor for the next page
      const nextCursor = hasMore
        ? postsToReturn[postsToReturn.length - 1]?.id
        : null

      return {
        success: true,
        posts: postsToReturn,
        pagination: {
          hasMore,
          nextCursor,
          limit,
        },
      }
    } catch (error) {
      console.error('getPostsAction 상세 오류:', {
        error,
        cursor,
        limit,
        published,
        authorId,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
      })

      ActionLogger.error('getPosts', 'Failed to get posts', error, {
        cursor,
        limit,
        published,
        authorId,
      })

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  })

/**
 * Get user's own posts (authenticated access)
 */
export const getUserPostsAction = authActionClient
  .inputSchema(getPostsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { user } = ctx
    const { cursor, limit, published } = parsedInput

    try {
      const whereClause: any = {
        authorId: user.id,
      }

      // Filter by published status if specified
      if (published !== undefined) {
        whereClause.published = published
      }

      // Build cursor condition for pagination
      const cursorCondition = cursor
        ? {
            id: {
              lt: cursor,
            },
          }
        : {}

      const posts = await postRepository.findMany({
        where: {
          ...whereClause,
          ...cursorCondition,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit + 1,
      })

      // Check if there are more posts
      const hasMore = posts.length > limit
      const postsToReturn = hasMore ? posts.slice(0, limit) : posts

      // Get the cursor for the next page
      const nextCursor = hasMore
        ? postsToReturn[postsToReturn.length - 1]?.id
        : null

      ActionLogger.info('getUserPosts', 'Retrieved user posts', {
        userId: user.id,
        count: postsToReturn.length,
        hasMore,
      })

      return {
        success: true,
        posts: postsToReturn,
        pagination: {
          hasMore,
          nextCursor,
          limit,
        },
      }
    } catch (error) {
      ActionLogger.error('getUserPosts', 'Failed to get user posts', error, {
        userId: user.id,
        cursor,
        limit,
        published,
      })
      throw error
    }
  })
